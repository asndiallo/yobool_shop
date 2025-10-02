import * as AppleAuthentication from 'expo-apple-authentication';

import { useEffect, useState } from 'react';

import { Platform } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface AppleAuthButtonProps {
  onPress: () => void;
}

/**
 * Reusable Apple authentication button component
 * Uses native Apple Sign In button with theme-aware styling
 * Only renders on iOS when Apple Authentication is available
 */
export function AppleAuthButton({ onPress }: AppleAuthButtonProps) {
  const [isAvailable, setIsAvailable] = useState(false);
  const colorScheme = useColorScheme();

  useEffect(() => {
    const checkAvailability = async () => {
      if (Platform.OS === 'ios') {
        const available = await AppleAuthentication.isAvailableAsync();
        setIsAvailable(available);
      }
    };
    checkAvailability();
  }, []);

  if (!isAvailable) {
    return null;
  }

  return (
    <AppleAuthentication.AppleAuthenticationButton
      buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
      buttonStyle={
        colorScheme === 'dark'
          ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE
          : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
      }
      cornerRadius={8}
      style={{ width: '100%', height: 52 }}
      onPress={onPress}
    />
  );
}
