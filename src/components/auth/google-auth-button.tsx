import { ActivityIndicator, Image, Pressable } from 'react-native';

import { Heading5 } from '@/components/ui';
import { authStyles } from '@/styles/auth.styles';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

interface GoogleAuthButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

/**
 * Reusable Google authentication button component
 * Handles Google OAuth sign-in/sign-up with proper loading states
 */
export function GoogleAuthButton({
  onPress,
  disabled = false,
  isLoading = false,
}: GoogleAuthButtonProps) {
  const { t } = useTranslation();
  const borderColor = useThemeColor({}, 'border');

  return (
    <Pressable
      style={[authStyles.socialButton, { borderColor }]}
      onPress={onPress}
      disabled={disabled}
    >
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <Image
            source={require('@/assets/icons/google.png')}
            style={authStyles.socialButtonIcon}
          />
          <Heading5 style={authStyles.socialButtonText}>
            {t('auth.continueWithGoogle')}
          </Heading5>
        </>
      )}
    </Pressable>
  );
}
