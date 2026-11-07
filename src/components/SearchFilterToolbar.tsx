import React from 'react';
import { Filter, ArrowUpDown, Check, X, Sparkles } from 'lucide-react';

export type SortOption = 'POPULAR' | 'PRICE_LOW' | 'PRICE_HIGH' | 'ALPHABETICAL' | 'DISCOUNT';
export type PriceRangeOption = 'ALL' | 'UNDER_100' | '100_TO_300' | 'ABOVE_300';

interface SearchFilterToolbarProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  inStockOnly: boolean;
  onToggleInStock: (val: boolean) => void;
  priceRange: PriceRangeOption;
  onPriceRangeChange: (range: PriceRangeOption) => void;
  totalResults: number;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export const SearchFilterToolbar: React.FC<SearchFilterToolbarProps> = ({
  sortBy,
  onSortChange,
  inStockOnly,
  onToggleInStock,
  priceRange,
  onPriceRangeChange,
  totalResults,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-3 sm:p-4 mb-6 shadow-2xs space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Results Count & Active Filter Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-800">
            {totalResults} {totalResults === 1 ? 'Product' : 'Products'} Found
          </span>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            Sort By:
          </span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-800 outline-none focus:ring-2 focus:ring-[#168A45]/30 cursor-pointer"
          >
            <option value="POPULAR">Recommended (Default)</option>
            <option value="PRICE_LOW">Price: Lowest First</option>
            <option value="PRICE_HIGH">Price: Highest First</option>
            <option value="ALPHABETICAL">Alphabetical (A to Z)</option>
            <option value="DISCOUNT">Top Discounts & Savings</option>
          </select>
        </div>
      </div>

      {/* Quick Filter Chips (In Stock & Price Buckets) */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
        {/* In Stock Only Toggle */}
        <button
          onClick={() => onToggleInStock(!inStockOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all cursor-pointer border ${
            inStockOnly
              ? 'bg-emerald-50 text-[#168A45] border-emerald-300 font-semibold shadow-2xs'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
            inStockOnly ? 'bg-[#168A45] border-[#168A45] text-white' : 'border-slate-300'
          }`}>
            {inStockOnly && <Check className="w-2.5 h-2.5" />}
          </div>
          <span>In Stock Only</span>
        </button>

        {/* Price Range Pills */}
        <span className="text-slate-300 mx-1 hidden sm:inline">|</span>
        <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">Price:</span>

        {[
          { label: 'All Prices', val: 'ALL' },
          { label: 'Under ₹100', val: 'UNDER_100' },
          { label: '₹100 – ₹300', val: '100_TO_300' },
          { label: 'Above ₹300', val: 'ABOVE_300' },
        ].map((item) => (
          <button
            key={item.val}
            onClick={() => onPriceRangeChange(item.val as PriceRangeOption)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer border ${
              priceRange === item.val
                ? 'bg-[#168A45] text-white border-[#168A45] font-semibold shadow-2xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
