import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList, Address } from '@/types';
import { useAuthStore } from '@/store';
import { useLocationStore } from '@/store';
import { styles } from './SetAddressScreen.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'SetAddress'>;

// Quick-pick suggestions for demo
const SUGGESTIONS: Partial<Address>[] = [
  { label: 'Home',   street: '123 Main St',   city: 'Springfield', zip: '12345' },
  { label: 'Work',   street: '456 Market Ave', city: 'Springfield', zip: '12346' },
  { label: 'Gym',    street: '789 Oak Blvd',   city: 'Springfield', zip: '12347' },
];

export const SetAddressScreen = ({ navigation }: Props) => {
  const setAuth       = useAuthStore((s) => s.setAuth);
  const token         = useAuthStore((s) => s.token);
  const userId        = useAuthStore((s) => s.userId);
  const setDelivery   = useLocationStore((s) => s.setDeliveryAddress);

  const [street, setStreet] = useState('');
  const [city,   setCity]   = useState('');
  const [zip,    setZip]    = useState('');
  const [label,  setLabel]  = useState('Home');
  const [errors, setErrors] = useState<{ street?: string; city?: string; zip?: string }>({});

  const applySuggestion = (s: Partial<Address>) => {
    setStreet(s.street ?? '');
    setCity(s.city ?? '');
    setZip(s.zip ?? '');
    setLabel(s.label ?? 'Home');
    setErrors({});
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!street.trim()) e.street = 'Street address is required.';
    if (!city.trim())   e.city   = 'City is required.';
    if (!zip.trim())    e.zip    = 'ZIP code is required.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleContinue = () => {
    if (!validate()) return;
    const address: Address = {
      id: `a-${Date.now()}`,
      label,
      street,
      city,
      zip,
      lat: 40.7128,   // Mock coordinates — replace with geocoding
      lng: -74.006,
      isDefault: true,
    };
    setDelivery(address);
    // Token is already set — RootNavigator will render AppNavigator automatically
    // but we still navigate for users who came here after register (auth flow)
    // For existing users who end up here from Profile, navigation.goBack() would be used instead.
  };

  const handleSkip = () => {
    // Allow skipping — delivery address can be set at checkout
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📍</Text>
          <Text style={styles.title}>Where should we deliver?</Text>
          <Text style={styles.subtitle}>
            We only deliver within 0.5 miles. Set your address to see what's nearby.
          </Text>
        </View>

        {/* Quick picks */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quick pick</Text>
          <View style={styles.suggestions}>
            {SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.label}
                style={[styles.chip, label === s.label ? styles.chipActive : null]}
                onPress={() => applySuggestion(s)}
              >
                <Text style={[styles.chipText, label === s.label ? styles.chipTextActive : null]}>
                  {s.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Street address</Text>
            <TextInput
              style={[styles.input, errors.street ? styles.inputError : null]}
              value={street}
              onChangeText={(v) => { setStreet(v); setErrors((e) => ({ ...e, street: undefined })); }}
              placeholder="123 Main St, Apt 4B"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="words"
            />
            {errors.street ? <Text style={styles.errorText}>{errors.street}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex]}>
              <Text style={styles.label}>City</Text>
              <TextInput
                style={[styles.input, errors.city ? styles.inputError : null]}
                value={city}
                onChangeText={(v) => { setCity(v); setErrors((e) => ({ ...e, city: undefined })); }}
                placeholder="Springfield"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
              {errors.city ? <Text style={styles.errorText}>{errors.city}</Text> : null}
            </View>

            <View style={[styles.field, styles.zipField]}>
              <Text style={styles.label}>ZIP</Text>
              <TextInput
                style={[styles.input, errors.zip ? styles.inputError : null]}
                value={zip}
                onChangeText={(v) => { setZip(v); setErrors((e) => ({ ...e, zip: undefined })); }}
                placeholder="12345"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                maxLength={5}
              />
              {errors.zip ? <Text style={styles.errorText}>{errors.zip}</Text> : null}
            </View>
          </View>
        </View>

        {/* Radius note */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            🚶 We deliver within a 0.5-mile walking radius. Stores outside this range won't be shown.
          </Text>
        </View>

        {/* Actions */}
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueButtonText}>Confirm address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
