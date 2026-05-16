import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CartStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStore }       from '@/queries/useStoreQueries';
import { usePlaceOrder }  from '@/queries/useOrderQueries';
import { useCartStore, useAuthStore, useLocationStore } from '@/store';

type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>;

const TIP_OPTIONS = [0, 10, 15, 20];

export const CheckoutScreen = ({ navigation }: Props) => {
  const insets = useSafeAreaInsets();

  const user            = useAuthStore((s) => s.user);
  const userId          = useAuthStore((s) => s.userId);
  const deliveryAddress = useLocationStore((s) => s.deliveryAddress);
  const storeId         = useCartStore((s) => s.storeId);
  const items           = useCartStore((s) => s.items);
  const subtotal        = useCartStore((s) => s.subtotal());
  const clearCart       = useCartStore((s) => s.clearCart);

  const { data: store } = useStore(storeId ?? '');
  const { mutate: placeOrder, isPending } = usePlaceOrder();

  const [tipPct, setTipPct] = useState(15);

  const deliveryFee = store?.deliveryFeeFlat != null
    ? store.deliveryFeeFlat
    : store?.deliveryFeePercent != null
      ? +(subtotal * store.deliveryFeePercent / 100).toFixed(2)
      : 0;

  const tipAmount = +(subtotal * tipPct / 100).toFixed(2);
  const total     = +(subtotal + deliveryFee + tipAmount).toFixed(2);

  const defaultPayment = user?.paymentMethods.find((p) => p.isDefault)
    ?? user?.paymentMethods[0];

  const handlePlaceOrder = () => {
    if (!userId || !storeId || !store || !deliveryAddress || !defaultPayment) {
      Alert.alert('Missing info', 'Please set a delivery address and payment method.');
      return;
    }

    const orderItems = items.map((i) => ({
      productId: i.product.id,
      name:      i.product.name,
      price:     i.product.price,
      quantity:  i.quantity,
    }));

    placeOrder(
      {
        userId,
        storeId,
        storeName:  store.name,
        status:     'pending',
        items:      orderItems,
        subtotal,
        deliveryFee,
        tip:        tipAmount,
        total,
        deliveryAddress: {
          street: deliveryAddress.street,
          city:   deliveryAddress.city,
          zip:    deliveryAddress.zip,
        },
        paymentMethod: {
          brand: defaultPayment.brand ?? 'Card',
          last4: defaultPayment.last4 ?? '****',
        },
        createdAt:        new Date().toISOString(),
        deliveredAt:      null,
        estimatedMinutes: store.estimatedMinutes,
        driverName:       'Your driver',
        driverPhone:      '555-0100',
      },
      {
        onSuccess: (order) => {
          clearCart();
          navigation.replace('OrderTracking', { orderId: order.id });
        },
        onError: () => {
          Alert.alert('Order failed', 'Something went wrong. Please try again.');
        },
      },
    );
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 36 }} />
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 120 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery address</Text>
          <View style={styles.infoCard}>
            {deliveryAddress ? (
              <>
                <Text style={styles.infoMain}>{deliveryAddress.street}</Text>
                <Text style={styles.infoSub}>{deliveryAddress.city}, {deliveryAddress.zip}</Text>
              </>
            ) : (
              <Text style={styles.infoWarning}>No address set — go back and add one.</Text>
            )}
          </View>
        </View>

        {/* Payment method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment</Text>
          <View style={styles.infoCard}>
            {defaultPayment ? (
              <>
                <Text style={styles.infoMain}>{defaultPayment.brand} ···· {defaultPayment.last4}</Text>
                <Text style={styles.infoSub}>Default card</Text>
              </>
            ) : (
              <Text style={styles.infoWarning}>No payment method — add one in Profile.</Text>
            )}
          </View>
        </View>

        {/* Order items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ Your order</Text>
          <View style={styles.itemsCard}>
            {items.map((item) => (
              <View key={item.product.id} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <Text style={styles.itemName} numberOfLines={1}>{item.product.name}</Text>
                <Text style={styles.itemPrice}>${(item.product.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tip */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🙌 Tip your driver</Text>
          <View style={styles.tipRow}>
            {TIP_OPTIONS.map((pct) => (
              <TouchableOpacity
                key={pct}
                style={[styles.tipChip, tipPct === pct && styles.tipChipActive]}
                onPress={() => setTipPct(pct)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tipLabel, tipPct === pct && styles.tipLabelActive]}>
                  {pct === 0 ? 'None' : `${pct}%`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order total</Text>
          <View style={styles.summaryCard}>
            <SummaryRow label="Subtotal"          value={`$${subtotal.toFixed(2)}`} />
            <SummaryRow label="Delivery"           value={deliveryFee === 0 ? 'Free' : `$${deliveryFee.toFixed(2)}`} />
            <SummaryRow label={`Tip (${tipPct}%)`} value={`$${tipAmount.toFixed(2)}`} />
            <View style={styles.divider} />
            <SummaryRow label="Total" value={`$${total.toFixed(2)}`} bold />
          </View>
        </View>

        {/* ETA note */}
        {store && (
          <View style={styles.etaNote}>
            <Text style={styles.etaNoteText}>
              🛵 Estimated delivery: {store.estimatedMinutes}–{store.estimatedMinutes + 5} min
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Place order CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
        <TouchableOpacity
          style={[styles.placeBtn, isPending && styles.placeBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPending}
          activeOpacity={0.88}
        >
          <Text style={styles.placeBtnText}>
            {isPending ? 'Placing order…' : 'Place order'}
          </Text>
          <Text style={styles.placeBtnTotal}>${total.toFixed(2)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SummaryRow = ({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) => (
  <View style={sumStyles.row}>
    <Text style={[sumStyles.label, bold && sumStyles.bold]}>{label}</Text>
    <Text style={[sumStyles.value, bold && sumStyles.bold]}>{value}</Text>
  </View>
);

const sumStyles = StyleSheet.create({
  row:   { flexDirection: 'row', justifyContent: 'space-between' },
  label: { ...textStyles.body,  color: colors.textSecondary },
  value: { ...textStyles.body,  color: colors.textPrimary },
  bold:  { ...textStyles.h3,    color: colors.textPrimary },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  header:     { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  headerTitle:{ ...textStyles.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  backBtn:    { width: 36, padding: spacing.xs },
  backText:   { fontSize: 22, color: colors.textPrimary },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },

  section:      { gap: spacing.sm },
  sectionTitle: { ...textStyles.h2, color: colors.textPrimary },

  infoCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: 4,
    ...shadow.card,
  },
  infoMain:    { ...textStyles.h3,      color: colors.textPrimary },
  infoSub:     { ...textStyles.caption, color: colors.textSecondary },
  infoWarning: { ...textStyles.body,    color: colors.error },

  itemsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  itemRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemQty:   { ...textStyles.label,   color: colors.textSecondary, width: 24 },
  itemName:  { ...textStyles.body,    color: colors.textPrimary, flex: 1 },
  itemPrice: { ...textStyles.label,   color: colors.textPrimary },

  tipRow: { flexDirection: 'row', gap: spacing.sm },
  tipChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  tipChipActive:  { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  tipLabel:       { ...textStyles.label, color: colors.textSecondary },
  tipLabelActive: { color: colors.primary },

  summaryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },

  etaNote: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  etaNoteText: { ...textStyles.body, color: colors.textSecondary },

  bottomBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: spacing.md,
    ...shadow.strong,
  },
  placeBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  placeBtnDisabled: { opacity: 0.55 },
  placeBtnText:     { ...textStyles.btnLg, color: colors.textInverse },
  placeBtnTotal:    { ...textStyles.btnLg, color: 'rgba(255,255,255,0.85)' },
});
