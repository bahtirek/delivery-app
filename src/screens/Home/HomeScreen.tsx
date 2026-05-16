import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStores } from '@/queries/useStoreQueries';
import { useAuthStore } from '@/store';
import { useLocationStore } from '@/store';
import { StoreCard } from '@/components/StoreCard/StoreCard';
import { LoadingSpinner } from '@/components/LoadingSpinner/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState/EmptyState';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

type FilterType = 'all' | 'convenience' | 'grocery' | 'restaurant';

const FILTERS: { label: string; value: FilterType; emoji: string }[] = [
  { label: 'All',          value: 'all',          emoji: '🏠' },
  { label: 'Convenience',  value: 'convenience',  emoji: '🏪' },
  { label: 'Grocery',      value: 'grocery',      emoji: '🥦' },
  { label: 'Restaurant',   value: 'restaurant',   emoji: '🍔' },
];

export const HomeScreen = ({ navigation }: Props) => {
  const user            = useAuthStore((s) => s.user);
  const deliveryAddress = useLocationStore((s) => s.deliveryAddress);
  const [filter,  setFilter]  = useState<FilterType>('all');
  const [search,  setSearch]  = useState('');

  const { data: stores, isLoading, error, refetch } = useStores();

  const firstName = user?.name.split(' ')[0] ?? 'there';
  const addressLabel = deliveryAddress
    ? `${deliveryAddress.street}`
    : 'Set delivery address';

  const filteredStores = useMemo(() => {
    if (!stores) return [];
    return stores.filter((s) => {
      const matchesFilter = filter === 'all' || s.type === filter;
      const matchesSearch = search.trim() === '' ||
        s.name.toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [stores, filter, search]);

  const openStores   = filteredStores.filter((s) => s.isOpen);
  const closedStores = filteredStores.filter((s) => !s.isOpen);

  if (isLoading) return <LoadingSpinner message="Finding stores near you…" />;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

      {/* Orange header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hey {firstName}! 👋</Text>
            <TouchableOpacity
              style={styles.addressRow}
              onPress={() => navigation.navigate('Home')}
              activeOpacity={0.7}
            >
              <Text style={styles.addressPin}>📍</Text>
              <Text style={styles.addressText} numberOfLines={1}>{addressLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* Floating search bar */}
      <View style={styles.searchWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search stores or items…"
            placeholderTextColor={colors.textDisabled}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Category filters */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.value}
              style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
              onPress={() => setFilter(f.value)}
              activeOpacity={0.75}
            >
              <Text style={styles.filterEmoji}>{f.emoji}</Text>
              <Text style={[styles.filterLabel, filter === f.value && styles.filterLabelActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Error state */}
        {error && (
          <EmptyState
            emoji="⚠️"
            title="Couldn't load stores"
            subtitle="Check your connection and try again."
            actionLabel="Retry"
            onAction={refetch}
          />
        )}

        {/* Open stores */}
        {!error && openStores.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Open now · {openStores.length}</Text>
            </View>
            <View style={styles.storeList}>
              {openStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onPress={() => navigation.navigate('Store', { storeId: store.id })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Closed stores */}
        {!error && closedStores.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Closed · {closedStores.length}</Text>
            </View>
            <View style={[styles.storeList, styles.closedList]}>
              {closedStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onPress={() => {}}
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty search result */}
        {!error && filteredStores.length === 0 && !isLoading && (
          <EmptyState
            emoji="🔍"
            title="No stores found"
            subtitle={`No results for "${search}". Try a different search or filter.`}
            actionLabel="Clear search"
            onAction={() => { setSearch(''); setFilter('all'); }}
          />
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  // Orange header
  header:    { backgroundColor: colors.primary },
  headerTop: { paddingHorizontal: spacing.md, paddingBottom: spacing.md },
  headerLeft: { flex: 1 },
  greeting:  { ...textStyles.h2, color: colors.textInverse, marginBottom: 4 },
  addressRow:{ flexDirection: 'row', alignItems: 'center', gap: 4 },
  addressPin:{ fontSize: 13 },
  addressText:{ ...textStyles.bodySm, color: 'rgba(255,255,255,0.85)', flex: 1 },

  // Floating search
  searchWrapper: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
    ...shadow.strong,
  },
  searchIcon:  { fontSize: 15 },
  searchInput: { flex: 1, ...textStyles.body, color: colors.textPrimary },
  clearIcon:   { fontSize: 13, color: colors.textDisabled, padding: 4 },

  // Filters
  filtersRow: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundCard,
  },
  filterChipActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primaryMuted,
  },
  filterEmoji: { fontSize: 14 },
  filterLabel: { ...textStyles.label, color: colors.textSecondary },
  filterLabelActive: { color: colors.primary },

  // Sections
  scroll:        { flex: 1 },
  scrollContent: { paddingBottom: spacing.xl },
  section:       { marginTop: spacing.md },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...textStyles.h3, color: colors.textPrimary },
  storeList:    { paddingHorizontal: spacing.md, gap: spacing.md },
  closedList:   { opacity: 0.55 },
  bottomPad:    { height: spacing.xl },
});
