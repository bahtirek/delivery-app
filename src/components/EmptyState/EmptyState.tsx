import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, textStyles, spacing } from '@/constants';
import { Button } from '@/components/Button/Button';

interface EmptyStateProps {
  emoji: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ emoji, title, subtitle, actionLabel, onAction }: EmptyStateProps) => (
  <View style={styles.container}>
    <Text style={styles.emoji}>{emoji}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    {actionLabel && onAction
      ? <Button label={actionLabel} onPress={onAction} variant="primary" size="md" fullWidth={false} style={styles.btn} />
      : null
    }
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emoji:    { fontSize: 52, marginBottom: spacing.xs },
  title:    { ...textStyles.h2, color: colors.textPrimary, textAlign: 'center' },
  subtitle: { ...textStyles.body, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  btn:      { marginTop: spacing.md, paddingHorizontal: spacing.lg },
});
