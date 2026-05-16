import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, textStyles, shadow } from '@/constants';
import { Badge } from '@/components/Badge/Badge';
import { getStoreVisual } from '@/utils/storeVisuals';
import type { Store } from '@/types';

interface StoreCardProps {
  store: Store;
  onPress: () => void;
}

export const StoreCard = ({ store, onPress }: StoreCardProps) => {
  const visual = getStoreVisual(store.type);

  const deliveryFeeLabel = store.deliveryFeeFlat != null
    ? `$${store.deliveryFeeFlat.toFixed(2)} delivery`
    : store.deliveryFeePercent != null
      ? `${store.deliveryFeePercent}% fee`
      : 'Free delivery';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Illustrated header */}
      <View style={[styles.imageContainer, { backgroundColor: visual.gradient[0] }]}>
        <Text style={styles.emoji}>{visual.emoji}</Text>
        <Badge
          label={store.isOpen ? 'OPEN' : 'CLOSED'}
          variant={store.isOpen ? 'open' : 'closed'}
        />
        <View style={styles.etaBadge}>
          <Badge label={`${store.estimatedMinutes} min`} variant="eta" />
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{store.name}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.rating}>⭐ {store.rating.toFixed(1)}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{store.distanceMiles.toFixed(1)} mi</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.meta}>{deliveryFeeLabel}</Text>
        </View>
        {store.minOrder > 0 && (
          <Text style={styles.minOrder}>${store.minOrder.toFixed(2)} min order</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadow.card,
  },
  imageContainer: {
    height: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: spacing.sm,
  },
  emoji: {
    fontSize: 44,
  },
  etaBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  body: {
    padding: spacing.md,
    gap: 4,
  },
  name: {
    ...textStyles.h3,
    color: colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  rating: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  dot: {
    ...textStyles.caption,
    color: colors.textDisabled,
  },
  meta: {
    ...textStyles.caption,
    color: colors.textSecondary,
  },
  minOrder: {
    ...textStyles.caption,
    color: colors.textDisabled,
    marginTop: 2,
  },
});
