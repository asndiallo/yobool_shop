import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type StyleProp, type ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined';

interface CardProps {
  variant?: CardVariant;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof Spacing;
}

export function Card({
  variant = 'default',
  children,
  style,
  padding = 'lg',
}: CardProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const getVariantStyles = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: BorderRadius.xl,
      padding: Spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          backgroundColor:
            colorScheme === 'dark'
              ? Colors.dark.backgroundSecondary
              : Colors.light.background,
          ...Shadows.lg,
        };
      case 'outlined':
        return {
          ...baseStyle,
          backgroundColor:
            colorScheme === 'dark'
              ? Colors.dark.backgroundSecondary
              : Colors.light.background,
          borderWidth: 1,
          borderColor:
            colorScheme === 'dark' ? Colors.dark.border : Colors.light.border,
        };
      case 'default':
      default:
        return {
          ...baseStyle,
          backgroundColor:
            colorScheme === 'dark'
              ? Colors.dark.backgroundSecondary
              : Colors.light.background,
          ...Shadows.md,
        };
    }
  };

  return (
    <ThemedView style={[getVariantStyles(), style]}>{children}</ThemedView>
  );
}
