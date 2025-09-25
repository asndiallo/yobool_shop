// ============================================================================
// ENGLISH TRANSLATIONS
// ============================================================================

export const en = {
  // Authentication
  'auth.login': 'Sign In',
  'auth.logout': 'Sign Out',
  'auth.register': 'Sign Up',
  'auth.forgotPassword': 'Forgot Password',
  'auth.resetPassword': 'Reset Password',
  'auth.confirmPassword': 'Confirm Password',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.rememberMe': 'Remember Me',

  // Common/General
  'common.loading': 'Loading...',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.ok': 'OK',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.confirm': 'Confirm',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.sort': 'Sort',

  // Errors
  'error.network': 'Network error',
  'error.unknown': 'An unknown error occurred',
  'error.validation': 'Please check your input',
  'error.auth.invalidCredentials': 'Invalid credentials',
  'error.auth.sessionExpired': 'Session expired',

  // Navigation
  'nav.home': 'Home',
  'nav.profile': 'Profile',
  'nav.settings': 'Settings',

  // Settings
  'settings.language': 'Language',
  'settings.theme': 'Theme',
  'settings.notifications': 'Notifications',
  'settings.privacy': 'Privacy',
  'settings.about': 'About',

} as const;

export type TranslationKey = keyof typeof en;