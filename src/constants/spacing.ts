export const spacing = {
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  xxl:  48,
} as const;

export const borderRadius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  full: 9999,
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  26,
  xxxl: 32,
} as const;

export const fontWeight = {
  regular:    '400' as const,
  medium:     '500' as const,
  semibold:   '600' as const,
  bold:       '700' as const,
  extrabold:  '800' as const,
} as const;

export const lineHeight = {
  tight:  1.2,
  normal: 1.5,
  loose:  1.75,
} as const;

// Consistent shadow style for elevated cards
export const shadow = {
  card: {
    shadowColor:   '#1A1510',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius:  8,
    elevation:     3,
  },
  strong: {
    shadowColor:   '#1A1510',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius:  16,
    elevation:     6,
  },
} as const;
