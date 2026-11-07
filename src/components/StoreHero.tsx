import React from 'react';
import { ShoppingBag, Truck, ShieldCheck, Phone, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import { StoreSettings } from '../types.ts';

interface StoreHeroProps {
  onShopNowClick: () => void;
  onSetLocationClick: () => void;
  savedAddressStreet?: string;
  settings?: StoreSettings;
}

export const StoreHero: React.FC<StoreHeroProps> = ({
  onShopNowClick,
  onSetLocationClick,
  savedAddressStreet,
  settings,
}) => {
  const storeName = settings?.storeName || 'Chodeshwari Kirana Store';
  const heroTitle = settings?.heroTitle || 'Your Daily Needs, Delivered to Your Doorstep.';
  const heroSubtitle =
    settings?.heroSubtitle ||
    'Shop fresh Indian groceries at great prices. Direct to your doorstep in 30–60 mins. Premium grains, pulses, dairy, oils & kitchen essentials.';
  const supportPhone = settings?.supportPhone || '7975614686';
  const phonepeNumber = settings?.phonepeNumber || '7760616625';
  const freeThreshold = settings?.freeDeliveryThreshold ?? 500;
  const deliveryFee = settings?.deliveryFee ?? 25;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#075B30] via-[#168A45] to-[#0A6E37] text-white rounded-3xl mx-4 my-4 sm:my-6 shadow-xl border border-emerald-600/40">
      {/* Background Grocery Imagery Collage Scrim */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            'url("https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80")',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-7 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Headline, Trust & CTAs */}
        <div className="lg:col-span-8 space-y-3.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-[#FFC83D] border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome to {storeName}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            {heroTitle}
          </h1>

          <p className="text-xs sm:text-sm text-emerald-50 max-w-2xl leading-relaxed">
            {heroSubtitle}
          </p>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onShopNowClick}
              className="px-6 py-3 bg-[#FFC83D] text-slate-950 hover:bg-[#f7bf2d] text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 text-slate-900" />
              <span>Shop Groceries at Great Prices</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onSetLocationClick}
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl border border-white/20 backdrop-blur-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#FFC83D]" />
              <span className="truncate max-w-[200px]">
                {savedAddressStreet ? `Delivering to: ${savedAddressStreet}` : 'Set Live GPS Pin'}
              </span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-3 flex flex-wrap items-center gap-4 sm:gap-6 text-[11px] sm:text-xs text-emerald-100 border-t border-white/15">
            <div className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#FFC83D]" />
              <span>15–25 Mins Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#FFC83D]" />
              <span>Cash on Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#FFC83D]" />
              <span>PhonePe: {phonepeNumber}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Delivery Value Box */}
        <div className="lg:col-span-4 hidden lg:block">
          <div className="bg-white/15 backdrop-blur-md p-5 rounded-2xl border border-white/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/15">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFC83D]">
                Store Express Desk
              </span>
              <span className="text-[10px] bg-emerald-400/20 text-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                Open Daily
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-200">Delivery Speed:</span>
                <span className="font-bold text-white">Within 15–25 Mins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">Payment Modes:</span>
                <span className="font-semibold text-white">Cash on Delivery & PhonePe UPI</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">Delivery Fee:</span>
                <span className="font-bold text-[#FFC83D]">
                  FREE above ₹{freeThreshold} (₹{deliveryFee} standard)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-200">Customer Care:</span>
                <span className="font-semibold text-white">Daily 8 AM – 10 PM (WhatsApp)</span>
              </div>
            </div>

            <div className="p-2.5 bg-black/20 rounded-xl text-[11px] text-emerald-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFC83D] shrink-0" />
              <span>100% Genuine, store-verified neighborhood groceries.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
