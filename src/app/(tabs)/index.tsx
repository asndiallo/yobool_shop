import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import {
  Button,
  Heading3,
  BodySmall,
  Caption,
  IconSymbol,
  Pills,
  type IconSymbolName,
} from '@/components/ui';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/useTranslation';
import { formatPrice, formatPriceFrom } from '@/utils';
import PopularStores from '@/components/PopularStores';
import type { Store } from '@/data/stores';

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
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
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
        {
          id: '3',
          name: 'MacBook Pro 14"',
          description: 'Latest Apple laptop',
          external_url: 'https://apple.com/macbook-pro',
          image_url:
            'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=300&h=300&fit=crop',
          price: 1250000,
          currency: 'XOF',
          category: { name: 'Electronics' },
          availability: { is_active: true, can_be_ordered: true },
        },
        {
          id: '4',
          name: 'AirPods Pro',
          description: 'Wireless earphones',
          external_url: 'https://apple.com/airpods-pro',
          image_url:
            'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=300&h=300&fit=crop',
          price: 150000,
          currency: 'XOF',
          category: { name: 'Electronics' },
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
      `Prix: ${formatPrice(
        product.price,
        product.currency,
        i18n.language
      )}\n\nVoulez-vous commander ce produit?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Commander', onPress: () => orderProduct(product) },
      ]
    );
  };

  const orderProduct = (product: Product) => {
    console.log('Ordering product:', product.name);
  };

  const handleCategoryPress = (category: Category) => {
    console.log('Category pressed:', category.name);
  };

  const renderHeader = () => (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.headerTop}>
        <ThemedView style={styles.logoContainer}>
          <Heading3 style={[styles.logo, { color: Colors.primary }]}>
            {t('home.brand')}
          </Heading3>
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
              <Caption style={styles.badgeText}>2</Caption>
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

      <ThemedView style={styles.taglineContainer}>
        <ThemedView style={styles.taglineContent}>
          <BodySmall style={[styles.taglineText, { color: textColor }]}>
            {t('home.tagline')}
          </BodySmall>
          <View style={styles.taglineHighlight}>
            <IconSymbol
              name="globe"
              size={16}
              color={Colors.primary}
              style={styles.taglineIcon}
            />
            <Caption style={[styles.taglineAccent, { color: Colors.primary }]}>
              {t('home.globalShipping')}
            </Caption>
          </View>
        </ThemedView>
      </ThemedView>

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
        <BodySmall style={styles.productName}>{product.name}</BodySmall>
        <Caption style={[styles.productPrice, { color: textColor }]}>
          {formatPriceFrom(product.price, product.currency, i18n.language)}
        </Caption>
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
      <View style={styles.customRequestCard}>
        <View style={styles.customRequestHeader}>
          <IconSymbol
            name="sparkles"
            size={32}
            color={Colors.primary}
            style={styles.customRequestIcon}
          />
          <Heading3 style={[styles.sectionTitle, { color: textColor }]}>
            {t('home.customRequest')}
          </Heading3>
          <BodySmall
            style={[styles.customRequestDescription, { color: textColor }]}
          >
            {t('home.customRequestDescription')}
          </BodySmall>
        </View>

        <View style={styles.customRequestFeatures}>
          <View style={styles.featureItem}>
            <IconSymbol name="globe" size={16} color={Colors.primary} />
            <Caption style={[styles.featureText, { color: textColor }]}>
              {t('home.globalSourcing')}
            </Caption>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol
              name="checkmark.circle"
              size={16}
              color={Colors.success}
            />
            <Caption style={[styles.featureText, { color: textColor }]}>
              {t('home.qualityGuaranteed')}
            </Caption>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="bolt" size={16} color={Colors.warning} />
            <Caption style={[styles.featureText, { color: textColor }]}>
              {t('home.fastDelivery')}
            </Caption>
          </View>
        </View>

        <Button
          variant="primary"
          size="lg"
          style={styles.startOrderButton}
          onPress={() => router.push('/order-options')}
        >
          {t('home.startOrder')}
        </Button>
      </View>
    </ThemedView>
  );

  const renderTrustBadges = () => (
    <ThemedView style={styles.trustBadges}>
      <View
        style={[
          styles.trustBadge,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
      >
        <Caption style={[styles.trustBadgeText, { color: Colors.warning }]}>
          {t('trust.registeredCompany')}
        </Caption>
      </View>
      <View
        style={[
          styles.trustBadge,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
      >
        <Caption style={[styles.trustBadgeText, { color: Colors.warning }]}>
          {t('trust.securePayment')}
        </Caption>
      </View>
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
        showSingleRow
        onStorePress={(store: Store) => {
          // Open store URL or navigate to store products
          console.log('Navigate to store:', store.website_url);
        }}
        onSeeAllPress={() => {
          // Navigate to all stores screen
          router.push('/stores');
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
    padding: Spacing.xs,
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
  taglineContainer: {
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.xs,
  },
  taglineContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  taglineText: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
    opacity: 0.9,
  },
  taglineHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  taglineIcon: {
    opacity: 0.8,
  },
  taglineAccent: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  productsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
    ...Shadows.md,
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
  customRequestCard: {
    backgroundColor: 'rgba(244, 185, 66, 0.05)',
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(244, 185, 66, 0.2)',
    padding: Spacing['2xl'],
    ...Shadows.md,
  },
  customRequestHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  customRequestIcon: {
    marginBottom: Spacing.md,
    opacity: 0.9,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  customRequestDescription: {
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 20,
    fontSize: 14,
    paddingHorizontal: Spacing.sm,
  },
  customRequestFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing['2xl'],
    paddingHorizontal: Spacing.sm,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  featureText: {
    marginTop: Spacing.xs,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.9,
  },
  startOrderButton: {
    borderRadius: BorderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 56,
    ...Shadows.lg,
  },
  startOrderIcon: {
    marginRight: Spacing.xs,
  },
  trustBadges: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: Spacing['4xl'],
  },
  trustBadge: {
    flex: 1,
    padding: Spacing.sm,
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
