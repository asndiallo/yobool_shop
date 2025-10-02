import { ThemedText } from '@/components/themed-text';
import { Colors, Typography as TypographyTokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { type StyleProp, type TextStyle } from 'react-native';

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'overline';

export type TypographyColor =
  | 'primary'
  | 'secondary'
  | 'textPrimary'
  | 'textSecondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

interface TypographyProps {
  variant?: TypographyVariant;
  color?: TypographyColor;
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
}

export function Text({
  variant = 'body',
  color = 'textPrimary',
  align = 'left',
  children,
  style,
  numberOfLines,
}: TypographyProps) {
  const colorScheme = useColorScheme() ?? 'light';

  const getVariantStyles = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: TypographyTokens.fontSize['5xl'],
          lineHeight: TypographyTokens.lineHeight['5xl'],
          fontWeight: TypographyTokens.fontWeight.bold,
        };
      case 'h2':
        return {
          fontSize: TypographyTokens.fontSize['4xl'],
          lineHeight: TypographyTokens.lineHeight['4xl'],
          fontWeight: TypographyTokens.fontWeight.bold,
        };
      case 'h3':
        return {
          fontSize: TypographyTokens.fontSize['3xl'],
          lineHeight: TypographyTokens.lineHeight['3xl'],
          fontWeight: TypographyTokens.fontWeight.bold,
        };
      case 'h4':
        return {
          fontSize: TypographyTokens.fontSize['2xl'],
          lineHeight: TypographyTokens.lineHeight['2xl'],
          fontWeight: TypographyTokens.fontWeight.semiBold,
        };
      case 'h5':
        return {
          fontSize: TypographyTokens.fontSize.xl,
          lineHeight: TypographyTokens.lineHeight.xl,
          fontWeight: TypographyTokens.fontWeight.semiBold,
        };
      case 'body':
        return {
          fontSize: TypographyTokens.fontSize.base,
          lineHeight: TypographyTokens.lineHeight.base,
          fontWeight: TypographyTokens.fontWeight.normal,
        };
      case 'bodySmall':
        return {
          fontSize: TypographyTokens.fontSize.sm,
          lineHeight: TypographyTokens.lineHeight.sm,
          fontWeight: TypographyTokens.fontWeight.normal,
        };
      case 'caption':
        return {
          fontSize: TypographyTokens.fontSize.xs,
          lineHeight: TypographyTokens.lineHeight.xs,
          fontWeight: TypographyTokens.fontWeight.normal,
        };
      case 'overline':
        return {
          fontSize: TypographyTokens.fontSize.xs,
          lineHeight: TypographyTokens.lineHeight.xs,
          fontWeight: TypographyTokens.fontWeight.semiBold,
          textTransform: 'uppercase',
          letterSpacing: 1,
        };
    }
  };

  const getColorValue = (): string => {
    switch (color) {
      case 'primary':
        return Colors.primary;
      case 'secondary':
        return Colors.secondary;
      case 'textPrimary':
        return colorScheme === 'dark' ? Colors.dark.text : Colors.light.text;
      case 'textSecondary':
        return colorScheme === 'dark'
          ? Colors.dark.textSecondary
          : Colors.light.textSecondary;
      case 'success':
        return Colors.success;
      case 'warning':
        return Colors.warning;
      case 'danger':
        return Colors.danger;
      case 'info':
        return Colors.info;
    }
  };

  return (
    <ThemedText
      style={[
        getVariantStyles(),
        {
          color: getColorValue(),
          textAlign: align,
        },
        style,
      ]}
      numberOfLines={numberOfLines}
    >
      {children}
    </ThemedText>
  );
}

// Convenience components for common typography patterns
export const Heading1 = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="h1" {...props} />
);

export const Heading2 = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="h2" {...props} />
);

export const Heading3 = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="h3" {...props} />
);

export const Heading4 = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="h4" {...props} />
);

export const Heading5 = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="h5" {...props} />
);

export const Body = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="body" {...props} />
);

export const BodySmall = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="bodySmall" {...props} />
);

export const Caption = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="caption" {...props} />
);

export const Overline = (props: Omit<TypographyProps, 'variant'>) => (
  <Text variant="overline" {...props} />
);
