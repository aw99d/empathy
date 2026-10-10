import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, QrCode } from 'lucide-react';
import { Product, MenuData, Category } from '../types';
import { Logo } from '../components/Logo';
import { SplashScreen } from '../components/SplashScreen';
import { ProductCard } from '../components/ProductCard';
import { ProductModal } from '../components/ProductModal';
import { QrModal } from '../components/QrModal';

interface PublicMenuProps {
  initialData?: MenuData | null;
}

export const PublicMenu: React.FC<PublicMenuProps> = ({ initialData }) => {
  const [data, setData] = useState<MenuData | null>(initialData || null);
  const [showSplash, setShowSplash] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Splash auto-dismiss timer (1.75s)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1750);
    return () => clearTimeout(timer);
  }, []);

  // Fetch menu data if not loaded or refresh periodically
  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((json: MenuData) => {
        setData(json);
      })
      .catch((err) => {
        console.error('Failed to fetch menu:', err);
      });
  }, []);

  const settings = data?.settings || {
    name: 'EMPATHY',
    subtitle: 'SPECIALITY COFFEE',
    tagline: 'come and enjoy your coffee',
    hours: '7AM - 12AM',
    location: 'QIDFA, FUJAIRAH',
    currency: 'AED',
    searchPlaceholder: 'Search coffee, V60, matcha, croissant...',
  };

  const categories = data?.categories || [];
  const products = data?.products || [];

  // Filter products by selected category and search
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        (item.categoryLabel && item.categoryLabel.toLowerCase().includes(q)) ||
        (item.sectionGroup && item.sectionGroup.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // Group filtered products by category sections
  const groupedSections = useMemo(() => {
    const validCats = categories.filter((c) => c.id !== 'all');

    if (selectedCategory !== 'all') {
      const activeCat = validCats.find((c) => c.id === selectedCategory);
      return activeCat ? [{ category: activeCat, items: filteredProducts }] : [];
    }

    return validCats
      .map((cat) => ({
        category: cat,
        items: filteredProducts.filter((item) => item.category === cat.id),
      }))
      .filter((group) => group.items.length > 0);
  }, [categories, selectedCategory, filteredProducts]);

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: products.length };
    for (const cat of categories) {
      if (cat.id !== 'all') {
        counts[cat.id] = products.filter((p) => p.category === cat.id).length;
      }
    }
    return counts;
  }, [categories, products]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F4] text-[#0E3524] selection:bg-[#C4283D] selection:text-[#F9F8F4]">
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onEnterMenu={() => setShowSplash(false)}
            location={settings.location}
            hours={settings.hours}
          />
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <header className="sticky top-0 z-30 h-14 bg-[#0E3524] text-[#EBE4D1] border-b border-[#EBE4D1]/10 px-4 sm:px-8 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display font-bold text-lg sm:text-xl tracking-wider text-[#EBE4D1] whitespace-nowrap"
        >
          {settings.name || 'EMPATHY'}
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="min-h-[38px] px-3.5 py-1.5 rounded-lg bg-[#C4283D] hover:bg-[#a82032] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section
        id="top"
        className="relative bg-[#0E3524] text-[#EBE4D1] pt-6 pb-10 sm:py-12 px-4 sm:px-8 overflow-hidden border-b border-[#0E3524]"
      >
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #C4283D 0%, transparent 70%)' }}
        />

        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          {/* Main Logo */}
          <div className="flex justify-center">
            <Logo variant="full" theme="dark" />
          </div>

          {/* Search Bar */}
          <div className="w-full max-w-md relative">
            <Search className="w-4 h-4 text-[#EBE4D1]/60 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={settings.searchPlaceholder || 'Search coffee, V60, matcha, croissant...'}
              aria-label="Search menu items"
              className="w-full h-12 pl-11 pr-10 rounded-xl bg-[#15442F] border border-[#EBE4D1]/20 text-[#EBE4D1] placeholder-[#EBE4D1]/50 text-sm focus:outline-none focus:border-[#E6BD83] transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full hover:bg-[#EBE4D1]/10 flex items-center justify-center text-[#EBE4D1]/70 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Browse Section */}
      <main
        id="menu-browse-anchor"
        className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16"
      >
        {/* Horizontal Category Navigation */}
        <div className="mb-8">
          <div
            role="tablist"
            aria-label="Menu categories"
            className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1"
          >
            {categories.map((cat: Category) => {
              const isActive = selectedCategory === cat.id;
              const count = categoryCounts[cat.id] ?? 0;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#0E3524] text-[#EBE4D1] shadow-sm'
                      : 'bg-[#F1EFE8] text-[#0E3524]/80 hover:bg-[#E5E0D5] hover:text-[#0E3524]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`font-mono-tabular text-[11px] ${
                      isActive ? 'text-[#E6BD83]' : 'text-[#0E3524]/50'
                    }`}
                  >
                    ({count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards by Category Sections */}
        {groupedSections.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#0E3524]/10 p-8 my-4">
            <p className="font-display font-semibold text-lg text-[#0E3524]">
              No menu items match “{searchQuery}”
            </p>
            <p className="text-xs text-[#43594E] mt-1">
              Try clearing your search or switching to All Menu.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#0E3524] text-[#F9F8F4] text-xs font-semibold hover:bg-[#1B5A3D] transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedSections.map(({ category: cat, items }) => (
              <motion.section
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                aria-labelledby={`heading-${cat.id}`}
                className="space-y-5"
              >
                {/* Section Header */}
                <div className="flex items-center gap-4">
                  <div className="flex items-baseline gap-3">
                    <h2
                      id={`heading-${cat.id}`}
                      className="font-display font-bold text-xl sm:text-2xl text-[#0E3524] tracking-tight uppercase"
                    >
                      {cat.name}
                    </h2>
                    {cat.parentGroup && cat.parentGroup !== cat.name.toUpperCase() && (
                      <span className="text-xs font-medium uppercase tracking-widest text-[#43594E]">
                        · {cat.parentGroup}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-px bg-[#0E3524]/15" />
                  <span className="font-mono-tabular text-xs text-[#43594E]">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Grid of Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {items.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      item={prod}
                      onSelect={(item) => setSelectedProduct(item)}
                    />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>
        )}
      </main>

      {/* Product Detail Modal */}
      <ProductModal
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        settings={settings}
      />

      {/* QR Code Modal */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        settings={settings}
      />
    </div>
  );
};
