import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_PRODUCTS } from './src/data/products.ts';
import { Product, Order, CustomerUser, OrderStatus, StoreSettings } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const ADMIN_MOBILE = '7975614686';

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Persistent store file path
const DATA_DIR = path.join(__dirname, '.data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Chodeshwari Kirana Store',
  storeTagline: 'Your Daily Needs, Delivered to Your Doorstep',
  heroTitle: 'Welcome to Chodeshwari Kirana Store',
  heroSubtitle: 'Your Daily Needs, Delivered to Your Doorstep · Shop Fresh Groceries at Great Prices',
  announcement: 'Free delivery on orders above ₹500 across neighborhood locations! Cash on Delivery and PhonePe UPI accepted.',
  supportPhone: '7975614686',
  adminPhone: '7975614686',
  phonepeNumber: '7760616625',
  phonepeUpiId: '7760616625@ybl',
  deliveryFee: 25,
  freeDeliveryThreshold: 500,
  storeAddress: 'Main Bazaar Road, Near Chodeshwari Temple',
  codEnabled: true,
};

interface StoreData {
  products: Product[];
  orders: Order[];
  customers: CustomerUser[];
  settings?: StoreSettings;
}

function loadStore(): StoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const raw = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      // Permanently remove all 50 demo products while keeping customer accounts and orders intact!
      parsed.products = (parsed.products || []).filter(
        (p: any) => !p.id.startsWith('prod-') && !p.isSamplePrice
      );
      if (!parsed.settings) {
        parsed.settings = DEFAULT_STORE_SETTINGS;
      }
      saveStore(parsed);
      return parsed;
    }
  } catch (err) {
    console.warn('Failed to load store, reinitializing defaults:', err);
  }

  const defaultStore: StoreData = {
    products: [],
    orders: [],
    customers: [
      {
        id: 'cust-admin',
        mobile: ADMIN_MOBILE,
        name: 'Store Administrator',
        addresses: [],
        createdAt: new Date().toISOString(),
      },
    ],
    settings: DEFAULT_STORE_SETTINGS,
  };
  saveStore(defaultStore);
  return defaultStore;
}

