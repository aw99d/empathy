import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// HMAC secret for admin tokens
const JWT_SECRET = process.env.ADMIN_SESSION_SECRET || 'empathy_coffee_secret_key_railway_2026';

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure data directory exists
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'menu.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Ensure default menu data exists
function getMenuData() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading menu.json:', e);
    }
  }
  return {
    settings: {
      name: 'EMPATHY',
      subtitle: 'SPECIALITY COFFEE',
      tagline: 'come and enjoy your coffee',
      hours: '7AM - 12AM',
      location: 'QIDFA, FUJAIRAH',
      currency: 'AED',
      defaultPlaceholderImage: '/images/placeholder.jpg',
      generatedAssetFallback: '/images/placeholder_empathy_coffee_1791136879221.jpg'
    },
    categories: [
      { id: 'breakfast', name: 'Breakfast', parentGroup: 'BREAKFAST' },
      { id: 'basic-coffee', name: 'Basic Coffee', parentGroup: 'COFFEE' },
      { id: 'iced-coffee', name: 'Iced Coffee', parentGroup: 'COFFEE' },
      { id: 'filter-coffee-v60', name: 'Filter Coffee', parentGroup: 'COFFEE' },
      { id: 'non-coffee', name: 'Non-Coffee', parentGroup: 'COFFEE' },
      { id: 'matcha', name: 'Matcha', parentGroup: 'MATCHA' },
      { id: 'dessert', name: 'Dessert', parentGroup: 'DESSERT' },
      { id: 'all', name: 'All Menu' }
    ],
    products: []
  };
}

