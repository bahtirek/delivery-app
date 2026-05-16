import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { OrdersStackParamList, OrderStatus } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useOrder } from '@/queries/useOrderQueries';
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner';
import { EmptyState }     from '@/components/EmptyState/EmptyState';

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderTracking'>;

interface StatusStep {
  key:     OrderStatus;
  label:   string;
  emoji:   string;
  detail:  string;
}

const STATUS_STEPS: StatusStep[] = [
  { key: 'pending',          label: 'Order placed',     emoji: '📋', detail: 'Your order has been received.' },
  { key: 'confirmed',        label: 'Confirmed',        emoji: '✅', detail: 'The store has confirmed your order.' },
  { key: 'preparing',        label: 'Being prepared',   emoji: '🧑‍🍳', detail: 'Your items are being packed.' },
  { key: 'out_for_delivery', label: 'On the way',       emoji: '🛵', detail: 'Your driver is heading to you.' },
  { key: 'delivered',        label: 'Delivered',        emoji: '🎉', detail: 'Enjoy your order!' },
];

const STATUS_ORDER: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered',
];

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case 'delivered':        return colors.success;
    case 'out_for_delivery': return colors.primary;
    case 'cancelled':        return colors.error;
    default:                 return colors.primary;
  }
};

export const OrderTrackingScreen = ({ navigation, route }: Props) => {
  const { orderId } = route.params;
  const insets = useSafeAreaInsets();

  // Poll every 15s while order is live
  const isLive = true;
  const { data: order, isLoading } = useOrder(orderId, isLive);

  if (isLoading) return <LoadingSpinner message="Loading your order…" />;
  if (!order)    return (
    <EmptyState
      emoji="📋"
      title="Order not found"
      actionLabel="Go home"
      onAction={() => navigation.navigate('Cart')}
    />
  );

  const currentIdx  = STATUS_ORDER.indexOf(order.status);
  const currentStep = STATUS_STEPS.find((s) => s.key === order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const statusColor = getStatusColor(order.status);

  const orderDate = new Date(order.createdAt).toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={[styles.header, { backgroundColor: statusColor }]}>
        <View style={styles.headerRow}>
          {isDelivered ? (
            <View style={{ width: 36 }} />
          ) : (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>
            {isDelivered ? 'Delivered! 🎉' : 'Tracking your order'}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero status */}
        <View style={styles.heroStatus}>
          <Text style={styles.heroEmoji}>{currentStep?.emoji ?? '📋'}</Text>
          <Text style={styles.heroLabel}>{currentStep?.label ?? order.status}</Text>
          <Text style={styles.heroDetail}>{currentStep?.detail}</Text>
          {!isDelivered && !isCancelled && (
            <View style={styles.etaPill}>
              <Text style={styles.etaText}>~{order.estimatedMinutes} min remaining</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 40 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress stepper */}
        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.stepperCard}>
              {STATUS_STEPS.map((step, idx) => {
                const isDone    = idx < currentIdx || isDelivered;
                const isCurrent = step.key === order.status;
                const isPending = idx > currentIdx && !isDelivered;

                return (
                  <View key={step.key} style={styles.stepRow}>
                    {/* Line connector */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <View style={[styles.stepLine, isDone && styles.stepLineDone]} />
                    )}

                    {/* Dot */}
                    <View style={[
                      styles.stepDot,
                      isDone    && styles.stepDotDone,
                      isCurrent && { backgroundColor: statusColor, borderColor: statusColor },
                      isPending && styles.stepDotPending,
                    ]}>
                      {(isDone || isCurrent) && (
                        <Text style={styles.stepDotEmoji}>{isDone && !isCurrent ? '✓' : step.emoji}</Text>
                      )}
                    </View>

                    {/* Text */}
                    <View style={styles.stepInfo}>
                      <Text style={[
                        styles.stepLabel,
                        isCurrent && { color: statusColor, fontFamily: 'Inter_700Bold' },
                        isPending && styles.stepLabelPending,
                      ]}>
                        {step.label}
                      </Text>
                      {isCurrent && (
                        <Text style={styles.stepDetail}>{step.detail}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Driver info — show when out for delivery */}
        {order.status === 'out_for_delivery' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your driver</Text>
            <View style={styles.driverCard}>
              <View style={styles.driverAvatar}>
                <Text style={{ fontSize: 28 }}>🛵</Text>
              </View>
              <View style={styles.driverInfo}>
                <Text style={styles.driverName}>{order.driverName}</Text>
                <Text style={styles.driverSub}>On the way to you</Text>
              </View>
              <TouchableOpacity style={styles.callBtn} activeOpacity={0.75}>
                <Text style={styles.callBtnText}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Order summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order summary</Text>
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Text style={styles.summaryStoreName}>{order.storeName}</Text>
              <Text style={styles.summaryTime}>Placed at {orderDate}</Text>
            </View>
            <View style={styles.summaryDivider} />
            {order.items.map((item) => (
              <View key={item.productId} style={styles.itemRow}>
                <Text style={styles.itemQty}>{item.quantity}×</Text>
                <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.itemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
              </View>
            ))}
            <View style={styles.summaryDivider} />
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { color: colors.textSecondary }]}>Delivery fee</Text>
              <Text style={styles.itemPrice}>${order.deliveryFee.toFixed(2)}</Text>
            </View>
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { color: colors.textSecondary }]}>Tip</Text>
              <Text style={styles.itemPrice}>${order.tip.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.itemRow}>
              <Text style={[styles.itemName, { ...textStyles.h3 }]}>Total</Text>
              <Text style={[styles.itemPrice, { ...textStyles.h3 }]}>${order.total.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivering to</Text>
          <View style={styles.addressCard}>
            <Text style={styles.addressMain}>📍 {order.deliveryAddress.street}</Text>
            <Text style={styles.addressSub}>{order.deliveryAddress.city}, {order.deliveryAddress.zip}</Text>
          </View>
        </View>

        {/* Done CTA */}
        {isDelivered && (
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => navigation.navigate('Cart')}
            activeOpacity={0.88}
          >
            <Text style={styles.doneBtnText}>Back to home</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  header:     { },
  headerRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  headerTitle:{ ...textStyles.h3, color: colors.textInverse, flex: 1, textAlign: 'center' },
  backBtn:    { width: 36, padding: spacing.xs },
  backIcon:   { fontSize: 22, color: colors.textInverse },

  heroStatus: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },
  heroEmoji:  { fontSize: 56 },
  heroLabel:  { ...textStyles.h1, color: colors.textInverse },
  heroDetail: { ...textStyles.body, color: 'rgba(255,255,255,0.8)', textAlign: 'center' },
  etaPill: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  etaText: { ...textStyles.label, color: colors.textInverse },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },
  section:       { gap: spacing.sm },
  sectionTitle:  { ...textStyles.h2, color: colors.textPrimary },

  // Stepper
  stepperCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    paddingLeft: spacing.xl + spacing.sm,
    gap: spacing.lg,
    ...shadow.card,
    position: 'relative',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    position: 'relative',
  },
  stepLine: {
    position: 'absolute',
    left: -spacing.xl,
    top: 28,
    width: 2,
    height: spacing.xl + spacing.sm,
    backgroundColor: colors.border,
  },
  stepLineDone:    { backgroundColor: colors.success },
  stepDot: {
    position: 'absolute',
    left: -(spacing.xl + 11),
    top: 0,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone:    { backgroundColor: colors.success, borderColor: colors.success },
  stepDotPending: { backgroundColor: colors.surfaceAlt },
  stepDotEmoji:   { fontSize: 12 },
  stepInfo:        { flex: 1, gap: 2 },
  stepLabel:       { ...textStyles.label, color: colors.textPrimary },
  stepLabelPending:{ color: colors.textDisabled },
  stepDetail:      { ...textStyles.caption, color: colors.textSecondary },

  // Driver
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  driverAvatar: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverInfo:  { flex: 1 },
  driverName:  { ...textStyles.h3,      color: colors.textPrimary },
  driverSub:   { ...textStyles.caption, color: colors.textSecondary },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnText: { fontSize: 20 },

  // Summary
  summaryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  summaryHeader:   { gap: 2 },
  summaryStoreName:{ ...textStyles.h3,      color: colors.textPrimary },
  summaryTime:     { ...textStyles.caption, color: colors.textSecondary },
  summaryDivider:  { height: 1, backgroundColor: colors.border },
  itemRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  itemQty:   { ...textStyles.label,   color: colors.textSecondary, width: 24 },
  itemName:  { ...textStyles.body,    color: colors.textPrimary, flex: 1 },
  itemPrice: { ...textStyles.label,   color: colors.textPrimary },

  // Address
  addressCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: 4,
    ...shadow.card,
  },
  addressMain: { ...textStyles.h3,      color: colors.textPrimary },
  addressSub:  { ...textStyles.caption, color: colors.textSecondary },

  // Done
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.strong,
  },
  doneBtnText: { ...textStyles.btnLg, color: colors.textInverse },
});
