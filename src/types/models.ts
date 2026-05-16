// ─── Address ────────────────────────────────────────────────────────────────

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  isDefault: boolean;
}

// ─── Payment ─────────────────────────────────────────────────────────────────

export interface PaymentMethod {
  id: string;
  type: 'card' | 'cash';
  brand?: string;
  last4?: string;
  isDefault: boolean;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
}

// ─── Store ───────────────────────────────────────────────────────────────────

export type StoreType = 'convenience' | 'grocery' | 'restaurant';

export interface Store {
  id: string;
  name: string;
  type: StoreType;
  description: string;
  image: string;
  rating: number;
  reviewCount: number;
  deliveryFeeFlat: number | null;
  deliveryFeePercent: number | null;
  minOrder: number;
  estimatedMinutes: number;
  distanceMiles: number;
  isOpen: boolean;
  categories: string[];
  lat: number;
  lng: number;
  address: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
  popular: boolean;
}

// ─── Order ───────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  storeId: string;
  storeName: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tip: number;
  total: number;
  deliveryAddress: Pick<Address, 'street' | 'city' | 'zip'>;
  paymentMethod: Pick<PaymentMethod, 'brand' | 'last4'>;
  createdAt: string;
  deliveredAt: string | null;
  estimatedMinutes: number;
  driverName: string;
  driverPhone: string;
}

// ─── Cart (local only — lives in Zustand, not the API) ───────────────────────

export interface CartItem {
  product: Product;
  quantity: number;
}
