import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../types';
import { Logo } from './Logo';

interface ProductCardProps {
  item: Product;
  onSelect: (item: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onSelect }) => {
  const [imgSrc, setImgSrc] = useState(item.image);
  const [hasError, setHasError] = useState(false);

  const handleImageError = () => {
    if (imgSrc !== item.fallbackImage && item.fallbackImage) {
      setImgSrc(item.fallbackImage);
    } else {
      setHasError(true);
    }
  };

  return (
    <article
      onClick={() => onSelect(item)}
      className="group relative flex flex-col rounded-2xl bg-white border border-[#0E3524]/10 overflow-hidden shadow-sm hover:shadow-md hover:border-[#0E3524]/25 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      {/* Product Image Banner */}
      <div className="relative w-full aspect-[4/3] bg-[#0E3524]/5 overflow-hidden">
        {!hasError && imgSrc ? (
          <img
            src={imgSrc}
            alt={`${item.name} — Empathy Speciality Coffee`}
            referrerPolicy="no-referrer"
            onError={handleImageError}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#0E3524]/10 p-6">
            <Logo variant="emblem" theme="light" className="w-20 h-16 opacity-40" />
          </div>
        )}

        {/* Hover overlay on desktop */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-[#0E3524]/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Badges or tags if present */}
        {item.badge && (
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C4283D] text-white shadow-sm">
            {item.badge}
          </span>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between p-4 w-full">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[#43594E]">
            <span>{item.sectionGroup}</span>
            <span aria-hidden="true">·</span>
            <span className="truncate">{item.categoryLabel}</span>
          </div>

          <h3 className="font-display font-semibold text-base sm:text-[17px] text-[#0E3524] mt-1 leading-snug group-hover:text-[#C4283D] transition-colors">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-xs text-[#43594E] mt-1 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {item.dietary && item.dietary.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.dietary.map((tag) => (
                <span
                  key={tag}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#F1EFE8] text-[#0E3524]/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Price and Plus button */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#0E3524]/6">
          <span className="font-mono-tabular font-semibold text-[15px] text-[#0E3524]">
            {item.formattedPrice}
          </span>
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F1EFE8] text-[#0E3524] group-hover:bg-[#C4283D] group-hover:text-white transition-colors"
            aria-hidden="true"
          >
            <Plus className="w-4 h-4" />
          </span>
        </div>
      </div>
    </article>
  );
};
