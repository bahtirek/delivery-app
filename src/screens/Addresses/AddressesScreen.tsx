import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ProfileStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useAuthStore, useLocationStore } from '@/store';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Addresses'>;

export const AddressesScreen = ({ navigation }: Props) => {
  const user           = useAuthStore((s) => s.user);
  const deliveryAddress = useLocationStore((s) => s.deliveryAddress);
  const setDelivery    = useLocationStore((s) => s.setDeliveryAddress);

  const addresses = user?.addresses ?? [];

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Addresses</Text>
        <View style={{ width: 36 }} />
      </SafeAreaView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Current delivery address */}
        {deliveryAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivering to</Text>
            <View style={[styles.addressCard, styles.activeCard]}>
              <View style={styles.cardLeft}>
                <Text style={styles.activeIndicator}>●</Text>
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>{deliveryAddress.label}</Text>
                  <Text style={styles.addressStreet}>{deliveryAddress.street}</Text>
                  <Text style={styles.addressCity}>{deliveryAddress.city}, {deliveryAddress.zip}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Saved addresses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saved addresses</Text>
          {addresses.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No saved addresses yet.</Text>
            </View>
          ) : (
            <View style={styles.addressList}>
              {addresses.map((addr) => {
                const isActive = deliveryAddress?.id === addr.id;
                return (
                  <TouchableOpacity
                    key={addr.id}
                    style={[styles.addressCard, isActive && styles.activeCard]}
                    onPress={() => setDelivery(addr)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.cardLeft}>
                      <Text style={[styles.dot, isActive && styles.activeDot]}>
                        {isActive ? '●' : '○'}
                      </Text>
                      <View style={styles.addressInfo}>
                        <Text style={styles.addressLabel}>{addr.label}</Text>
                        <Text style={styles.addressStreet}>{addr.street}</Text>
                        <Text style={styles.addressCity}>{addr.city}, {addr.zip}</Text>
                      </View>
                    </View>
                    {isActive && (
                      <View style={styles.selectedBadge}>
                        <Text style={styles.selectedBadgeText}>Active</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

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
  addressList:   { gap: spacing.sm },

  addressCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadow.card,
  },
  activeCard: { borderColor: colors.primary, backgroundColor: colors.primarySubtle },

  cardLeft:      { flexDirection: 'row', gap: spacing.md, flex: 1 },
  activeIndicator:{ fontSize: 16, color: colors.primary, marginTop: 2 },
  dot:           { fontSize: 16, color: colors.textDisabled, marginTop: 2 },
  activeDot:     { color: colors.primary },
  addressInfo:   { flex: 1, gap: 2 },
  addressLabel:  { ...textStyles.label,   color: colors.textPrimary },
  addressStreet: { ...textStyles.body,    color: colors.textPrimary },
  addressCity:   { ...textStyles.caption, color: colors.textSecondary },

  selectedBadge: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  selectedBadgeText: { ...textStyles.labelSm, color: colors.textInverse },

  emptyCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadow.card,
  },
  emptyText: { ...textStyles.body, color: colors.textSecondary },
});
