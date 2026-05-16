import React, { useState, useMemo, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert, Animated,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList, Product } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStore }         from '@/queries/useStoreQueries';
import { useStoreProducts } from '@/queries/useProductQueries';
import { useCartStore }     from '@/store';
import { getStoreVisual, getCategoryVisual } from '@/utils/storeVisuals';
import { ProductCard }    from '@/components/ProductCard/ProductCard';
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner';
import { EmptyState }     from '@/components/EmptyState/EmptyState';
import { Badge }          from '@/components/Badge/Badge';

type Props = NativeStackScreenProps<HomeStackParamList, 'Store'>;

export const StoreScreen = ({ navigation, route }: Props) => {
  const { storeId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: store,    isLoading: storeLoading }    = useStore(storeId);
  const { data: products, isLoading: productsLoading } = useStoreProducts(storeId);

  const cartStoreId  = useCartStore((s) => s.storeId);
  const itemCount    = useCartStore((s) => s.itemCount());
  const subtotal     = useCartStore((s) => s.subtotal());
  const addItem      = useCartStore((s) => s.addItem);

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const cartBounce = useRef(new Animated.Value(1)).current;

  // Derive categories from products
  const categories = useMemo(() => {
    if (!products) return [];
    const seen = new Set<string>();
    const cats: string[] = [];
    products.forEach((p) => {
      if (!seen.has(p.category)) { seen.add(p.category); cats.push(p.category); }
    });
    return cats;
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === 'all') return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const popularProducts = useMemo(
    () => products?.filter((p) => p.popular && p.inStock) ?? [],
    [products],
  );

  const handleAddToCart = (product: Product) => {
    // Warn if cart has items from a different store
    if (cartStoreId && cartStoreId !== storeId && itemCount > 0) {
      Alert.alert(
        'Start new cart?',
        'Your cart has items from another store. Adding this will clear your current cart.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Start new cart', style: 'destructive', onPress: () => {
            addItem(product);
            bounceCart();
          }},
        ],
      );
      return;
    }
    addItem(product);
    bounceCart();
  };

  const bounceCart = () => {
    Animated.sequence([
      Animated.spring(cartBounce, { toValue: 1.18, useNativeDriver: true, speed: 40 }),
      Animated.spring(cartBounce, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
  };

  const isLoading = storeLoading || productsLoading;
  if (isLoading) return <LoadingSpinner message="Loading menu…" />;
  if (!store)    return (
    <EmptyState emoji="🏪" title="Store not found" subtitle="This store may no longer be available." actionLabel="Go back" onAction={() => navigation.goBack()} />
  );

  const visual = getStoreVisual(store.type);
  const deliveryFeeLabel = store.deliveryFeeFlat != null
    ? `$${store.deliveryFeeFlat.toFixed(2)} delivery`
    : store.deliveryFeePercent != null
      ? `${store.deliveryFeePercent}% fee`
      : 'Free delivery';

  const cartFromThisStore = cartStoreId === storeId;
  const showCartBar = cartFromThisStore && itemCount > 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Orange hero header */}
      <View style={[styles.hero, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Text style={styles.heroEmoji}>{visual.emoji}</Text>
          <View style={styles.heroInfo}>
            <Text style={styles.heroName}>{store.name}</Text>
            <Text style={styles.heroType}>{visual.categoryLabel}</Text>
          </View>
        </View>

        {/* Store meta pills */}
        <View style={styles.heroPills}>
          <Badge label={store.isOpen ? '● Open' : '● Closed'} variant={store.isOpen ? 'open' : 'closed'} />
          <Badge label={`${store.estimatedMinutes} min`} variant="eta" />
          <Badge label={deliveryFeeLabel} variant="fee" />
          <Badge label={`⭐ ${store.rating.toFixed(1)}`} variant="fee" />
        </View>

        {/* Floating address */}
        <Text style={styles.heroAddress} numberOfLines={1}>📍 {store.address}</Text>
      </View>

      {/* Category tab bar — sticky */}
      {categories.length > 0 && (
        <View style={styles.categoryBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {/* "All" tab */}
            <TouchableOpacity
              style={[styles.catTab, activeCategory === 'all' && styles.catTabActive]}
              onPress={() => setActiveCategory('all')}
              activeOpacity={0.75}
            >
              <Text style={[styles.catTabLabel, activeCategory === 'all' && styles.catTabLabelActive]}>
                All
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => {
              const vis = getCategoryVisual(cat);
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catTab, isActive && styles.catTabActive]}
                  onPress={() => setActiveCategory(cat)}
                  activeOpacity={0.75}
                >
                  <Text style={styles.catEmoji}>{vis.emoji}</Text>
                  <Text style={[styles.catTabLabel, isActive && styles.catTabLabelActive]}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Product list */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, showCartBar && { paddingBottom: 100 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Popular section — only show when "all" filter active */}
        {activeCategory === 'all' && popularProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⭐ Popular items</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {popularProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onPress={() => navigation.navigate('ProductDetail', { productId: product.id, storeId })}
                  onAdd={() => handleAddToCart(product)}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Main product grid */}
        <View style={styles.section}>
          {activeCategory !== 'all' && (
            <Text style={styles.sectionTitle}>
              {getCategoryVisual(activeCategory).emoji} {activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)}
            </Text>
          )}
          {activeCategory === 'all' && <Text style={styles.sectionTitle}>All items</Text>}

          {filteredProducts.length === 0
            ? <EmptyState emoji="📭" title="Nothing here" subtitle="No items in this category." />
            : (
              <View style={styles.grid}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onPress={() => navigation.navigate('ProductDetail', { productId: product.id, storeId })}
                    onAdd={() => handleAddToCart(product)}
                  />
                ))}
              </View>
            )
          }
        </View>

        {/* Min order notice */}
        {store.minOrder > 0 && (
          <View style={styles.minOrderNotice}>
            <Text style={styles.minOrderText}>
              🛍️ Minimum order ${store.minOrder.toFixed(2)}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Floating cart bar */}
      {showCartBar && (
        <Animated.View style={[styles.cartBar, { bottom: insets.bottom + spacing.md }, { transform: [{ scale: cartBounce }] }]}>
          <TouchableOpacity
            style={styles.cartBtn}
            activeOpacity={0.88}
            onPress={() => {
              // Navigate to Cart — hoisted to Orders tab in phase 2
              // For now show a coming soon alert
              Alert.alert('Cart', `${itemCount} item${itemCount !== 1 ? 's' : ''} · $${subtotal.toFixed(2)}

Cart screen coming soon!`);
            }}
          >
            <View style={styles.cartCount}>
              <Text style={styles.cartCountText}>{itemCount}</Text>
            </View>
            <Text style={styles.cartBtnLabel}>View cart</Text>
            <Text style={styles.cartBtnTotal}>${subtotal.toFixed(2)}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Hero header
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  backBtn:  { alignSelf: 'flex-start', padding: spacing.xs, marginBottom: spacing.xs },
  backIcon: { fontSize: 22, color: colors.textInverse },

  heroContent: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  heroEmoji:   { fontSize: 48 },
  heroInfo:    { flex: 1, gap: 2 },
  heroName:    { ...textStyles.h1, color: colors.textInverse },
  heroType:    { ...textStyles.bodySm, color: 'rgba(255,255,255,0.75)' },

  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },

  heroAddress: {
    ...textStyles.caption,
    color: 'rgba(255,255,255,0.65)',
    marginTop: spacing.xs,
  },

  // Category tabs
  categoryBar: {
    backgroundColor: colors.backgroundCard,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadow.card,
  },
  categoryScroll: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  catTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  catTabActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryMuted,
  },
  catEmoji:         { fontSize: 13 },
  catTabLabel:      { ...textStyles.label, color: colors.textSecondary },
  catTabLabelActive:{ color: colors.primary },

  // Products
  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },
  section:       { gap: spacing.md },
  sectionTitle:  { ...textStyles.h2, color: colors.textPrimary },
  horizontalList:{ gap: spacing.md, paddingRight: spacing.md },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },

  // Min order
  minOrderNotice: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  minOrderText: { ...textStyles.bodySm, color: colors.textSecondary },

  // Cart bar
  cartBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
  },
  cartBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    ...shadow.strong,
  },
  cartCount: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: { ...textStyles.label,  color: colors.textInverse },
  cartBtnLabel:  { ...textStyles.btnLg,  color: colors.textInverse, flex: 1 },
  cartBtnTotal:  { ...textStyles.btnLg,  color: colors.textInverse },
});
