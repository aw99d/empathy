import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, MapPin } from 'lucide-react';
import { Product, Settings } from '../types';
import { Logo } from './Logo';

interface ProductModalProps {
  item: Product | null;
  onClose: () => void;
  settings: Settings;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  item,
  onClose,
  settings,
}) => {
  const [imgSrc, setImgSrc] = useState('');
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (item) {
      setImgSrc(item.image);
      setHasError(false);
    }
  }, [item]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (item) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-product-title"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0E3524]/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg bg-[#F9F8F4] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl border border-[#0E3524]/15 max-h-[90vh] flex flex-col"
          >
            {/* Mobile Drag Indicator */}
            <div className="sm:hidden w-10 h-1.5 bg-[#0E3524]/20 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close product details"
              className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-[#0E3524]/80 hover:bg-[#C4283D] text-[#F9F8F4] flex items-center justify-center transition-colors shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Product Image Header */}
            <div className="relative w-full aspect-[4/3] bg-[#0E3524] shrink-0 overflow-hidden">
              {!hasError && imgSrc ? (
                <img
                  src={imgSrc}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  onError={() => {
                    if (item.fallbackImage && imgSrc !== item.fallbackImage) {
                      setImgSrc(item.fallbackImage);
                    } else {
                      setHasError(true);
                    }
                  }}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0E3524] p-6">
                  <Logo variant="emblem" theme="dark" className="w-40 h-32" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-[#0E3524]/60 via-transparent to-transparent" />

              <div className="absolute bottom-3 left-5 right-5 flex items-end justify-between text-[#F9F8F4]">
                <div className="flex items-center gap-2 text-xs font-medium tracking-wider uppercase text-[#EBE4D1]/90">
                  <span>{item.sectionGroup}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.categoryLabel}</span>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-start justify-between gap-4">
                <h2
                  id="modal-product-title"
                  className="font-display font-bold text-2xl sm:text-3xl text-[#0E3524] leading-tight"
                >
                  {item.name}
                </h2>
                <div className="shrink-0 text-right">
                  <span className="font-mono-tabular font-bold text-2xl text-[#C4283D]">
                    {item.formattedPrice}
                  </span>
                </div>
              </div>

              {item.description && (
                <p className="text-sm sm:text-base text-[#43594E] leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Category & Section Metadata */}
              <div className="pt-4 border-t border-[#0E3524]/10 grid grid-cols-2 gap-4 text-xs text-[#43594E]">
                <div>
                  <span className="block uppercase tracking-wider text-[11px] text-[#43594E]/70">
                    Category
                  </span>
                  <span className="font-semibold text-[#0E3524] mt-0.5 block">
                    {item.categoryLabel}
                  </span>
                </div>
                <div>
                  <span className="block uppercase tracking-wider text-[11px] text-[#43594E]/70">
                    Menu Section
                  </span>
                  <span className="font-semibold text-[#0E3524] mt-0.5 block">
                    {item.sectionGroup}
                  </span>
                </div>
              </div>

              {/* Extra info if present */}
              {item.allergens && item.allergens.length > 0 && (
                <div className="p-3.5 rounded-xl bg-white border border-[#0E3524]/10 space-y-2 text-xs text-[#43594E]">
                  <div className="flex justify-between">
                    <span className="text-[#43594E]/70">Allergens:</span>
                    <span className="font-medium text-[#0E3524]">{item.allergens.join(', ')}</span>
                  </div>
                </div>
              )}

              {/* Hours and Location Pills */}
              <div className="p-4 rounded-2xl bg-[#F1EFE8] flex flex-wrap items-center justify-between gap-3 text-xs text-[#0E3524]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#C4283D] shrink-0" />
                  <span>Served daily {settings.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#C4283D] shrink-0" />
                  <span>{settings.location}</span>
                </div>
              </div>

              {/* Back to menu button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full h-12 rounded-xl bg-[#0E3524] hover:bg-[#1B5A3D] text-[#F9F8F4] font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
              >
                Back to Menu
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
