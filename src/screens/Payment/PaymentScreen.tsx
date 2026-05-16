import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList, PaymentMethod } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useAuthStore } from '@/store';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Payment'>;

export const PaymentScreen = ({ navigation }: Props) => {
  const user    = useAuthStore((s) => s.user);
  const methods = user?.paymentMethods ?? [];
  const insets  = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddPayment', {})}
        >
          <Text style={styles.addBtnText}>＋ Add</Text>
        </TouchableOpacity>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {methods.length === 0 ? (
          <TouchableOpacity
            style={styles.emptyCard}
            onPress={() => navigation.navigate('AddPayment', {})}
            activeOpacity={0.8}
          >
            <Text style={styles.emptyEmoji}>💳</Text>
            <Text style={styles.emptyTitle}>No payment methods</Text>
            <Text style={styles.emptyLink}>Tap to add a card →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved cards</Text>
            <View style={styles.cardList}>
              {methods.map((method) => (
                <PaymentCard
                  key={method.id}
                  method={method}
                  onEdit={() => navigation.navigate('AddPayment', { paymentId: method.id })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Add card button */}
        <TouchableOpacity
          style={styles.addCardBtn}
          onPress={() => navigation.navigate('AddPayment', {})}
          activeOpacity={0.8}
        >
          <Text style={styles.addCardIcon}>＋</Text>
          <Text style={styles.addCardText}>Add a new card</Text>
        </TouchableOpacity>

        <View style={styles.infoNote}>
          <Text style={styles.infoNoteText}>
            🔒 Card details are stored securely. Never shared with stores or drivers.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const PaymentCard = ({ method, onEdit }: { method: PaymentMethod; onEdit: () => void }) => (
  <View style={[cardStyles.card, method.isDefault && cardStyles.defaultCard]}>
    <Text style={cardStyles.emoji}>💳</Text>
    <View style={cardStyles.info}>
      <Text style={cardStyles.brand}>{method.brand ?? 'Card'} ···· {method.last4 ?? '****'}</Text>
      {method.isDefault && <Text style={cardStyles.defaultLabel}>Default card</Text>}
    </View>
    <TouchableOpacity style={cardStyles.editBtn} onPress={onEdit}>
      <Text style={cardStyles.editText}>Edit</Text>
    </TouchableOpacity>
  </View>
);

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1.5, borderColor: colors.border, ...shadow.card,
  },
  defaultCard: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  emoji:       { fontSize: 28 },
  info:        { flex: 1, gap: 2 },
  brand:       { ...textStyles.h3,      color: colors.textPrimary },
  defaultLabel:{ ...textStyles.caption, color: colors.primary },
  editBtn:     { paddingLeft: spacing.sm, paddingVertical: spacing.xs },
  editText:    { ...textStyles.label, color: colors.primary },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn:    { width: 44, padding: spacing.xs },
  backText:   { fontSize: 22, color: colors.textPrimary },
  title:      { ...textStyles.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  addBtn:     { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  addBtnText: { ...textStyles.label, color: colors.primary },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },
  section:       { gap: spacing.sm },
  sectionTitle:  { ...textStyles.h3, color: colors.textSecondary },
  cardList:      { gap: spacing.sm },

  emptyCard: {
    backgroundColor: colors.backgroundCard, borderRadius: borderRadius.lg,
    padding: spacing.xl, alignItems: 'center', gap: spacing.xs,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
  },
  emptyEmoji: { fontSize: 36 },
  emptyTitle: { ...textStyles.h3,    color: colors.textSecondary },
  emptyLink:  { ...textStyles.label, color: colors.primary },

  addCardBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, borderRadius: borderRadius.lg,
    borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed',
    padding: spacing.md, backgroundColor: colors.backgroundCard,
  },
  addCardIcon: { fontSize: 20, color: colors.primary },
  addCardText: { ...textStyles.label, color: colors.primary },

  infoNote: { backgroundColor: colors.surface, borderRadius: borderRadius.md, padding: spacing.md },
  infoNoteText: { ...textStyles.caption, color: colors.textSecondary, lineHeight: 18, textAlign: 'center' },
});
