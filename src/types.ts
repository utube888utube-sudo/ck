export type ProductCategory =
  | 'Rice & Grains'
  | 'Atta & Flour'
  | 'Dals & Pulses'
  | 'Cooking Oils'
  | 'Sugar & Salt'
  | 'Spices & Masalas'
  | 'Biscuits & Snacks'
  | 'Tea & Coffee'
  | 'Dairy Products'
  | 'Personal Care'
  | 'Household Cleaning'
  | 'Rice and grains'
  | 'Atta and flour'
  | 'Pulses and dals'
  | 'Cooking oil and ghee'
  | 'Sugar and salt'
  | 'Spices and masalas'
  | 'Biscuits and snacks'
  | 'Tea and coffee'
  | 'Soaps and personal care'
  | 'Household cleaning products';

export interface Product {
  id: string;
  title: string;
  name: string; // compatibility alias
  brand: string;
  category: ProductCategory;
  weight: string;
  unit: string; // compatibility alias
  mrp: number; // Maximum retail price in ₹
  selling_price: number;
  price: number; // compatibility alias
  discount_percentage: number;
  image_url: string;
  imageUrl: string; // compatibility alias
  manufacture_date?: string;
  expiry_date?: string;
  stock_quantity: number;
  stockCount: number; // compatibility alias
  availability: boolean | 'IN_STOCK' | 'OUT_OF_STOCK';
  inStock: boolean; // compatibility alias
  status: 'ACTIVE' | 'INACTIVE';
  isSamplePrice?: boolean;
  description: string;
  isPopular?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryAddress {
  houseNo: string;
  street: string;
  landmark: string;
  villageOrCity: string;
  pincode: string;
  latitude: number;
  longitude: number;
  formattedAddress?: string;
}

export type OrderStatus =
  | 'New Order'
  | 'Order Accepted'
  | 'Preparing'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export type PaymentMethod = 'Cash on Delivery' | 'PhonePe UPI';

export interface OrderItem {
  productId: string;
  name: string;
  brand: string;
  unit: string;
  price: number;
  quantity: number;
  itemTotal: number;
}

export interface Order {
  id: string;
  customerMobile: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'Pending' | 'Verified' | 'Paid on Delivery';
  phonePeTransactionId?: string;
  deliveryAddress: DeliveryAddress;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUser {
  id: string;
  mobile: string;
  name: string;
  addresses: DeliveryAddress[];
  createdAt: string;
}

export interface AuthState {
  user: CustomerUser | null;
  isAdmin: boolean;
  token: string | null;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  supportPhone: string;
  adminPhone: string;
  phonepeNumber: string;
  phonepeUpiId: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  storeAddress: string;
  codEnabled: boolean;
}
