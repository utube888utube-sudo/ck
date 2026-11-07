import React, { useState } from 'react';
import { ShoppingBag, Zap, Plus, Minus, Edit2, CheckCircle2 } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductCardProps {
  product: Product;
  cartQuantity: number;
  onAddToCart: (product: Product) => void;
  onUpdateQuantity: (product: Product, quantity: number) => void;
  onBuyNow: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  isAdmin?: boolean;
  onAdminQuickEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  cartQuantity,
  onAddToCart,
  onUpdateQuantity,
  onBuyNow,
  onViewDetails,
  isAdmin,
  onAdminQuickEdit,
}) => {
  const [imageError, setImageError] = useState(false);

  const displayName = product.title || product.name || 'Grocery Product';
  const displayBrand = product.brand || 'Kirana Staple';
  const displayUnit = product.weight || product.unit || '1 unit';
  const displayPrice = product.selling_price ?? product.price ?? 0;
  const displayMrp = product.mrp ?? displayPrice;
  const displayImage = product.image_url || product.imageUrl || '';
  const isAvailable = product.availability === 'OUT_OF_STOCK' || product.availability === false
    ? false
    : (product.inStock !== false && (product.stockCount === undefined || product.stockCount > 0) && (product.stock_quantity === undefined || product.stock_quantity > 0));

  const autoDiscount = displayMrp > displayPrice
    ? Math.round(((displayMrp - displayPrice) / displayMrp) * 100)
    : 0;
  const discountPercent = product.discount_percentage ?? autoDiscount;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#168A45]/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative h-full">
      {/* Top Badge Strip (Discount & Sample / Admin Edit) */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        {discountPercent > 0 ? (
          <span className="bg-[#168A45] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs tracking-tight">
            {discountPercent}% OFF
          </span>
        ) : (
          <span />
        )}

        {isAdmin && onAdminQuickEdit ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdminQuickEdit(product);
            }}
            className="pointer-events-auto p-1.5 bg-white/95 backdrop-blur-sm text-slate-700 hover:text-[#168A45] hover:bg-white rounded-lg shadow-xs border border-slate-200 transition-colors cursor-pointer"
            title="Edit Price & Stock (Admin)"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        ) : product.isSamplePrice ? (
          <span className="bg-amber-100/90 text-amber-900 text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded border border-amber-200 backdrop-blur-sm">
            Sample Price
          </span>
        ) : null}
      </div>

      {/* 1. Fixed Display Area for Product Image (object-fit: contain) */}
      <div
        onClick={() => onViewDetails(product)}
        className="w-full h-36 sm:h-44 bg-white flex items-center justify-center p-3 pt-6 cursor-pointer overflow-hidden relative shrink-0"
      >
        {!imageError && displayImage ? (
          <img
            src={displayImage}
            alt={displayName}
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-emerald-50/50 text-[#168A45] p-3 text-center rounded-xl border border-emerald-100">
            <ShoppingBag className="w-7 h-7 text-[#168A45] mb-1" />
            <span className="text-[11px] font-bold truncate max-w-full">{displayBrand}</span>
            <span className="text-[10px] text-slate-500">{displayUnit}</span>
          </div>
        )}

        {!isAvailable && (
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="bg-rose-600 text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* 2. Structured Metadata Body */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white border-t border-slate-100/80">
        <div onClick={() => onViewDetails(product)} className="cursor-pointer space-y-1">
          {/* Brand & Net Pack Size */}
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-slate-500 truncate max-w-[110px]">
              {displayBrand}
            </span>
            <span className="font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] shrink-0 font-mono">
              {displayUnit}
            </span>
          </div>

          {/* Product Title (Strict 2-Line Fixed Height to Prevent Card Misalignment) */}
          <h4
            className="text-xs sm:text-[13px] font-semibold text-[#222222] line-clamp-2 h-9 sm:h-10 leading-snug group-hover:text-[#168A45] transition-colors"
            title={displayName}
          >
            {displayName}
          </h4>

          {/* Pricing Row: Green Selling Price & Strikethrough MRP */}
          <div className="pt-1 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-[#168A45] font-mono tabular-nums">
              ₹{displayPrice}
            </span>
            {displayMrp > displayPrice && (
              <span className="text-[11px] sm:text-xs text-slate-400 line-through font-mono tabular-nums">
                ₹{displayMrp}
              </span>
            )}
          </div>
        </div>

        {/* 3. Action Buttons with Consistent Bottom Baseline Alignment */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-1.5 sm:gap-2">
          {cartQuantity > 0 ? (
            <div className="flex-1 flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl px-1.5 py-1 text-emerald-900">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product, cartQuantity - 1);
                }}
                className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-lg bg-white shadow-xs text-slate-700 hover:bg-emerald-100 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 text-emerald-900" />
              </button>
              <span className="text-xs font-bold font-mono px-1">{cartQuantity}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateQuantity(product, cartQuantity + 1);
                }}
                disabled={!isAvailable}
                className="w-6 sm:w-7 h-6 sm:h-7 flex items-center justify-center rounded-lg bg-[#168A45] text-white shadow-xs hover:bg-[#075B30] transition-colors disabled:opacity-50 cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              disabled={!isAvailable}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-2 text-[11px] sm:text-xs font-semibold rounded-xl bg-[#168A45] hover:bg-[#075B30] text-white shadow-xs transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">Add</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onBuyNow(product);
            }}
            disabled={!isAvailable}
            className="py-2 px-2.5 text-[11px] sm:text-xs font-semibold rounded-xl bg-[#FFC83D] hover:bg-[#f5bc2c] text-slate-950 transition-colors flex items-center justify-center gap-1 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed shrink-0 cursor-pointer active:scale-95"
            title="Buy Now"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline whitespace-nowrap">Buy</span>
          </button>
        </div>
      </div>
    </div>
  );
};
