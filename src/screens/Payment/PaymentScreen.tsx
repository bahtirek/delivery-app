import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList, PaymentMethod } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useAuthStore } from '@/store';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Payment'>;

const CARD_BRAND_EMOJI: Record<string, string> = {
  Visa: '💳', Mastercard: '💳', Amex: '💳', default: '💳',
};

export const PaymentScreen = ({ navigation }: Props) => {
  const user = useAuthStore((s) => s.user);
  const methods = user?.paymentMethods ?? [];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment methods</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {methods.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>💳</Text>
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptySub}>Add a card to checkout faster.</Text>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved cards</Text>
            <View style={styles.cardList}>
              {methods.map((method) => (
                <PaymentCard key={method.id} method={method} />
              ))}
            </View>
          </View>
        )}

        {/* Add card CTA */}
        <TouchableOpacity style={styles.addCardBtn} activeOpacity={0.8}>
          <Text style={styles.addCardIcon}>＋</Text>
          <Text style={styles.addCardText}>Add a new card</Text>
        </TouchableOpacity>

        {/* Info note */}
        <View style={styles.infoNote}>
          <Text style={styles.infoNoteText}>
            🔒 Payment info is stored securely. Cards are never shared with stores.
          </Text>
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

const PaymentCard = ({ method }: { method: PaymentMethod }) => {
  const emoji = CARD_BRAND_EMOJI[method.brand ?? ''] ?? CARD_BRAND_EMOJI.default;

  return (
    <View style={[cardStyles.card, method.isDefault && cardStyles.defaultCard]}>
      <Text style={cardStyles.emoji}>{emoji}</Text>
      <View style={cardStyles.info}>
        <Text style={cardStyles.brand}>{method.brand ?? 'Card'} ···· {method.last4 ?? '****'}</Text>
        {method.isDefault && <Text style={cardStyles.defaultLabel}>Default</Text>}
      </View>
      {method.isDefault && (
        <View style={cardStyles.defaultBadge}>
          <Text style={cardStyles.defaultBadgeText}>Default</Text>
        </View>
      )}
    </View>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.card,
  },
  defaultCard: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  emoji:        { fontSize: 28 },
  info:         { flex: 1, gap: 2 },
  brand:        { ...textStyles.h3, color: colors.textPrimary },
  defaultLabel: { ...textStyles.caption, color: colors.primary },
  defaultBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  defaultBadgeText: { ...textStyles.labelSm, color: colors.textInverse },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn:  { width: 36, padding: spacing.xs },
  backText: { fontSize: 22, color: colors.textPrimary },
  title:    { ...textStyles.h2, color: colors.textPrimary },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },
  section:       { gap: spacing.sm },
  sectionTitle:  { ...textStyles.h3, color: colors.textSecondary },
  cardList:      { gap: spacing.sm },

  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    padding: spacing.md,
    backgroundColor: colors.backgroundCard,
  },
  addCardIcon: { fontSize: 20, color: colors.primary },
  addCardText: { ...textStyles.label, color: colors.primary },

  emptyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadow.card,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { ...textStyles.h3,  color: colors.textPrimary },
  emptySub:   { ...textStyles.body, color: colors.textSecondary },

  infoNote: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoNoteText: { ...textStyles.caption, color: colors.textSecondary, lineHeight: 18, textAlign: 'center' },
});
