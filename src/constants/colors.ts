export const colors = {
  // Brand
  primary:          '#FF6B00',
  primaryLight:     '#FF8C38',
  primaryDark:      '#CC5500',
  primarySubtle:    '#FFF4EE',
  primaryMuted:     '#FFE0CC',

  // Semantic
  success:          '#22C55E',
  successSubtle:    '#E8F5EE',
  warning:          '#F59E0B',
  warningSubtle:    '#FFF3E0',
  error:            '#EF4444',
  errorSubtle:      '#FDEAEA',
  info:             '#3B82F6',
  infoSubtle:       '#EEF2FF',

  // Neutrals
  background:       '#FFFBF8',   // warm white — not pure white
  backgroundCard:   '#FFFFFF',
  surface:          '#FFF4EE',   // warm tinted surface
  surfaceAlt:       '#F5F0EB',
  border:           '#F0EDE8',
  borderStrong:     '#E0D8D0',

  // Text
  textPrimary:      '#1A1510',   // warm near-black
  textSecondary:    '#7A6E66',   // warm gray
  textDisabled:     '#BEB5AD',
  textInverse:      '#FFFFFF',

  // Category icon backgrounds
  iconConvenience:  '#FFF0E6',
  iconGrocery:      '#E8F5EE',
  iconRestaurant:   '#FFF3E0',
  iconQuick:        '#EEF2FF',

  // Store card gradients (top color only, used for illustrated placeholders)
  gradientConvenience: ['#FFE0CC', '#FFB380'],
  gradientGrocery:     ['#C8ECD8', '#7DD3A8'],
  gradientRestaurant:  ['#FFD9B3', '#FF9F5A'],
  gradientQuick:       ['#D4E4FF', '#89B4FF'],

  // Tab bar
  tabActive:        '#FF6B00',
  tabInactive:      '#C8C0B8',

  // Overlay
  overlay:          'rgba(26, 21, 16, 0.5)',
} as const;
