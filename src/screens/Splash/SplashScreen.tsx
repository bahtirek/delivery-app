import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types';
import { styles } from './SplashScreen.styles';

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export const SplashScreen = ({ navigation }: Props) => {
  useEffect(() => {
    // Small delay to show the splash, then go to Login
    const timer = setTimeout(() => navigation.replace('Login'), 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoEmoji}>🛵</Text>
        <Text style={styles.appName}>Nearr</Text>
        <Text style={styles.tagline}>Delivered in minutes.</Text>
      </View>
      <ActivityIndicator size="small" color="#FF6B00" style={styles.loader} />
    </View>
  );
};
