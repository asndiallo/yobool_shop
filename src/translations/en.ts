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
  'common.seeAll': 'See All',

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

  // Home Screen
  'home.brand': 'YoBool',
  'home.tagline':
    'Get products from anywhere in the world, delivered to you by trusted travelers',
  'home.customRequest': 'Custom Request',
  'home.customRequestPlaceholder': 'Paste your Amazon/Nike/Zara link here',
  'home.requestQuote': 'Request a Quote',
  'home.priceFrom': 'From {price} {currency}',
  'home.order': 'Order',

  // Categories
  'categories.fashion': 'Fashion',
  'categories.electronics': 'Electronics',
  'categories.beauty': 'Beauty',
  'categories.clothing': 'Clothing',
  'categories.home': 'Home',
  'categories.accessories': 'Accessories',

  // Stores
  'stores.popularStores': 'Popular Stores',
  'stores.discoverProducts': 'Découvrez des milliers de produits',
  'stores.topShops': 'Top Shops',
  'stores.electronics': 'Electronics',
  'stores.fashionBeauty': 'Fashion & Beauty',
  'stores.shoesSports': 'SHoes & Sports',

  // Trust Badges
  'trust.registeredCompany': 'Company registered in Senegal',
  'trust.securePayment': 'Secure Wave payment',
} as const;

export type TranslationKey = keyof typeof en;
