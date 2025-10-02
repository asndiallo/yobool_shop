import { BodySmall, Heading4 } from '@/components/ui/typography';
import { Opacity, Spacing } from '@/constants/theme';
import { Pressable, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import React from 'react';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  rightElement?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  onBackPress,
  rightElement,
}) => {
  const textColor = useThemeColor({}, 'text');

  const handleBackPress = () => {
    if (onBackPress) {
      onBackPress();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.topRow}>
        {showBackButton && (
          <Pressable
            style={({ pressed }) => [
              styles.backButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={handleBackPress}
          >
            <IconSymbol name="chevron.left" size={24} color={textColor} />
          </Pressable>
        )}

        {title && (
          <ThemedView
            style={[
              styles.titleContainer,
              !showBackButton && styles.titleContainerCentered,
            ]}
          >
            <Heading4>{title}</Heading4>
            {subtitle && (
              <BodySmall style={styles.subtitle}>{subtitle}</BodySmall>
            )}
          </ThemedView>
        )}

        {rightElement && (
          <ThemedView style={styles.rightElement}>{rightElement}</ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: Spacing.sm,
    marginLeft: -8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  titleContainerCentered: {
    marginLeft: 0,
    alignItems: 'center',
  },
  subtitle: {
    opacity: Opacity.secondary,
  },
  rightElement: {
    marginLeft: 12,
  },
});
