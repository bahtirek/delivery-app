import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrdersStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStore }      from '@/queries/useStoreQueries';
import { useCartStore }  from '@/store';
import { CartItem }      from '@/components/CartItem/CartItem';
import { EmptyState }    from '@/components/EmptyState/EmptyState';
import { getStoreVisual } from '@/utils/storeVisuals';

type Props = NativeStackScreenProps<OrdersStackParamList, 'Cart'>;

const TIP_OPTIONS = [0, 10, 15, 20];

export const CartScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  const storeId        = useCartStore((s) => s.storeId);
  const items          = useCartStore((s) => s.items);
  const subtotal       = useCartStore((s) => s.subtotal());
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart      = useCartStore((s) => s.clearCart);

  const { data: store } = useStore(storeId ?? '');

  const [tipPct, setTipPct] = useState(15);

  const deliveryFee = store?.deliveryFeeFlat != null
    ? store.deliveryFeeFlat
    : store?.deliveryFeePercent != null
      ? +(subtotal * store.deliveryFeePercent / 100).toFixed(2)
      : 0;

  const tipAmount = +(subtotal * tipPct / 100).toFixed(2);
  const total     = +(subtotal + deliveryFee + tipAmount).toFixed(2);

  const belowMinOrder = store ? subtotal < store.minOrder : false;

  const handleClear = () => {
    Alert.alert('Clear cart?', 'All items will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  if (!items.length) return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your cart</Text>
        <View style={{ width: 36 }} />
      </View>
      <EmptyState
        emoji="🛍️"
        title="Your cart is empty"
        subtitle="Add items from a nearby store to get started."
        actionLabel="Browse stores"
        onAction={() => navigation.goBack()}
      />
    </SafeAreaView>
  );

  const visual = store ? getStoreVisual(store.type) : null;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your cart</Text>
          <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Store info banner */}
        {store && visual && (
          <View style={styles.storeBanner}>
            <Text style={styles.storeBannerEmoji}>{visual.emoji}</Text>
            <View style={styles.storeBannerInfo}>
              <Text style={styles.storeBannerName}>{store.name}</Text>
              <Text style={styles.storeBannerMeta}>{store.estimatedMinutes} min · {store.distanceMiles.toFixed(1)} mi</Text>
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          <View style={styles.itemsList}>
            {items.map((item) => (
              <CartItem
                key={item.product.id}
                item={item}
                onIncrement={() => updateQuantity(item.product.id, item.quantity + 1)}
                onDecrement={() => updateQuantity(item.product.id, item.quantity - 1)}
              />
            ))}
          </View>
        </View>

        {/* Tip selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tip your driver 🙌</Text>
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map((pct) => (
              <TouchableOpacity
                key={pct}
                style={[styles.tipChip, tipPct === pct && styles.tipChipActive]}
                onPress={() => setTipPct(pct)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tipPct, tipPct === pct && styles.tipPctActive]}>
                  {pct === 0 ? 'No tip' : `${pct}%`}
                </Text>
                {pct > 0 && (
                  <Text style={[styles.tipAmt, tipPct === pct && styles.tipAmtActive]}>
                    ${(subtotal * pct / 100).toFixed(2)}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="Subtotal"     value={`$${subtotal.toFixed(2)}`} />
            <SummaryRow label="Delivery fee" value={deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`} />
            <SummaryRow label={`Tip (${tipPct}%)`} value={`$${tipAmount.toFixed(2)}`} />
            <View style={styles.summaryDivider} />
            <SummaryRow label="Total" value={`$${total.toFixed(2)}`} bold />
          </View>
        </View>

        {/* Min order warning */}
        {belowMinOrder && store && (
          <View style={styles.minOrderWarning}>
            <Text style={styles.minOrderWarningText}>
              ⚠️ Minimum order is ${store.minOrder.toFixed(2)}. Add ${(store.minOrder - subtotal).toFixed(2)} more.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Sticky checkout CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={[styles.checkoutBtn, belowMinOrder && styles.checkoutBtnDisabled]}
          onPress={() => navigation.navigate('Checkout')}
          disabled={belowMinOrder}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutBtnText}>Go to checkout</Text>
          <Text style={styles.checkoutBtnTotal}>${total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SummaryRow = ({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) => (
  <View style={summaryStyles.row}>
    <Text style={[summaryStyles.label, bold && summaryStyles.bold]}>{label}</Text>
    <Text style={[summaryStyles.value, bold && summaryStyles.bold]}>{value}</Text>
  </View>
);

const summaryStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...textStyles.body,  color: colors.textSecondary },
  value: { ...textStyles.body,  color: colors.textPrimary },
  bold:  { ...textStyles.h3,    color: colors.textPrimary },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  header:    { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerTitle:{ ...textStyles.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  backBtn:    { width: 36, padding: spacing.xs },
  backText:   { fontSize: 22, color: colors.textPrimary },
  clearBtn:   { width: 36, alignItems: 'flex-end' },
  clearText:  { ...textStyles.label, color: colors.error },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },

  storeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  storeBannerEmoji: { fontSize: 32 },
  storeBannerInfo:  { flex: 1 },
  storeBannerName:  { ...textStyles.h3,      color: colors.textPrimary },
  storeBannerMeta:  { ...textStyles.caption, color: colors.textSecondary },

  section:      { gap: spacing.sm },
  sectionTitle: { ...textStyles.h2, color: colors.textPrimary },
  itemsList:    { gap: spacing.sm },

  tipRow: { flexDirection: 'row', gap: spacing.sm },
  tipChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
    gap: 2,
  },
  tipChipActive: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  tipPct:        { ...textStyles.label,   color: colors.textSecondary },
  tipPctActive:  { color: colors.primary },
  tipAmt:        { ...textStyles.caption, color: colors.textDisabled },
  tipAmtActive:  { color: colors.primary },

  summaryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  summaryDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  minOrderWarning: {
    backgroundColor: colors.warningSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning,
  },
  minOrderWarningText: { ...textStyles.bodySm, color: colors.textSecondary },

  bottomBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    ...shadow.strong,
  },
  checkoutBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  checkoutBtnDisabled: { opacity: 0.45 },
  checkoutBtnText:     { ...textStyles.btnLg, color: colors.textInverse },
  checkoutBtnTotal:    { ...textStyles.btnLg, color: 'rgba(255,255,255,0.85)' },
});
