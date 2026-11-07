import React, { useState } from 'react';
import { X, ShoppingBag, Zap, Shield, Check, Truck, AlertCircle } from 'lucide-react';
import { Product } from '../types.ts';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  cartQuantity: number;
  onAddToCart: (product: Product, quantity?: number) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  cartQuantity,
  onAddToCart,
  onBuyNow,
}) => {
  if (!product) return null;

  const [qty, setQty] = useState(1);
  const [imageError, setImageError] = useState(false);

  const displayName = product.title || product.name || 'Grocery Staple';
  const displayBrand = product.brand || 'Kirana Product';
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
  const savings = displayMrp > displayPrice ? displayMrp - displayPrice : 0;
  const stockAvailableCount = product.stock_quantity ?? product.stockCount ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-white/80 hover:bg-white rounded-full shadow-sm transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image */}
          <div className="w-full h-64 md:h-80 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center p-4 relative">
            {!imageError && displayImage ? (
              <img
                src={displayImage}
                alt={displayName}
                referrerPolicy="no-referrer"
                onError={() => setImageError(true)}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4">
                <ShoppingBag className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
                <span className="text-sm font-bold text-slate-700">{displayBrand}</span>
              </div>
            )}

            {product.isSamplePrice && (
              <div className="absolute bottom-3 left-3 bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-md border border-amber-200">
                Sample Price · Store Verified
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <span className="font-bold uppercase tracking-wider text-emerald-700">
                  {displayBrand}
                </span>
                <span>·</span>
                <span>{product.category}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900 leading-snug">
                {displayName}
              </h2>

              <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                <span>Net Quantity / Weight:</span>
                <span className="text-emerald-700 font-bold">{displayUnit}</span>
              </div>

              {/* Price Block */}
              <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#168A45] font-mono">
                    ₹{displayPrice}
                  </span>
                  {displayMrp > displayPrice && (
                    <>
                      <span className="text-sm text-slate-400 line-through font-mono">
                        ₹{displayMrp}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Save ₹{savings} ({discountPercent}% OFF)
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Inclusive of all taxes. Free delivery on orders above ₹500.
                </p>
              </div>

              {/* Manufacturing & Expiry Dates (if provided) */}
              {(product.manufacture_date || product.expiry_date) && (
                <div className="mt-3 p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                  {product.manufacture_date && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500">Mfg Date:</span>
                      <span className="font-semibold text-slate-800">{product.manufacture_date}</span>
                    </div>
                  )}
                  {product.expiry_date && (
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="font-medium text-slate-500">Expiry / Best Before:</span>
                      <span className="font-bold text-emerald-800">{product.expiry_date}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stock Status */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                {isAvailable ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    In Stock at Chodeshwari Kirana Store ({stockAvailableCount > 0 ? `${stockAvailableCount} units` : 'Available'})
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-rose-600 font-medium">
                    <AlertCircle className="w-4 h-4" />
                    Currently Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mt-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  About this item
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {product.description || 'Fresh and authentic kirana grocery staple packed hygienically.'}
                </p>
              </div>

              {/* Kirana Trust Badges */}
              <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Doorstep Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>100% Genuine Brands</span>
                </div>
              </div>
            </div>

            {/* Bottom Purchase CTAs */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, qty);
                  onClose();
                }}
                disabled={!isAvailable}
                className="flex-1 py-3 px-4 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onBuyNow(product);
                  onClose();
                }}
                disabled={!isAvailable}
                className="py-3 px-5 bg-[#FFC83D] hover:bg-[#f5bc2c] text-slate-950 text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
