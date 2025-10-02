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
  'auth.welcomeBack': 'Welcome Back',
  'auth.signInToContinue': 'Sign in to continue your shopping journey',
  'auth.createAccount': 'Create Account',
  'auth.joinYobool':
    'Join YoBool and start shopping from anywhere in the world',
  'auth.continueWithGoogle': 'Continue with Google',
  'auth.continueWithApple': 'Continue with Apple',
  'auth.orContinueWith': 'Or continue with',
  'auth.dontHaveAccount': "Don't have an account?",
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.signUpLink': 'Sign up',
  'auth.signInLink': 'Sign in',
  'auth.emailPlaceholder': 'Enter your email',
  'auth.passwordPlaceholder': 'Enter your password',
  'auth.confirmPasswordPlaceholder': 'Confirm your password',
  'auth.passwordMismatch': 'Passwords do not match',
  'auth.invalidEmail': 'Please enter a valid email',
  'auth.passwordTooShort': 'Password must be at least 8 characters',
  'auth.fieldRequired': 'This field is required',

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

  // Validation
  'validation.required': 'This field is required',
  'validation.email': 'Please enter a valid email address',
  'validation.url': 'Please enter a valid URL',
  'validation.invalidType': 'Invalid value',
  'validation.minLength': 'Must be at least {min} characters',
  'validation.passwordMinLength': 'Password must be at least 8 characters',
  'validation.passwordUppercase':
    'Password must contain at least one uppercase letter',
  'validation.passwordLowercase':
    'Password must contain at least one lowercase letter',
  'validation.passwordNumber': 'Password must contain at least one number',
  'validation.passwordMismatch': 'Passwords do not match',

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
  'home.globalShipping': 'Worldwide Delivery',
  'home.customRequest': 'Custom Request',
  'home.customRequestDescription':
    "Can't find what you're looking for? Let us source it for you from anywhere in the world.",
  'home.startOrder': "I'm ready to start my order",
  'home.customRequestPlaceholder': 'Paste your Amazon/Nike/Zara link here',
  'home.requestQuote': 'Request a Quote',
  'home.globalSourcing': 'Global sourcing',
  'home.qualityGuaranteed': 'Quality guaranteed',
  'home.fastDelivery': 'Fast delivery',

  // Order
  'order.createOrder': 'Create Order',
  'order.subtitle': "Choose how you'd like to get started",
  'order.proTip':
    'Provide all product specifics about your order to ensure you receive the correct item.',
  'order.popularStores': 'Show me popular stores',
  'order.popularStoresSubtitle':
    'Browse curated products from trusted retailers',
  'order.productUrl': 'I have the URL of the product I want',
  'order.productUrlSubtitle': 'Paste any product link and get a custom quote',
  'order.manualEntry': 'Enter info manually',
  'order.manualEntrySubtitle': 'Describe your product requirements in detail',
  'home.order': 'Order',
  'home.orderDirectlyOnline': 'Order Directly Online',

  // Categories
  'categories.fashion': 'Fashion',
  'categories.electronics': 'Electronics',
  'categories.beauty': 'Beauty',
  'categories.clothing': 'Clothing',
  'categories.home': 'Home',
  'categories.accessories': 'Accessories',

  // Stores
  'stores.popularStores': 'Popular Stores',
  'stores.discoverProducts': 'Discover thousands of products',
  'stores.allStores': 'All Stores',
  'stores.browseByCategory': 'Browse stores by category',
  'stores.topShops': 'Top Shops',
  'stores.electronics': 'Electronics',
  'stores.fashionBeauty': 'Fashion & Beauty',
  'stores.shoesSports': 'Shoes & Sports',

  // Trust Badges
  'trust.registeredCompany': 'Company registered in Senegal',
  'trust.securePayment': 'Secure Wave payment',
} as const;

export type TranslationKey = keyof typeof en;
