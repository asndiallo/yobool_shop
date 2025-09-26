import React from 'react';
import { StyleSheet, ScrollView, Pressable, Image, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import {
  IconSymbol,
  Button,
  BodySmall,
  Heading3,
  Overline,
  Caption,
  Heading4,
} from '@/components/ui';
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
      <Caption style={styles.storeName} numberOfLines={2}>
        {store.name}
      </Caption>
      {store.country && (
        <View
          style={[
            styles.countryBadge,
            { backgroundColor: getCountryColor(store.country) },
          ]}
        >
          <Caption style={styles.countryText}>{store.country}</Caption>
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
          <Heading4 style={styles.categoryName}>
            {t(category.name_key as TranslationKey)}
          </Heading4>
        </ThemedView>
        <Pressable onPress={() => onSeeAllPress(category.id)}>
          <BodySmall style={[styles.seeAllText, { color: Colors.primary }]}>
            {t('common.seeAll')}
          </BodySmall>
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
  onCategoryPress?: (categoryId: string) => void;
  onSeeAllPress?: () => void;
  categoryId?: string; // If provided, show only this category
  showSingleRow?: boolean; // If true, show only one row for home screen
  title?: string; // Custom title
  subtitle?: string; // Custom subtitle
}

const PopularStores: React.FC<PopularStoresProps> = ({
  onStorePress,
  onCategoryPress,
  onSeeAllPress,
  categoryId,
  showSingleRow = false,
  title,
  subtitle,
}) => {
  const { t } = useTranslation();

  const handleStorePress = (store: Store) => {
    console.log('Store pressed:', store.name);
    onStorePress(store);
  };

  const handleSeeAllPress = (catId: string) => {
    console.log('See all pressed for category:', catId);
    if (onCategoryPress) {
      onCategoryPress(catId);
    }
  };

  // Determine which categories to show
  const categoriesToShow = React.useMemo(() => {
    if (categoryId) {
      // Show specific category
      const category = STORES_DATA.find((cat) => cat.id === categoryId);
      return category ? [category] : [];
    } else if (showSingleRow) {
      // Show only top-shops for home screen
      const topShopsCategory = STORES_DATA.find(
        (cat) => cat.id === 'top-shops'
      );
      return topShopsCategory ? [topShopsCategory] : [];
    } else {
      // Show all categories
      return STORES_DATA;
    }
  }, [categoryId, showSingleRow]);

  if (showSingleRow && categoriesToShow.length > 0) {
    // Single row layout for home screen
    const category = categoriesToShow[0];
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.singleRowHeader}>
          <Overline>{title || t('home.orderDirectlyOnline')}</Overline>
          {onSeeAllPress && (
            <Button variant="ghost" size="sm" onPress={onSeeAllPress}>
              {t('common.seeAll')}
            </Button>
          )}
        </ThemedView>

        {subtitle && (
          <BodySmall style={styles.sectionSubtitle}>{subtitle}</BodySmall>
        )}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storesScrollContainer}
          style={styles.storesScroll}
        >
          {category.stores.map((store) => (
            <StoreCard
              key={store.id}
              store={store}
              onPress={handleStorePress}
            />
          ))}
        </ScrollView>
      </ThemedView>
    );
  }

  // Multiple categories layout for dedicated screen
  return (
    <ThemedView style={styles.container}>
      {(title || (!categoryId && !showSingleRow)) && (
        <>
          <Heading3 style={styles.sectionTitle}>
            {title || t('stores.popularStores')}
          </Heading3>
          {(subtitle || (!categoryId && !showSingleRow)) && (
            <BodySmall style={styles.sectionSubtitle}>
              {subtitle || t('stores.discoverProducts')}
            </BodySmall>
          )}
        </>
      )}

      {categoriesToShow.map((category) => (
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
  singleRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionTitle: {
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  sectionSubtitle: {
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
    color: '#ffffff',
  },
});

export default PopularStores;
