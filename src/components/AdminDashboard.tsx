import React, { useState, useEffect, useRef } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  PlusCircle,
  FolderTree,
  ClipboardList,
  Users,
  Boxes,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  Phone,
  RefreshCw,
  Search,
  Filter,
  DollarSign,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  BarChart3,
  ArrowUpRight,
  Upload,
  Image as ImageIcon,
  X,
  Calendar,
  Eye,
  EyeOff,
  Save,
  Store,
  CreditCard,
  MapPin,
  Sparkles,
  Bell,
} from 'lucide-react';
import { Product, Order, OrderStatus, ProductCategory, StoreSettings } from '../types.ts';
import { api } from '../services/api.ts';
import { CATEGORIES } from '../data/products.ts';
import { SalesInsightsCard } from './SalesInsightsCard.tsx';

interface AdminDashboardProps {
  onBackToShop: () => void;
  onProductsChanged?: () => void;
}

type AdminTab =
  | 'DASHBOARD'
  | 'MANAGE_PRODUCTS'
  | 'ADD_PRODUCT'
  | 'CATEGORIES'
  | 'MANAGE_ORDERS'
  | 'CUSTOMERS'
  | 'INVENTORY'
  | 'SALES_REPORTS'
  | 'SETTINGS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToShop,
  onProductsChanged,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('ALL');
  const [productStockFilter, setProductStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'INACTIVE'>('ALL');
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add / Edit Product Form State
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formBrand, setFormBrand] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Rice & Grains');
  const [formUnit, setFormUnit] = useState('1 kg');
  const [formMrp, setFormMrp] = useState('');
  const [formSellingPrice, setFormSellingPrice] = useState('');
  const [formDiscount, setFormDiscount] = useState<number>(0);
  const [formStockCount, setFormStockCount] = useState('50');
  const [formInStock, setFormInStock] = useState(true);
  const [formStatus, setFormStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formMfgDate, setFormMfgDate] = useState('');
  const [formExpDate, setFormExpDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageUploadMode, setImageUploadMode] = useState<'FILE' | 'URL'>('FILE');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store Settings & Autonomous Configuration State
  const defaultSettings: StoreSettings = {
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
  };
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(defaultSettings);
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(defaultSettings);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [prodRes, orderRes, settingsRes] = await Promise.all([
        api.adminGetProducts(),
        api.adminGetOrders(),
        api.getSettings(),
      ]);
      setProducts(prodRes.products || []);
      setOrders(orderRes.orders || []);
      if (settingsRes?.settings) {
        setStoreSettings(settingsRes.settings);
        setSettingsForm(settingsRes.settings);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load administrative data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await api.adminUpdateSettings(settingsForm);
      if (res.success && res.settings) {
        setStoreSettings(res.settings);
        setSettingsForm(res.settings);
        showToast('Store configurations updated and synced live!');
        if (onProductsChanged) {
          onProductsChanged();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to update store settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 25000);
    return () => clearInterval(timer);
  }, []);

  // Recalculate discount dynamically whenever MRP or Selling Price changes
  useEffect(() => {
    const mrp = parseFloat(formMrp);
    const sellingPrice = parseFloat(formSellingPrice);
    if (!isNaN(mrp) && !isNaN(sellingPrice) && mrp > 0) {
      if (mrp > sellingPrice) {
        const disc = Math.round(((mrp - sellingPrice) / mrp) * 100);
        setFormDiscount(disc);
      } else {
        setFormDiscount(0);
      }
    } else {
      setFormDiscount(0);
    }
  }, [formMrp, formSellingPrice]);

  // Handle local image file upload from phone or computer
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Please select a JPG, JPEG, PNG, or WebP image file.');
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size exceeds 10MB. Please choose a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormImageUrl(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setFormImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resetForm = () => {
    setEditingProductId(null);
    setFormTitle('');
    setFormBrand('');
    setFormCategory('Rice & Grains');
    setFormUnit('1 kg');
    setFormMrp('');
    setFormSellingPrice('');
    setFormDiscount(0);
    setFormStockCount('50');
    setFormInStock(true);
    setFormStatus('ACTIVE');
    setFormMfgDate('');
    setFormExpDate('');
    setFormDescription('');
    setFormImageUrl('');
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openAddProductTab = () => {
    resetForm();
    setActiveTab('ADD_PRODUCT');
  };

  const openEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setFormTitle(p.title || p.name);
    setFormBrand(p.brand || '');
    setFormCategory(p.category);
    setFormUnit(p.weight || p.unit || '1 kg');
    setFormMrp(String(p.mrp));
    setFormSellingPrice(String(p.selling_price || p.price));
    setFormDiscount(p.discount_percentage || 0);
    setFormStockCount(String(p.stock_quantity ?? p.stockCount ?? 50));
    setFormInStock(p.availability !== undefined ? (p.availability === true || p.availability === 'IN_STOCK') : Boolean(p.inStock));
    setFormStatus(p.status || 'ACTIVE');
    setFormMfgDate(p.manufacture_date || '');
    setFormExpDate(p.expiry_date || '');
    setFormDescription(p.description || '');
    
    const img = p.image_url || p.imageUrl || '';
    setFormImageUrl(img);
    setImagePreview(img || null);
    if (img.startsWith('http')) {
      setImageUploadMode('URL');
    } else {
      setImageUploadMode('FILE');
    }

    setActiveTab('ADD_PRODUCT');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Editing "${p.title || p.name}"`);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showToast('Product Title is mandatory.');
      return;
    }

    const mrpNum = parseFloat(formMrp);
    const sellingPriceNum = parseFloat(formSellingPrice);

    if (isNaN(mrpNum) || mrpNum <= 0) {
      showToast('Please enter a valid MRP price.');
      return;
    }

    if (isNaN(sellingPriceNum) || sellingPriceNum <= 0) {
      showToast('Please enter a valid Selling Price.');
      return;
    }

    let allowOverride = false;
    if (sellingPriceNum > mrpNum) {
      const confirmOverride = window.confirm(
        `Warning: Selling price (₹${sellingPriceNum}) is higher than MRP (₹${mrpNum}). Do you wish to override and save anyway?`
      );
      if (!confirmOverride) return;
      allowOverride = true;
    }

    const payload = {
      title: formTitle.trim(),
      name: formTitle.trim(),
      brand: formBrand.trim() || 'Store Special',
      category: formCategory,
      weight: formUnit.trim() || '1 kg',
      unit: formUnit.trim() || '1 kg',
      mrp: mrpNum,
      selling_price: sellingPriceNum,
      price: sellingPriceNum,
      discount_percentage: formDiscount,
      image_url: formImageUrl.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      imageUrl: formImageUrl.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      stock_quantity: parseInt(formStockCount, 10) || 0,
      stockCount: parseInt(formStockCount, 10) || 0,
      availability: formInStock,
      inStock: formInStock,
      status: formStatus,
      manufacture_date: formMfgDate || undefined,
      expiry_date: formExpDate || undefined,
      description: formDescription.trim(),
      allowPriceOverride: allowOverride,
    };

    try {
      if (editingProductId) {
        await api.adminUpdateProduct(editingProductId, payload);
      } else {
        await api.adminAddProduct(payload);
      }

      resetForm();
      await loadData();
      if (onProductsChanged) onProductsChanged();
      setActiveTab('MANAGE_PRODUCTS');
      showToast(editingProductId ? 'Product updated successfully!' : 'New product successfully added to catalogue!');
    } catch (err: any) {
      showToast(err.message || 'Failed to save product');
    }
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    try {
      setIsDeleting(true);
      await api.adminDeleteProduct(deletingProduct.id);
      await loadData();
      if (onProductsChanged) onProductsChanged();
      setDeletingProduct(null);
      showToast(`"${deletingProduct.title || deletingProduct.name}" permanently deleted.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStock = async (product: Product) => {
    const nextStock = !product.inStock;
    try {
      await api.adminUpdateProduct(product.id, {
        inStock: nextStock,
        availability: nextStock,
      });
      await loadData();
      if (onProductsChanged) onProductsChanged();
      showToast(`${product.title || product.name} marked ${nextStock ? 'In Stock' : 'Out of Stock'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update stock');
    }
  };

  const handleToggleStatus = async (product: Product) => {
    const nextStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.adminUpdateProduct(product.id, {
        status: nextStatus,
      });
      await loadData();
      if (onProductsChanged) onProductsChanged();
      showToast(`${product.title || product.name} is now ${nextStatus === 'ACTIVE' ? 'Active' : 'Inactive (Hidden)'}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update status');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await api.adminUpdateOrderStatus(orderId, status);
      await loadData();
      showToast(`Order status updated to ${status}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status');
    }
  };

  const handleVerifyPayment = async (orderId: string) => {
    try {
      await api.adminVerifyPayment(orderId);
      await loadData();
      showToast('Payment verified successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to verify payment');
    }
  };

  // Metrics
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status !== 'INACTIVE').length;
  const inStockProductsCount = products.filter((p) => p.inStock && p.status !== 'INACTIVE').length;
  const outOfStockProductsCount = products.filter((p) => !p.inStock || p.stockCount === 0 || p.stock_quantity === 0).length;
  const inactiveProductsCount = products.filter((p) => p.status === 'INACTIVE').length;
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === 'New Order' || o.status === 'Preparing').length;
  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalSales = orders.reduce((sum, o) => (o.status !== 'Cancelled' ? sum + o.totalAmount : sum), 0);
  const outOfStockProducts = outOfStockProductsCount;

  const filteredProducts = products.filter((p) => {
    const title = (p.title || p.name || '').toLowerCase();
    const brand = (p.brand || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const q = searchQuery.toLowerCase().trim();

    if (q && !title.includes(q) && !brand.includes(q) && !category.includes(q)) {
      return false;
    }

    if (productCategoryFilter !== 'ALL' && p.category !== productCategoryFilter) {
      return false;
    }

    if (productStockFilter === 'IN_STOCK' && (!p.inStock || p.status === 'INACTIVE')) {
      return false;
    }

    if (productStockFilter === 'OUT_OF_STOCK' && p.inStock) {
      return false;
    }

    if (productStockFilter === 'INACTIVE' && p.status !== 'INACTIVE') {
      return false;
    }

    return true;
  });

  const filteredOrders = orders.filter((o) => {
    if (orderStatusFilter !== 'ALL' && o.status !== orderStatusFilter) return false;
    if (!searchQuery) return true;
    return (
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerMobile.includes(searchQuery)
    );
  });

  const sidebarItems: { id: AdminTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'MANAGE_PRODUCTS', label: 'Manage Products', icon: <Package className="w-4 h-4" />, badge: totalProducts },
    { id: 'ADD_PRODUCT', label: editingProductId ? 'Edit Product' : 'Add Product', icon: <PlusCircle className="w-4 h-4" /> },
    { id: 'CATEGORIES', label: 'Categories', icon: <FolderTree className="w-4 h-4" /> },
    { id: 'MANAGE_ORDERS', label: 'Manage Orders', icon: <ClipboardList className="w-4 h-4" />, badge: pendingOrders },
    { id: 'CUSTOMERS', label: 'Customers', icon: <Users className="w-4 h-4" /> },
    { id: 'INVENTORY', label: 'Inventory', icon: <Boxes className="w-4 h-4" />, badge: outOfStockProducts },
    { id: 'SALES_REPORTS', label: 'Sales Reports', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'SETTINGS', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex">
      {/* 1. Collapsible Sidebar */}
      <aside
        className={`bg-slate-900 text-white flex flex-col justify-between transition-all duration-300 z-30 shrink-0 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div>
          {/* Sidebar Top Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-[#168A45] flex items-center justify-center font-bold text-white text-xs">
                  CK
                </div>
                <div className="truncate">
                  <span className="font-bold text-xs uppercase tracking-wider text-emerald-400 block">
                    Admin Portal
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    +91 7975614686
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-2 space-y-1">
            {sidebarItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'ADD_PRODUCT' && !editingProductId) {
                      resetForm();
                    }
                    setActiveTab(item.id);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#168A45] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <span className={active ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  {!sidebarCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {!sidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        item.id === 'MANAGE_ORDERS'
                          ? 'bg-amber-400 text-amber-950'
                          : item.id === 'INVENTORY'
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-700 text-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom: Back to Shop */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <button
            onClick={onBackToShop}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span>Back to Customer Store</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Admin Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {sidebarItems.find((i) => i.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-slate-500">
              Merchant Control Panel · Verified Admin: <strong>7975614686</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              className="p-2 text-slate-600 hover:text-[#168A45] bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={openAddProductTab}
              className="px-4 py-2 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
          </div>
        </header>

        {error && (
          <div className="m-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* TAB 1: DASHBOARD OVERVIEW */}
        {activeTab === 'DASHBOARD' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Catalog Items</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {totalProducts}
                </span>
                <span className="text-[10px] text-emerald-700">{activeProducts} Active Online</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Orders</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {totalOrders}
                </span>
                <span className="text-[10px] text-slate-500">Customer checkouts</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Pending Orders</span>
                <span className="text-2xl font-bold font-mono text-amber-600 mt-1 block">
                  {pendingOrders}
                </span>
                <span className="text-[10px] text-amber-700">Awaiting dispatch</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Delivered Orders</span>
                <span className="text-2xl font-bold font-mono text-emerald-700 mt-1 block">
                  {deliveredOrders}
                </span>
                <span className="text-[10px] text-emerald-600">Completed</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Total Sales</span>
                <span className="text-2xl font-bold font-mono text-[#168A45] mt-1 block">
                  ₹{totalSales}
                </span>
                <span className="text-[10px] text-emerald-700">Accumulated total</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500 block">Out-of-Stock</span>
                <span className="text-2xl font-bold font-mono text-rose-600 mt-1 block">
                  {outOfStockProducts}
                </span>
                <span className="text-[10px] text-rose-600">Needs restock</span>
              </div>
            </div>

            {/* Empty store banner if zero items */}
            {totalProducts === 0 && (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-300 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#168A45] flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Your Store Catalogue is Ready for Products</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  All demo products have been deleted as requested. You can now add your real kirana items with title, uploaded photos, expiry details, and prices.
                </p>
                <button
                  onClick={openAddProductTab}
                  className="px-5 py-2.5 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Add Your First Product
                </button>
              </div>
            )}

            {/* Dynamic Recharts Sales Insights Card */}
            <SalesInsightsCard orders={orders} />
          </div>
        )}

        {/* TAB 2: MANAGE PRODUCTS (TABLE + MOBILE CARDS) */}
        {activeTab === 'MANAGE_PRODUCTS' && (
          <div className="p-4 sm:p-6 space-y-4">
            {/* Filter and Action Toolbar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                {/* Search Input */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search products by title, brand, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Filter Dropdown & Add Button */}
                <div className="flex items-center gap-2.5">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 outline-none focus:ring-2 focus:ring-[#168A45]/20 cursor-pointer"
                  >
                    <option value="ALL">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.displayName}
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={openAddProductTab}
                    className="px-4 py-2 bg-[#168A45] hover:bg-[#075B30] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>
                </div>
              </div>

              {/* Status & Stock Filter Segmented Chips */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => setProductStockFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                      productStockFilter === 'ALL'
                        ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All ({products.length})
                  </button>
                  <button
                    onClick={() => setProductStockFilter('IN_STOCK')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                      productStockFilter === 'IN_STOCK'
                        ? 'bg-[#168A45] text-white font-semibold shadow-2xs'
                        : 'bg-emerald-50 text-[#075B30] hover:bg-emerald-100'
                    }`}
                  >
                    In Stock ({inStockProductsCount})
                  </button>
                  <button
                    onClick={() => setProductStockFilter('OUT_OF_STOCK')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                      productStockFilter === 'OUT_OF_STOCK'
                        ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Out of Stock ({outOfStockProductsCount})
                  </button>
                  <button
                    onClick={() => setProductStockFilter('INACTIVE')}
                    className={`px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer text-xs ${
                      productStockFilter === 'INACTIVE'
                        ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    Inactive ({inactiveProductsCount})
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-medium">
                  Showing <strong>{filteredProducts.length}</strong> of {products.length} items
                </div>
              </div>
            </div>

            {/* Empty States */}
            {products.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 max-w-md mx-auto shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#168A45] flex items-center justify-center mx-auto mb-3">
                  <Package className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Products in Catalogue</h4>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  The catalogue currently has 0 products. Add your first grocery staple using the Add Product form.
                </p>
                <button
                  onClick={openAddProductTab}
                  className="mt-5 px-5 py-2.5 bg-[#168A45] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#075B30] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Add First Product</span>
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500 max-w-md mx-auto shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">No Matching Products</h4>
                <p className="text-xs text-slate-500 mt-1">
                  No products matched your search keyword or selected category filter.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setProductCategoryFilter('ALL');
                    setProductStockFilter('ALL');
                  }}
                  className="mt-4 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <>
                {/* 1. DESKTOP VIEW: High-Density Responsive Table (hidden on mobile, >= 768px) */}
                <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[11px] tracking-wider">
                        <tr>
                          <th className="p-3.5">Product Details</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Weight / Size</th>
                          <th className="p-3.5">Selling Price</th>
                          <th className="p-3.5">MRP</th>
                          <th className="p-3.5">Discount</th>
                          <th className="p-3.5">Stock Status</th>
                          <th className="p-3.5">Visibility</th>
                          <th className="p-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredProducts.map((p) => {
                          const title = p.title || p.name;
                          const brand = p.brand || 'Kirana Staple';
                          const weight = p.weight || p.unit;
                          const price = p.selling_price ?? p.price ?? 0;
                          const mrp = p.mrp ?? price;
                          const disc = p.discount_percentage !== undefined
                            ? p.discount_percentage
                            : mrp > price
                            ? Math.round(((mrp - price) / mrp) * 100)
                            : 0;
                          const img = p.image_url || p.imageUrl;
                          const isActive = p.status !== 'INACTIVE';
                          const isAvailable = p.inStock && (p.stock_quantity === undefined || p.stock_quantity > 0);
                          const stockCount = p.stock_quantity ?? p.stockCount ?? 0;

                          return (
                            <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                              {/* 1. Product Details */}
                              <td className="p-3.5">
                                <div className="flex items-center gap-3">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt={title}
                                      className="w-12 h-12 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#168A45] shrink-0">
                                      <ShoppingBag className="w-6 h-6" />
                                    </div>
                                  )}
                                  <div className="min-w-0 max-w-xs">
                                    <span className="font-bold text-slate-900 block truncate" title={title}>
                                      {title}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                                      {brand}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* 2. Category */}
                              <td className="p-3.5 text-slate-700 font-medium">
                                {p.category}
                              </td>

                              {/* 3. Pack Size */}
                              <td className="p-3.5 font-mono text-slate-700">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-semibold">
                                  {weight}
                                </span>
                              </td>

                              {/* 4. Selling Price */}
                              <td className="p-3.5 font-mono font-bold text-[#168A45] text-sm tabular-nums">
                                ₹{price}
                              </td>

                              {/* 5. MRP */}
                              <td className="p-3.5 font-mono text-slate-400 line-through tabular-nums text-xs">
                                ₹{mrp}
                              </td>

                              {/* 6. Discount */}
                              <td className="p-3.5">
                                {disc > 0 ? (
                                  <span className="bg-emerald-100 text-[#075B30] text-[10px] font-bold px-2 py-0.5 rounded">
                                    {disc}% OFF
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono text-[10px]">0%</span>
                                )}
                              </td>

                              {/* 7. Stock Status (Inline Toggle) */}
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStock(p)}
                                  className={`px-3 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors shadow-2xs ${
                                    isAvailable
                                      ? 'bg-emerald-50 text-[#075B30] border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  }`}
                                  title="Click to toggle In Stock / Out of Stock"
                                >
                                  {isAvailable ? `In Stock (${stockCount})` : 'Out of Stock'}
                                </button>
                              </td>

                              {/* 8. Visibility Status (Inline Toggle) */}
                              <td className="p-3.5">
                                <button
                                  type="button"
                                  onClick={() => handleToggleStatus(p)}
                                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs ${
                                    isActive
                                      ? 'bg-emerald-50 text-[#168A45] border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                                  }`}
                                  title={isActive ? 'Active: Visible to customers' : 'Inactive: Hidden from customers'}
                                >
                                  {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                  <span>{isActive ? 'Active' : 'Inactive'}</span>
                                </button>
                              </td>

                              {/* 9. Actions */}
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => openEditProduct(p)}
                                    className="p-2 text-slate-600 hover:text-[#168A45] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                                    title="Edit Product Details"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteProduct(p)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. MOBILE VIEW: Adaptive Card Grid (visible on mobile only, < 768px) */}
                <div className="md:hidden space-y-3">
                  {filteredProducts.map((p) => {
                    const title = p.title || p.name;
                    const brand = p.brand || 'Kirana Staple';
                    const weight = p.weight || p.unit;
                    const price = p.selling_price ?? p.price ?? 0;
                    const mrp = p.mrp ?? price;
                    const disc = p.discount_percentage !== undefined
                      ? p.discount_percentage
                      : mrp > price
                      ? Math.round(((mrp - price) / mrp) * 100)
                      : 0;
                    const img = p.image_url || p.imageUrl;
                    const isActive = p.status !== 'INACTIVE';
                    const isAvailable = p.inStock && (p.stock_quantity === undefined || p.stock_quantity > 0);
                    const stockCount = p.stock_quantity ?? p.stockCount ?? 0;

                    return (
                      <div
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3"
                      >
                        {/* Top: Thumbnail, Title, Brand & Category */}
                        <div className="flex items-start gap-3">
                          {img ? (
                            <img
                              src={img}
                              alt={title}
                              className="w-14 h-14 object-contain rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#168A45] shrink-0">
                              <ShoppingBag className="w-7 h-7" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-slate-900 text-sm leading-snug">
                              {title}
                            </h4>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <span className="font-semibold text-slate-600 uppercase text-[10px]">{brand}</span>
                              <span>·</span>
                              <span>{p.category}</span>
                            </div>
                            <div className="mt-1">
                              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono font-semibold">
                                {weight}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Savings Row */}
                        <div className="flex items-baseline justify-between pt-2 border-t border-slate-100">
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-[#168A45] font-mono tabular-nums">
                              ₹{price}
                            </span>
                            {mrp > price && (
                              <span className="text-xs text-slate-400 line-through font-mono tabular-nums">
                                ₹{mrp}
                              </span>
                            )}
                          </div>
                          {disc > 0 && (
                            <span className="bg-emerald-100 text-[#075B30] text-[10px] font-bold px-2 py-0.5 rounded">
                              {disc}% OFF
                            </span>
                          )}
                        </div>

                        {/* Quick Inline Toggles: Stock & Visibility */}
                        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleStock(p)}
                            className={`py-2 px-3 rounded-xl font-bold transition-colors cursor-pointer text-center text-xs flex items-center justify-center gap-1 border min-h-[38px] ${
                              isAvailable
                                ? 'bg-emerald-50 text-[#075B30] border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            <span>{isAvailable ? `In Stock (${stockCount})` : 'Out of Stock'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            className={`py-2 px-3 rounded-xl font-bold transition-colors cursor-pointer text-center text-xs flex items-center justify-center gap-1.5 border min-h-[38px] ${
                              isActive
                                ? 'bg-emerald-50 text-[#168A45] border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            <span>{isActive ? 'Active' : 'Inactive'}</span>
                          </button>
                        </div>

                        {/* Actions Row: Edit & Delete */}
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => openEditProduct(p)}
                            className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[#168A45]" />
                            <span>Edit Product</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p)}
                            className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: ADVANCED ADD / EDIT PRODUCT FORM */}
        {activeTab === 'ADD_PRODUCT' && (
          <div className="p-6 max-w-4xl">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingProductId ? 'Edit Product Details' : 'Add New Grocery Product'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter product information. Only active products are visible to customers.
                  </p>
                </div>
                {editingProductId && (
                  <button
                    onClick={() => {
                      resetForm();
                      setActiveTab('MANAGE_PRODUCTS');
                    }}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 bg-slate-100 rounded-xl cursor-pointer"
                  >
                    Cancel Edit & Return to Products
                  </button>
                )}
              </div>

              {editingProductId && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#168A45] flex items-center justify-center shrink-0">
                      <Edit2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-emerald-950">Editing Existing Product:</span> {formTitle || 'Product'}
                      <span className="text-[11px] text-emerald-700 ml-2 font-mono">ID: {editingProductId}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('MANAGE_PRODUCTS');
                    }}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                  >
                    Back to List
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                {/* 1. Product Title & Brand */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-800 mb-1">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aashirvaad Shudh Chakki Atta"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">Brand Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Aashirvaad, Tata, Fortune"
                      value={formBrand}
                      onChange={(e) => setFormBrand(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45]"
                    />
                  </div>
                </div>

                {/* 2. Category & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">Category Department</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white cursor-pointer"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.displayName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Product Weight / Size * (e.g. 1 kg, 500 g, 1 litre, 100 ml)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="e.g. 1 kg"
                        value={formUnit}
                        onChange={(e) => setFormUnit(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45]"
                      />
                      {/* Preset quick buttons */}
                      {['1 kg', '500 g', '1 L', '5 kg'].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setFormUnit(preset)}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 transition-colors"
                        >
                          {preset}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. MRP, Selling Price & Auto-calculated Discount */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      MRP Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 300"
                      value={formMrp}
                      onChange={(e) => setFormMrp(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Selling Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="e.g. 270"
                      value={formSellingPrice}
                      onChange={(e) => setFormSellingPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Calculated Discount (%)
                    </label>
                    <div className="h-[42px] px-3.5 rounded-xl border border-emerald-300 bg-white flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-[#168A45]">
                        {formDiscount}% OFF
                      </span>
                      <span className="text-[10px] text-slate-500">Auto Computed</span>
                    </div>
                  </div>
                </div>

                {/* 4. Product Image Upload from Device or Web URL */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-[#168A45]" />
                      <span>Product Image (Upload from phone/computer or paste URL)</span>
                    </label>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('FILE')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                          imageUploadMode === 'FILE'
                            ? 'bg-[#168A45] text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        Upload File
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageUploadMode('URL')}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors ${
                          imageUploadMode === 'URL'
                            ? 'bg-[#168A45] text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {imageUploadMode === 'FILE' ? (
                    <div className="space-y-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg, image/jpg, image/png, image/webp"
                        onChange={handleImageFileChange}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#168A45] file:text-white hover:file:bg-[#075B30] file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400">
                        Supports JPG, JPEG, PNG, and WebP (up to 10MB) directly from mobile gallery or PC.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/photo-..."
                        value={formImageUrl}
                        onChange={(e) => {
                          setFormImageUrl(e.target.value);
                          setImagePreview(e.target.value);
                        }}
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white"
                      />
                    </div>
                  )}

                  {/* Image Live Preview */}
                  {imagePreview && (
                    <div className="relative inline-block mt-2">
                      <div className="w-24 h-24 rounded-2xl border-2 border-[#168A45] p-1 bg-white overflow-hidden shadow-xs">
                        <img
                          src={imagePreview}
                          alt="Product preview"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-2 -right-2 p-1 bg-rose-600 text-white rounded-full shadow-sm hover:bg-rose-700"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 5. Age & Expiry Information (Optional) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Manufacturing Date (Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={formMfgDate}
                      onChange={(e) => setFormMfgDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Expiry Date (Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={formExpDate}
                      onChange={(e) => setFormExpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white"
                    />
                  </div>
                </div>

                {/* 6. Stock Quantity, Availability & Store Visibility Status */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">
                      Stock Quantity (Units)
                    </label>
                    <input
                      type="number"
                      value={formStockCount}
                      onChange={(e) => setFormStockCount(e.target.value)}
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white"
                    />
                  </div>

                  <div className="flex flex-col justify-center">
                    <label className="font-semibold text-slate-800 mb-1">Product Availability</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="formInStockCheck"
                        checked={formInStock}
                        onChange={(e) => setFormInStock(e.target.checked)}
                        className="w-4 h-4 text-[#168A45] rounded cursor-pointer"
                      />
                      <label htmlFor="formInStockCheck" className="text-xs text-slate-700 font-semibold cursor-pointer">
                        {formInStock ? 'In Stock (Available)' : 'Out of Stock'}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-800 mb-1">Storefront Status</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'ACTIVE' | 'INACTIVE')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] bg-white cursor-pointer"
                    >
                      <option value="ACTIVE">Active (Visible to Customers)</option>
                      <option value="INACTIVE">Inactive (Hidden from Customers)</option>
                    </select>
                  </div>
                </div>

                {/* 7. Product Description */}
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Product Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe product freshness, origin, nutritional value, and packaging..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45]"
                  />
                </div>

                {/* Large Green Action CTA */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setActiveTab('MANAGE_PRODUCTS');
                    }}
                    className="px-5 py-3 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>

                  {editingProductId ? (
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-[#168A45] hover:bg-[#075B30] text-white text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span>SAVE PRODUCT CHANGES</span>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-[#168A45] hover:bg-[#075B30] text-white text-sm font-bold rounded-2xl shadow-md transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>ADD PRODUCT</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORIES */}
        {activeTab === 'CATEGORIES' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">10 Kirana Departments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CATEGORIES.map((c) => {
                const count = products.filter((p) => p.category === c.name || c.aliases.includes(p.category)).length;
                return (
                  <div key={c.name} className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                    <img src={c.imageUrl} alt={c.displayName} className="w-12 h-12 rounded-xl object-cover" />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{c.displayName}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {count} {count === 1 ? 'product' : 'products'} active
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: MANAGE ORDERS */}
        {activeTab === 'MANAGE_ORDERS' && (
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter orders by ID, customer name, mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                {['ALL', 'New Order', 'Order Accepted', 'Preparing', 'Out for Delivery', 'Delivered'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setOrderStatusFilter(s)}
                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                      orderStatusFilter === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500">
                  <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No matching orders</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                          {order.id}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                          order.status === 'New Order' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                          order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono font-bold text-[#168A45] text-base">₹{order.totalAmount}</span>
                        <span className="text-[10px] text-slate-500 block">{order.paymentMethod} ({order.paymentStatus})</span>
                      </div>
                    </div>

                    <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Customer</span>
                        <p className="font-semibold text-slate-900 mt-1">{order.customerName}</p>
                        <a href={`tel:${order.customerMobile}`} className="text-[#168A45] font-semibold flex items-center gap-1 hover:underline mt-0.5">
                          <Phone className="w-3 h-3" />
                          +91 {order.customerMobile}
                        </a>
                        <p className="text-slate-600 mt-2">{order.deliveryAddress.houseNo}, {order.deliveryAddress.street}</p>
                        <a
                          href={`https://www.google.com/maps?q=${order.deliveryAddress.latitude},${order.deliveryAddress.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[#168A45] font-mono text-[10px] mt-1 hover:underline"
                        >
                          GPS: {order.deliveryAddress.latitude}, {order.deliveryAddress.longitude}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>

                      <div>
                        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px] block">Items</span>
                        <div className="divide-y divide-slate-100 max-h-32 overflow-y-auto mt-1">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="py-1 flex justify-between">
                              <span>{it.name} × {it.quantity}</span>
                              <span className="font-mono font-bold">₹{it.itemTotal}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] block">Advance Status</span>
                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'Order Accepted')}
                            className="px-2 py-1.5 bg-blue-50 text-blue-700 rounded text-[10px] font-bold hover:bg-blue-100 cursor-pointer"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'Preparing')}
                            className="px-2 py-1.5 bg-indigo-50 text-indigo-700 rounded text-[10px] font-bold hover:bg-indigo-100 cursor-pointer"
                          >
                            Packing
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')}
                            className="px-2 py-1.5 bg-amber-50 text-amber-800 rounded text-[10px] font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            Out for Delivery
                          </button>
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                            className="px-2 py-1.5 bg-[#168A45] text-white rounded text-[10px] font-bold hover:bg-[#075B30] cursor-pointer"
                          >
                            Delivered
                          </button>
                        </div>

                        {order.paymentMethod === 'PhonePe UPI' && order.paymentStatus !== 'Verified' && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[10px] text-purple-900 block mb-1">
                              PhonePe UTR: <strong className="font-mono">{order.phonePeTransactionId || 'Awaiting entry'}</strong>
                            </span>
                            <button
                              onClick={() => handleVerifyPayment(order.id)}
                              className="w-full py-1 bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold rounded cursor-pointer"
                            >
                              Verify PhonePe Payment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 6: CUSTOMERS */}
        {activeTab === 'CUSTOMERS' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Customer Accounts</h3>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
              <p className="text-xs text-slate-600 leading-relaxed">
                Customers securely sign in via their mobile number and OTP. Customer profile and delivery addresses are safely mapped to their verified telephone credentials.
              </p>
            </div>
          </div>
        )}

        {/* TAB 7: INVENTORY */}
        {activeTab === 'INVENTORY' && (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800">Inventory Status</h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg">
                {outOfStockProducts} Out-of-Stock
              </span>
            </div>

            {products.length === 0 ? (
              <p className="text-xs text-slate-500">No inventory tracked yet. Add products to manage stock.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-900 block truncate">{p.title || p.name}</span>
                      <span className={`text-[11px] font-mono font-semibold ${p.inStock ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {p.stock_quantity ?? p.stockCount} Units · {p.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleToggleStock(p)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                        p.inStock ? 'bg-slate-100 text-slate-700' : 'bg-[#168A45] text-white'
                      }`}
                    >
                      {p.inStock ? 'Mark Out' : 'Restock'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: SALES REPORTS */}
        {activeTab === 'SALES_REPORTS' && (
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#168A45]" />
                  <span>Comprehensive Sales & Revenue Analytics</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dynamic 30-day revenue trends, daily order volume, and key performance indicators.
                </p>
              </div>
              <button
                type="button"
                onClick={loadData}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>

            {/* Dynamic Recharts Sales Insights Card */}
            <SalesInsightsCard orders={orders} />

            {/* Lifetime KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Accumulated Sales
                </span>
                <span className="text-2xl font-bold font-mono text-[#168A45] block">
                  ₹{totalSales.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500">Across all completed customer transactions</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Total Order Volume
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 block">
                  {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                </span>
                <span className="text-[11px] text-emerald-700">
                  {deliveredOrders} delivered to customer doorsteps
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Average Order Basket
                </span>
                <span className="text-2xl font-bold font-mono text-indigo-700 block">
                  ₹{orders.length > 0 ? Math.round(totalSales / orders.length) : 0}
                </span>
                <span className="text-[11px] text-slate-500">Average ticket size per checkout</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: SETTINGS (COMPLETE CHANGING ACCESS TO ADMIN 7975614686) */}
        {activeTab === 'SETTINGS' && (
          <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
            {/* Header with Admin Privilege Badge */}
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#075B30] text-white p-6 rounded-3xl shadow-md border border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-[#FFC83D] border border-white/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">Full Store Configuration & Access Control</h3>
                    <p className="text-xs text-emerald-200">
                      Exclusive Administrative Permissions for Verified Mobile: <strong className="text-white font-mono">7975614686</strong>
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  Admin Master Access
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                As the store owner, you have full changing access over store branding, hero marketing messages, customer support helpline, PhonePe UPI QR/Number credentials, delivery fees, free delivery order thresholds, and store operational policies. All updates save directly to the secure database and reflect immediately for all online customers.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 1: Store Branding & Identity */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Store className="w-4 h-4 text-[#168A45]" />
                    <span>Store Branding & Identity</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                      placeholder="e.g. Chodeshwari Kirana Store"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Displayed in website header, logo badges, order receipts, and footer.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Store Tagline / Slogan
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeTagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeTagline: e.target.value })}
                      placeholder="e.g. Pure & Fresh Groceries at Unbeatable Prices"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Top Announcement Strip Message
                    </label>
                    <input
                      type="text"
                      value={settingsForm.announcement}
                      onChange={(e) => setSettingsForm({ ...settingsForm, announcement: e.target.value })}
                      placeholder="e.g. Special Community Offer: Free 1-Hour Delivery on all orders above ₹500!"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Visible in the prominent green top bar at the very top of the website.</span>
                  </div>
                </div>

                {/* Section 2: Hero Marketing Banner */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sparkles className="w-4 h-4 text-[#168A45]" />
                    <span>Homepage Hero Banner Copy</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hero Banner Main Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.heroTitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroTitle: e.target.value })}
                      placeholder="e.g. Your Daily Needs, Delivered to Your Doorstep."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hero Banner Subtitle / Description
                    </label>
                    <textarea
                      rows={3}
                      value={settingsForm.heroSubtitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })}
                      placeholder="e.g. Shop fresh Indian groceries at great prices. Direct to your doorstep in 30–60 mins."
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none resize-none"
                    />
                  </div>
                </div>

                {/* Section 3: Customer Support & Admin Mobile */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Phone className="w-4 h-4 text-[#168A45]" />
                    <span>Customer Helpline & WhatsApp</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Customer Helpline & WhatsApp Number *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-mono font-bold text-slate-600">
                        +91
                      </span>
                      <input
                        type="text"
                        required
                        value={settingsForm.supportPhone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="7975614686"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-r-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">Used for direct customer phone calls, WhatsApp inquiries, and floating support button.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Verified Admin Access Mobile (Master Control)
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl text-xs font-mono font-bold text-slate-600">
                        +91
                      </span>
                      <input
                        type="text"
                        disabled
                        value={settingsForm.adminPhone}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-r-xl border border-slate-200 bg-slate-50 text-slate-600 cursor-not-allowed outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                      ✓ Permanently locked to 7975614686 for guaranteed administrative security.
                    </span>
                  </div>
                </div>

                {/* Section 4: PhonePe UPI & Payment Settings */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <CreditCard className="w-4 h-4 text-purple-700" />
                    <span>PhonePe UPI & Payment Options</span>
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PhonePe Merchant Mobile Number *
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2.5 bg-purple-50 border border-r-0 border-purple-200 rounded-l-xl text-xs font-mono font-bold text-purple-900">
                        +91
                      </span>
                      <input
                        type="text"
                        required
                        value={settingsForm.phonepeNumber}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phonepeNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        placeholder="7760616625"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-r-xl border border-purple-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                      />
                    </div>
                    <span className="text-[10px] text-purple-800 mt-1 block">Customers transfer digital UPI payments directly to this PhonePe number.</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      PhonePe UPI ID (VPA) *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.phonepeUpiId}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phonepeUpiId: e.target.value.trim() })}
                      placeholder="7760616625@ybl"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono rounded-xl border border-purple-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                    />
                    <span className="text-[10px] text-purple-800 mt-1 block">Displayed on customer checkout with one-tap copy button for PhonePe/GPay/Paytm.</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">Cash on Delivery (COD)</span>
                        <span className="text-[11px] text-slate-500">Allow customers to pay cash when items arrive at doorstep</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={settingsForm.codEnabled}
                        onChange={(e) => setSettingsForm({ ...settingsForm, codEnabled: e.target.checked })}
                        className="w-5 h-5 text-[#168A45] rounded-md focus:ring-[#168A45] cursor-pointer"
                      />
                    </label>
                  </div>
                </div>

                {/* Section 5: Delivery Logistics & Store Location */}
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 lg:col-span-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Truck className="w-4 h-4 text-[#168A45]" />
                    <span>Delivery Logistics & Store Address</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Standard Delivery Fee (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={settingsForm.deliveryFee}
                        onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: parseFloat(e.target.value) || 0 })}
                        placeholder="25"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Standard charge applied to customer basket if below free threshold.</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Free Delivery Minimum Order (₹) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        required
                        value={settingsForm.freeDeliveryThreshold}
                        onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: parseFloat(e.target.value) || 0 })}
                        placeholder="500"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">Orders equal to or above this value automatically get 100% FREE delivery.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Physical Store Address / Landmark *
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.storeAddress}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })}
                      placeholder="e.g. Main Bazar Road, Kirana Galli, Near Temple Chowk"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#168A45]/20 focus:border-[#168A45] outline-none"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Printed on order summaries, customer invoices, and contact panels.</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div className="text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Database Sync:</span> Changes will take effect immediately for customer storefront visits.
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSettingsForm(storeSettings)}
                    className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={savingSettings}
                    className="px-6 py-2.5 text-xs sm:text-sm font-bold rounded-xl bg-[#168A45] hover:bg-[#075B30] text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingSettings ? 'Saving Configurations...' : 'SAVE STORE CONFIGURATIONS'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* CUSTOM DELETE CONFIRMATION MODAL */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900 leading-tight">
                  Permanently Delete Product?
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Are you sure you want to delete this grocery staple from Chodeshwari Kirana Store's active shopping catalogue?
                </p>
              </div>
            </div>

            {/* Product Preview Card */}
            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex items-center gap-3">
              {(deletingProduct.image_url || deletingProduct.imageUrl) ? (
                <img
                  src={deletingProduct.image_url || deletingProduct.imageUrl}
                  alt={deletingProduct.title || deletingProduct.name}
                  className="w-14 h-14 object-contain rounded-xl bg-white border border-slate-200 p-1 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#168A45] shrink-0">
                  <ShoppingBag className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0 flex-1 text-xs">
                <span className="font-bold text-slate-900 block truncate text-sm">
                  {deletingProduct.title || deletingProduct.name}
                </span>
                <span className="text-slate-500 block text-[11px] mt-0.5">
                  {deletingProduct.brand} · {deletingProduct.category} · {deletingProduct.weight || deletingProduct.unit}
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-mono font-bold text-sm text-[#168A45]">
                    ₹{deletingProduct.selling_price || deletingProduct.price}
                  </span>
                  <span className="text-xs text-slate-400 line-through font-mono">
                    ₹{deletingProduct.mrp}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Orders Safety Reassurance Note */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 text-xs text-[#075B30] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#168A45] mt-0.5" />
              <span className="leading-snug">
                <strong>Real order history is safe:</strong> Deleting this item will remove it from the customer storefront and active catalogue. Past customer transactions, addresses, and order histories remain 100% preserved.
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingProduct(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 text-xs font-semibold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'Deleting...' : 'Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING IN-APP TOAST */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
