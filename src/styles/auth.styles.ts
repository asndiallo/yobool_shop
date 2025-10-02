import { BorderRadius, Opacity, Spacing, Typography } from '@/constants/theme';

import { StyleSheet } from 'react-native';

/**
 * Centralized styles for authentication screens (sign-in and sign-up)
 * to maintain consistency and easier maintenance.
 */
export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
  },
  headerSection: {
    marginBottom: Spacing['3xl'],
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  formContainer: {
    gap: Spacing.lg,
  },
  passwordInput: {
    marginTop: 0,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
  },
  submitButton: {
    marginTop: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: Spacing.md,
    opacity: Opacity.secondary,
  },
  socialButtonsContainer: {
    gap: Spacing.md,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    minHeight: 52,
    gap: Spacing.sm,
  },
  socialButtonIcon: {
    width: 20,
    height: 20,
  },
  socialButtonText: {
    fontWeight: Typography.fontWeight.medium,
  },
  bottomLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  bottomLinkTextSecondary: {
    opacity: Opacity.secondary,
  },
  bottomLinkTextPrimary: {
    fontWeight: Typography.fontWeight.semiBold,
  },
});
