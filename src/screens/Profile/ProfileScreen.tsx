import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useAuthStore, useCartStore, useLocationStore } from '@/store';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>;

export const ProfileScreen = ({ navigation }: Props) => {
  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clearCart);
  const clearAddress = useLocationStore((s) => s.clearDeliveryAddress);

  const deliveryAddress = useLocationStore((s) => s.deliveryAddress);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          clearCart();
          clearAddress();
          logout();
          // RootNavigator auto-switches to AuthNavigator
        },
      },
    ]);
  };

  const initials = user?.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? '?';

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{user?.name ?? 'Guest'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
        </View>

        {/* Delivery address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery</Text>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardIcon}>📍</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>Current address</Text>
                <Text style={styles.cardValue}>
                  {deliveryAddress ? deliveryAddress.street : 'Not set'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Addresses')}
                style={styles.cardAction}
              >
                <Text style={styles.cardActionText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Account links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <MenuRow icon="🏠" label="Saved addresses" onPress={() => navigation.navigate('Addresses')} />
            <View style={styles.menuDivider} />
            <MenuRow icon="💳" label="Payment methods" onPress={() => navigation.navigate('Payment')} />
          </View>
        </View>

        {/* Order links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Orders</Text>
          <View style={styles.card}>
            <MenuRow
              icon="🛍️"
              label="Order history"
              onPress={() => navigation.navigate('OrderHistory')}
            />
          </View>
        </View>

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <MenuRow icon="ℹ️" label="About Nearr" onPress={() => Alert.alert('Nearr', 'Version 1.0.0 Local delivery within 0.5 miles.')} />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

const MenuRow = ({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) => (
  <TouchableOpacity style={menuStyles.row} onPress={onPress} activeOpacity={0.7}>
    <Text style={menuStyles.icon}>{icon}</Text>
    <Text style={menuStyles.label}>{label}</Text>
    <Text style={menuStyles.arrow}>›</Text>
  </TouchableOpacity>
);

const menuStyles = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  icon:  { fontSize: 20, width: 28, textAlign: 'center' },
  label: { ...textStyles.body, color: colors.textPrimary, flex: 1 },
  arrow: { fontSize: 20, color: colors.textDisabled },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  title: { ...textStyles.h1, color: colors.textPrimary },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },

  avatarSection: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md },
  avatar: {
    width: 72, height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primarySubtle,
    borderWidth: 3,
    borderColor: colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...textStyles.h2, color: colors.primary },
  name:       { ...textStyles.h2, color: colors.textPrimary },
  email:      { ...textStyles.body,    color: colors.textSecondary },
  phone:      { ...textStyles.caption, color: colors.textSecondary },

  section:      { gap: spacing.sm },
  sectionTitle: { ...textStyles.h3, color: colors.textSecondary },

  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadow.card,
  },
  cardRow:    { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xs },
  cardIcon:   { fontSize: 20 },
  cardInfo:   { flex: 1, gap: 2 },
  cardLabel:  { ...textStyles.caption, color: colors.textSecondary },
  cardValue:  { ...textStyles.body,    color: colors.textPrimary },
  cardAction: { padding: spacing.xs },
  cardActionText: { ...textStyles.label, color: colors.primary },

  menuDivider: { height: 1, backgroundColor: colors.border },

  logoutBtn: {
    backgroundColor: colors.errorSubtle,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.error + '40',
  },
  logoutText: { ...textStyles.btn, color: colors.error },
});
