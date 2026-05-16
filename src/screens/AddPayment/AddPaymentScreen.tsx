import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AddPaymentProps, PaymentMethod } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useAuthStore } from '@/store';
import { useSavePaymentMethod, useDeletePaymentMethod } from '@/queries/useUserQueries';

const BRANDS = ['Visa', 'Mastercard', 'Amex', 'Discover'];

// Naive card number formatting — groups of 4
const formatCardNumber = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
};

const formatExpiry = (v: string) => {
  const digits = v.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
};

export const AddPaymentScreen = ({ navigation, route }: AddPaymentProps) => {
  const { paymentId } = route.params ?? {};
  const isEditing = !!paymentId;

  const user = useAuthStore((s) => s.user);
  const existing = isEditing ? user?.paymentMethods.find((m) => m.id === paymentId) : undefined;

  const [brand,      setBrand]      = useState(existing?.brand   ?? 'Visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [name,       setName]       = useState('');
  const [isDefault,  setIsDefault]  = useState(existing?.isDefault ?? false);
  const [errors,     setErrors]     = useState<Record<string, string>>({});

  const insets = useSafeAreaInsets();

  const { mutate: saveMethod,   isPending: saving   } = useSavePaymentMethod();
  const { mutate: deleteMethod, isPending: deleting } = useDeletePaymentMethod();

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    const digits = cardNumber.replace(/\s/g, '');
    if (!isEditing) {
      if (digits.length < 16)      e.cardNumber = 'Enter a valid 16-digit card number.';
      if (expiry.length < 5)       e.expiry     = 'Enter expiry as MM/YY.';
      if (cvv.length < 3)          e.cvv        = 'Enter a valid CVV.';
      if (!name.trim())            e.name       = 'Cardholder name is required.';
    }
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;

    const digits = cardNumber.replace(/\s/g, '');
    const method: PaymentMethod = {
      id:        existing?.id ?? `pm-${Date.now()}`,
      type:      'card',
      brand,
      last4:     isEditing ? existing?.last4 : digits.slice(-4),
      isDefault,
    };

    saveMethod(method, {
      onSuccess: () => navigation.goBack(),
      onError:   () => Alert.alert('Error', 'Failed to save card. Please try again.'),
    });
  };

  const handleDelete = () => {
    if (!paymentId) return;
    Alert.alert('Remove card', 'Are you sure you want to remove this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteMethod(paymentId, {
          onSuccess: () => navigation.goBack(),
          onError:   () => Alert.alert('Error', 'Failed to remove card.'),
        }),
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView edges={['top']} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{isEditing ? 'Edit card' : 'Add card'}</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} disabled={deleting}>
              <Text style={styles.deleteText}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 60 }} />
          )}
        </SafeAreaView>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card preview */}
          <View style={styles.cardPreview}>
            <View style={styles.cardPreviewTop}>
              <Text style={styles.cardPreviewBrand}>{brand}</Text>
              <Text style={styles.cardPreviewEmoji}>💳</Text>
            </View>
            <Text style={styles.cardPreviewNumber}>
              {isEditing
                ? `•••• •••• •••• ${existing?.last4 ?? '****'}`
                : cardNumber || '•••• •••• •••• ••••'
              }
            </Text>
            <View style={styles.cardPreviewBottom}>
              <Text style={styles.cardPreviewLabel}>
                {name || 'CARDHOLDER NAME'}
              </Text>
              <Text style={styles.cardPreviewExpiry}>
                {expiry || 'MM/YY'}
              </Text>
            </View>
          </View>

          {/* Brand picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Card brand</Text>
            <View style={styles.brandRow}>
              {BRANDS.map((b) => (
                <TouchableOpacity
                  key={b}
                  style={[styles.brandChip, brand === b && styles.brandChipActive]}
                  onPress={() => setBrand(b)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.brandText, brand === b && styles.brandTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Card fields — hidden when editing (don't re-enter full number) */}
          {!isEditing && (
            <>
              <Field
                label="Card number"
                value={cardNumber}
                onChangeText={(v) => {
                  setCardNumber(formatCardNumber(v));
                  setErrors((e) => ({ ...e, cardNumber: '' }));
                }}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                error={errors.cardNumber}
                maxLength={19}
              />

              <View style={styles.row}>
                <View style={[styles.section, styles.flex]}>
                  <Text style={styles.sectionLabel}>Expiry</Text>
                  <TextInput
                    style={[styles.input, errors.expiry && styles.inputError]}
                    value={expiry}
                    onChangeText={(v) => {
                      setExpiry(formatExpiry(v));
                      setErrors((e) => ({ ...e, expiry: '' }));
                    }}
                    placeholder="MM/YY"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                  {errors.expiry && <Text style={styles.errorText}>{errors.expiry}</Text>}
                </View>
                <View style={[styles.section, styles.cvvField]}>
                  <Text style={styles.sectionLabel}>CVV</Text>
                  <TextInput
                    style={[styles.input, errors.cvv && styles.inputError]}
                    value={cvv}
                    onChangeText={(v) => {
                      setCvv(v.replace(/\D/g, '').slice(0, 4));
                      setErrors((e) => ({ ...e, cvv: '' }));
                    }}
                    placeholder="123"
                    placeholderTextColor={colors.textDisabled}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                  />
                  {errors.cvv && <Text style={styles.errorText}>{errors.cvv}</Text>}
                </View>
              </View>

              <Field
                label="Cardholder name"
                value={name}
                onChangeText={(v) => {
                  setName(v);
                  setErrors((e) => ({ ...e, name: '' }));
                }}
                placeholder="Alex Johnson"
                autoCapitalize="words"
                error={errors.name}
              />
            </>
          )}

          {/* Set as default toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setIsDefault((v) => !v)}
            activeOpacity={0.75}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Set as default card</Text>
              <Text style={styles.toggleSub}>Used automatically at checkout</Text>
            </View>
            <View style={[styles.toggleSwitch, isDefault && styles.toggleSwitchOn]}>
              <View style={[styles.toggleThumb, isDefault && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>

          {/* Security note */}
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              🔒 Your card details are stored securely and never shared with stores or drivers.
            </Text>
          </View>
        </ScrollView>

        {/* Save CTA */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add card'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

// Reusable field component
const Field = ({
  label, value, onChangeText, placeholder,
  keyboardType, autoCapitalize, error, maxLength,
}: {
  label: string; value: string;
  onChangeText: (v: string) => void;
  placeholder?: string; keyboardType?: any;
  autoCapitalize?: any; error?: string; maxLength?: number;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionLabel}>{label}</Text>
    <TextInput
      style={[styles.input, error && styles.inputError]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textDisabled}
      keyboardType={keyboardType ?? 'default'}
      autoCapitalize={autoCapitalize ?? 'none'}
      maxLength={maxLength}
    />
    {error ? <Text style={styles.errorText}>{error}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  flex:   { flex: 1 },
  screen: { flex: 1, backgroundColor: colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn:    { width: 52, padding: spacing.xs },
  backText:   { fontSize: 22, color: colors.textPrimary },
  title:      { ...textStyles.h2, color: colors.textPrimary, flex: 1, textAlign: 'center' },
  deleteBtn:  { width: 60, alignItems: 'flex-end' },
  deleteText: { ...textStyles.label, color: colors.error },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },

  // Card preview
  cardPreview: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    aspectRatio: 1.586,
    justifyContent: 'space-between',
    ...shadow.strong,
  },
  cardPreviewTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardPreviewBrand:  { ...textStyles.h3, color: colors.textInverse },
  cardPreviewEmoji:  { fontSize: 28 },
  cardPreviewNumber: { ...textStyles.h2, color: colors.textInverse, letterSpacing: 2 },
  cardPreviewBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardPreviewLabel:  { ...textStyles.label, color: 'rgba(255,255,255,0.8)', letterSpacing: 1 },
  cardPreviewExpiry: { ...textStyles.label, color: 'rgba(255,255,255,0.8)' },

  section:      { gap: spacing.xs },
  sectionLabel: { ...textStyles.label, color: colors.textPrimary },

  brandRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  brandChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  brandChipActive:  { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  brandText:        { ...textStyles.label, color: colors.textSecondary },
  brandTextActive:  { color: colors.primary },

  row:      { flexDirection: 'row', gap: spacing.md },
  cvvField: { width: 100 },

  input: {
    height: 52, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    ...textStyles.body, color: colors.textPrimary,
    backgroundColor: colors.backgroundCard,
  },
  inputError: { borderColor: colors.error },
  errorText:  { ...textStyles.caption, color: colors.error },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md, gap: spacing.md,
    ...shadow.card,
  },
  toggleInfo:     { flex: 1, gap: 2 },
  toggleLabel:    { ...textStyles.label,   color: colors.textPrimary },
  toggleSub:      { ...textStyles.caption, color: colors.textSecondary },
  toggleSwitch: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: colors.border, padding: 2, justifyContent: 'center',
  },
  toggleSwitchOn:  { backgroundColor: colors.primary },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.backgroundCard, ...shadow.card,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },

  notice: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  noticeText: { ...textStyles.caption, color: colors.textSecondary, lineHeight: 18 },

  bottomBar: {
    backgroundColor: colors.backgroundCard,
    borderTopWidth: 1, borderTopColor: colors.border,
    padding: spacing.md, ...shadow.strong,
  },
  saveBtn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.md,
    height: 54, alignItems: 'center', justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.55 },
  saveBtnText:     { ...textStyles.btnLg, color: colors.textInverse },
});
