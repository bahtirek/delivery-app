import React from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList, Order, OrderStatus } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useOrderHistory } from '@/queries/useOrderQueries';
import { useAuthStore }    from '@/store';
import { LoadingSpinner }  from '@/components/LoadingSpinner/LoadingSpinner';
import { EmptyState }      from '@/components/EmptyState/EmptyState';

type Props = NativeStackScreenProps<ProfileStackParamList, 'OrderHistory'>;

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:          'Pending',
  confirmed:        'Confirmed',
  preparing:        'Preparing',
  out_for_delivery: 'On the way',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

const STATUS_COLOR: Record<OrderStatus, string> = {
  pending:          colors.warning,
  confirmed:        colors.info,
  preparing:        colors.warning,
  out_for_delivery: colors.primary,
  delivered:        colors.success,
  cancelled:        colors.error,
};

export const OrderHistoryScreen = ({ navigation }: Props) => {
  const userId = useAuthStore((s) => s.userId);
  const { data: orders, isLoading, refetch } = useOrderHistory(userId ?? '');

  const sorted = orders
    ? [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  if (isLoading) return <LoadingSpinner message="Loading orders…" />;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Order history</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      {sorted.length === 0 ? (
        <EmptyState
          emoji="🛍️"
          title="No orders yet"
          subtitle="Your completed orders will appear here."
        />
      ) : (
        <FlatList
          data={sorted}
          keyExtractor={(o) => o.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item: order }) => (
            <OrderCard
              order={order}
              onPress={() => { /* OrderTracking is in the Cart tab — use deep link in production */ }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        />
      )}
    </View>
  );
};

const OrderCard = ({ order, onPress }: { order: Order; onPress: () => void }) => {
  const statusColor = STATUS_COLOR[order.status];
  const date = new Date(order.createdAt).toLocaleDateString([], {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <TouchableOpacity style={cardStyles.card} onPress={onPress} activeOpacity={0.85}>
      {/* Store + status row */}
      <View style={cardStyles.topRow}>
        <View style={cardStyles.storeInfo}>
          <Text style={cardStyles.storeName}>{order.storeName}</Text>
          <Text style={cardStyles.date}>{date}</Text>
        </View>
        <View style={[cardStyles.statusPill, { backgroundColor: statusColor + '20' }]}>
          <Text style={[cardStyles.statusText, { color: statusColor }]}>
            {STATUS_LABEL[order.status]}
          </Text>
        </View>
      </View>

      {/* Items summary */}
      <Text style={cardStyles.itemsSummary} numberOfLines={1}>
        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(', ')}
      </Text>

      {/* Footer */}
      <View style={cardStyles.footer}>
        <Text style={cardStyles.total}>${order.total.toFixed(2)}</Text>
        <Text style={cardStyles.reorder}>View details →</Text>
      </View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  topRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  storeInfo:  { flex: 1, gap: 2 },
  storeName:  { ...textStyles.h3,      color: colors.textPrimary },
  date:       { ...textStyles.caption, color: colors.textSecondary },
  statusPill: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 3 },
  statusText: { ...textStyles.labelSm },
  itemsSummary: { ...textStyles.bodySm, color: colors.textSecondary },
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total:      { ...textStyles.h3, color: colors.textPrimary },
  reorder:    { ...textStyles.label, color: colors.primary },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn:  { width: 36, padding: spacing.xs },
  backText: { fontSize: 22, color: colors.textPrimary },
  title:    { ...textStyles.h2, color: colors.textPrimary },
  list:     { padding: spacing.md, paddingBottom: spacing.xxl },
});
