import React from 'react';
import { ShoppingBag, User, Shield, Phone, Search, LogOut, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { CustomerUser, DeliveryAddress, StoreSettings } from '../types.ts';

interface NavbarProps {
  user: CustomerUser | null;
  isAdmin: boolean;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenAdmin: () => void;
  onOpenOrders: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  deliveryAddress: DeliveryAddress | null;
  onOpenLocationPicker: () => void;
  currentView: 'SHOP' | 'ORDERS' | 'ADMIN';
  onNavigateHome: () => void;
  settings?: StoreSettings;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  isAdmin,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenAdmin,
  onOpenOrders,
  onLogout,
  searchQuery,
  onSearchChange,
  deliveryAddress,
  onOpenLocationPicker,
  currentView,
  onNavigateHome,
  settings,
}) => {
  const supportPhone = settings?.supportPhone || '7975614686';
  const phonepeNumber = settings?.phonepeNumber || '7760616625';
  const announcement = settings?.announcement || 'Fast 15–25 Mins Local Doorstep Delivery';
  const freeThreshold = settings?.freeDeliveryThreshold ?? 500;
  const storeName = settings?.storeName || 'CHODESHWARI KIRANA';
  const storeTagline = settings?.storeTagline || 'Store & Supermarket';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Quick-Delivery & Helpline Strip */}
      <div className="bg-[#075B30] text-white text-[10px] sm:text-[11px] px-3 sm:px-4 py-1 flex items-center justify-between gap-2 overflow-hidden">
        <div className="flex items-center gap-2 min-w-0 truncate">
          <span className="flex items-center gap-1.5 font-semibold text-[#FFC83D] truncate">
            <Sparkles className="w-3 h-3 shrink-0" />
            <span className="truncate">{announcement}</span>
          </span>
          <span className="hidden md:inline text-emerald-200">·</span>
          <span className="hidden md:inline text-emerald-100 shrink-0">
            Free Delivery over ₹{freeThreshold}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-[10px] sm:text-[11px]">
          <a
            href={`https://wa.me/91${supportPhone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${storeName}, I need assistance with my grocery order.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-100 hover:text-white transition-colors"
            title="Chat with Customer Support on WhatsApp"
          >
            <Phone className="w-2.5 h-2.5 text-[#FFC83D]" />
            <span>Order Support</span>
          </a>
          <span className="text-emerald-700 hidden sm:inline">|</span>
          <span className="text-emerald-200 hidden sm:inline">
            PhonePe: <strong className="text-white font-mono">{phonepeNumber}</strong>
          </span>
        </div>
      </div>

      {/* Main 3-Zone Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 py-2 sm:py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Zone 1: Store Wordmark & Delivery Pin */}
        <div className="flex items-center gap-4 sm:gap-6 shrink-0">
          <button
            onClick={onNavigateHome}
            className="text-left group focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#168A45] flex items-center justify-center text-white font-black text-sm shadow-xs">
                CK
              </div>
              <div>
                <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#222222] group-hover:text-[#168A45] transition-colors leading-none block">
                  {storeName}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mt-0.5 truncate max-w-[200px]">
                  {storeTagline}
                </span>
              </div>
            </div>
          </button>

          {/* Blinkit/Zepto Delivery Location Pill */}
          <button
            onClick={onOpenLocationPicker}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/60 rounded-xl transition-all text-left cursor-pointer max-w-[220px]"
            title="Click to change delivery GPS pin"
          >
            <MapPin className="w-4 h-4 text-[#168A45] shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#168A45] block leading-none">
                Delivery in 15–25 Mins
              </span>
              <span className="text-xs font-semibold text-slate-800 truncate block mt-0.5">
                {deliveryAddress?.street ? `${deliveryAddress.street} (${deliveryAddress.pincode})` : 'Pinpoint on Map'}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Zone 2: Centered Instant Search Bar */}
        <div className="flex-1 max-w-lg hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search rice, atta, cooking oil, spices, soaps, snacks..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-[#168A45] focus:ring-2 focus:ring-[#168A45]/20 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Zone 3: Actions (Admin / User / Basket) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Admin Badge */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className={`px-3 py-2 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap cursor-pointer ${
                currentView === 'ADMIN'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-100 text-[#075B30] hover:bg-emerald-200'
              }`}
              title="Store Owner Admin Panel"
            >
              <Shield className="w-3.5 h-3.5 text-[#168A45]" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          )}

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={onOpenOrders}
                className="px-2.5 py-2 text-xs font-semibold text-slate-700 hover:text-[#168A45] hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Account & Orders"
              >
                <div className="w-6 h-6 rounded-full bg-[#168A45] text-white flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline max-w-[100px] truncate font-medium">
                  {user.name || user.mobile}
                </span>
              </button>

              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#168A45] hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-[#168A45]" />
              <span>Login</span>
            </button>
          )}

          {/* Shopping Cart CTA with Live Badge */}
          <button
            onClick={onOpenCart}
            className="px-3.5 sm:px-4 py-2 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer active:scale-95"
            aria-label="View Shopping Basket"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="bg-[#FFC83D] text-slate-950 text-[11px] font-black px-1.5 py-0.2 rounded-full font-mono">
              {cartCount}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Location & Search Row */}
      <div className="sm:hidden px-4 pb-2.5 space-y-2">
        <button
          onClick={onOpenLocationPicker}
          className="w-full flex items-center justify-between px-3 py-1.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-left"
        >
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-[#168A45] shrink-0" />
            <span className="text-[11px] font-semibold text-slate-800 truncate">
              {deliveryAddress?.street ? `Deliver to: ${deliveryAddress.street}` : 'Set Delivery Pin (GPS)'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#168A45] shrink-0">Change</span>
        </button>

        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search 50 grocery staples..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-[#168A45]"
          />
        </div>
      </div>
    </header>
  );
};