function saveMenuData(data: any) {
  const tempFile = `${DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
  fs.renameSync(tempFile, DATA_FILE);
}

// Token helpers
function createToken(username: string): string {
  const payload = {
    username,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
  return `${payloadBase64}.${signature}`;
}

function verifyToken(token: string): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payloadBase64, signature] = parts;
  const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(payloadBase64).digest('base64url');
  if (signature !== expectedSignature) return false;

  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return false;
    return true;
  } catch {
    return false;
  }
}

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  if (!token || !verifyToken(token)) {
    return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
  }
  next();
}

// Serve public static images directly
app.use('/images', express.static(path.resolve(process.cwd(), 'public/images')));

// API Routes

// 1. Public Menu API
app.get('/api/menu', (req, res) => {
  const data = getMenuData();
  res.json(data);
});

// 2. Admin Authentication
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  const normalizedUser = (username || '').trim().toLowerCase();
  const rawPass = (password || '').trim();

  // Mandatory credentials: admin or admin@douve.cafe / ahmad123
  // Also accept custom environment variables if set
  const customUser = (process.env.ADMIN_USERNAME || '').trim().toLowerCase();
  const customPass = (process.env.ADMIN_PASSWORD || '').trim();

  const isHardcodedValid = (normalizedUser === 'admin' || normalizedUser === 'admin@douve.cafe') && rawPass === 'ahmad123';
  const isCustomValid = Boolean(customUser && customPass && normalizedUser === customUser && rawPass === customPass);

  if (isHardcodedValid || isCustomValid) {
    const token = createToken(normalizedUser);
    return res.json({ success: true, token, user: { username: normalizedUser } });
  }

  return res.status(401).json({ error: 'Invalid username or password' });
});

app.get('/api/admin/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : (req.headers['x-admin-token'] as string);
  if (token && verifyToken(token)) {
    return res.json({ valid: true });
  }
  return res.status(401).json({ valid: false });
});

// 3. Admin Products Management
app.post('/api/admin/products', requireAdminAuth, (req, res) => {
  const data = getMenuData();
  const newProduct = req.body;

  if (!newProduct.name || !newProduct.category) {
    return res.status(400).json({ error: 'Name and Category are required' });
  }

  if (!newProduct.id) {
    newProduct.id = newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
  }

  // Ensure categoryLabel and sectionGroup match selected category
  const cat = data.categories.find((c: any) => c.id === newProduct.category);
  if (cat) {
    newProduct.categoryLabel = cat.name;
    newProduct.sectionGroup = cat.parentGroup || cat.name.toUpperCase();
  }

  // Ensure price and formattedPrice
  const price = parseFloat(newProduct.price) || 0;
  newProduct.price = price;
  const currency = data.settings?.currency || 'AED';
  newProduct.currency = currency;
  if (!newProduct.formattedPrice) {
    newProduct.formattedPrice = price % 1 === 0 ? `${price} ${currency}` : `${price.toFixed(2)} ${currency}`;
  }

  // Ensure fallbackImage
  if (!newProduct.fallbackImage) {
    newProduct.fallbackImage = data.settings?.generatedAssetFallback || '/images/placeholder.jpg';
  }
  if (!newProduct.image) {
    newProduct.image = newProduct.fallbackImage;
  }

  data.products.push(newProduct);
  saveMenuData(data);
  res.json({ success: true, product: newProduct });
});

app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = getMenuData();
  const index = data.products.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updated = { ...data.products[index], ...req.body, id };

  const cat = data.categories.find((c: any) => c.id === updated.category);
  if (cat) {
    updated.categoryLabel = cat.name;
    updated.sectionGroup = cat.parentGroup || cat.name.toUpperCase();
  }

  const price = parseFloat(updated.price) || 0;
  updated.price = price;
  const currency = data.settings?.currency || updated.currency || 'AED';
  updated.currency = currency;
  if (req.body.price !== undefined || !updated.formattedPrice) {
    updated.formattedPrice = price % 1 === 0 ? `${price} ${currency}` : `${price.toFixed(2)} ${currency}`;
  }

  data.products[index] = updated;
  saveMenuData(data);
  res.json({ success: true, product: updated });
});

app.delete('/api/admin/products/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = getMenuData();
  const initialLength = data.products.length;
  data.products = data.products.filter((p: any) => p.id !== id);

  if (data.products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found' });
  }

  saveMenuData(data);
  res.json({ success: true });
});

// 4. Admin Categories Management
app.post('/api/admin/categories', requireAdminAuth, (req, res) => {
  const data = getMenuData();
  const { name, parentGroup } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  const id = req.body.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  if (data.categories.some((c: any) => c.id === id)) {
    return res.status(400).json({ error: 'Category ID already exists' });
  }

  const newCat = {
    id,
    name,
    parentGroup: (parentGroup || name).toUpperCase()
  };

  // Place before 'all' category if it exists
  const allIdx = data.categories.findIndex((c: any) => c.id === 'all');
  if (allIdx !== -1) {
    data.categories.splice(allIdx, 0, newCat);
  } else {
    data.categories.push(newCat);
  }

  saveMenuData(data);
  res.json({ success: true, category: newCat });
});

app.put('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const data = getMenuData();
  const cat = data.categories.find((c: any) => c.id === id);

  if (!cat) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const oldName = cat.name;
  if (req.body.name) cat.name = req.body.name;
  if (req.body.parentGroup) cat.parentGroup = req.body.parentGroup.toUpperCase();

  // Update associated products' categoryLabel & sectionGroup
  data.products.forEach((p: any) => {
    if (p.category === id) {
      p.categoryLabel = cat.name;
      p.sectionGroup = cat.parentGroup;
    }
  });

  saveMenuData(data);
  res.json({ success: true, category: cat });
});

app.delete('/api/admin/categories/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  if (id === 'all') {
    return res.status(400).json({ error: 'Cannot delete the "All Menu" category' });
  }

  const data = getMenuData();
  const catIndex = data.categories.findIndex((c: any) => c.id === id);

  if (catIndex === -1) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const { action, targetCategoryId } = req.body || {};

  if (action === 'move' && targetCategoryId) {
    const targetCat = data.categories.find((c: any) => c.id === targetCategoryId);
    if (!targetCat) {
      return res.status(400).json({ error: 'Target category does not exist' });
    }
    data.products.forEach((p: any) => {
      if (p.category === id) {
        p.category = targetCategoryId;
        p.categoryLabel = targetCat.name;
        p.sectionGroup = targetCat.parentGroup || targetCat.name.toUpperCase();
      }
    });
  } else {
    // Delete associated products
    data.products = data.products.filter((p: any) => p.category !== id);
  }

  data.categories.splice(catIndex, 1);
  saveMenuData(data);
  res.json({ success: true });
});

// 5. Admin Settings Management
app.put('/api/admin/settings', requireAdminAuth, (req, res) => {
  const data = getMenuData();
  data.settings = { ...data.settings, ...req.body };

  // If currency was changed, update formattedPrice on products
  if (req.body.currency) {
    const cur = req.body.currency;
    data.products.forEach((p: any) => {
      p.currency = cur;
      const price = p.price || 0;
      p.formattedPrice = price % 1 === 0 ? `${price} ${cur}` : `${price.toFixed(2)} ${cur}`;
    });
  }

  saveMenuData(data);
  res.json({ success: true, settings: data.settings });
});

// 6. Admin Image Upload (Base64 data URL)
app.post('/api/admin/upload-image', requireAdminAuth, (req, res) => {
  try {
    const { dataUrl, filename } = req.body;
    if (!dataUrl || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'Invalid image data' });
    }

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid base64 image format' });
    }

    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    const safeName = (filename || 'upload')
      .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
      .replace(/\.[^/.]+$/, '');
    const finalFilename = `${safeName}-${Date.now()}.${ext}`;

    const destDir = path.resolve(process.cwd(), 'public/images');
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    fs.writeFileSync(path.join(destDir, finalFilename), buffer);
    res.json({ success: true, url: `/images/${finalFilename}` });
  } catch (err: any) {
    console.error('Image upload error:', err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Setup Dev or Production serving
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
