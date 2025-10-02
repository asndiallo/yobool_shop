import {
  ActivityIndicator,
  Image,
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
import { signInSchema, type SignInFormData } from '@/schemas/auth.schema';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { authStyles } from '@/styles/auth.styles';
import { useEffect, useState } from 'react';

// Configure WebBrowser for optimal OAuth experience
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');
  const {
    login,
    authState,
    initiateGoogleAuth,
    exchangeOauthToken,
    signInWithApple,
    isLoadingGoogle,
    isLoadingApple,
  } = useAuthHook();
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);

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

  // Check Apple Authentication availability
  useEffect(() => {
    const checkAppleAuth = async () => {
      if (Platform.OS === 'ios') {
        const available = await AppleAuthentication.isAvailableAsync();
        setIsAppleAvailable(available);
      }
    };
    checkAppleAuth();
  }, []);

  const isLoading =
    authState.status === 'loading' ||
    isSubmitting ||
    isLoadingGoogle ||
    isLoadingApple;

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

  const handleSignUpPress = () => {
    router.push('/sign-up');
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
            <Heading3>{t('auth.welcomeBack')}</Heading3>
            <BodySmall
              style={[authStyles.subtitle, { opacity: Opacity.secondary }]}
            >
              {t('auth.signInToContinue')}
            </BodySmall>
          </ThemedView>

          {/* Email & Password Form */}
          <ThemedView style={authStyles.formContainer}>
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
              containerStyle={authStyles.passwordInput}
            />

            {/* Forgot Password Link */}
            <Pressable
              onPress={() => console.log('Forgot password')}
              style={authStyles.forgotPasswordButton}
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
              style={authStyles.submitButton}
            >
              {isLoading && !isLoadingGoogle && !isLoadingApple ? (
                <ActivityIndicator color={Colors.neutral.white} />
              ) : (
                t('auth.login')
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
            <Pressable
              style={[authStyles.socialButton, { borderColor }]}
              onPress={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoadingGoogle ? (
                <ActivityIndicator size="small" />
              ) : (
                <>
                  <Image
                    source={require('@/assets/icons/google.png')}
                    style={authStyles.socialButtonIcon}
                  />
                  <BodySmall style={authStyles.socialButtonText}>
                    {t('auth.continueWithGoogle')}
                  </BodySmall>
                </>
              )}
            </Pressable>

            {Platform.OS === 'ios' && isAppleAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={
                  AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
                }
                buttonStyle={
                  AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
                }
                cornerRadius={8}
                style={{ width: '100%', height: 52 }}
                onPress={handleAppleSignIn}
              />
            )}
          </ThemedView>

          {/* Sign Up Link */}
          <ThemedView style={authStyles.bottomLinkContainer}>
            <BodySmall style={authStyles.bottomLinkTextSecondary}>
              {t('auth.dontHaveAccount')}{' '}
            </BodySmall>
            <Pressable onPress={handleSignUpPress} disabled={isLoading}>
              <BodySmall
                color="primary"
                style={authStyles.bottomLinkTextPrimary}
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
