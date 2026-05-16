import { StyleSheet } from 'react-native';
import { colors, fontSize } from '@/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 8,
  },
  logoEmoji: {
    fontSize: 64,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
