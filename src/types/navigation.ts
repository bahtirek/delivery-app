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

// ─── Cart stack (was Orders) — active ordering only ──────────────────────────

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  OrderTracking: { orderId: string };
};

// ─── Profile stack — includes order history ───────────────────────────────────

export type ProfileStackParamList = {
  Profile: undefined;
  OrderHistory: undefined;
  Addresses: undefined;
  AddAddress: { addressId?: string };
  Payment: undefined;
  AddPayment: { paymentId?: string };
};

// ─── Tab navigator ───────────────────────────────────────────────────────────

export type TabParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  CartTab: undefined;
  ProfileTab: undefined;
};

// ─── Convenience types ───────────────────────────────────────────────────────

export type HomeScreenProps     = NativeStackScreenProps<HomeStackParamList, 'Home'>;
export type StoreScreenProps    = NativeStackScreenProps<HomeStackParamList, 'Store'>;
export type ProductDetailProps  = NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>;
export type CartScreenProps     = NativeStackScreenProps<CartStackParamList, 'Cart'>;
export type CheckoutScreenProps = NativeStackScreenProps<CartStackParamList, 'Checkout'>;
export type OrderTrackingProps  = NativeStackScreenProps<CartStackParamList, 'OrderTracking'>;
export type OrderHistoryProps   = NativeStackScreenProps<ProfileStackParamList, 'OrderHistory'>;
export type AddAddressProps     = NativeStackScreenProps<ProfileStackParamList, 'AddAddress'>;
export type AddPaymentProps     = NativeStackScreenProps<ProfileStackParamList, 'AddPayment'>;
