import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Layers,
  Settings as SettingsIcon,
  LogOut,
  ExternalLink,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  Upload,
  X,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { Product, Category, Settings, MenuData } from '../types';
import { Logo } from '../components/Logo';

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onLogout,
  onNavigateHome,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'branding'>('products');
  const [data, setData] = useState<MenuData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Search & filter for products
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Product modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({});
  const [imageUploading, setImageUploading] = useState(false);

  // Delete product modal
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Category modal state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryFormData, setCategoryFormData] = useState<Partial<Category>>({});

  // Delete category modal
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deleteCatAction, setDeleteCatAction] = useState<'move' | 'delete_products'>('move');
  const [targetCatForMove, setTargetCatForMove] = useState<string>('');

  // Branding form state
  const [brandingForm, setBrandingForm] = useState<Settings>({
    name: 'EMPATHY',
    subtitle: 'SPECIALITY COFFEE',
    tagline: 'come and enjoy your coffee',
    hours: '7AM - 12AM',
    location: 'QIDFA, FUJAIRAH',
    currency: 'AED',
    searchPlaceholder: 'Search coffee, V60, matcha, croissant...',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('empathy_admin_token') || '';
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
  };

  const loadMenuData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const json: MenuData = await res.json();
        setData(json);
        if (json.settings) {
          setBrandingForm({
            name: json.settings.name || 'EMPATHY',
            subtitle: json.settings.subtitle || 'SPECIALITY COFFEE',
            tagline: json.settings.tagline || 'come and enjoy your coffee',
            hours: json.settings.hours || '7AM - 12AM',
            location: json.settings.location || 'QIDFA, FUJAIRAH',
            currency: json.settings.currency || 'AED',
            defaultPlaceholderImage: json.settings.defaultPlaceholderImage,
            generatedAssetFallback: json.settings.generatedAssetFallback,
            searchPlaceholder: json.settings.searchPlaceholder || 'Search coffee, V60, matcha, croissant...',
          });
        }
      } else {
        showToast('Failed to load menu data', 'error');
      }
    } catch {
      showToast('Error connecting to backend', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, []);

  // Products Handlers
  const handleOpenAddProduct = () => {
    const defaultCat = data?.categories.find((c) => c.id !== 'all')?.id || 'basic-coffee';
    setEditingProduct(null);
    setProductFormData({
      name: '',
      category: defaultCat,
      price: 20,
      currency: data?.settings.currency || 'AED',
      description: '',
      image: '/images/placeholder.jpg',
      badge: '',
      dietary: [],
      allergens: [],
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProductFormData({ ...prod });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name?.trim()) {
      showToast('Product name is required', 'error');
      return;
    }

    try {
      const isEdit = Boolean(editingProduct);
      const url = isEdit
        ? `/api/admin/products/${editingProduct?.id}`
        : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(productFormData),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to save product', 'error');
        return;
      }

      showToast(isEdit ? 'Product updated successfully' : 'Product created successfully');
      setIsProductModalOpen(false);
      loadMenuData();
    } catch {
      showToast('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        showToast('Product deleted');
        setProductToDelete(null);
        loadMenuData();
      } else {
        showToast('Failed to delete product', 'error');
      }
    } catch {
      showToast('Error deleting product', 'error');
    }
  };

  // Image Upload handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/admin/upload-image', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            dataUrl,
            filename: file.name,
          }),
        });

        const json = await res.json();
        if (res.ok && json.url) {
          setProductFormData((prev) => ({ ...prev, image: json.url }));
          showToast('Image uploaded successfully');
        } else {
          // Fallback to dataUrl directly
          setProductFormData((prev) => ({ ...prev, image: dataUrl }));
          showToast('Image set as data URL');
        }
      } catch {
        setProductFormData((prev) => ({ ...prev, image: dataUrl }));
        showToast('Image set as data URL');
      } finally {
        setImageUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Categories Handlers
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryFormData({
      name: '',
      parentGroup: 'COFFEE',
    });
    setIsCategoryModalOpen(true);
  };

  const handleOpenEditCategory = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryFormData({ ...cat });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryFormData.name?.trim()) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      const isEdit = Boolean(editingCategory);
      const url = isEdit
        ? `/api/admin/categories/${editingCategory?.id}`
        : '/api/admin/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(categoryFormData),
      });

      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || 'Failed to save category', 'error');
        return;
      }

      showToast(isEdit ? 'Category updated' : 'Category created');
      setIsCategoryModalOpen(false);
      loadMenuData();
    } catch {
      showToast('Error saving category', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          action: deleteCatAction,
          targetCategoryId: targetCatForMove,
        }),
      });

      if (res.ok) {
        showToast('Category deleted');
        setCategoryToDelete(null);
        loadMenuData();
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to delete category', 'error');
      }
    } catch {
      showToast('Error deleting category', 'error');
    }
  };

  // Branding save handler
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(brandingForm),
      });

      if (res.ok) {
        showToast('Website text & branding updated');
        loadMenuData();
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch {
      showToast('Error saving settings', 'error');
    }
  };

  // Filtered products list
  const filteredProducts = (data?.products || []).filter((p) => {
    const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const query = productSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.categoryLabel.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-[#0E3524] flex flex-col md:flex-row">
      {/* Toast alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#0E3524] text-[#EBE4D1] shadow-2xl border border-[#EBE4D1]/20 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-[#C4283D] shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#0E3524] text-[#EBE4D1] border-r border-[#EBE4D1]/10 flex flex-col shrink-0">
        <div className="p-5 border-b border-[#EBE4D1]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="compact" theme="dark" />
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular font-bold uppercase tracking-wider bg-[#C4283D] text-white">
            Admin
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 space-y-1.5 flex-1">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'products'
                ? 'bg-[#EBE4D1] text-[#0E3524] shadow-sm'
                : 'text-[#EBE4D1]/80 hover:bg-[#15442F] hover:text-[#EBE4D1]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Coffee className="w-4 h-4" />
              <span>Products</span>
            </div>
            <span
              className={`font-mono-tabular text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'products' ? 'bg-[#0E3524]/10 text-[#0E3524]' : 'bg-[#15442F] text-[#E6BD83]'
              }`}
            >
              {data?.products.length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#EBE4D1] text-[#0E3524] shadow-sm'
                : 'text-[#EBE4D1]/80 hover:bg-[#15442F] hover:text-[#EBE4D1]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4" />
              <span>Categories</span>
            </div>
            <span
              className={`font-mono-tabular text-[11px] px-2 py-0.5 rounded-full ${
                activeTab === 'categories' ? 'bg-[#0E3524]/10 text-[#0E3524]' : 'bg-[#15442F] text-[#E6BD83]'
              }`}
            >
              {data?.categories.filter((c) => c.id !== 'all').length || 0}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('branding')}
            className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'branding'
                ? 'bg-[#EBE4D1] text-[#0E3524] shadow-sm'
                : 'text-[#EBE4D1]/80 hover:bg-[#15442F] hover:text-[#EBE4D1]'
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            <span>Website Text & Branding</span>
          </button>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-[#EBE4D1]/10 space-y-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#15442F] hover:bg-[#1C5B3E] text-[#EBE4D1] text-xs font-semibold transition-colors cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Public Menu</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#C4283D]/20 hover:bg-[#C4283D] text-[#EBE4D1] text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-xs text-[#43594E]">
            <Coffee className="w-6 h-6 animate-spin text-[#C4283D]" />
            <span>Loading menu data...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: PRODUCTS */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display font-bold text-2xl text-[#0E3524]">
                      Menu Products
                    </h1>
                    <p className="text-xs text-[#43594E] mt-0.5">
                      Add, update, or remove coffee and food items on your digital menu
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddProduct}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E3524] hover:bg-[#1B5A3D] text-[#F9F8F4] text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Product</span>
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-[#0E3524]/40 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products by title or description..."
                      className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-[#0E3524]/15 text-xs text-[#0E3524] placeholder-[#0E3524]/40 focus:outline-none focus:border-[#C4283D]"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="h-10 px-3 rounded-xl bg-white border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                  >
                    <option value="all">All Categories ({data?.products.length})</option>
                    {data?.categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Products Grid / Table */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded-2xl border border-[#0E3524]/10 p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-[#0E3524]/5 overflow-hidden shrink-0 border border-[#0E3524]/10">
                          <img
                            src={p.image}
                            alt={p.name}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#43594E]">
                            {p.categoryLabel}
                          </span>
                          <h3 className="font-display font-semibold text-sm text-[#0E3524] truncate mt-0.5">
                            {p.name}
                          </h3>
                          <p className="font-mono-tabular font-bold text-xs text-[#C4283D] mt-1">
                            {p.formattedPrice}
                          </p>
                        </div>
                      </div>

                      {p.description && (
                        <p className="text-[11px] text-[#43594E] line-clamp-2 mt-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-[#0E3524]/6">
                        <button
                          type="button"
                          onClick={() => handleOpenEditProduct(p)}
                          className="p-1.5 rounded-lg text-[#0E3524]/70 hover:text-[#0E3524] hover:bg-[#F1EFE8] transition-colors cursor-pointer"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setProductToDelete(p)}
                          className="p-1.5 rounded-lg text-[#C4283D]/70 hover:text-[#C4283D] hover:bg-[#C4283D]/10 transition-colors cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-[#0E3524]/10 p-6">
                      <p className="font-semibold text-sm text-[#0E3524]">No products found</p>
                      <p className="text-xs text-[#43594E] mt-1">Try adjusting your search query or category filter</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CATEGORIES */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-display font-bold text-2xl text-[#0E3524]">
                      Menu Categories
                    </h1>
                    <p className="text-xs text-[#43594E] mt-0.5">
                      Organize your menu into sections (e.g. Breakfast, Coffee, Matcha, Dessert)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenAddCategory}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0E3524] hover:bg-[#1B5A3D] text-[#F9F8F4] text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data?.categories
                    .filter((c) => c.id !== 'all')
                    .map((cat) => {
                      const count = (data.products || []).filter((p) => p.category === cat.id).length;
                      return (
                        <div
                          key={cat.id}
                          className="bg-white rounded-2xl border border-[#0E3524]/10 p-5 flex flex-col justify-between shadow-sm"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#43594E]">
                                Group: {cat.parentGroup || 'COFFEE'}
                              </span>
                              <span className="font-mono-tabular text-xs font-semibold text-[#C4283D] px-2 py-0.5 rounded-full bg-[#C4283D]/10">
                                {count} {count === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                            <h3 className="font-display font-bold text-lg text-[#0E3524] mt-2">
                              {cat.name}
                            </h3>
                            <p className="text-[11px] font-mono-tabular text-[#43594E]/70 mt-1">
                              Slug ID: {cat.id}
                            </p>
                          </div>

                          <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-[#0E3524]/6">
                            <button
                              type="button"
                              onClick={() => handleOpenEditCategory(cat)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0E3524] bg-[#F1EFE8] hover:bg-[#E5E0D5] transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToDelete(cat);
                                const otherCat = data.categories.find((c) => c.id !== 'all' && c.id !== cat.id);
                                setTargetCatForMove(otherCat?.id || '');
                                setDeleteCatAction('move');
                              }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#C4283D] bg-[#C4283D]/10 hover:bg-[#C4283D]/20 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* TAB 3: WEBSITE TEXT & BRANDING */}
            {activeTab === 'branding' && (
              <div className="max-w-2xl space-y-6">
                <div>
                  <h1 className="font-display font-bold text-2xl text-[#0E3524]">
                    Website Text & Branding
                  </h1>
                  <p className="text-xs text-[#43594E] mt-0.5">
                    Customize public restaurant information, hours, location, and labels
                  </p>
                </div>

                <form
                  onSubmit={handleSaveBranding}
                  className="bg-white rounded-2xl border border-[#0E3524]/10 p-6 sm:p-8 space-y-5 shadow-sm"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        value={brandingForm.name}
                        onChange={(e) => setBrandingForm({ ...brandingForm, name: e.target.value })}
                        required
                        className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={brandingForm.subtitle}
                        onChange={(e) => setBrandingForm({ ...brandingForm, subtitle: e.target.value })}
                        required
                        className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                      Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={brandingForm.tagline}
                      onChange={(e) => setBrandingForm({ ...brandingForm, tagline: e.target.value })}
                      className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={brandingForm.hours}
                        onChange={(e) => setBrandingForm({ ...brandingForm, hours: e.target.value })}
                        required
                        className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                        Location
                      </label>
                      <input
                        type="text"
                        value={brandingForm.location}
                        onChange={(e) => setBrandingForm({ ...brandingForm, location: e.target.value })}
                        required
                        className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                        Menu Currency
                      </label>
                      <input
                        type="text"
                        value={brandingForm.currency}
                        onChange={(e) => setBrandingForm({ ...brandingForm, currency: e.target.value })}
                        required
                        className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1.5">
                        Search Bar Placeholder
                      </label>
                      <input
                        type="text"
                        value={brandingForm.searchPlaceholder || ''}
                        onChange={(e) =>
                          setBrandingForm({ ...brandingForm, searchPlaceholder: e.target.value })
                        }
                        className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#0E3524]/10">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C4283D] hover:bg-[#a82032] text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Branding Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E3524]/60 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#0E3524]/15 my-8">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-[#0E3524]/10">
              <h2 className="font-display font-bold text-xl text-[#0E3524]">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#F1EFE8] text-[#0E3524]/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={productFormData.name || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                    required
                    placeholder="e.g. AMERICANO"
                    className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                    Category *
                  </label>
                  <select
                    value={productFormData.category || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, category: e.target.value })}
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                  >
                    {data?.categories
                      .filter((c) => c.id !== 'all')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.parentGroup || 'COFFEE'})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                    Price ({data?.settings.currency || 'AED'}) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={productFormData.price ?? ''}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, price: parseFloat(e.target.value) || 0 })
                    }
                    required
                    className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                    Badge (Optional)
                  </label>
                  <input
                    type="text"
                    value={productFormData.badge || ''}
                    onChange={(e) => setProductFormData({ ...productFormData, badge: e.target.value })}
                    placeholder="e.g. Speciality, New, Best Seller"
                    className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={productFormData.description || ''}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, description: e.target.value })
                  }
                  placeholder="Notes on tasting notes, ingredients, preparation..."
                  className="w-full p-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                />
              </div>

              {/* Image Input and File Upload */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                  Product Image
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-14 h-14 rounded-xl bg-[#0E3524]/5 border border-[#0E3524]/15 overflow-hidden shrink-0 flex items-center justify-center">
                    {productFormData.image ? (
                      <img
                        src={productFormData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#0E3524]/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      value={productFormData.image || ''}
                      onChange={(e) => setProductFormData({ ...productFormData, image: e.target.value })}
                      placeholder="/images/Americano.JPG or URL"
                      className="w-full h-9 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F1EFE8] hover:bg-[#E5E0D5] text-[#0E3524] text-[11px] font-semibold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{imageUploading ? 'Uploading...' : 'Upload Image File'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        disabled={imageUploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#0E3524]/10">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0E3524] hover:bg-[#F1EFE8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C4283D] hover:bg-[#a82032] text-white text-xs font-semibold shadow-sm"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELETE PRODUCT CONFIRMATION */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E3524]/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#0E3524]/15 space-y-4">
            <h3 className="font-display font-bold text-lg text-[#0E3524]">
              Delete Product?
            </h3>
            <p className="text-xs text-[#43594E]">
              Are you sure you want to remove <strong>{productToDelete.name}</strong> from the menu? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#0E3524]/10">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0E3524] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteProduct}
                className="px-4 py-2 rounded-xl bg-[#C4283D] hover:bg-[#a82032] text-white text-xs font-semibold"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E3524]/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#0E3524]/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#0E3524]/10">
              <h2 className="font-display font-bold text-lg text-[#0E3524]">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#F1EFE8] text-[#0E3524]/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={categoryFormData.name || ''}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  required
                  placeholder="e.g. Specialty Tea"
                  className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#43594E] mb-1">
                  Parent Menu Section *
                </label>
                <input
                  type="text"
                  value={categoryFormData.parentGroup || ''}
                  onChange={(e) =>
                    setCategoryFormData({ ...categoryFormData, parentGroup: e.target.value })
                  }
                  required
                  placeholder="e.g. COFFEE, BREAKFAST, MATCHA, DESSERT"
                  className="w-full h-10 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524] focus:outline-none focus:border-[#C4283D]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#0E3524]/10">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0E3524] hover:bg-[#F1EFE8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0E3524] hover:bg-[#1B5A3D] text-white text-xs font-semibold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE CATEGORY CONFIRMATION */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E3524]/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#0E3524]/15 space-y-4">
            <h3 className="font-display font-bold text-lg text-[#0E3524]">
              Delete Category: {categoryToDelete.name}?
            </h3>
            <p className="text-xs text-[#43594E]">
              What would you like to do with the products currently assigned to this category?
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="delAction"
                  checked={deleteCatAction === 'move'}
                  onChange={() => setDeleteCatAction('move')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-[#0E3524]">Move products to another category:</span>
                  {deleteCatAction === 'move' && (
                    <select
                      value={targetCatForMove}
                      onChange={(e) => setTargetCatForMove(e.target.value)}
                      className="mt-2 w-full h-9 px-3 rounded-xl bg-[#F9F8F4] border border-[#0E3524]/15 text-xs text-[#0E3524]"
                    >
                      {data?.categories
                        .filter((c) => c.id !== 'all' && c.id !== categoryToDelete.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                <input
                  type="radio"
                  name="delAction"
                  checked={deleteCatAction === 'delete_products'}
                  onChange={() => setDeleteCatAction('delete_products')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-semibold text-[#C4283D]">Delete all associated products too</span>
                  <p className="text-[11px] text-[#43594E]/70">Permanently removes all items in this category</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#0E3524]/10">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#0E3524] hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCategory}
                className="px-4 py-2 rounded-xl bg-[#C4283D] hover:bg-[#a82032] text-white text-xs font-semibold"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
