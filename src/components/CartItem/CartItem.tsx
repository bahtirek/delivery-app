import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, borderRadius, spacing, textStyles } from '@/constants';
import { getCategoryVisual } from '@/utils/storeVisuals';
import type { CartItem as CartItemType } from '@/types';

interface CartItemProps {
  item: CartItemType;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const CartItem = ({ item, onIncrement, onDecrement }: CartItemProps) => {
  const visual = getCategoryVisual(item.product.category);
  const lineTotal = (item.product.price * item.quantity).toFixed(2);

  return (
    <View style={styles.row}>
      {/* Emoji thumbnail */}
      <View style={[styles.thumb, { backgroundColor: visual.bg }]}>
        <Text style={styles.thumbEmoji}>{visual.emoji}</Text>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.product.name}</Text>
        <Text style={styles.price}>${item.product.price.toFixed(2)} each</Text>
      </View>

      {/* Quantity stepper */}
      <View style={styles.stepper}>
        <TouchableOpacity style={styles.stepBtn} onPress={onDecrement} activeOpacity={0.75}>
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.qty}>{item.quantity}</Text>
        <TouchableOpacity style={styles.stepBtn} onPress={onIncrement} activeOpacity={0.75}>
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Line total */}
      <Text style={styles.lineTotal}>${lineTotal}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbEmoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  name:  { ...textStyles.label,   color: colors.textPrimary },
  price: { ...textStyles.caption, color: colors.textSecondary },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundCard,
  },
  stepBtnText: { ...textStyles.h3, color: colors.textPrimary, lineHeight: 28 },
  qty:      { ...textStyles.label, color: colors.textPrimary, minWidth: 16, textAlign: 'center' },
  lineTotal:{ ...textStyles.label, color: colors.textPrimary, minWidth: 42, textAlign: 'right' },
});
