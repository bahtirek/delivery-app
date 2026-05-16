import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types';
import { useAuthStore } from '@/store';
import { authService } from '@/services/authService';
import { styles } from './RegisterScreen.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setUser = useAuthStore((s) => s.setUser);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<typeof form>>({});

  const update = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = (): boolean => {
    const e: Partial<typeof form> = {};
    if (!form.name.trim())           e.name    = 'Name is required.';
    if (!form.email.includes('@'))   e.email   = 'Enter a valid email.';
    if (form.phone.length < 7)       e.phone   = 'Enter a valid phone number.';
    if (form.password.length < 6)    e.password = 'Password must be at least 6 characters.';
    if (form.confirm !== form.password) e.confirm = 'Passwords do not match.';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { token, userId, user } = await authService.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      setAuth(token, userId);
      setUser(user);
      navigation.navigate('SetAddress');
    } catch (err: any) {
      Alert.alert('Registration failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    label, field, placeholder, keyboardType, secureTextEntry, autoCapitalize,
  }: {
    label: string;
    field: keyof typeof form;
    placeholder: string;
    keyboardType?: any;
    secureTextEntry?: boolean;
    autoCapitalize?: any;
  }) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, errors[field] ? styles.inputError : null]}
        value={form[field]}
        onChangeText={update(field)}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'words'}
        autoCorrect={false}
      />
      {errors[field] ? <Text style={styles.errorText}>{errors[field]}</Text> : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        {/* Back button */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Get deliveries in under 30 minutes</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Field label="Full name"    field="name"     placeholder="Alex Johnson" />
          <Field label="Email"        field="email"    placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone"        field="phone"    placeholder="555-0101"  keyboardType="phone-pad" autoCapitalize="none" />
          <Field label="Password"     field="password" placeholder="Min. 6 characters" secureTextEntry autoCapitalize="none" />
          <Field label="Confirm password" field="confirm" placeholder="Re-enter password" secureTextEntry autoCapitalize="none" />
        </View>

        <TouchableOpacity
          style={[styles.registerButton, loading ? styles.registerButtonDisabled : null]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Creating account…' : 'Create account'}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
