// ============================================================================
// AUTHENTICATION SCHEMAS - Zod validation schemas with i18n support
// ============================================================================

import { makeZodI18nMap } from '@/lib/zod-i18n';
import { t } from '@/lib/i18n';
import { z } from 'zod';

/**
 * Sign In Schema
 * Validates email and password for authentication
 */
export const signInSchema = z
  .object({
    email: z
      .string({ errorMap: makeZodI18nMap() })
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.email') }),
    password: z
      .string({ errorMap: makeZodI18nMap() })
      .min(1, { message: t('validation.required') })
      .min(8, { message: t('validation.passwordMinLength') }),
  })
  .strict();

export type SignInFormData = z.infer<typeof signInSchema>;

/**
 * Sign Up Schema
 * Validates email, password, and password confirmation
 */
export const signUpSchema = z
  .object({
    email: z
      .string({ errorMap: makeZodI18nMap() })
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.email') }),
    password: z
      .string({ errorMap: makeZodI18nMap() })
      .min(1, { message: t('validation.required') })
      .min(8, { message: t('validation.passwordMinLength') })
      .regex(/[A-Z]/, { message: t('validation.passwordUppercase') })
      .regex(/[a-z]/, { message: t('validation.passwordLowercase') })
      .regex(/[0-9]/, { message: t('validation.passwordNumber') }),
    confirmPassword: z
      .string({ errorMap: makeZodI18nMap() })
      .min(1, { message: t('validation.required') }),
  })
  .strict()
  .refine((data) => data.password === data.confirmPassword, {
    message: t('validation.passwordMismatch'),
    path: ['confirmPassword'],
  });

export type SignUpFormData = z.infer<typeof signUpSchema>;
