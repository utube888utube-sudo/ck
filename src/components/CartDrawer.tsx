import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../types.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (product: any, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const totalMrp = cart.reduce((acc, item) => acc + item.product.mrp * item.quantity, 0);
  const totalSavings = totalMrp > subtotal ? totalMrp - subtotal : 0;
  const deliveryFee = subtotal >= 500 || subtotal === 0 ? 0 : 25;
  const finalTotal = subtotal + deliveryFee;
  const freeDeliveryShortfall = 500 - subtotal;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Top Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#168A45]" />
            <h3 className="font-bold text-[#222222] text-base">Your Grocery Basket</h3>
            <span className="bg-emerald-100 text-[#075B30] text-xs font-bold px-2 py-0.5 rounded-full font-mono">
              {cart.reduce((total, item) => total + item.quantity, 0)} items
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Delivery Bar */}
        {subtotal > 0 && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 text-xs text-[#075B30] flex items-center justify-between">
            {freeDeliveryShortfall > 0 ? (
              <span>
                Add <strong>₹{freeDeliveryShortfall}</strong> more for <strong>FREE Delivery</strong>!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-semibold text-[#168A45]">
                <Sparkles className="w-3.5 h-3.5" />
                Yay! You unlocked FREE Delivery!
              </span>
            )}
          </div>
        )}

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <ShoppingBag className="w-16 h-16 text-slate-200 mb-3" />
              <h4 className="font-bold text-slate-800 text-base">Your basket is empty</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Explore our 50 fresh grocery items and add what your family needs today.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-5 py-2.5 bg-[#168A45] text-white text-xs font-semibold rounded-xl hover:bg-[#075B30] transition-colors cursor-pointer shadow-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center gap-3 p-3 bg-white border border-slate-200/80 rounded-2xl hover:border-slate-300 transition-colors shadow-2xs"
              >
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  className="w-14 h-14 object-contain rounded-xl bg-slate-50 p-1 shrink-0 border border-slate-100"
                />

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {item.product.brand} · {item.product.unit}
                  </span>
                  <h5 className="text-xs font-semibold text-slate-800 truncate">
                    {item.product.name}
                  </h5>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-sm font-bold text-[#168A45] font-mono">
                      ₹{item.product.price * item.quantity}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      (₹{item.product.price} each)
                    </span>
                  </div>
                </div>

                {/* Quantity Stepper */}
                <div className="flex items-center gap-1.5 bg-slate-100 rounded-xl p-1">
                  <button
                    onClick={() => {
                      if (item.quantity === 1) {
                        onRemoveItem(item.product.id);
                      } else {
                        onUpdateQuantity(item.product, item.quantity - 1);
                      }
                    }}
                    className="w-6 h-6 flex items-center justify-center bg-white rounded-lg shadow-xs text-slate-700 hover:bg-slate-200 cursor-pointer"
                  >
                    {item.quantity === 1 ? (
                      <Trash2 className="w-3 h-3 text-rose-600" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                  </button>
                  <span className="w-5 text-center text-xs font-bold font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQuantity(item.product, item.quantity + 1)}
                    className="w-6 h-6 flex items-center justify-center bg-[#168A45] text-white rounded-lg shadow-xs hover:bg-[#075B30] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Summary & Sticky Checkout Button */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white space-y-3 shadow-lg">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-mono font-medium text-slate-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-mono font-medium text-slate-900">
                  {deliveryFee === 0 ? (
                    <span className="text-[#168A45] font-bold uppercase text-[11px]">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between text-[#168A45] font-medium">
                  <span>Total Savings</span>
                  <span className="font-mono font-bold">-₹{totalSavings}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 flex justify-between text-base font-bold text-slate-900">
                <span>To Pay</span>
                <span className="font-mono text-[#168A45]">₹{finalTotal}</span>
              </div>
            </div>

            {/* Mobile Sticky CTA */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3.5 px-4 bg-[#168A45] hover:bg-[#075B30] text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#168A45]" />
              <span>Cash on Delivery & PhonePe UPI Accepted</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
