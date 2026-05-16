/**
 * Inter font family.
 * Load Inter via expo-font before using these — see SETUP.md.
 * Fallback: System font (San Francisco / Roboto) until Inter loads.
 */

export const fontFamily = {
  regular:   'Inter_400Regular',
  medium:    'Inter_500Medium',
  semibold:  'Inter_600SemiBold',
  bold:      'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
} as const;

/**
 * Pre-built text style presets.
 * Use these in StyleSheet.create to stay consistent across screens.
 *
 * Usage:
 *   import { textStyles } from '@/constants';
 *   const styles = StyleSheet.create({ title: { ...textStyles.h1, color: colors.textPrimary } });
 */
export const textStyles = {
  // Display
  display:   { fontFamily: fontFamily.extrabold, fontSize: 32, lineHeight: 38 },
  h1:        { fontFamily: fontFamily.bold,      fontSize: 26, lineHeight: 32 },
  h2:        { fontFamily: fontFamily.bold,      fontSize: 20, lineHeight: 26 },
  h3:        { fontFamily: fontFamily.semibold,  fontSize: 17, lineHeight: 22 },

  // Body
  bodyLg:    { fontFamily: fontFamily.regular,   fontSize: 17, lineHeight: 26 },
  body:      { fontFamily: fontFamily.regular,   fontSize: 15, lineHeight: 22 },
  bodySm:    { fontFamily: fontFamily.regular,   fontSize: 13, lineHeight: 20 },

  // Labels & captions
  label:     { fontFamily: fontFamily.semibold,  fontSize: 13, lineHeight: 18 },
  labelSm:   { fontFamily: fontFamily.semibold,  fontSize: 11, lineHeight: 16 },
  caption:   { fontFamily: fontFamily.regular,   fontSize: 11, lineHeight: 16 },

  // Buttons
  btnLg:     { fontFamily: fontFamily.bold,      fontSize: 17, lineHeight: 22 },
  btn:       { fontFamily: fontFamily.semibold,  fontSize: 15, lineHeight: 20 },
  btnSm:     { fontFamily: fontFamily.semibold,  fontSize: 13, lineHeight: 18 },
} as const;
