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
  ControlledTextInput,
  Header,
  Heading3,
  IconSymbol,
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
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signInSchema, type SignInFormData } from '@/schemas/auth.schema';

export default function SignInScreen() {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const { login, authState, initiateGoogleAuth } = useAuthHook();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const isLoading = authState.status === 'loading' || isSubmitting;

  const onSubmit = async (data: SignInFormData) => {
    try {
      await login({
        email: data.email.trim(),
        password: data.password,
      });

      router.replace('/(tabs)');
    } catch (error) {
      console.error('Sign in error:', error);
      setError('password', {
        type: 'manual',
        message: t('error.auth.invalidCredentials'),
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
            <ControlledTextInput
              control={control}
              name="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              leftIcon="house.fill"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <ControlledTextInput
              control={control}
              name="password"
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
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
              onPress={handleSubmit(onSubmit)}
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
