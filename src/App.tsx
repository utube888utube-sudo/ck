/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Sparkles,
  Phone,
  Shield,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Search,
  Filter,
  X,
} from 'lucide-react';
import { Product, CartItem, CustomerUser, Order, ProductCategory, DeliveryAddress, StoreSettings } from './types.ts';
import { api } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { StoreHero } from './components/StoreHero.tsx';
import { CategoryBar } from './components/CategoryBar.tsx';
import { ProductCard } from './components/ProductCard.tsx';
import { ProductDetailModal } from './components/ProductDetailModal.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { CheckoutModal } from './components/CheckoutModal.tsx';
import { OrdersView } from './components/OrdersView.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { DeliveryMapPicker } from './components/DeliveryMapPicker.tsx';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton.tsx';
import {
  SearchFilterToolbar,
  SortOption,
  PriceRangeOption,
} from './components/SearchFilterToolbar.tsx';
import { CATEGORIES } from './data/products.ts';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState<DeliveryAddress | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Chodeshwari Kirana Store',
    storeTagline: 'Pure & Fresh Groceries at Unbeatable Prices',
    heroTitle: 'Farm-Fresh Kirana & Daily Staples Delivered Fast',
    heroSubtitle: 'Direct to your doorstep in 30–60 mins. Premium grains, pulses, dairy, oils & kitchen essentials.',
    announcement: 'Special Community Offer: Free 1-Hour Delivery on all orders above ₹500! Fresh stock arriving daily.',
    supportPhone: '7975614686',
    adminPhone: '7975614686',
    phonepeNumber: '7760616625',
    phonepeUpiId: '7760616625@ybl',
    deliveryFee: 25,
    freeDeliveryThreshold: 500,
    storeAddress: 'Main Bazar Road, Kirana Galli, Near Temple Chowk',
    codEnabled: true,
  });

  // View state: 'SHOP' | 'ORDERS' | 'ADMIN'
  const [currentView, setCurrentView] = useState<'SHOP' | 'ORDERS' | 'ADMIN'>('SHOP');

  // Modals & Panels
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters, Sort & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('POPULAR');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<PriceRangeOption>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Check saved session & user addresses on startup
  useEffect(() => {
    const stored = api.getStoredUser();
    if (stored.user) {
      setUser(stored.user);
      setIsAdmin(stored.isAdmin);
      if (stored.user.addresses && stored.user.addresses.length > 0) {
        setDeliveryAddress(stored.user.addresses[0]);
      }
    }

    if (api.getToken()) {
      api.getMe()
        .then((res) => {
          setUser(res.user);
          setIsAdmin(res.isAdmin);
          if (res.user?.addresses && res.user.addresses.length > 0) {
            setDeliveryAddress(res.user.addresses[0]);
          }
        })
        .catch(() => {
          api.clearAuth();
          setUser(null);
          setIsAdmin(false);
        });
    }

    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const [prodRes, settingsRes] = await Promise.all([
        api.getProducts(),
        api.getSettings().catch(() => null),
      ]);
      setProducts(prodRes.products || []);
      if (settingsRes?.settings) {
        setStoreSettings(settingsRes.settings);
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
    showToast(`Added ${product.name} to basket`);
  };

  const handleUpdateQuantity = (product: Product, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.product.id !== product.id);
      }
      return prev.map((item) =>
        item.product.id === product.id ? { ...item, quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product, 1);
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (!user) {
      setIsAuthOpen(true);
    } else {
      setIsCheckoutOpen(true);
    }
  };

  const handleLoginSuccess = (loggedInUser: CustomerUser, adminStatus: boolean) => {
    setUser(loggedInUser);
    setIsAdmin(adminStatus);
    if (loggedInUser.addresses && loggedInUser.addresses.length > 0) {
      setDeliveryAddress(loggedInUser.addresses[0]);
    }
    showToast(adminStatus ? 'Logged in as Store Administrator' : `Welcome, ${loggedInUser.name}!`);
    if (cart.length > 0) {
      setIsCheckoutOpen(true);
    }
  };

  const handleLogout = () => {
    api.clearAuth();
    setUser(null);
    setIsAdmin(false);
    setCurrentView('SHOP');
    showToast('Logged out successfully');
  };

  const handleOrderPlaced = (order: Order) => {
    setCart([]);
    setDeliveryAddress(order.deliveryAddress);
    showToast(`Order ${order.id} confirmed!`);
  };

  const handleConfirmLocation = (addr: DeliveryAddress) => {
    setDeliveryAddress(addr);
    setIsLocationPickerOpen(false);
    if (user) {
      api.saveAddress(addr).catch(console.warn);
    }
    showToast(`Delivery location set to ${addr.street}`);
  };

  const clearAllFilters = () => {
    setSelectedCategory('ALL');
    setSearchQuery('');
    setSortBy('POPULAR');
    setInStockOnly(false);
    setPriceRange('ALL');
  };

  // Category Item Counts calculation
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat.name] = products.filter(
        (p) => p.category === cat.name || cat.aliases.includes(p.category)
      ).length;
    });
    return counts;
  }, [products]);

  // Filter & Sort Logic
  const filteredAndSortedProducts = products
    .filter((p) => {
      const pName = p.title || p.name || '';
      const pBrand = p.brand || '';
      const pCat = p.category || '';
      const pDesc = p.description || '';
      const pPrice = p.selling_price ?? p.price ?? 0;
      const isAvailable = p.availability === 'OUT_OF_STOCK' || p.availability === false
        ? false
        : (p.inStock !== false && (p.stockCount === undefined || p.stockCount > 0) && (p.stock_quantity === undefined || p.stock_quantity > 0));

      // Category Filter (support aliases)
      if (selectedCategory !== 'ALL') {
        const catMeta = CATEGORIES.find((c) => c.name === selectedCategory || c.displayName === selectedCategory);
        if (catMeta) {
          if (pCat !== selectedCategory && !catMeta.aliases.includes(pCat)) {
            return false;
          }
        } else if (pCat !== selectedCategory) {
          return false;
        }
      }

      // In-stock Filter
      if (inStockOnly && !isAvailable) {
        return false;
      }

      // Price Range Filter
      if (priceRange === 'UNDER_100' && pPrice >= 100) return false;
      if (priceRange === '100_TO_300' && (pPrice < 100 || pPrice > 300)) return false;
      if (priceRange === 'ABOVE_300' && pPrice <= 300) return false;

      // Text Search Query (Name, Brand, Category, Description)
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        pName.toLowerCase().includes(q) ||
        pBrand.toLowerCase().includes(q) ||
        pCat.toLowerCase().includes(q) ||
        pDesc.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const priceA = a.selling_price ?? a.price ?? 0;
      const priceB = b.selling_price ?? b.price ?? 0;
      const mrpA = a.mrp ?? priceA;
      const mrpB = b.mrp ?? priceB;
      const nameA = a.title || a.name || '';
      const nameB = b.title || b.name || '';

      if (sortBy === 'PRICE_LOW') return priceA - priceB;
      if (sortBy === 'PRICE_HIGH') return priceB - priceA;
      if (sortBy === 'ALPHABETICAL') return nameA.localeCompare(nameB);
      if (sortBy === 'DISCOUNT') {
        const discA = mrpA > priceA ? (mrpA - priceA) / mrpA : 0;
        const discB = mrpB > priceB ? (mrpB - priceB) / mrpB : 0;
        return discB - discA;
      }
      // POPULAR default
      return (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0);
    });

  const cartTotalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    Boolean(searchQuery.trim()) ||
    inStockOnly ||
    priceRange !== 'ALL' ||
    sortBy !== 'POPULAR';

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col font-sans pb-16 md:pb-0 text-[#222222]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        user={user}
        isAdmin={isAdmin}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenAdmin={() => setCurrentView('ADMIN')}
        onOpenOrders={() => setCurrentView('ORDERS')}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        deliveryAddress={deliveryAddress}
        onOpenLocationPicker={() => setIsLocationPickerOpen(true)}
        currentView={currentView}
        onNavigateHome={() => {
          setCurrentView('SHOP');
          setSelectedCategory('ALL');
        }}
        settings={storeSettings}
      />

      {/* VIEW 1: Main Storefront */}
      {currentView === 'SHOP' && (
        <main className="flex-1">
          {/* Promotional Hero Banner */}
          <StoreHero
            onShopNowClick={() => {
              const el = document.getElementById('catalog-products-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSetLocationClick={() => setIsLocationPickerOpen(true)}
            savedAddressStreet={deliveryAddress?.street}
            settings={storeSettings}
          />

          {/* 10 Category Dashboard Tiles */}
          <CategoryBar
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            totalProductsCount={products.length}
            categoryCounts={categoryCounts}
          />

          {/* Catalog Section with Advanced Search & Responsive Grid */}
          <section id="catalog-products-section" className="max-w-7xl mx-auto px-4 py-6 sm:py-8">
            {/* Products Grid / Empty States */}
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="h-72 bg-white rounded-2xl border border-slate-200 animate-pulse p-4 flex flex-col justify-between"
                  >
                    <div className="h-40 bg-slate-100 rounded-xl" />
                    <div className="space-y-2">
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Dedicated Empty Catalogue Screen Matching Specification */
              <div className="bg-white rounded-3xl border border-emerald-100/80 p-8 sm:p-14 text-center max-w-2xl mx-auto shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-50 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none" />

                <div className="relative z-10">
                  {/* Store Badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#168A45] border border-emerald-200 text-xs font-bold tracking-wide uppercase mb-4">
                    <Sparkles className="w-3.5 h-3.5" />
                    Welcome to {storeSettings.storeName}
                  </span>

                  {/* Empty Icon Illustration */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-emerald-100 to-emerald-50 text-[#168A45] flex items-center justify-center mx-auto mb-4 shadow-xs border border-emerald-200/60">
                    <ShoppingBag className="w-10 h-10 text-[#168A45]" />
                  </div>

                  {/* Headline & Subtitle per explicit requirement */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                    No Products Available Yet
                  </h3>
                  <p className="text-sm sm:text-base text-slate-500 mt-2 font-medium">
                    New products will be added soon. Please visit again!
                  </p>

                  {/* Helpful Local Store Information Box */}
                  <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-md mx-auto text-left text-xs text-slate-600 space-y-2">
                    <div className="flex items-center justify-between font-semibold text-slate-800 border-b border-slate-200 pb-2">
                      <span>{storeSettings.storeName}</span>
                      <span className="text-[#168A45] font-bold">Local Store Online</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Customer Support:</span>
                      <span className="text-emerald-700 font-semibold">Active on WhatsApp</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Accepted Payments:</span>
                      <span className="text-slate-800 font-medium">
                        {storeSettings.codEnabled ? 'Cash on Delivery & PhonePe UPI' : 'PhonePe UPI'}
                      </span>
                    </div>
                  </div>

                  {/* Action Button for Authenticated Store Administrator */}
                  {isAdmin && (
                    <div className="mt-6 flex items-center justify-center">
                      <button
                        onClick={() => setCurrentView('ADMIN')}
                        className="px-6 py-3 bg-[#168A45] hover:bg-[#075B30] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Manage Catalogue (Admin Dashboard)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              /* Beautiful "No Products Found" Screen when filters match 0 results */
              <div>
                <SearchFilterToolbar
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  inStockOnly={inStockOnly}
                  onToggleInStock={setInStockOnly}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  totalResults={0}
                  onClearFilters={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center text-slate-500 max-w-md mx-auto shadow-2xs">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-[#168A45] flex items-center justify-center mx-auto mb-3">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-lg">No Products Found</h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    We could not find matching groceries for your filters. Try resetting your search or exploring another category.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 px-5 py-2.5 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <SearchFilterToolbar
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                  inStockOnly={inStockOnly}
                  onToggleInStock={setInStockOnly}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  totalResults={filteredAndSortedProducts.length}
                  onClearFilters={clearAllFilters}
                  hasActiveFilters={hasActiveFilters}
                />

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 items-stretch">
                  {filteredAndSortedProducts.map((product) => {
                    const cartItem = cart.find((i) => i.product.id === product.id);
                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        cartQuantity={cartItem?.quantity || 0}
                        onAddToCart={(p) => handleAddToCart(p, 1)}
                        onUpdateQuantity={handleUpdateQuantity}
                        onBuyNow={handleBuyNow}
                        onViewDetails={setSelectedProduct}
                        isAdmin={isAdmin}
                        onAdminQuickEdit={() => setCurrentView('ADMIN')}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW 2: Customer Orders Timeline */}
      {currentView === 'ORDERS' && (
        <OrdersView onBackToShop={() => setCurrentView('SHOP')} />
      )}

      {/* VIEW 3: Dedicated Full-Screen Admin Dashboard */}
      {currentView === 'ADMIN' && (
        <AdminDashboard
          onBackToShop={() => setCurrentView('SHOP')}
          onProductsChanged={loadProducts}
        />
      )}

      {/* Footer (Visible when not in admin view) */}
      {currentView !== 'ADMIN' && (
        <footer className="mt-auto bg-slate-900 text-white text-xs border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-[#FFC83D] uppercase">
                {storeSettings.storeName}
              </h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                {storeSettings.storeTagline || 'Your trusted neighborhood online supermarket delivering fresh grocery staples.'}
              </p>
              <p className="text-[11px] text-slate-500">
                📍 {storeSettings.storeAddress}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Store Contacts</h4>
              <div className="space-y-1 text-slate-400">
                <p>PhonePe UPI: <strong className="text-white">{storeSettings.phonepeNumber}</strong></p>
                <p>Delivery: <strong className="text-emerald-400">FREE over ₹{storeSettings.freeDeliveryThreshold}</strong></p>
                <p>Customer Care: <span className="text-slate-300">Daily 8:00 AM – 10:00 PM</span></p>
                <p>Order Support: <span className="text-emerald-400 font-medium">Active on WhatsApp</span></p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Popular Departments</h4>
              <div className="space-y-1 text-slate-400">
                <p>• Rice & Grains, Atta & Flour</p>
                <p>• Cooking Oils & Nandini Cow Ghee</p>
                <p>• Tata Salt & Madhur Sugar</p>
                <p>• Everest Spices & Cleaning Essentials</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-200 mb-2">Neighborhood Store Promise</h4>
              <p className="text-slate-400 mb-3 text-[11px] leading-relaxed">
                Handpicked farm-fresh staples delivered straight to your doorstep within 15–25 minutes with verified digital UPI or Cash on Delivery.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setCurrentView('ADMIN')}
                  className="px-3.5 py-1.5 bg-[#168A45] hover:bg-[#075B30] text-white rounded-xl font-semibold cursor-pointer text-xs"
                >
                  Open Dedicated Admin Panel
                </button>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 py-3.5 text-center text-slate-500 text-[11px]">
            © {new Date().getFullYear()} {storeSettings.storeName}. All rights reserved. Built for local neighborhood convenience.
          </div>
        </footer>
      )}

      {/* Floating WhatsApp Support Button */}
      <WhatsAppFloatingButton
        phoneNumber={storeSettings.supportPhone}
        storeName={storeSettings.storeName}
      />

      {/* Modals & Slide-Overs */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        cartQuantity={
          selectedProduct
            ? cart.find((i) => i.product.id === selectedProduct.id)?.quantity || 0
            : 0
        }
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {user && (
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          user={user}
          onOrderPlaced={handleOrderPlaced}
          settings={storeSettings}
        />
      )}

      {/* Dedicated Standalone GPS Location Picker Modal */}
      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-2xl w-full">
            <DeliveryMapPicker
              initialAddress={deliveryAddress}
              onConfirmAddress={handleConfirmLocation}
              onCancel={() => setIsLocationPickerOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Mobile Sticky Bottom Navigation (5 destinations) */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={setCurrentView}
        cartCount={cartTotalItems}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => {
          setIsAuthOpen(true);
        }}
        onOpenSearch={() => {
          setCurrentView('SHOP');
          window.scrollTo({ top: 300, behavior: 'smooth' });
        }}
        onOpenCategories={() => {
          setCurrentView('SHOP');
          window.scrollTo({ top: 200, behavior: 'smooth' });
        }}
        isLoggedIn={Boolean(user)}
        isAdmin={isAdmin}
      />
    </div>
  );
}
