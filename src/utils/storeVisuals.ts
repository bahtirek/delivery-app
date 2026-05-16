import { colors } from '@/constants';
import type { StoreType } from '@/types';

interface StoreVisual {
  emoji:       string;
  gradient:    readonly [string, string];
  iconBg:      string;
  categoryLabel: string;
}

export const getStoreVisual = (type: StoreType): StoreVisual => {
  switch (type) {
    case 'convenience':
      return {
        emoji:         '🏪',
        gradient:      colors.gradientConvenience,
        iconBg:        colors.iconConvenience,
        categoryLabel: 'Convenience',
      };
    case 'grocery':
      return {
        emoji:         '🥦',
        gradient:      colors.gradientGrocery,
        iconBg:        colors.iconGrocery,
        categoryLabel: 'Grocery',
      };
    case 'restaurant':
      return {
        emoji:         '🍔',
        gradient:      colors.gradientRestaurant,
        iconBg:        colors.iconRestaurant,
        categoryLabel: 'Restaurant',
      };
  }
};

export const getCategoryVisual = (category: string): { emoji: string; bg: string } => {
  const map: Record<string, { emoji: string; bg: string }> = {
    snacks:     { emoji: '🍿', bg: colors.iconConvenience },
    drinks:     { emoji: '🧃', bg: colors.iconConvenience },
    frozen:     { emoji: '🧊', bg: colors.infoSubtle },
    household:  { emoji: '🧹', bg: colors.surfaceAlt },
    produce:    { emoji: '🥬', bg: colors.iconGrocery },
    dairy:      { emoji: '🥛', bg: '#F0F4FF' },
    bakery:     { emoji: '🍞', bg: colors.iconRestaurant },
    meat:       { emoji: '🥩', bg: '#FDEAEA' },
    pantry:     { emoji: '🥫', bg: colors.surfaceAlt },
    burgers:    { emoji: '🍔', bg: colors.iconRestaurant },
    sides:      { emoji: '🍟', bg: colors.iconRestaurant },
    desserts:   { emoji: '🍩', bg: '#FFF0F5' },
    indian:     { emoji: '🍛', bg: colors.iconRestaurant },
    thai:       { emoji: '🍜', bg: colors.iconRestaurant },
    rice:       { emoji: '🍚', bg: colors.surfaceAlt },
    noodles:    { emoji: '🍝', bg: colors.iconRestaurant },
  };
  return map[category] ?? { emoji: '📦', bg: colors.surfaceAlt };
};
