import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { TabParamList, HomeStackParamList, OrdersStackParamList } from '@/types';
import { colors, textStyles } from '@/constants';

import { HomeScreen }            from '@/screens/Home/HomeScreen';
import { StoreScreen }           from '@/screens/Store/StoreScreen';
import { ProductDetailScreen }   from '@/screens/ProductDetail/ProductDetailScreen';
import { CartScreen }            from '@/screens/Cart/CartScreen';
import { CheckoutScreen }        from '@/screens/Checkout/CheckoutScreen';
import { OrderTrackingScreen }   from '@/screens/OrderTracking/OrderTrackingScreen';

const Placeholder = ({ name }: { name: string }) => (
  <View style={styles.placeholder}>
    <Text style={styles.placeholderEmoji}>🚧</Text>
    <Text style={styles.placeholderText}>{name} coming soon</Text>
  </View>
);

// ─── Home stack ──────────────────────────────────────────────────────────────
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={{ headerShown: false }}>
    <HomeStack.Screen name="Home"          component={HomeScreen} />
    <HomeStack.Screen name="Store"         component={StoreScreen} />
    <HomeStack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </HomeStack.Navigator>
);

// ─── Orders stack ─────────────────────────────────────────────────────────────
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const OrdersNavigator = () => (
  <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
    <OrdersStack.Screen name="Cart"          component={CartScreen} />
    <OrdersStack.Screen name="Checkout"      component={CheckoutScreen} />
    <OrdersStack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <OrdersStack.Screen name="OrderHistory"  component={() => <Placeholder name="Order history" />} />
  </OrdersStack.Navigator>
);

// ─── Tab icon ────────────────────────────────────────────────────────────────
const TabIcon = ({ emoji, focused, badge }: { emoji: string; focused: boolean; badge?: number }) => (
  <View style={styles.tabIcon}>
    <View>
      <Text style={{ fontSize: 20 }}>{emoji}</Text>
      {badge != null && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </View>
    {focused && <View style={styles.tabDot} />}
  </View>
);

// ─── Tab navigator ───────────────────────────────────────────────────────────
const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  const insets = useSafeAreaInsets();
  const itemCount = require('@/store').useCartStore((s: any) => s.itemCount());

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor:  colors.border,
          borderTopWidth:  1,
          paddingBottom:   insets.bottom + 4,
          paddingTop:      8,
          height:          56 + insets.bottom,
        },
        tabBarLabelStyle: { ...textStyles.labelSm },
        tabBarShowLabel:  true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{ title: 'Home',    tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
      />
      <Tab.Screen
        name="SearchTab"
        component={() => <Placeholder name="Search" />}
        options={{ title: 'Search',  tabBarIcon: ({ focused }) => <TabIcon emoji="🔍" focused={focused} /> }}
      />
      <Tab.Screen
        name="OrdersTab"
        component={OrdersNavigator}
        options={{ title: 'Orders',  tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} badge={itemCount} /> }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={() => <Placeholder name="Profile" />}
        options={{ title: 'Profile', tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} /> }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  placeholder:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background, gap: 12 },
  placeholderEmoji: { fontSize: 40 },
  placeholderText:  { ...textStyles.h3, color: colors.textSecondary },
  tabIcon:  { alignItems: 'center', gap: 2 },
  tabDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.tabActive },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { ...textStyles.caption, color: colors.textInverse, fontSize: 9 },
});
