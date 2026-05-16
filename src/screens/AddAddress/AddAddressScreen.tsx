import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, StatusBar, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AddAddressProps, Address } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useAuthStore, useLocationStore } from '@/store';
import { useSaveAddress, useDeleteAddress } from '@/queries/useUserQueries';

const LABEL_OPTIONS = ['Home', 'Work', 'Gym', 'Other'];

export const AddAddressScreen = ({ navigation, route }: AddAddressProps) => {
  const { addressId } = route.params ?? {};
  const isEditing = !!addressId;

  const user         = useAuthStore((s) => s.user);
  const setDelivery  = useLocationStore((s) => s.setDeliveryAddress);
  const deliveryAddr = useLocationStore((s) => s.deliveryAddress);

  const existing = isEditing ? user?.addresses.find((a) => a.id === addressId) : undefined;

  const [label,  setLabel]  = useState(existing?.label  ?? 'Home');
  const [street, setStreet] = useState(existing?.street ?? '');
  const [city,   setCity]   = useState(existing?.city   ?? '');
  const [zip,    setZip]    = useState(existing?.zip     ?? '');
  const [setAsDefault, setSetAsDefault] = useState(!isEditing);
  const [errors, setErrors] = useState<{ street?: string; city?: string; zip?: string }>({});

  const { mutate: saveAddress,   isPending: saving   } = useSaveAddress();
  const { mutate: deleteAddress, isPending: deleting } = useDeleteAddress();

  const insets = useSafeAreaInsets();

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!street.trim()) e.street = 'Street address is required.';
    if (!city.trim())   e.city   = 'City is required.';
    if (!zip.trim())    e.zip    = 'ZIP code is required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSave = () => {
    if (!validate()) return;

    const address: Address = {
      id:        existing?.id ?? `a-${Date.now()}`,
      label,
      street:    street.trim(),
      city:      city.trim(),
      zip:       zip.trim(),
      lat:       existing?.lat ?? 40.7128,  // Mock coords — replace with geocoding
      lng:       existing?.lng ?? -74.006,
      isDefault: setAsDefault,
    };

    saveAddress(address, {
      onSuccess: () => {
        if (setAsDefault) setDelivery(address);
        navigation.goBack();
      },
      onError: () => Alert.alert('Error', 'Failed to save address. Please try again.'),
    });
  };

  const handleDelete = () => {
    if (!addressId) return;
    Alert.alert(
      'Delete address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteAddress(addressId, {
            onSuccess: () => {
              // If deleted address was the active delivery address, clear it
              if (deliveryAddr?.id === addressId) setDelivery(null as any);
              navigation.goBack();
            },
            onError: () => Alert.alert('Error', 'Failed to delete address.'),
          }),
        },
      ],
    );
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
          <Text style={styles.title}>{isEditing ? 'Edit address' : 'New address'}</Text>
          {isEditing ? (
            <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn} disabled={deleting}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 52 }} />
          )}
        </SafeAreaView>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Label picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Label</Text>
            <View style={styles.labelRow}>
              {LABEL_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt}
                  style={[styles.labelChip, label === opt && styles.labelChipActive]}
                  onPress={() => setLabel(opt)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.labelChipText, label === opt && styles.labelChipTextActive]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Street */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Street address</Text>
            <TextInput
              style={[styles.input, errors.street && styles.inputError]}
              value={street}
              onChangeText={(v) => { setStreet(v); setErrors((e) => ({ ...e, street: undefined })); }}
              placeholder="123 Main St, Apt 4B"
              placeholderTextColor={colors.textDisabled}
              autoCapitalize="words"
            />
            {errors.street && <Text style={styles.errorText}>{errors.street}</Text>}
          </View>

          {/* City + ZIP row */}
          <View style={styles.row}>
            <View style={[styles.section, styles.flex]}>
              <Text style={styles.sectionLabel}>City</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                value={city}
                onChangeText={(v) => { setCity(v); setErrors((e) => ({ ...e, city: undefined })); }}
                placeholder="Springfield"
                placeholderTextColor={colors.textDisabled}
                autoCapitalize="words"
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={[styles.section, styles.zipField]}>
              <Text style={styles.sectionLabel}>ZIP</Text>
              <TextInput
                style={[styles.input, errors.zip && styles.inputError]}
                value={zip}
                onChangeText={(v) => { setZip(v); setErrors((e) => ({ ...e, zip: undefined })); }}
                placeholder="12345"
                placeholderTextColor={colors.textDisabled}
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.zip && <Text style={styles.errorText}>{errors.zip}</Text>}
            </View>
          </View>

          {/* Set as delivery address toggle */}
          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setSetAsDefault((v) => !v)}
            activeOpacity={0.75}
          >
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Set as delivery address</Text>
              <Text style={styles.toggleSub}>Use this address for your next order</Text>
            </View>
            <View style={[styles.toggleSwitch, setAsDefault && styles.toggleSwitchOn]}>
              <View style={[styles.toggleThumb, setAsDefault && styles.toggleThumbOn]} />
            </View>
          </TouchableOpacity>

          {/* Radius note */}
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              🚶 We only deliver within 0.5 miles. Make sure your address is within range.
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
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add address'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

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
  deleteBtn:  { width: 52, alignItems: 'flex-end' },
  deleteText: { ...textStyles.label, color: colors.error },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },

  section:      { gap: spacing.xs },
  sectionLabel: { ...textStyles.label, color: colors.textPrimary },

  labelRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  labelChip: {
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  labelChipActive:    { borderColor: colors.primary, backgroundColor: colors.primarySubtle },
  labelChipText:      { ...textStyles.label, color: colors.textSecondary },
  labelChipTextActive:{ color: colors.primary },

  input: {
    height: 52, borderWidth: 1.5, borderColor: colors.border,
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md,
    ...textStyles.body, color: colors.textPrimary,
    backgroundColor: colors.backgroundCard,
  },
  inputError: { borderColor: colors.error },
  errorText:  { ...textStyles.caption, color: colors.error },

  row:      { flexDirection: 'row', gap: spacing.md },
  zipField: { width: 110 },

  toggleRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md, gap: spacing.md,
    ...shadow.card,
  },
  toggleInfo:  { flex: 1, gap: 2 },
  toggleLabel: { ...textStyles.label, color: colors.textPrimary },
  toggleSub:   { ...textStyles.caption, color: colors.textSecondary },
  toggleSwitch: {
    width: 44, height: 26, borderRadius: 13,
    backgroundColor: colors.border, padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchOn: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.backgroundCard,
    ...shadow.card,
  },
  toggleThumbOn: { alignSelf: 'flex-end' },

  notice: {
    backgroundColor: colors.surface, borderRadius: borderRadius.md,
    padding: spacing.md, borderLeftWidth: 3, borderLeftColor: colors.primary,
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
