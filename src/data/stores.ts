export interface Store {
  id: string;
  name: string;
  logo_url: string;
  website_url: string;
  country: 'FR' | 'US' | 'UK' | 'DE';
  shipping_info?: string;
  popular_categories?: string[];
}

export interface StoreCategory {
  id: string;
  name_key: string; // For i18n: 'stores.topShops'
  icon: string;
  stores: Store[];
}

// Stores data optimized for Senegalese market
export const STORES_DATA: StoreCategory[] = [
  {
    id: 'top-shops',
    name_key: 'stores.topShops',
    icon: 'star.fill',
    stores: [
      {
        id: 'amazon-fr',
        name: 'Amazon France',
        logo_url: 'https://logo.clearbit.com/amazon.com',
        website_url: 'https://amazon.fr',
        country: 'FR',
        shipping_info: 'Livraison internationale disponible',
      },
      {
        id: 'fnac',
        name: 'Fnac',
        logo_url: 'https://logo.clearbit.com/fnac.com',
        website_url: 'https://fnac.com',
        country: 'FR',
      },
      {
        id: 'cdiscount',
        name: 'Cdiscount',
        logo_url: 'https://logo.clearbit.com/cdiscount.com',
        website_url: 'https://cdiscount.com',
        country: 'FR',
      },
      {
        id: 'iherb',
        name: 'iHerb',
        logo_url: 'https://logo.clearbit.com/iherb.com',
        website_url: 'https://iherb.com',
        country: 'US',
        shipping_info: 'Expédition mondiale',
      },
    ],
  },
  {
    id: 'electronics',
    name_key: 'stores.electronics',
    icon: 'laptopcomputer',
    stores: [
      {
        id: 'apple-fr',
        name: 'Apple Store France',
        logo_url: 'https://logo.clearbit.com/apple.com',
        website_url: 'https://apple.com/fr',
        country: 'FR',
      },
      {
        id: 'fnac-tech',
        name: 'Fnac',
        logo_url: 'https://logo.clearbit.com/fnac.com',
        website_url: 'https://fnac.com',
        country: 'FR',
        popular_categories: ['iPhone', 'MacBook', 'Gaming'],
      },
      {
        id: 'darty',
        name: 'Darty',
        logo_url: 'https://logo.clearbit.com/darty.com',
        website_url: 'https://darty.com',
        country: 'FR',
      },
      {
        id: 'amazon-us',
        name: 'Amazon US',
        logo_url: 'https://logo.clearbit.com/amazon.com',
        website_url: 'https://amazon.com',
        country: 'US',
      },
    ],
  },
  {
    id: 'fashion-beauty',
    name_key: 'stores.fashionBeauty',
    icon: 'bag.fill',
    stores: [
      {
        id: 'zara',
        name: 'Zara',
        logo_url: 'https://logo.clearbit.com/zara.com',
        website_url: 'https://zara.com',
        country: 'FR',
      },
      {
        id: 'sephora-fr',
        name: 'Sephora France',
        logo_url: 'https://logo.clearbit.com/sephora.fr',
        website_url: 'https://sephora.fr',
        country: 'FR',
      },
      {
        id: 'galeries-lafayette',
        name: 'Galeries Lafayette',
        logo_url: 'https://logo.clearbit.com/galerieslafayette.com',
        website_url: 'https://galerieslafayette.com',
        country: 'FR',
      },
      {
        id: 'la-redoute',
        name: 'La Redoute',
        logo_url: 'https://logo.clearbit.com/laredoute.fr',
        website_url: 'https://laredoute.fr',
        country: 'FR',
      },
    ],
  },
  {
    id: 'shoes-sports',
    name_key: 'stores.shoesSports',
    icon: 'figure.walk',
    stores: [
      {
        id: 'nike-fr',
        name: 'Nike France',
        logo_url: 'https://logo.clearbit.com/nike.com',
        website_url: 'https://nike.com/fr',
        country: 'FR',
      },
      {
        id: 'adidas-fr',
        name: 'Adidas France',
        logo_url: 'https://logo.clearbit.com/adidas.fr',
        website_url: 'https://adidas.fr',
        country: 'FR',
      },
      {
        id: 'decathlon',
        name: 'Decathlon',
        logo_url: 'https://logo.clearbit.com/decathlon.fr',
        website_url: 'https://decathlon.fr',
        country: 'FR',
        shipping_info: 'Marque française populaire',
      },
      {
        id: 'zalando',
        name: 'Zalando',
        logo_url: 'https://logo.clearbit.com/zalando.fr',
        website_url: 'https://zalando.fr',
        country: 'FR',
      },
    ],
  },
];

// Helper functions for the component
export const getStoresByCategory = (categoryId: string): Store[] => {
  const category = STORES_DATA.find((cat) => cat.id === categoryId);
  return category?.stores || [];
};

export const getAllStores = (): Store[] => {
  return STORES_DATA.flatMap((category) => category.stores);
};

export const getStoreById = (storeId: string): Store | undefined => {
  return getAllStores().find((store) => store.id === storeId);
};
