import { ScrollView, StyleSheet } from 'react-native';

import { Header } from '@/components/ui';
import PopularStores from '@/components/popular-stores';
import React from 'react';
import type { Store } from '@/data/stores';
import { ThemedView } from '@/components/themed-view';
import { router } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

const AllStoresScreen: React.FC = () => {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');

  const handleStorePress = (store: Store) => {
    // Navigate to store details or open external URL
    console.log('Navigate to store:', store.website_url);
    // You can implement deep linking or web view here
  };

  const handleCategoryPress = (categoryId: string) => {
    // Navigate to specific category view
    console.log('Navigate to category:', categoryId);
    // You can implement category filtering here
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Header
        title={t('stores.allStores')}
        subtitle={t('stores.browseByCategory')}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <PopularStores
          onStorePress={handleStorePress}
          onCategoryPress={handleCategoryPress}
        />
      </ScrollView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});

export default AllStoresScreen;
