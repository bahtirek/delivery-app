import React, { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, StatusBar, Alert, Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useProduct }   from '@/queries/useProductQueries';
import { useStore }     from '@/queries/useStoreQueries';
import { useCartStore } from '@/store';
import { getCategoryVisual } from '@/utils/storeVisuals';
import { LoadingSpinner }    from '@/components/LoadingSpinner/LoadingSpinner';
import { EmptyState }        from '@/components/EmptyState/EmptyState';
import { Badge }             from '@/components/Badge/Badge';

type Props = NativeStackScreenProps<HomeStackParamList, 'ProductDetail'>;

export const ProductDetailScreen = ({ navigation, route }: Props) => {
  const { productId, storeId } = route.params;
  const insets = useSafeAreaInsets();

  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: store,   isLoading: storeLoading }   = useStore(storeId);

  const cartStoreId = useCartStore((s) => s.storeId);
  const itemCount   = useCartStore((s) => s.itemCount());
  const cartItems   = useCartStore((s) => s.items);
  const addItem     = useCartStore((s) => s.addItem);
  const subtotal    = useCartStore((s) => s.subtotal());

  const [quantity, setQuantity] = useState(1);
  const addBtnScale = useRef(new Animated.Value(1)).current;

  // How many of this product are already in cart
  const inCartQty = cartItems.find((i) => i.product.id === productId)?.quantity ?? 0;

  const isLoading = productLoading || storeLoading;
  if (isLoading) return <LoadingSpinner message="Loading product…" />;
  if (!product)  return (
    <EmptyState
      emoji="📦"
      title="Product not found"
      subtitle="This item may no longer be available."
      actionLabel="Go back"
      onAction={() => navigation.goBack()}
    />
  );

  const visual = getCategoryVisual(product.category);

  const lineTotal = (product.price * quantity).toFixed(2);

  const handleAdd = () => {
    // Warn if cart has items from a different store
    if (cartStoreId && cartStoreId !== storeId && itemCount > 0) {
      Alert.alert(
        'Start new cart?',
        'Your cart has items from another store. Adding this will clear your current cart.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start new cart',
            style: 'destructive',
            onPress: () => {
              for (let i = 0; i < quantity; i++) addItem(product);
              bounceBtn();
              navigation.goBack();
            },
          },
        ],
      );
      return;
    }
    for (let i = 0; i < quantity; i++) addItem(product);
    bounceBtn();
    navigation.goBack();
  };

  const bounceBtn = () => {
    Animated.sequence([
      Animated.spring(addBtnScale, { toValue: 0.93, useNativeDriver: true, speed: 50 }),
      Animated.spring(addBtnScale, { toValue: 1,    useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const cartFromThisStore = cartStoreId === storeId;
  const showCartBar = cartFromThisStore && itemCount > 0;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Back button (floating over content) */}
      <View style={[styles.backRow, { paddingTop: insets.top + spacing.xs }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.75}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 110 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero illustration */}
        <View style={[styles.hero, { backgroundColor: visual.bg }]}>
          <Text style={styles.heroEmoji}>{visual.emoji}</Text>
          {product.popular && (
            <View style={styles.popularBadge}>
              <Badge label="⭐ Popular" variant="popular" />
            </View>
          )}
          {!product.inStock && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockText}>Out of stock</Text>
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category pill */}
          <View style={styles.categoryRow}>
            <Text style={styles.categoryEmoji}>{visual.emoji}</Text>
            <Text style={styles.categoryLabel}>
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Text>
          </View>

          {/* Name + price */}
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>

          {/* Description */}
          <Text style={styles.description}>{product.description}</Text>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Store info */}
          {store && (
            <TouchableOpacity
              style={styles.storeRow}
              onPress={() => navigation.navigate('Store', { storeId })}
              activeOpacity={0.75}
            >
              <View style={styles.storeIcon}>
                <Text style={{ fontSize: 18 }}>🏪</Text>
              </View>
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{store.name}</Text>
                <Text style={styles.storeMeta}>{store.estimatedMinutes} min · {store.distanceMiles.toFixed(1)} mi away</Text>
              </View>
              <Text style={styles.storeArrow}>›</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* In cart indicator */}
          {inCartQty > 0 && (
            <View style={styles.inCartBanner}>
              <Text style={styles.inCartText}>
                🛍️ {inCartQty} already in your cart
              </Text>
            </View>
          )}

          {/* Quantity selector */}
          {product.inStock && (
            <View style={styles.qtySection}>
              <Text style={styles.qtySectionLabel}>Quantity</Text>
              <View style={styles.qtyStepper}>
                <TouchableOpacity
                  style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyValue}>{quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => q + 1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom — Add to cart CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        {/* Cart summary (if cart has items from this store) */}
        {showCartBar && (
          <TouchableOpacity
            style={styles.cartSummary}
            onPress={() => Alert.alert('Cart', `${itemCount} item${itemCount !== 1 ? 's' : ''} · $${subtotal.toFixed(2)}

Cart screen coming soon!`)}
            activeOpacity={0.8}
          >
            <Text style={styles.cartSummaryText}>
              🛍️ {itemCount} item{itemCount !== 1 ? 's' : ''} in cart · ${subtotal.toFixed(2)}
            </Text>
            <Text style={styles.cartSummaryLink}>View →</Text>
          </TouchableOpacity>
        )}

        {product.inStock ? (
          <Animated.View style={{ transform: [{ scale: addBtnScale }] }}>
            <TouchableOpacity style={styles.addBtn} onPress={handleAdd} activeOpacity={0.88}>
              <Text style={styles.addBtnLabel}>Add {quantity} to cart</Text>
              <View style={styles.addBtnPrice}>
                <Text style={styles.addBtnPriceText}>${lineTotal}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.outOfStockBtn}>
            <Text style={styles.outOfStockBtnText}>Out of stock</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Back button
  backRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.md,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  backIcon: { fontSize: 20, color: colors.textPrimary },

  // Hero
  hero: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroEmoji: { fontSize: 100 },
  popularBadge: { position: 'absolute', top: spacing.md, right: spacing.md },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,251,248,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: { ...textStyles.h2, color: colors.textSecondary },

  // Scrollable content
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },

  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    marginTop: -spacing.xl,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  // Category
  categoryRow:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  categoryEmoji:{ fontSize: 14 },
  categoryLabel:{ ...textStyles.label, color: colors.textSecondary },

  // Name + price
  name:  { ...textStyles.h1, color: colors.textPrimary },
  price: { ...textStyles.h2, color: colors.primary },

  // Description
  description: { ...textStyles.body, color: colors.textSecondary, lineHeight: 24 },

  // Divider
  divider: { height: 1, backgroundColor: colors.border },

  // Store row
  storeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  storeIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo:  { flex: 1, gap: 2 },
  storeName:  { ...textStyles.label,   color: colors.textPrimary },
  storeMeta:  { ...textStyles.caption, color: colors.textSecondary },
  storeArrow: { fontSize: 20, color: colors.textDisabled },

  // In cart
  inCartBanner: {
    backgroundColor: colors.primarySubtle,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primaryMuted,
  },
  inCartText: { ...textStyles.label, color: colors.primary },

  // Quantity
  qtySection:      { gap: spacing.sm },
  qtySectionLabel: { ...textStyles.h3, color: colors.textPrimary },
  qtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'flex-start',
  },
  qtyBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
  },
  qtyBtnDisabled: { opacity: 0.35 },
  qtyBtnText: { fontSize: 24, color: colors.textPrimary, lineHeight: 28 },
  qtyValue:   { ...textStyles.h2, color: colors.textPrimary, minWidth: 32, textAlign: 'center' },

  // Bottom bar
  bottomBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    ...shadow.strong,
  },
  cartSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cartSummaryText: { ...textStyles.label, color: colors.textSecondary },
  cartSummaryLink: { ...textStyles.label, color: colors.primary },

  // Add to cart button
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    ...shadow.strong,
  },
  addBtnLabel: { ...textStyles.btnLg, color: colors.textInverse },
  addBtnPrice: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  addBtnPriceText: { ...textStyles.btnLg, color: colors.textInverse },

  // Out of stock button
  outOfStockBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockBtnText: { ...textStyles.btnLg, color: colors.textDisabled },
});
