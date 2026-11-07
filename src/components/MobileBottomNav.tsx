import React from 'react';
import { Home, Grid, Search, ShoppingBag, User, Shield } from 'lucide-react';

interface MobileBottomNavProps {
  currentView: 'SHOP' | 'ORDERS' | 'ADMIN';
  onNavigate: (view: 'SHOP' | 'ORDERS' | 'ADMIN') => void;
  cartCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenSearch: () => void;
  onOpenCategories: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  cartCount,
  onOpenCart,
  onOpenAuth,
  onOpenSearch,
  onOpenCategories,
  isLoggedIn,
  isAdmin,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Destination 1: Home */}
        <button
          onClick={() => onNavigate('SHOP')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
            currentView === 'SHOP' ? 'text-[#168A45] font-bold' : 'text-slate-500'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Destination 2: Categories */}
        <button
          onClick={onOpenCategories}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-[#168A45] transition-colors cursor-pointer"
          aria-label="Categories"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Categories</span>
        </button>

        {/* Destination 3: Search */}
        <button
          onClick={onOpenSearch}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 hover:text-[#168A45] transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Search</span>
        </button>

        {/* Destination 4: Cart (with Live Badge) */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-700 hover:text-[#168A45] transition-colors cursor-pointer relative"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-[#168A45]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-[#FFC83D] text-slate-950 font-mono text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-[#168A45]">Cart</span>
        </button>

        {/* Destination 5: Profile / Admin */}
        {isAdmin ? (
          <button
            onClick={() => onNavigate('ADMIN')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
              currentView === 'ADMIN' ? 'text-[#168A45] font-bold' : 'text-slate-500'
            }`}
            aria-label="Admin"
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">Admin</span>
          </button>
        ) : (
          <button
            onClick={isLoggedIn ? () => onNavigate('ORDERS') : onOpenAuth}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors cursor-pointer ${
              currentView === 'ORDERS' ? 'text-[#168A45] font-bold' : 'text-slate-500'
            }`}
            aria-label="Account"
          >
            <User className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">{isLoggedIn ? 'Orders' : 'Login'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
