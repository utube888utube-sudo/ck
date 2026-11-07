import React from 'react';
import {
  Wheat,
  Package,
  Layers,
  Droplet,
  Sparkles,
  Flame,
  Cookie,
  Coffee,
  Smile,
  Sparkle,
  Grid,
} from 'lucide-react';
import { CATEGORIES, CategoryMeta } from '../data/products.ts';

interface CategoryBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  totalProductsCount: number;
  categoryCounts?: Record<string, number>;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'Rice & Grains': <Wheat className="w-4 h-4" />,
  'Atta & Flour': <Package className="w-4 h-4" />,
  'Dals & Pulses': <Layers className="w-4 h-4" />,
  'Cooking Oils': <Droplet className="w-4 h-4" />,
  'Spices & Masalas': <Flame className="w-4 h-4" />,
  'Sugar & Salt': <Sparkles className="w-4 h-4" />,
  'Biscuits & Snacks': <Cookie className="w-4 h-4" />,
  'Tea & Coffee': <Coffee className="w-4 h-4" />,
  'Dairy Products': <Droplet className="w-4 h-4" />,
  'Personal Care': <Smile className="w-4 h-4" />,
  'Household Cleaning': <Sparkle className="w-4 h-4" />,
};

export const CategoryBar: React.FC<CategoryBarProps> = ({
  selectedCategory,
  onSelectCategory,
  totalProductsCount,
  categoryCounts = {},
}) => {
  return (
    <div className="bg-white border-b border-slate-200/90 sticky top-[88px] sm:top-[74px] z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Shop By Category
          </h3>
          <span className="text-[11px] text-slate-400">
            10 Curated Kirana Departments
          </span>
        </div>

        {/* Scrollable Category Image Tiles */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1">
          {/* "All Groceries" Tile */}
          <button
            onClick={() => onSelectCategory('ALL')}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[76px] sm:min-w-[88px] transition-all cursor-pointer border ${
              selectedCategory === 'ALL'
                ? 'bg-[#168A45] text-white border-[#168A45] shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5 ${
              selectedCategory === 'ALL' ? 'bg-white/20 text-white' : 'bg-white text-[#168A45] shadow-2xs'
            }`}>
              <Grid className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold whitespace-nowrap">All Items</span>
            <span className={`text-[10px] ${selectedCategory === 'ALL' ? 'text-emerald-100' : 'text-slate-400'}`}>
              ({totalProductsCount})
            </span>
          </button>

          {/* 10 Category Department Image Tiles */}
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.name || cat.aliases.includes(selectedCategory);
            const count = categoryCounts[cat.name] ?? 0;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(cat.name)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl min-w-[80px] sm:min-w-[94px] transition-all cursor-pointer border group shrink-0 ${
                  isSelected
                    ? 'bg-[#168A45] text-white border-[#168A45] shadow-sm'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-2xs'
                }`}
              >
                {/* Visual Image Thumbnail */}
                <div className={`w-11 h-11 rounded-xl overflow-hidden mb-1.5 p-0.5 border relative ${
                  isSelected ? 'border-white/40 bg-white/10' : 'border-slate-200 bg-slate-50'
                }`}>
                  <img
                    src={cat.imageUrl}
                    alt={cat.displayName}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>

                <span className="text-[11px] font-semibold whitespace-nowrap text-center leading-tight">
                  {cat.displayName}
                </span>
                <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                  {count > 0 ? `${count} Items` : '0 Items'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
