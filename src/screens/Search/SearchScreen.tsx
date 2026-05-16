import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStores }          from '@/queries/useStoreQueries';
import { useLocationStore }   from '@/store';
import { StoreCard }          from '@/components/StoreCard/StoreCard';
import { StoreMapView }       from '@/components/StoreMapView/StoreMapView';
import { EmptyState }         from '@/components/EmptyState/EmptyState';
import { LoadingSpinner }     from '@/components/LoadingSpinner/LoadingSpinner';
import { getCategoryVisual }  from '@/utils/storeVisuals';
import type { Store }         from '@/types';

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>;

type ViewMode = 'list' | 'map';

const BROWSE_CATEGORIES = [
  'snacks', 'drinks', 'produce', 'dairy',
  'bakery', 'burgers', 'sides', 'frozen',
  'household', 'pantry', 'desserts', 'indian',
];

// Fallback coordinates (Springfield, same as mock data)
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.006;

export const SearchScreen = ({ navigation }: Props) => {
  const [query,    setQuery]    = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const deliveryAddress = useLocationStore((s) => s.deliveryAddress);
  const { data: stores, isLoading } = useStores();
  const insets = useSafeAreaInsets();

  const userLat = deliveryAddress?.lat ?? DEFAULT_LAT;
  const userLng = deliveryAddress?.lng ?? DEFAULT_LNG;

  const filteredStores = useMemo(() => {
    if (!stores || !query.trim()) return [];
    const q = query.toLowerCase();
    return stores.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.type.includes(q) ||
      s.categories.some((c) => c.includes(q))
    );
  }, [stores, query]);

  const hasQuery = query.trim().length > 0;

  const handleStorePress = (store: Store) => {
    navigation.navigate('CategoryResults', { category: store.type, storeId: store.id });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Search</Text>

          {/* List / Map toggle */}
          <View style={styles.toggle}>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
              onPress={() => setViewMode('list')}
              activeOpacity={0.75}
            >
              <Text style={[styles.toggleIcon, viewMode === 'list' && styles.toggleIconActive]}>
                ☰
              </Text>
              <Text style={[styles.toggleLabel, viewMode === 'list' && styles.toggleLabelActive]}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
              onPress={() => setViewMode('map')}
              activeOpacity={0.75}
            >
              <Text style={[styles.toggleIcon, viewMode === 'map' && styles.toggleIconActive]}>
                🗺️
              </Text>
              <Text style={[styles.toggleLabel, viewMode === 'map' && styles.toggleLabelActive]}>
                Map
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar — only in list mode */}
        {viewMode === 'list' && (
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Stores, items, categories…"
              placeholderTextColor={colors.textDisabled}
              returnKeyType="search"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Address indicator in map mode */}
        {viewMode === 'map' && (
          <View style={styles.mapAddressBar}>
            <Text style={styles.mapAddressIcon}>📍</Text>
            <Text style={styles.mapAddressText} numberOfLines={1}>
              {deliveryAddress ? deliveryAddress.street : 'Delivery address not set'}
            </Text>
            <Text style={styles.mapRadiusLabel}>0.5 mi radius</Text>
          </View>
        )}
      </SafeAreaView>

      {/* Map view */}
      {viewMode === 'map' && (
        <View style={styles.mapContainer}>
          {isLoading ? (
            <LoadingSpinner message="Loading stores…" />
          ) : !stores?.length ? (
            <EmptyState emoji="🗺️" title="No stores found" subtitle="Try adjusting your delivery address." />
          ) : (
            <StoreMapView
              stores={stores}
              userLat={userLat}
              userLng={userLng}
              onStorePress={handleStorePress}
            />
          )}
        </View>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Search results */}
          {hasQuery && (
            <>
              {isLoading && <LoadingSpinner fullScreen={false} />}
              {!isLoading && filteredStores.length === 0 && (
                <EmptyState
                  emoji="🔍"
                  title="No results"
                  subtitle={`Nothing matched "${query}". Try a different search.`}
                />
              )}
              {!isLoading && filteredStores.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Stores · {filteredStores.length}</Text>
                  <View style={styles.storeList}>
                    {filteredStores.map((store) => (
                      <StoreCard
                        key={store.id}
                        store={store}
                        onPress={() => handleStorePress(store)}
                      />
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Browse by category */}
          {!hasQuery && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse by category</Text>
              <View style={styles.categoryGrid}>
                {BROWSE_CATEGORIES.map((cat) => {
                  const visual = getCategoryVisual(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryTile, { backgroundColor: visual.bg }]}
                      onPress={() => navigation.navigate('CategoryResults', { category: cat })}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.categoryEmoji}>{visual.emoji}</Text>
                      <Text style={styles.categoryLabel}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },

  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { ...textStyles.h1, color: colors.textPrimary },

  // Toggle
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.full,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  toggleBtnActive:   { backgroundColor: colors.backgroundCard, ...shadow.card },
  toggleIcon:        { fontSize: 13 },
  toggleIconActive:  {},
  toggleLabel:       { ...textStyles.labelSm, color: colors.textSecondary },
  toggleLabelActive: { color: colors.textPrimary },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 46,
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  searchIcon: { fontSize: 15 },
  input:      { flex: 1, ...textStyles.body, color: colors.textPrimary },
  clearIcon:  { fontSize: 13, color: colors.textDisabled, padding: 4 },

  // Map address bar
  mapAddressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  mapAddressIcon:  { fontSize: 14 },
  mapAddressText:  { ...textStyles.bodySm, color: colors.textSecondary, flex: 1 },
  mapRadiusLabel:  { ...textStyles.labelSm, color: colors.primary },

  // Map
  mapContainer: { flex: 1 },

  // List
  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg },
  section:       { gap: spacing.md },
  sectionTitle:  { ...textStyles.h2, color: colors.textPrimary },
  storeList:     { gap: spacing.md },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryTile: {
    width: '47%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  categoryEmoji: { fontSize: 32 },
  categoryLabel: { ...textStyles.label, color: colors.textPrimary },
});
