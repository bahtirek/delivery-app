import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ─── Auth stack ──────────────────────────────────────────────────────────────

export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  SetAddress: undefined;
};

// ─── Home stack ──────────────────────────────────────────────────────────────

export type HomeStackParamList = {
  Home: undefined;
  Store: { storeId: string };
  ProductDetail: { productId: string; storeId: string };
};

// ─── Search stack ────────────────────────────────────────────────────────────

export type SearchStackParamList = {
  Search: undefined;
  CategoryResults: { category: string; storeId?: string };
};

// ─── Orders stack ────────────────────────────────────────────────────────────

export type OrdersStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string };
  OrderHistory: undefined;
};

// ─── Profile stack ───────────────────────────────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  Addresses: undefined;
  Payment: undefined;
};

// ─── Tab navigator ───────────────────────────────────────────────────────────

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
};

// ─── Convenience types ───────────────────────────────────────────────────────

export type HomeScreenProps     = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type StoreScreenProps    = NativeStackScreenProps<HomeStackParamList, 'Store'>;
export type ProductDetailProps  = NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>;
export type CartScreenProps     = NativeStackScreenProps<OrdersStackParamList, 'Cart'>;
export type CheckoutScreenProps = NativeStackScreenProps<OrdersStackParamList, 'Checkout'>;
export type OrderTrackingProps  = NativeStackScreenProps<OrdersStackParamList, 'OrderTracking'>;
