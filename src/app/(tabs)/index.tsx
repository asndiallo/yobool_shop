import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Button,
  Heading4,
  IconSymbol,
  Pills,
  type IconSymbolName,
} from '@/components/ui';
import { BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/useTranslation';
import PopularStores from '@/components/PopularStores';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Product {
  id: string;
  name: string;
  description: string;
  external_url: string;
  image_url: string;
  price: number;
  currency: string;
  category: {
    name: string;
  };
  availability: {
    is_active: boolean;
    can_be_ordered: boolean;
  };
}

interface Category {
  id: string;
  name: string;
  icon: IconSymbolName;
}

const categories: Category[] = [
  { id: '1', name: 'clothing', icon: 'house.fill' },
  { id: '2', name: 'electronics', icon: 'paperplane.fill' },
  { id: '3', name: 'home', icon: 'house.fill' },
  { id: '4', name: 'accessories', icon: 'paperplane.fill' },
];

const YoBoolHomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [searchText, setSearchText] = useState('');
  const [, setLoading] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);

      // Mock data matching the design
      const mockProducts: Product[] = [
        {
          id: '1',
          name: 'Nike Air Force 1',
          description: 'Classic white sneakers',
          external_url: 'https://nike.com/air-force-1',
          image_url:
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop',
          price: 89500,
          currency: 'XOF',
          category: { name: 'Chaussures' },
          availability: { is_active: true, can_be_ordered: true },
        },
        {
          id: '2',
          name: 'Robe Élégante Zara',
          description: 'Robe noire élégante',
          external_url: 'https://zara.com/dress',
          image_url:
            'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=300&fit=crop',
          price: 35000,
          currency: 'XOF',
          category: { name: 'Mode' },
          availability: { is_active: true, can_be_ordered: true },
        },
      ];

      setFeaturedProducts(mockProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductPress = (product: Product) => {
    Alert.alert(
      product.name,
      `Prix: ${product.price.toLocaleString()} ${
        product.currency
      }\n\nVoulez-vous commander ce produit?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Commander', onPress: () => orderProduct(product) },
      ]
    );
  };

  const orderProduct = (product: Product) => {
    console.log('Ordering product:', product.name);
  };

  const handleCustomRequest = () => {
    console.log('Opening custom request form');
  };

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category.name);
  };

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerTop}>
        <ThemedView style={styles.logoContainer}>
          <ThemedText style={[styles.logo, { color: Colors.primary }]}>
            {t('home.brand')}
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.headerIcons}>
          <Pressable style={styles.notificationButton}>
            <IconSymbol
              name="bell.fill"
              size={24}
              color={Colors.neutral.gray[500]}
            />
            <ThemedView
              style={[
                styles.notificationBadge,
                { backgroundColor: Colors.danger },
              ]}
            >
              <ThemedText style={styles.badgeText}>2</ThemedText>
            </ThemedView>
          </Pressable>
          <Pressable>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
              }}
              style={styles.avatar}
            />
          </Pressable>
        </ThemedView>
      </ThemedView>

      <Heading4 style={styles.headerTitle}>{t('home.tagline')}</Heading4>

      <Pills
        items={[
          { id: '1', label: t('categories.fashion'), isActive: true },
          { id: '2', label: t('categories.electronics'), isActive: false },
          { id: '3', label: t('categories.beauty'), isActive: false },
        ]}
        onItemPress={(id) =>
          handleCategoryPress(categories.find((c) => c.id === id)!)
        }
      />
    </ThemedView>
  );

  const renderProductCard = (product: Product, index: number) => (
    <Pressable
      key={product.id}
      style={({ pressed }) => [
        styles.productCard,
        { backgroundColor: Colors[colorScheme].backgroundSecondary },
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => handleProductPress(product)}
    >
      <Image source={{ uri: product.image_url }} style={styles.productImage} />
      <ThemedView style={styles.productContent}>
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={[styles.productPrice, { color: textColor }]}>
          {t('home.priceFrom')
            .replace('{price}', product.price.toLocaleString())
            .replace('{currency}', product.currency)}
        </ThemedText>
        <Button
          variant={'ghost'}
          size="sm"
          onPress={() => orderProduct(product)}
        >
          {t('home.order')}
        </Button>
      </ThemedView>
    </Pressable>
  );

  const renderCustomRequest = () => (
    <ThemedView style={styles.customRequestSection}>
      <ThemedText style={styles.sectionTitle}>
        {t('home.customRequest')}
      </ThemedText>

      <ThemedView
        style={[
          styles.searchContainer,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
      >
        <IconSymbol
          name="paperplane.fill"
          size={20}
          color={Colors.neutral.gray[500]}
        />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={t('home.customRequestPlaceholder')}
          placeholderTextColor={Colors.neutral.gray[500]}
          value={searchText}
          onChangeText={setSearchText}
        />
      </ThemedView>

      <ThemedView style={styles.categoryIconsGrid}>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[
              styles.categoryIcon,
              { backgroundColor: Colors[colorScheme].backgroundSecondary },
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <IconSymbol
              name={category.icon}
              size={24}
              color={Colors.neutral.gray[500]}
            />
            <ThemedText style={styles.categoryIconText}>
              {t(`categories.${category.name}` as any)}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>

      <Button
        variant="primary"
        size="lg"
        style={styles.requestButton}
        onPress={handleCustomRequest}
      >
        {t('home.requestQuote')}
      </Button>
    </ThemedView>
  );

  const renderTrustBadges = () => (
    <ThemedView style={styles.trustBadges}>
      <ThemedView
        style={[
          styles.trustBadge,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
      >
        <ThemedText style={[styles.trustBadgeText, { color: Colors.warning }]}>
          {t('trust.registeredCompany')}
        </ThemedText>
      </ThemedView>
      <ThemedView
        style={[
          styles.trustBadge,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
      >
        <ThemedText style={[styles.trustBadgeText, { color: Colors.warning }]}>
          {t('trust.securePayment')}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      {renderHeader()}

      <ThemedView style={styles.productsSection}>
        <ThemedView style={styles.productsGrid}>
          {featuredProducts.map((product, index) =>
            renderProductCard(product, index)
          )}
        </ThemedView>
      </ThemedView>

      <PopularStores
        onStorePress={(store) => {
          // Open store URL or navigate to store products
          console.log('Navigate to store:', store.website_url);
        }}
        onCategoryPress={(categoryId) => {
          // Navigate to category page with all stores
          console.log('Navigate to category:', categoryId);
        }}
      />

      {renderCustomRequest()}
      {renderTrustBadges()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 4,
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 18,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  headerTitle: {
    marginBottom: 20,
  },
  productsSection: {
    padding: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  productCard: {
    width: (SCREEN_WIDTH - 52) / 2, // Account for padding and gap
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
  },
  productContent: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    height: 36, // Fixed height to align content
  },
  productPrice: {
    fontSize: 12,
    marginBottom: 10,
  },
  customRequestSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  categoryIconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  categoryIcon: {
    width: (SCREEN_WIDTH - 64) / 2,
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    gap: 8,
  },
  categoryIconText: {
    fontSize: 14,
    fontWeight: '500',
  },
  requestButton: {
    borderRadius: BorderRadius.lg,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  trustBadge: {
    flex: 1,
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default YoBoolHomeScreen;
