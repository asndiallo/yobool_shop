// ============================================================================
// ZOD I18N ERROR MAP - Custom error messages with translation support
// ============================================================================

import { t } from '@/lib/i18n';
import { z } from 'zod';

/**
 * Creates a custom error map for Zod that uses translated messages
 * Following best practices from Zod documentation
 */
export const makeZodI18nMap = (): z.ZodErrorMap => (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.received === 'undefined' || issue.received === 'null') {
      return { message: t('validation.required') };
    }
    return { message: t('validation.invalidType') };
  }

  if (issue.code === z.ZodIssueCode.too_small) {
    if (issue.type === 'string') {
      if (issue.minimum === 1) {
        return { message: t('validation.required') };
      }
      return {
        message: t('validation.minLength', { min: issue.minimum.toString() }),
      };
    }
  }

  if (issue.code === z.ZodIssueCode.invalid_string) {
    if (issue.validation === 'email') {
      return { message: t('validation.email') };
    }
    if (issue.validation === 'url') {
      return { message: t('validation.url') };
    }
  }

  // Default to Zod's error message
  return { message: ctx.defaultError };
};
