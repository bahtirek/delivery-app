import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/types';
import { SplashScreen }     from '@/screens/Splash/SplashScreen';
import { LoginScreen }      from '@/screens/Login/LoginScreen';
import { RegisterScreen }   from '@/screens/Register/RegisterScreen';
import { SetAddressScreen } from '@/screens/SetAddress/SetAddressScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Splash"      component={SplashScreen} />
    <Stack.Screen name="Login"       component={LoginScreen} />
    <Stack.Screen name="Register"    component={RegisterScreen} />
    <Stack.Screen name="SetAddress"  component={SetAddressScreen} />
  </Stack.Navigator>
);
