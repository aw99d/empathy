export interface Product {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  sectionGroup: string;
  price: number;
  currency: string;
  formattedPrice: string;
  image: string;
  fallbackImage?: string;
  description?: string;
  badge?: string;
  dietary?: string[];
  calories?: number | string;
  preparation?: string;
  allergens?: string[];
}

export interface Category {
  id: string;
  name: string;
  parentGroup?: string;
}

export interface Settings {
  name: string;
  subtitle: string;
  tagline: string;
  hours: string;
  location: string;
  currency: string;
  defaultPlaceholderImage?: string;
  generatedAssetFallback?: string;
  searchPlaceholder?: string;
}

export interface MenuData {
  settings: Settings;
  categories: Category[];
  products: Product[];
}
