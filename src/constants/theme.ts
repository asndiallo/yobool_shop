/**
 * YoBool Design System - Unified theme configuration
 * Below are the colors, spacing, and design tokens used throughout the app.
 */

import { Platform } from 'react-native';

// Brand Colors - YoBool identity
const brandColors = {
  primary: '#F4B942', // Golden yellow
  primaryLight: '#FFF8E7', // Light golden background
  secondary: '#8B7DD8', // Purple
  secondaryLight: '#F3F1FF', // Light purple background
  navy: '#2C3E50', // Navy for primary buttons
} as const;

// Semantic Colors - Consistent meaning across app
const semanticColors = {
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
} as const;

// Neutral Colors - For backgrounds, text, borders
const neutralColors = {
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#E9ECEF',
    200: '#DEE2E6',
    300: '#CED4DA',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#1A1D20',
  },
} as const;

// Theme-specific colors
const tintColorLight = brandColors.primary;
const tintColorDark = '#fff';

export const Colors = {
  // Brand colors (theme-independent)
  ...brandColors,
  ...semanticColors,
  neutral: neutralColors,

  // Theme-specific colors
  light: {
    text: neutralColors.gray[800],
    textSecondary: neutralColors.gray[500],
    background: neutralColors.white,
    backgroundSecondary: neutralColors.gray[50],
    border: neutralColors.gray[200],
    tint: tintColorLight,
    icon: neutralColors.gray[500],
    tabIconDefault: neutralColors.gray[400],
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: neutralColors.gray[400],
    background: '#151718',
    backgroundSecondary: '#1f1f1f',
    border: neutralColors.gray[700],
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
} as const;

// Spacing Scale - 8pt grid system for consistent spacing
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,
} as const;

// Opacity Scale - Consistent transparency levels
export const Opacity = {
  disabled: 0.3,
  secondary: 0.6,
  primary: 1,
} as const;

// Typography Scale - Consistent text sizes and styles
export const Typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
  },
  lineHeight: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 40,
    '4xl': 44,
    '5xl': 48,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Border Radius - Consistent corner rounding
export const BorderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 999,
} as const;

// Shadows - Consistent elevation
export const Shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
