import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import type { Store } from '@/types';
import { colors, spacing, borderRadius, textStyles, shadow } from '@/constants';
import { DELIVERY_RADIUS_MILES } from '@/constants';
import { getStoreVisual } from '@/utils/storeVisuals';

const RADIUS_METERS = DELIVERY_RADIUS_MILES * 1609.34; // miles → meters
const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StoreMapViewProps {
  stores: Store[];
  userLat: number;
  userLng: number;
  onStorePress: (store: Store) => void;
}

// Pin color per store type
const PIN_COLOR: Record<string, string> = {
  convenience: '#FF6B00',
  grocery:     '#22C55E',
  restaurant:  '#EF4444',
};

export const StoreMapView = ({ stores, userLat, userLng, onStorePress }: StoreMapViewProps) => {
  const mapRef = useRef<MapView>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const cardAnim = useRef(new Animated.Value(0)).current;

  const initialRegion = {
    latitude:       userLat,
    longitude:      userLng,
    latitudeDelta:  0.012,
    longitudeDelta: 0.012,
  };

  const showCard = useCallback((store: Store) => {
    setSelectedStore(store);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 60,
      friction: 10,
    }).start();
    // Pan map so store pin is in upper portion of screen
    mapRef.current?.animateToRegion({
      latitude:       store.lat - 0.003,
      longitude:      store.lng,
      latitudeDelta:  0.012,
      longitudeDelta: 0.012,
    }, 350);
  }, [cardAnim]);

  const hideCard = useCallback(() => {
    Animated.timing(cardAnim, {
      toValue: 0, duration: 180, useNativeDriver: true,
    }).start(() => setSelectedStore(null));
  }, [cardAnim]);

  const handleMapPress = useCallback(() => {
    if (selectedStore) hideCard();
  }, [selectedStore, hideCard]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        onPress={handleMapPress}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Delivery radius circle */}
        <Circle
          center={{ latitude: userLat, longitude: userLng }}
          radius={RADIUS_METERS}
          fillColor="rgba(255,107,0,0.08)"
          strokeColor="rgba(255,107,0,0.35)"
          strokeWidth={1.5}
        />

        {/* User location pin */}
        <Marker
          coordinate={{ latitude: userLat, longitude: userLng }}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={10}
        >
          <View style={styles.userPin}>
            <View style={styles.userPinInner} />
          </View>
        </Marker>

        {/* Store pins */}
        {stores.map((store) => {
          const visual   = getStoreVisual(store.type);
          const pinColor = store.isOpen ? PIN_COLOR[store.type] ?? colors.primary : colors.textDisabled;
          const isSelected = selectedStore?.id === store.id;

          return (
            <Marker
              key={store.id}
              coordinate={{ latitude: store.lat, longitude: store.lng }}
              onPress={() => showCard(store)}
              anchor={{ x: 0.5, y: 1 }}
              zIndex={isSelected ? 5 : 1}
            >
              <View style={[
                styles.pin,
                { backgroundColor: pinColor },
                isSelected && styles.pinSelected,
                !store.isOpen && styles.pinClosed,
              ]}>
                <Text style={styles.pinEmoji}>{visual.emoji}</Text>
              </View>
              {/* Pin tail */}
              <View style={[styles.pinTail, { borderTopColor: pinColor }]} />
            </Marker>
          );
        })}
      </MapView>

      {/* Legend */}
      <View style={styles.legend}>
        <LegendItem color={PIN_COLOR.convenience} label="Convenience" />
        <LegendItem color={PIN_COLOR.grocery}     label="Grocery" />
        <LegendItem color={PIN_COLOR.restaurant}  label="Restaurant" />
        <LegendItem color={colors.textDisabled}   label="Closed" />
      </View>

      {/* Recenter button */}
      <TouchableOpacity
        style={styles.recenterBtn}
        onPress={() => mapRef.current?.animateToRegion(initialRegion, 400)}
        activeOpacity={0.85}
      >
        <Text style={styles.recenterIcon}>◎</Text>
      </TouchableOpacity>

      {/* Store detail card */}
      {selectedStore && (
        <Animated.View style={[
          styles.storeCard,
          {
            transform: [{
              translateY: cardAnim.interpolate({
                inputRange: [0, 1], outputRange: [180, 0],
              }),
            }],
            opacity: cardAnim,
          },
        ]}>
          <StoreCalloutCard
            store={selectedStore}
            onPress={() => {
              hideCard();
              onStorePress(selectedStore);
            }}
            onClose={hideCard}
          />
        </Animated.View>
      )}
    </View>
  );
};

