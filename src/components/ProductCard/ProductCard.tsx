import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, textStyles, shadow } from '@/constants';
import { getCategoryVisual } from '@/utils/storeVisuals';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onAdd?: () => void;
}

export const ProductCard = ({ product, onPress, onAdd }: ProductCardProps) => {
  const visual = getCategoryVisual(product.category);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.88}>
      {/* Illustrated image */}
      <View style={[styles.imageContainer, { backgroundColor: visual.bg }]}>
        <Text style={styles.emoji}>{visual.emoji}</Text>
        {product.popular && (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Popular</Text>
          </View>
        )}
        {!product.inStock && (
          <View style={styles.outOfStockOverlay}>
            <Text style={styles.outOfStockText}>Out of stock</Text>
          </View>
        )}
      </View>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {product.inStock && onAdd && (
            <TouchableOpacity style={styles.addBtn} onPress={onAdd} activeOpacity={0.8}>
              <Text style={styles.addBtnText}>+</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    width: 160,
    ...shadow.card,
  },
  imageContainer: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emoji: { fontSize: 40 },
  popularBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  popularText: { ...textStyles.labelSm, color: colors.primary },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,251,248,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outOfStockText: { ...textStyles.label, color: colors.textSecondary },
  body: { padding: spacing.sm, gap: spacing.xs },
  name: { ...textStyles.label, color: colors.textPrimary },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { ...textStyles.h3, color: colors.textPrimary },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: colors.textInverse, fontSize: 20, lineHeight: 28, textAlign: 'center' },
});
