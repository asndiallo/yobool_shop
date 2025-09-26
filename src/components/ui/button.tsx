import { ThemedText } from '@/components/themed-text';
import {
  BorderRadius,
  Colors,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/theme';
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  style,
  textStyle,
  disabled = false,
  ...props
}: ButtonProps) {
  const getVariantStyles = (pressed: boolean): ViewStyle => {
    const baseStyle: ViewStyle = {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: Colors.primary,
          ...Shadows.sm,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: Colors.navy,
          ...Shadows.sm,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: Colors.danger,
          ...Shadows.sm,
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: Spacing.sm,
          minHeight: 32,
        };
      case 'md':
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.md,
          minHeight: 44,
        };
      case 'lg':
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.lg,
          minHeight: 52,
        };
    }
  };

  const getTextColor = (): string => {
    if (variant === 'outline' || variant === 'ghost') {
      return Colors.primary;
    }
    return Colors.neutral.white;
  };

  const getTextSize = (): number => {
    switch (size) {
      case 'sm':
        return Typography.fontSize.sm;
      case 'md':
        return Typography.fontSize.base;
      case 'lg':
        return Typography.fontSize.lg;
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        getVariantStyles(pressed),
        getSizeStyles(),
        style,
      ]}
      disabled={disabled}
      {...props}
    >
      <ThemedText
        style={[
          {
            color: getTextColor(),
            fontSize: getTextSize(),
            fontWeight: Typography.fontWeight.semiBold,
          },
          textStyle,
        ]}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}