// ─── LegendItem ───────────────────────────────────────────────────────────────
const LegendItem = ({ color, label }: { color: string; label: string }) => (
  <View style={legendStyles.item}>
    <View style={[legendStyles.dot, { backgroundColor: color }]} />
    <Text style={legendStyles.label}>{label}</Text>
  </View>
);

const legendStyles = StyleSheet.create({
  item:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot:   { width: 8, height: 8, borderRadius: 4 },
  label: { ...textStyles.caption, color: colors.textSecondary },
});

// ─── StoreCalloutCard ─────────────────────────────────────────────────────────
const StoreCalloutCard = ({
  store, onPress, onClose,
}: {
  store: Store;
  onPress: () => void;
  onClose: () => void;
}) => {
  const visual = getStoreVisual(store.type);
  const deliveryFeeLabel = store.deliveryFeeFlat != null
    ? `$${store.deliveryFeeFlat.toFixed(2)} delivery`
    : store.deliveryFeePercent != null
      ? `${store.deliveryFeePercent}% fee`
      : 'Free delivery';

  return (
    <View style={calloutStyles.card}>
      {/* Close button */}
      <TouchableOpacity style={calloutStyles.closeBtn} onPress={onClose} activeOpacity={0.7}>
        <Text style={calloutStyles.closeIcon}>✕</Text>
      </TouchableOpacity>

      <View style={calloutStyles.row}>
        {/* Illustrated thumbnail */}
        <View style={[calloutStyles.thumb, { backgroundColor: visual.gradient[0] }]}>
          <Text style={calloutStyles.thumbEmoji}>{visual.emoji}</Text>
        </View>

        {/* Info */}
        <View style={calloutStyles.info}>
          <View style={calloutStyles.nameRow}>
            <Text style={calloutStyles.name} numberOfLines={1}>{store.name}</Text>
            <View style={[
              calloutStyles.statusDot,
              { backgroundColor: store.isOpen ? colors.success : colors.textDisabled },
            ]} />
          </View>
          <Text style={calloutStyles.meta}>
            ⭐ {store.rating.toFixed(1)} · {store.distanceMiles.toFixed(1)} mi · {store.estimatedMinutes} min
          </Text>
          <Text style={calloutStyles.fee}>{deliveryFeeLabel}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[calloutStyles.viewBtn, !store.isOpen && calloutStyles.viewBtnDisabled]}
        onPress={onPress}
        disabled={!store.isOpen}
        activeOpacity={0.88}
      >
        <Text style={calloutStyles.viewBtnText}>
          {store.isOpen ? 'View store →' : 'Currently closed'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const calloutStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    gap: spacing.md,
  },
  closeBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  closeIcon: { fontSize: 12, color: colors.textSecondary },

  row:    { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  thumb: {
    width: 60, height: 60,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  thumbEmoji: { fontSize: 28 },

  info:    { flex: 1, gap: 3 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name:    { ...textStyles.h3, color: colors.textPrimary, flex: 1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  meta:    { ...textStyles.caption, color: colors.textSecondary },
  fee:     { ...textStyles.labelSm, color: colors.primary },

  viewBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnDisabled: { backgroundColor: colors.surfaceAlt },
  viewBtnText:     { ...textStyles.btn, color: colors.textInverse },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },

  // User location pin
  userPin: {
    width: 20, height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPinInner: {
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#3B82F6',
    borderWidth: 2,
    borderColor: '#fff',
  },

  // Store pins
  pin: {
    width: 40, height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
    ...shadow.card,
  },
  pinSelected: { width: 48, height: 48, borderRadius: 24 },
  pinClosed:   { opacity: 0.45 },
  pinTail: {
    width: 0, height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
    marginTop: -1,
  },
  pinEmoji: { fontSize: 18 },

  // Legend
  legend: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: 'rgba(255,251,248,0.94)',
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
    gap: spacing.xs,
    ...shadow.card,
  },

  // Recenter
  recenterBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 40, height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  recenterIcon: { fontSize: 20, color: colors.primary },

  // Store card
  storeCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    ...shadow.strong,
  },
});
