import {} from '@/components/ui/button';
import {} from '@/components/ui/header';
import {} from '@/components/ui/icon-symbol';
import {} from '@/components/ui/text-input';

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  BodySmall,
  Button,
  Header,
  Heading3,
  IconSymbol,
  TextInput,
} from '@/components/ui/';
import {
  BorderRadius,
  Colors,
  Opacity,
  Spacing,
  Typography,
} from '@/constants/theme';

import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useAuthHook } from '@/hooks/use-auth';
import { useState } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export default function SignInScreen() {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const { login, authState, initiateGoogleAuth } = useAuthHook();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const isLoading = authState.status === 'loading';

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = t('auth.fieldRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = t('auth.invalidEmail');
    }

    if (!password) {
      newErrors.password = t('auth.fieldRequired');
    } else if (password.length < 8) {
      newErrors.password = t('auth.passwordTooShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await login({
        email: email.trim(),
        password,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign in error:', error);
      setErrors({
        password: t('error.auth.invalidCredentials'),
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const url = await initiateGoogleAuth();
      // TODO: Open browser or WebView with url
      console.log('Google OAuth URL:', url);
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    // TODO: Implement Apple Sign In with expo-apple-authentication
    console.log('Apple Sign In - To be implemented');
  };

  const handleSignUpPress = () => {
    router.push('/sign-up');
  };

  return (
    <ThemedView style={styles.container}>
      <Header title="" showBackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <ThemedView style={styles.headerSection}>
            <Heading3>{t('auth.welcomeBack')}</Heading3>
            <BodySmall
              style={[styles.subtitle, { opacity: Opacity.secondary }]}
            >
              {t('auth.signInToContinue')}
            </BodySmall>
          </ThemedView>

          {/* Social Sign In Buttons */}
          <ThemedView style={styles.socialButtonsContainer}>
            <Pressable
              style={[styles.socialButton, { borderColor }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              <IconSymbol
                name="paperplane.fill"
                size={20}
                color={Colors.primary}
              />
              <BodySmall style={styles.socialButtonText}>
                {t('auth.continueWithGoogle')}
              </BodySmall>
            </Pressable>

            {Platform.OS === 'ios' && (
              <Pressable
                style={[styles.socialButton, { borderColor }]}
                onPress={handleAppleSignIn}
                disabled={isLoading}
              >
                <IconSymbol
                  name="paperplane.fill"
                  size={20}
                  color={Colors.primary}
                />
                <BodySmall style={styles.socialButtonText}>
                  {t('auth.continueWithApple')}
                </BodySmall>
              </Pressable>
            )}
          </ThemedView>

          {/* Divider */}
          <ThemedView style={styles.dividerContainer}>
            <ThemedView
              style={[styles.divider, { backgroundColor: borderColor }]}
            />
            <BodySmall
              style={[styles.dividerText, { opacity: Opacity.secondary }]}
            >
              {t('auth.orContinueWith')}
            </BodySmall>
            <ThemedView
              style={[styles.divider, { backgroundColor: borderColor }]}
            />
          </ThemedView>

          {/* Email & Password Form */}
          <ThemedView style={styles.formContainer}>
            <TextInput
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) {
                  setErrors({ ...errors, email: undefined });
                }
              }}
              error={errors.email}
              leftIcon="house.fill"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <TextInput
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors({ ...errors, password: undefined });
                }
              }}
              error={errors.password}
              leftIcon="house.fill"
              secureTextEntry
              editable={!isLoading}
              containerStyle={styles.passwordInput}
            />

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => console.log('Forgot password')}
              style={styles.forgotPasswordButton}
              disabled={isLoading}
            >
              <BodySmall color="primary">{t('auth.forgotPassword')}</BodySmall>
            </Pressable>

            {/* Sign In Button */}
            <Button
              onPress={handleSignIn}
              disabled={isLoading}
              variant="primary"
              size="lg"
              style={styles.signInButton}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                t('auth.login')
              )}
            </Button>
          </ThemedView>

          {/* Sign Up Link */}
          <ThemedView style={styles.signUpContainer}>
            <BodySmall style={{ opacity: Opacity.secondary }}>
              {t('auth.dontHaveAccount')}{' '}
            </BodySmall>
            <Pressable onPress={handleSignUpPress} disabled={isLoading}>
              <BodySmall
                color="primary"
                style={{ fontWeight: Typography.fontWeight.semiBold }}
              >
                {t('auth.signUpLink')}
              </BodySmall>
            </Pressable>
          </ThemedView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  headerSection: {
    marginBottom: Spacing['3xl'],
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  socialButtonsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minHeight: 52,
    gap: Spacing.sm,
  },
  socialButtonText: {
    fontWeight: Typography.fontWeight.medium,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
  },
  formContainer: {
    gap: Spacing.lg,
  },
  passwordInput: {
    marginTop: 0,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  signInButton: {
    marginTop: Spacing.md,
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
});
