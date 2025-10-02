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

export default function SignUpScreen() {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const { register, authState, initiateGoogleAuth } = useAuthHook();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const isLoading = authState.status === 'loading';

  const validateForm = (): boolean => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

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

    if (!confirmPassword) {
      newErrors.confirmPassword = t('auth.fieldRequired');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordMismatch');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    try {
      await register({
        email: email.trim(),
        password,
        password_confirmation: confirmPassword,
        first_name: '',
        last_name: '',
      });

      // After successful registration, redirect to sign in
      router.replace('/sign-in');
    } catch (error) {
      console.error('Sign up error:', error);
      setErrors({
        email: t('error.unknown'),
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

  const handleSignInPress = () => {
    router.push('/sign-in');
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
            <Heading3>{t('auth.createAccount')}</Heading3>
            <BodySmall
              style={[styles.subtitle, { opacity: Opacity.secondary }]}
            >
              {t('auth.joinYobool')}
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
            />

            <TextInput
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: undefined });
                }
              }}
              error={errors.confirmPassword}
              leftIcon="house.fill"
              secureTextEntry
              editable={!isLoading}
            />

            {/* Sign Up Button */}
            <Button
              onPress={handleSignUp}
              disabled={isLoading}
              variant="primary"
              size="lg"
              style={styles.signUpButton}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                t('auth.register')
              )}
            </Button>
          </ThemedView>

          {/* Sign In Link */}
          <ThemedView style={styles.signInContainer}>
            <BodySmall style={{ opacity: Opacity.secondary }}>
              {t('auth.alreadyHaveAccount')}{' '}
            </BodySmall>
            <Pressable onPress={handleSignInPress} disabled={isLoading}>
              <BodySmall
                color="primary"
                style={{ fontWeight: Typography.fontWeight.semiBold }}
              >
                {t('auth.signInLink')}
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
  signUpButton: {
    marginTop: Spacing.md,
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
});
