import React, { useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { SearchStackParamList } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { useStores }         from '@/queries/useStoreQueries';
import { useStoreProducts }  from '@/queries/useProductQueries';
import { useCartStore }      from '@/store';
import { getCategoryVisual } from '@/utils/storeVisuals';
import { LoadingSpinner }    from '@/components/LoadingSpinner/LoadingSpinner';
import { EmptyState }        from '@/components/EmptyState/EmptyState';

type Props = NativeStackScreenProps<SearchStackParamList, 'CategoryResults'>;

export const CategoryResultsScreen = ({ navigation, route }: Props) => {
  const { category } = route.params;
  const visual = getCategoryVisual(category);
  const addItem = useCartStore((s) => s.addItem);

  const { data: stores, isLoading: storesLoading } = useStores();

  // Find stores that carry this category
  const relevantStores = useMemo(
    () => stores?.filter((s) => s.categories.includes(category) && s.isOpen) ?? [],
    [stores, category],
  );

  const categoryLabel = category.charAt(0).toUpperCase() + category.slice(1);

  if (storesLoading) return <LoadingSpinner message={`Finding ${categoryLabel}…`} />;

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerEmoji}>{visual.emoji}</Text>
          <Text style={styles.headerTitle}>{categoryLabel}</Text>
        </View>
      </SafeAreaView>

      {relevantStores.length === 0 ? (
        <EmptyState
          emoji={visual.emoji}
          title={`No ${categoryLabel} nearby`}
          subtitle="No open stores carry this category right now."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      ) : (
        <FlatList
          data={relevantStores}
          keyExtractor={(s) => s.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultCount}>{relevantStores.length} store{relevantStores.length !== 1 ? 's' : ''} nearby</Text>
          }
          renderItem={({ item: store }) => (
            <StoreWithProducts
              store={store}
              category={category}
              onAddToCart={addItem}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.lg }} />}
        />
      )}
    </View>
  );
};

// ─── StoreWithProducts subcomponent ──────────────────────────────────────────
import type { Store, Product } from '@/types';

const StoreWithProducts = ({
  store, category, onAddToCart,
}: {
  store: Store;
  category: string;
  onAddToCart: (p: Product) => void;
}) => {
  const { data: products, isLoading } = useStoreProducts(store.id);
  const filtered = useMemo(
    () => products?.filter((p) => p.category === category && p.inStock) ?? [],
    [products, category],
  );

  if (isLoading) return <LoadingSpinner fullScreen={false} />;
  if (!filtered.length) return null;

  return (
    <View style={storeStyles.container}>
      <Text style={storeStyles.storeName}>{store.name}</Text>
      <Text style={storeStyles.storeMeta}>{store.estimatedMinutes} min · {store.distanceMiles.toFixed(1)} mi</Text>
      <View style={storeStyles.products}>
        {filtered.map((product) => {
          const vis = getCategoryVisual(product.category);
          return (
            <View key={product.id} style={storeStyles.productRow}>
              <View style={[storeStyles.productThumb, { backgroundColor: vis.bg }]}>
                <Text style={storeStyles.productEmoji}>{vis.emoji}</Text>
              </View>
              <View style={storeStyles.productInfo}>
                <Text style={storeStyles.productName} numberOfLines={1}>{product.name}</Text>
                <Text style={storeStyles.productDesc} numberOfLines={1}>{product.description}</Text>
              </View>
              <View style={storeStyles.productRight}>
                <Text style={storeStyles.productPrice}>${product.price.toFixed(2)}</Text>
                <TouchableOpacity
                  style={storeStyles.addBtn}
                  onPress={() => onAddToCart(product)}
                  activeOpacity={0.8}
                >
                  <Text style={storeStyles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const storeStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadow.card,
  },
  storeName:    { ...textStyles.h3,      color: colors.textPrimary },
  storeMeta:    { ...textStyles.caption, color: colors.textSecondary },
  products:     { gap: spacing.sm },
  productRow:   { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  productThumb: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  productEmoji: { fontSize: 22 },
  productInfo:  { flex: 1 },
  productName:  { ...textStyles.label,   color: colors.textPrimary },
  productDesc:  { ...textStyles.caption, color: colors.textSecondary },
  productRight: { alignItems: 'flex-end', gap: spacing.xs },
  productPrice: { ...textStyles.label,   color: colors.textPrimary },
  addBtn: {
    width: 28, height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnText: { color: colors.textInverse, fontSize: 18, lineHeight: 28, textAlign: 'center' },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  backBtn:     { padding: spacing.xs },
  backText:    { fontSize: 22, color: colors.textPrimary },
  headerInfo:  { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerEmoji: { fontSize: 28 },
  headerTitle: { ...textStyles.h2, color: colors.textPrimary },
  list:        { padding: spacing.md, paddingBottom: spacing.xxl },
  resultCount: { ...textStyles.bodySm, color: colors.textSecondary, marginBottom: spacing.md },
});
