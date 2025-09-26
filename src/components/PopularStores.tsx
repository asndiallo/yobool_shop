import React from 'react';
import { StyleSheet, ScrollView, Pressable, Image, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/useTranslation';
import { STORES_DATA, type Store, type StoreCategory } from '@/data/stores';
import type { TranslationKey } from '@/translations';

const STORE_CARD_WIDTH = 120;

interface StoreCardProps {
  store: Store;
  onPress: (store: Store) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onPress }) => {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.storeCard,
        { backgroundColor: Colors[colorScheme].backgroundSecondary },
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => onPress(store)}
    >
      <View style={styles.logoContainer}>
        <Image source={{ uri: store.logo_url }} style={styles.storeLogo} />
      </View>
      <ThemedText style={styles.storeName} numberOfLines={2}>
        {store.name}
      </ThemedText>
      {store.country && (
        <View
          style={[
            styles.countryBadge,
            { backgroundColor: getCountryColor(store.country) },
          ]}
        >
          <ThemedText style={styles.countryText}>{store.country}</ThemedText>
        </View>
      )}
    </Pressable>
  );
};

interface StoreCategoryRowProps {
  category: StoreCategory;
  onStorePress: (store: Store) => void;
  onSeeAllPress: (categoryId: string) => void;
}

const StoreCategoryRow: React.FC<StoreCategoryRowProps> = ({
  category,
  onStorePress,
  onSeeAllPress,
}) => {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.categoryContainer}>
      <ThemedView style={styles.categoryHeader}>
        <ThemedView style={styles.categoryTitle}>
          <IconSymbol
            name={category.icon as any}
            size={20}
            color={Colors.primary}
          />
          <ThemedText style={styles.categoryName}>
            {t(category.name_key as TranslationKey)}
          </ThemedText>
        </ThemedView>
        <Pressable onPress={() => onSeeAllPress(category.id)}>
          <ThemedText style={[styles.seeAllText, { color: Colors.primary }]}>
            {t('common.seeAll')}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storesScrollContainer}
        style={styles.storesScroll}
      >
        {category.stores.map((store) => (
          <StoreCard key={store.id} store={store} onPress={onStorePress} />
        ))}
      </ScrollView>
    </ThemedView>
  );
};

interface PopularStoresProps {
  onStorePress: (store: Store) => void;
  onCategoryPress: (categoryId: string) => void;
}

const PopularStores: React.FC<PopularStoresProps> = ({
  onStorePress,
  onCategoryPress,
}) => {
  const { t } = useTranslation();

  const handleStorePress = (store: Store) => {
    // Track analytics here if needed
    console.log('Store pressed:', store.name);
    onStorePress(store);
  };

  const handleSeeAllPress = (categoryId: string) => {
    console.log('See all pressed for category:', categoryId);
    onCategoryPress(categoryId);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.sectionTitle}>
        {t('stores.popularStores')}
      </ThemedText>
      <ThemedText style={styles.sectionSubtitle}>
        {t('stores.discoverProducts')}
      </ThemedText>

      {STORES_DATA.map((category) => (
        <StoreCategoryRow
          key={category.id}
          category={category}
          onStorePress={handleStorePress}
          onSeeAllPress={handleSeeAllPress}
        />
      ))}
    </ThemedView>
  );
};

// Helper function to get country flag colors
const getCountryColor = (country: string): string => {
  switch (country) {
    case 'FR':
      return '#0055A4'; // French blue
    case 'US':
      return '#B22234'; // US red
    case 'UK':
      return '#012169'; // British blue
    case 'DE':
      return '#000000'; // German black
    default:
      return Colors.neutral.gray[400];
  }
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.6,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  categoryContainer: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  storesScroll: {
    paddingLeft: 20,
  },
  storesScrollContainer: {
    paddingRight: 20,
    gap: 12,
  },
  storeCard: {
    width: STORE_CARD_WIDTH,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  storeName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    height: 32, // Fixed height for alignment
  },
  countryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countryText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default PopularStores;
