import React, { useState, useMemo } from 'react';
import {
  View, Text, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStores }        from '@/queries/useStoreQueries';
import { StoreCard }        from '@/components/StoreCard/StoreCard';
import { EmptyState }       from '@/components/EmptyState/EmptyState';
import { LoadingSpinner }   from '@/components/LoadingSpinner/LoadingSpinner';
import { getCategoryVisual } from '@/utils/storeVisuals';

type Props = NativeStackScreenProps<SearchStackParamList, 'Search'>;

const BROWSE_CATEGORIES = [
  'snacks', 'drinks', 'produce', 'dairy',
  'bakery', 'burgers', 'sides', 'frozen',
  'household', 'pantry', 'desserts', 'indian',
];

export const SearchScreen = ({ navigation }: Props) => {
  const [query, setQuery] = useState('');
  const { data: stores, isLoading } = useStores();

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

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <SafeAreaView edges={['top']} style={styles.header}>
        <Text style={styles.title}>Search</Text>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            placeholder="Stores, items, categories…"
            placeholderTextColor={colors.textDisabled}
            autoFocus={false}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
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
                      onPress={() =>
                        // Navigate to home stack store screen via linking
                        // For now alert — cross-tab navigation needs a navigator ref
                        navigation.navigate('CategoryResults', { category: store.type, storeId: store.id })
                      }
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
  title: { ...textStyles.h1, color: colors.textPrimary },
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
  input: { flex: 1, ...textStyles.body, color: colors.textPrimary },
  clearIcon: { fontSize: 13, color: colors.textDisabled, padding: 4 },

  scroll:        { flex: 1 },
  scrollContent: { padding: spacing.md, gap: spacing.lg, paddingBottom: spacing.xxl },
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
