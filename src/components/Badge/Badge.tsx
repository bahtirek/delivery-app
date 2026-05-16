import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, borderRadius, textStyles } from '@/constants';

type BadgeVariant = 'open' | 'closed' | 'popular' | 'eta' | 'fee' | 'custom';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  color?: string;
  bg?: string;
}

export const Badge = ({ label, variant = 'custom', color, bg }: BadgeProps) => {
  const variantStyle = getVariantStyle(variant);
  return (
    <View style={[styles.base, { backgroundColor: bg ?? variantStyle.bg }]}>
      <Text style={[styles.text, { color: color ?? variantStyle.color }]}>{label}</Text>
    </View>
  );
};

const getVariantStyle = (variant: BadgeVariant) => {
  switch (variant) {
    case 'open':    return { bg: colors.successSubtle, color: colors.success };
    case 'closed':  return { bg: colors.surfaceAlt,    color: colors.textSecondary };
    case 'popular': return { bg: colors.primarySubtle, color: colors.primary };
    case 'eta':     return { bg: 'rgba(255,255,255,0.92)', color: colors.textPrimary };
    case 'fee':     return { bg: colors.surfaceAlt,    color: colors.textSecondary };
    default:        return { bg: colors.surfaceAlt,    color: colors.textSecondary };
  }
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...textStyles.labelSm,
  },
});
