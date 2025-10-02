import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
} from 'react-native';
import {
  BodySmall,
  Button,
  ControlledTextInput,
  Header,
  Heading3,
} from '@/components/ui/';
import { Colors, Opacity } from '@/constants/theme';

import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useAuthHook } from '@/hooks/use-auth';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUpSchema, type SignUpFormData } from '@/schemas/auth.schema';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authStyles } from '@/styles/auth.styles';
import { GoogleAuthButton, AppleAuthButton } from '@/components/auth';

// Configure WebBrowser for optimal OAuth experience
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const {
    register,
    authState,
    initiateGoogleAuth,
    exchangeOauthToken,
    signInWithApple,
    isLoadingGoogle,
    isLoadingApple,
  } = useAuthHook();

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const isLoading =
    authState.status === 'loading' ||
    isSubmitting ||
    isLoadingGoogle ||
    isLoadingApple;

  const onSubmit = async (data: SignUpFormData) => {
    try {
      await register({
        email: data.email.trim(),
        password: data.password,
        password_confirmation: data.confirmPassword,
        first_name: '',
        last_name: '',
      });

      // After successful registration, redirect to sign in
      router.replace('/sign-in');
    } catch (error) {
      console.error('Sign up error:', error);
      setError('email', {
        type: 'manual',
        message: t('error.unknown'),
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const url = await initiateGoogleAuth();

      // Open OAuth URL with expo-web-browser
      const result = await WebBrowser.openAuthSessionAsync(url, undefined, {
        showInRecents: true,
      });

      if (result.type === 'success' && result.url) {
        // Extract the authorization code from the callback URL
        const urlParams = new URL(result.url).searchParams;
        const code = urlParams.get('code');

        if (code) {
          await exchangeOauthToken(code);
          router.replace('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Google sign in error:', error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Send credential to server
      await signInWithApple({
        id_token: credential.identityToken!,
        authorization_code: credential.authorizationCode!,
        user_info: {
          id: credential.user,
          email: credential.email ?? undefined,
          first_name: credential.fullName?.givenName ?? undefined,
          last_name: credential.fullName?.familyName ?? undefined,
        },
      });

      router.replace('/(tabs)');
    } catch (error: any) {
      if (error.code === 'ERR_REQUEST_CANCELED') {
        // User canceled the sign-in flow
        return;
      }
      console.error('Apple sign in error:', error);
    }
  };

  const handleSignInPress = () => {
    router.push('/sign-in');
  };

  return (
    <ThemedView style={authStyles.container}>
      <Header showBackButton />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Section */}
          <ThemedView style={authStyles.headerSection}>
            <Heading3>{t('auth.createAccount')}</Heading3>
            <BodySmall
              style={[authStyles.subtitle, { opacity: Opacity.secondary }]}
            >
              {t('auth.joinYobool')}
            </BodySmall>
          </ThemedView>

          {/* Email & Password Form */}
          <ThemedView style={authStyles.formContainer}>
            <ControlledTextInput
              control={control}
              name="email"
              label={t('auth.email')}
              placeholder={t('auth.emailPlaceholder')}
              leftIcon="envelope"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />

            <ControlledTextInput
              control={control}
              name="password"
              label={t('auth.password')}
              placeholder={t('auth.passwordPlaceholder')}
              leftIcon="key"
              secureTextEntry
              editable={!isLoading}
            />

            <ControlledTextInput
              control={control}
              name="confirmPassword"
              label={t('auth.confirmPassword')}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              leftIcon="key"
              secureTextEntry
              editable={!isLoading}
            />

            {/* Sign Up Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
              variant="primary"
              size="lg"
              style={authStyles.submitButton}
            >
              {isLoading && !isLoadingGoogle && !isLoadingApple ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                t('auth.register')
              )}
            </Button>
          </ThemedView>

          {/* Divider */}
          <ThemedView style={authStyles.dividerContainer}>
            <ThemedView
              style={[authStyles.divider, { backgroundColor: borderColor }]}
            />
            <BodySmall style={authStyles.dividerText}>
              {t('auth.orContinueWith')}
            </BodySmall>
            <ThemedView
              style={[authStyles.divider, { backgroundColor: borderColor }]}
            />
          </ThemedView>

          {/* Social Sign In Buttons */}
          <ThemedView style={authStyles.socialButtonsContainer}>
            <GoogleAuthButton
              onPress={handleGoogleSignIn}
              disabled={isLoading}
              isLoading={isLoadingGoogle}
            />

            <AppleAuthButton onPress={handleAppleSignIn} />
          </ThemedView>

          {/* Sign In Link */}
          <ThemedView style={authStyles.bottomLinkContainer}>
            <BodySmall style={authStyles.bottomLinkTextSecondary}>
              {t('auth.alreadyHaveAccount')}{' '}
            </BodySmall>
            <Pressable onPress={handleSignInPress} disabled={isLoading}>
              <BodySmall
                color="primary"
                style={authStyles.bottomLinkTextPrimary}
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
