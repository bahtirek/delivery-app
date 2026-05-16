import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, textStyles } from '@/constants';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  variant?: 'default' | 'orange';
}

export const Header = ({
  title,
  showBack = false,
  onBack,
  rightElement,
  variant = 'default',
}: HeaderProps) => {
  const insets = useSafeAreaInsets();
  const isOrange = variant === 'orange';

  return (
    <View style={[
      styles.container,
      { paddingTop: insets.top + spacing.sm },
      isOrange ? styles.orangeBg : styles.defaultBg,
    ]}>
      {showBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Text style={[styles.backIcon, isOrange ? styles.lightText : styles.darkText]}>←</Text>
        </TouchableOpacity>
      )}
      {title && (
        <Text style={[styles.title, isOrange ? styles.lightText : styles.darkText]} numberOfLines={1}>
          {title}
        </Text>
      )}
      {rightElement && <View style={styles.right}>{rightElement}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  defaultBg: { backgroundColor: colors.background },
  orangeBg:  { backgroundColor: colors.primary },
  backBtn:   { padding: spacing.xs },
  backIcon:  { fontSize: 22 },
  title:     { ...textStyles.h3, flex: 1 },
  lightText: { color: colors.textInverse },
  darkText:  { color: colors.textPrimary },
  right:     { marginLeft: 'auto' },
});
