import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, textStyles } from '@/constants';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize    = 'lg' | 'md' | 'sm';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export const Button = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  fullWidth = true,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.82}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.textInverse : colors.primary} size="small" />
        : <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}Label`]]}>{label}</Text>
      }
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
  },
  fullWidth: { width: '100%' },

  // Variants
  primary:   { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primarySubtle, borderWidth: 1.5, borderColor: colors.primaryMuted },
  ghost:     { backgroundColor: 'transparent' },

  // Sizes
  lg: { height: 54, paddingHorizontal: 24 },
  md: { height: 46, paddingHorizontal: 20 },
  sm: { height: 36, paddingHorizontal: 16 },

  // Disabled
  disabled: { opacity: 0.55 },

  // Labels
  label: { textAlign: 'center' },
  primaryLabel:   { ...textStyles.btnLg, color: colors.textInverse },
  secondaryLabel: { ...textStyles.btn,   color: colors.primary },
  ghostLabel:     { ...textStyles.btn,   color: colors.primary },
  lgLabel: {},
  mdLabel: {},
  smLabel: { ...textStyles.btnSm },
});