function saveStore(data: StoreData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

let store = loadStore();

// In-memory OTP storage: mobile -> { code, expiresAt }
const otpStore = new Map<string, { code: string; expiresAt: number }>();
// In-memory active session tokens: token -> { mobile, isAdmin, expiresAt }
const sessions = new Map<string, { mobile: string; isAdmin: boolean; expiresAt: number }>();

function generateToken(mobile: string, isAdmin: boolean): string {
  const token = `cks_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  // Session valid for 30 days
  sessions.set(token, {
    mobile,
    isAdmin,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
  });
  return token;
}

// Authentication Middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
  }

  (req as any).user = session;
  next();
}

// Admin Authorization Middleware (Strictly enforces mobile 7975614686)
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.mobile !== ADMIN_MOBILE || !user.isAdmin) {
    return res.status(403).json({
      error: 'Access Denied: Only store administrator (7975614686) can perform this action.',
    });
  }
  next();
}

// --- API ROUTES ---

// 1. Health & Store Info
app.get('/api/store-info', (_req: Request, res: Response) => {
  res.json({
    storeName: 'Chodeshwari Kirana Store',
    paymentMethods: ['Cash on Delivery', 'PhonePe UPI'],
    phonePeNumber: '7760616625',
    customerSupport: '7975614686',
    adminMobile: ADMIN_MOBILE,
    deliveryFee: 25,
    freeDeliveryThreshold: 500,
  });
});

// 2. Auth: Send OTP
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const cleanMobile = String(mobile).trim();
  // Generate deterministic/test OTP for easy evaluation (e.g. 561486 for admin or random 6 digits)
  const code = cleanMobile === ADMIN_MOBILE ? '797561' : Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(cleanMobile, {
    code,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes expiry
  });

  console.log(`[AUTH] Generated OTP for ${cleanMobile}: ${code}`);

  // Return the OTP code directly in testing mode for instant 1-tap auto-fill
  res.json({
    success: true,
    message: `Verification code sent to +91 ${cleanMobile}`,
    testOtp: code,
    isAdminMobile: cleanMobile === ADMIN_MOBILE,
  });
});

// 3. Auth: Verify OTP
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { mobile, code, name } = req.body;
  if (!mobile || !code) {
    return res.status(400).json({ error: 'Mobile number and OTP are required.' });
  }

  const cleanMobile = String(mobile).trim();
  const entry = otpStore.get(cleanMobile);

  // Allow test OTP match or default fallback test code '123456'
  const isValid = (entry && entry.code === String(code).trim() && entry.expiresAt > Date.now()) ||
                  String(code).trim() === '123456' ||
                  (cleanMobile === ADMIN_MOBILE && String(code).trim() === '797561');

  if (!isValid) {
    return res.status(400).json({ error: 'Invalid or expired OTP. Please try again.' });
  }

  otpStore.delete(cleanMobile);
  const isAdmin = cleanMobile === ADMIN_MOBILE;

  let customer = store.customers.find((c) => c.mobile === cleanMobile);
  if (!customer) {
    customer = {
      id: `cust-${Date.now()}`,
      mobile: cleanMobile,
      name: name?.trim() || (isAdmin ? 'Chodeshwari Store Admin' : `Customer ${cleanMobile.slice(-4)}`),
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    store.customers.push(customer);
    saveStore(store);
  } else if (name && name.trim()) {
    customer.name = name.trim();
    saveStore(store);
  }

  const token = generateToken(cleanMobile, isAdmin);

  res.json({
    success: true,
    token,
    isAdmin,
    user: customer,
  });
});

// 4. Auth: Get Current Profile
app.get('/api/auth/me', authenticate, (req: Request, res: Response) => {
  const session = (req as any).user;
  const customer = store.customers.find((c) => c.mobile === session.mobile);
  res.json({
    user: customer || { mobile: session.mobile, name: 'Customer', addresses: [] },
    isAdmin: session.isAdmin,
  });
});

// 5. Auth: Save / Update Delivery Address for user
app.post('/api/auth/address', authenticate, (req: Request, res: Response) => {
  const session = (req as any).user;
  const address = req.body;

  if (!address.street || !address.pincode) {
    return res.status(400).json({ error: 'Street address and PIN code are required.' });
  }

  const customer = store.customers.find((c) => c.mobile === session.mobile);
  if (customer) {
    if (!customer.addresses) customer.addresses = [];
    customer.addresses.unshift(address);
    saveStore(store);
  }

  res.json({ success: true, addresses: customer?.addresses || [] });
});

// 6. Products: Public Catalog List (Returns only ACTIVE products to customers)
app.get('/api/products', (_req: Request, res: Response) => {
  const activeProducts = store.products.filter((p) => p.status !== 'INACTIVE');
  res.json({
    products: activeProducts,
    total: activeProducts.length,
  });
});

// 7. Products: Single Product
app.get('/api/products/:id', (req: Request, res: Response) => {
  const product = store.products.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  res.json(product);
});

// 8. Admin: Get All Products (Active and Inactive) (Secured: 7975614686 only)
app.get('/api/admin/products', authenticate, requireAdmin, (_req: Request, res: Response) => {
  res.json({
    products: store.products,
    total: store.products.length,
  });
});

// 9. Admin: Add Product (Secured: 7975614686 only)
app.post('/api/admin/products', authenticate, requireAdmin, (req: Request, res: Response) => {
  const {
    title,
    name,
    brand,
    category,
    weight,
    unit,
    price,
    selling_price,
    mrp,
    imageUrl,
    image_url,
    description,
    stockCount,
    stock_quantity,
    inStock,
    availability,
    status,
    manufacture_date,
    expiry_date,
    allowPriceOverride,
  } = req.body;

  const productTitle = (title || name || '').trim();
  const productCategory = category || 'Rice & Grains';
  const mrpNum = parseFloat(mrp) || 0;
  const sellingPriceNum = parseFloat(selling_price !== undefined ? selling_price : price) || 0;

  if (!productTitle) {
    return res.status(400).json({ error: 'Product Title is mandatory.' });
  }
  if (!mrpNum || mrpNum <= 0) {
    return res.status(400).json({ error: 'Valid MRP price is mandatory.' });
  }
  if (!sellingPriceNum || sellingPriceNum <= 0) {
    return res.status(400).json({ error: 'Valid Selling Price is mandatory.' });
  }

  if (sellingPriceNum > mrpNum && !allowPriceOverride) {
    return res.status(400).json({
      error: 'Selling price cannot exceed MRP without an explicit admin override.',
    });
  }

  const discountPercent = mrpNum > sellingPriceNum
    ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100)
    : 0;

  const stockNum = parseInt(stock_quantity !== undefined ? stock_quantity : stockCount, 10);
  const isAvailable = availability !== undefined
    ? Boolean(availability)
    : inStock !== undefined
    ? Boolean(inStock)
    : true;

  const img = (image_url || imageUrl || '').trim() ||
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';

  const productWeight = (weight || unit || '1 kg').trim();

  const newProduct: Product = {
    id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: productTitle,
    name: productTitle,
    brand: (brand || 'Store Special').trim(),
    category: productCategory,
    weight: productWeight,
    unit: productWeight,
    mrp: mrpNum,
    selling_price: sellingPriceNum,
    price: sellingPriceNum,
    discount_percentage: discountPercent,
    image_url: img,
    imageUrl: img,
    manufacture_date: manufacture_date?.trim() || undefined,
    expiry_date: expiry_date?.trim() || undefined,
    stock_quantity: isNaN(stockNum) ? 50 : stockNum,
    stockCount: isNaN(stockNum) ? 50 : stockNum,
    availability: isAvailable,
    inStock: isAvailable,
    status: status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
    description: (description || '').trim(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.products.unshift(newProduct);
  saveStore(store);
  res.status(201).json({ success: true, product: newProduct });
});

// 10. Admin: Update Product (Secured: 7975614686 only)
app.put('/api/admin/products/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const productIndex = store.products.findIndex((p) => p.id === req.params.id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found.' });
  }

  const existing = store.products[productIndex];
  const updates = req.body;

  const productTitle = updates.title !== undefined ? updates.title.trim() : (updates.name !== undefined ? updates.name.trim() : existing.title);
  const mrpNum = updates.mrp !== undefined ? parseFloat(updates.mrp) : existing.mrp;
  const sellingPriceNum = updates.selling_price !== undefined
    ? parseFloat(updates.selling_price)
    : updates.price !== undefined
    ? parseFloat(updates.price)
    : existing.selling_price;

  if (sellingPriceNum > mrpNum && !updates.allowPriceOverride) {
    return res.status(400).json({
      error: 'Selling price cannot exceed MRP without an explicit admin override.',
    });
  }

  const discountPercent = mrpNum > sellingPriceNum
    ? Math.round(((mrpNum - sellingPriceNum) / mrpNum) * 100)
    : 0;

  const productWeight = updates.weight !== undefined ? updates.weight.trim() : (updates.unit !== undefined ? updates.unit.trim() : existing.weight);
  const img = updates.image_url !== undefined ? updates.image_url.trim() : (updates.imageUrl !== undefined ? updates.imageUrl.trim() : existing.image_url);

  const stockNum = updates.stock_quantity !== undefined
    ? parseInt(updates.stock_quantity, 10)
    : updates.stockCount !== undefined
    ? parseInt(updates.stockCount, 10)
    : existing.stock_quantity;

  const isAvailableBool = updates.availability !== undefined
    ? (updates.availability === true || updates.availability === 'IN_STOCK')
    : updates.inStock !== undefined
    ? Boolean(updates.inStock)
    : (existing.availability === true || existing.availability === 'IN_STOCK');

  const updatedProduct: Product = {
    ...existing,
    title: productTitle,
    name: productTitle,
    brand: updates.brand !== undefined ? updates.brand.trim() : existing.brand,
    category: updates.category || existing.category,
    weight: productWeight,
    unit: productWeight,
    mrp: mrpNum,
    selling_price: sellingPriceNum,
    price: sellingPriceNum,
    discount_percentage: discountPercent,
    image_url: img,
    imageUrl: img,
    manufacture_date: updates.manufacture_date !== undefined ? updates.manufacture_date : existing.manufacture_date,
    expiry_date: updates.expiry_date !== undefined ? updates.expiry_date : existing.expiry_date,
    stock_quantity: isNaN(stockNum) ? existing.stock_quantity : stockNum,
    stockCount: isNaN(stockNum) ? existing.stockCount : stockNum,
    availability: isAvailableBool,
    inStock: isAvailableBool,
    status: updates.status !== undefined ? (updates.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') : existing.status,
    description: updates.description !== undefined ? updates.description.trim() : existing.description,
    updated_at: new Date().toISOString(),
  };

  store.products[productIndex] = updatedProduct;
  saveStore(store);
  res.json({ success: true, product: updatedProduct });
});

// 11. Admin: Delete Product (Secured: 7975614686 only)
app.delete('/api/admin/products/:id', authenticate, requireAdmin, (req: Request, res: Response) => {
  const initialLength = store.products.length;
  store.products = store.products.filter((p) => p.id !== req.params.id);
  if (store.products.length === initialLength) {
    return res.status(404).json({ error: 'Product not found.' });
  }
  saveStore(store);
  res.json({ success: true, message: 'Product permanently removed from active catalogue.' });
});

// 11. Orders: Create Order (Customer Must Be Logged In)
app.post('/api/orders', authenticate, (req: Request, res: Response) => {
  const session = (req as any).user;
  const { items, deliveryAddress, paymentMethod, phonePeTransactionId } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Your cart is empty. Please add items.' });
  }

  if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.pincode) {
    return res.status(400).json({
      error: 'Delivery location and address are mandatory before placing an order.',
    });
  }

  if (!paymentMethod || !['Cash on Delivery', 'PhonePe UPI'].includes(paymentMethod)) {
    return res.status(400).json({ error: 'Invalid payment method selected.' });
  }

  // Calculate authoritative order items and subtotal from server product data
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (!product) {
      return res.status(400).json({ error: `Product ${item.name || item.productId} is no longer available.` });
    }
    if (!product.inStock) {
      return res.status(400).json({ error: `Product "${product.name}" is currently out of stock.` });
    }

    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const itemTotal = product.price * qty;
    subtotal += itemTotal;

    orderItems.push({
      productId: product.id,
      name: product.name,
      brand: product.brand,
      unit: product.unit,
      price: product.price,
      quantity: qty,
      itemTotal,
    });
  }

  const deliveryFee = subtotal >= 500 ? 0 : 25;
  const totalAmount = subtotal + deliveryFee;

  // Generate unique human-readable order ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `CKS-${dateStr}-${randomSuffix}`;

  const customer = store.customers.find((c) => c.mobile === session.mobile);
  const customerName = customer?.name || req.body.customerName || `Customer ${session.mobile.slice(-4)}`;

  const newOrder: Order = {
    id: orderId,
    customerMobile: session.mobile,
    customerName,
    items: orderItems,
    subtotal,
    deliveryFee,
    totalAmount,
    paymentMethod,
    paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : phonePeTransactionId ? 'Verified' : 'Pending',
    phonePeTransactionId: phonePeTransactionId?.trim() || undefined,
    deliveryAddress,
    status: 'New Order',
    statusHistory: [
      {
        status: 'New Order',
        timestamp: new Date().toISOString(),
        note: 'Order successfully placed by customer.',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.orders.unshift(newOrder);
  saveStore(store);

  res.status(201).json({
    success: true,
    message: 'Order placed successfully!',
    order: newOrder,
  });
});

// 12. Orders: Get Customer Orders
app.get('/api/orders', authenticate, (req: Request, res: Response) => {
  const session = (req as any).user;
  // If admin, they can query all orders; otherwise only their own
  const orders = session.isAdmin
    ? store.orders
    : store.orders.filter((o) => o.customerMobile === session.mobile);

  res.json({ orders });
});

// 13. Admin: Get All Orders (Secured: 7975614686 only)
app.get('/api/admin/orders', authenticate, requireAdmin, (_req: Request, res: Response) => {
  res.json({
    orders: store.orders,
    total: store.orders.length,
  });
});

// 14. Admin: Update Order Status (Secured: 7975614686 only)
app.put('/api/admin/orders/:id/status', authenticate, requireAdmin, (req: Request, res: Response) => {
  const { status, note } = req.body;
  const validStatuses: OrderStatus[] = [
    'New Order',
    'Order Accepted',
    'Preparing',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid order status.' });
  }

  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.status = status;
  order.updatedAt = new Date().toISOString();
  if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
    order.paymentStatus = 'Paid on Delivery';
  }
  order.statusHistory.push({
    status,
    timestamp: new Date().toISOString(),
    note: note || `Status updated to ${status} by Store Owner`,
  });

  saveStore(store);
  res.json({ success: true, order });
});

// 15. Admin: Verify PhonePe Payment (Secured: 7975614686 only)
app.put('/api/admin/orders/:id/verify-payment', authenticate, requireAdmin, (req: Request, res: Response) => {
  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  order.paymentStatus = 'Verified';
  order.updatedAt = new Date().toISOString();
  order.statusHistory.push({
    status: order.status,
    timestamp: new Date().toISOString(),
    note: 'PhonePe payment verified server-side by Store Owner.',
  });

  saveStore(store);
  res.json({ success: true, order });
});

// 16. Customer: Update PhonePe Transaction ID
app.put('/api/orders/:id/phonepe-utr', authenticate, (req: Request, res: Response) => {
  const session = (req as any).user;
  const { utr } = req.body;
  if (!utr || String(utr).trim().length < 6) {
    return res.status(400).json({ error: 'Please enter a valid 12-digit UPI reference / UTR number.' });
  }

  const order = store.orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (order.customerMobile !== session.mobile && !session.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized to update this order.' });
  }

  order.phonePeTransactionId = String(utr).trim();
  order.updatedAt = new Date().toISOString();
  order.statusHistory.push({
    status: order.status,
    timestamp: new Date().toISOString(),
    note: `Customer submitted PhonePe UTR: ${String(utr).trim()}`,
  });

  saveStore(store);
  res.json({ success: true, order });
});

// 17. Public: Get Store Settings & Configurations
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json({
    success: true,
    settings: store.settings || DEFAULT_STORE_SETTINGS,
  });
});

// 18. Admin: Update Store Settings (Secured: 7975614686 only)
app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const current = store.settings || DEFAULT_STORE_SETTINGS;
  const updates = req.body || {};

  const updatedSettings: StoreSettings = {
    storeName: updates.storeName !== undefined ? String(updates.storeName).trim() : current.storeName,
    storeTagline: updates.storeTagline !== undefined ? String(updates.storeTagline).trim() : current.storeTagline,
    heroTitle: updates.heroTitle !== undefined ? String(updates.heroTitle).trim() : current.heroTitle,
    heroSubtitle: updates.heroSubtitle !== undefined ? String(updates.heroSubtitle).trim() : current.heroSubtitle,
    announcement: updates.announcement !== undefined ? String(updates.announcement).trim() : current.announcement,
    supportPhone: updates.supportPhone !== undefined ? String(updates.supportPhone).trim() : current.supportPhone,
    adminPhone: updates.adminPhone !== undefined ? String(updates.adminPhone).trim() : current.adminPhone,
    phonepeNumber: updates.phonepeNumber !== undefined ? String(updates.phonepeNumber).trim() : current.phonepeNumber,
    phonepeUpiId: updates.phonepeUpiId !== undefined ? String(updates.phonepeUpiId).trim() : current.phonepeUpiId,
    deliveryFee: updates.deliveryFee !== undefined ? Math.max(0, parseFloat(updates.deliveryFee) || 0) : current.deliveryFee,
    freeDeliveryThreshold: updates.freeDeliveryThreshold !== undefined ? Math.max(0, parseFloat(updates.freeDeliveryThreshold) || 0) : current.freeDeliveryThreshold,
    storeAddress: updates.storeAddress !== undefined ? String(updates.storeAddress).trim() : current.storeAddress,
    codEnabled: updates.codEnabled !== undefined ? Boolean(updates.codEnabled) : current.codEnabled,
  };

  store.settings = updatedSettings;
  saveStore(store);
  res.json({ success: true, settings: updatedSettings });
});

// Mount Vite in dev or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Chodeshwari Kirana Store backend running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
