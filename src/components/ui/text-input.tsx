import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  type TextInputProps as RNTextInputProps,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { BodySmall } from '@/components/ui/typography';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';

export interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: IconSymbolName;
  rightIcon?: IconSymbolName;
  onRightIconPress?: () => void;
  containerStyle?: any;
}

export function TextInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  secureTextEntry,
  ...props
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'border');
  const placeholderColor = useThemeColor({}, 'textSecondary');

  const isPassword = secureTextEntry === true;
  const showPassword = isPassword && !isPasswordVisible;

  const handlePasswordToggle = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getBorderColor = () => {
    if (error) return Colors.danger;
    if (isFocused) return Colors.primary;
    return borderColor;
  };

  return (
    <ThemedView style={[styles.container, containerStyle]}>
      {label && (
        <BodySmall style={styles.label} color="textPrimary">
          {label}
        </BodySmall>
      )}

      <ThemedView
        style={[
          styles.inputContainer,
          {
            borderColor: getBorderColor(),
          },
        ]}
      >
        {leftIcon && (
          <ThemedView style={styles.leftIconContainer}>
            <IconSymbol
              name={leftIcon}
              size={20}
              color={isFocused ? Colors.primary : placeholderColor}
            />
          </ThemedView>
        )}

        <RNTextInput
          style={[
            styles.input,
            {
              color: textColor,
            },
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword) && styles.inputWithRightIcon,
          ]}
          placeholderTextColor={placeholderColor}
          secureTextEntry={showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
          {...props}
        />

        {isPassword ? (
          <Pressable
            onPress={handlePasswordToggle}
            style={styles.rightIconContainer}
          >
            <IconSymbol
              name={isPasswordVisible ? 'eye.slash' : 'eye'}
              size={20}
              color={placeholderColor}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
          >
            <IconSymbol name={rightIcon} size={20} color={placeholderColor} />
          </Pressable>
        ) : null}
      </ThemedView>

      {error && (
        <BodySmall style={[styles.helperText, { color: Colors.danger }]}>
          {error}
        </BodySmall>
      )}

      {!error && helperText && (
        <BodySmall style={[styles.helperText, { color: placeholderColor }]}>
          {helperText}
        </BodySmall>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: Spacing.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    minHeight: 52,
    paddingHorizontal: Spacing.md,
  },
  leftIconContainer: {
    marginRight: Spacing.sm,
  },
  rightIconContainer: {
    marginLeft: Spacing.sm,
    padding: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    paddingVertical: Spacing.md,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  helperText: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});
