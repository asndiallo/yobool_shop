import 'react-native-reanimated';

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { AuthProvider } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const queryClient = new QueryClient();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen
              name="stores"
              options={{ headerShown: false, title: 'All Stores' }}
            />
            <Stack.Screen
              name="order-options"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="sign-in"
              options={{ headerShown: false, title: 'Sign In' }}
            />
            <Stack.Screen
              name="sign-up"
              options={{ headerShown: false, title: 'Sign Up' }}
            />
            {/* <Stack.Screen
              name="forgot-password"
              options={{ headerShown: false, title: 'Forgot Password' }}
            />
            <Stack.Screen
              name="reset-password"
              options={{ headerShown: false, title: 'Reset Password' }}
            /> */}
            <Stack.Screen
              name="profile/[id]"
              options={{ headerShown: false, title: 'Profile' }}
            />
            <Stack.Screen
              name="profile/edit"
              options={{ headerShown: false, title: 'Edit Profile' }}
            />
            {/* <Stack.Screen
              name="product/[id]"
              options={{ headerShown: false, title: 'Product Details' }}
            />
            <Stack.Screen
              name="cart"
              options={{ headerShown: false, title: 'Your Cart' }}
            />
            <Stack.Screen
              name="checkout"
              options={{ headerShown: false, title: 'Checkout' }}
            />
            <Stack.Screen
              name="order/[id]"
              options={{ headerShown: false, title: 'Order Details' }}
            />
            <Stack.Screen
              name="search"
              options={{ headerShown: false, title: 'Search Products' }}
            />
            <Stack.Screen
              name="category/[id]"
              options={{ headerShown: false, title: 'Category' }}
            />
            <Stack.Screen
              name="store/[id]"
              options={{ headerShown: false, title: 'Store' }}
            /> */}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}
