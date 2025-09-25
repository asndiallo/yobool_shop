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
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

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

// Color configuration - easy to modify
const Colors = {
  primary: '#F4B942', // Golden yellow for primary actions
  primaryLight: '#FFF8E7', // Light background for primary elements
  secondary: '#8B7DD8', // Purple for secondary actions
  secondaryLight: '#F3F1FF', // Light background for secondary elements
  navy: '#2C3E50', // Navy for primary buttons
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  lightGray: '#F8F9FA',
  mediumGray: '#E9ECEF',
  darkGray: '#6C757D',
};

const categories: Category[] = [
  { id: '1', name: 'Vêtements', icon: 'house.fill' },
  { id: '2', name: 'Électronique', icon: 'paperplane.fill' },
  { id: '3', name: 'Maison', icon: 'house.fill' },
  { id: '4', name: 'Accessoires', icon: 'paperplane.fill' },
];

const YoBoolHomeScreen: React.FC = () => {
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
            YoBool
          </ThemedText>
        </ThemedView>
        <ThemedView style={styles.headerIcons}>
          <Pressable style={styles.notificationButton}>
            <IconSymbol name="bell.fill" size={24} color={Colors.darkGray} />
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

      <ThemedText style={styles.headerTitle}>
        Achetez aux États-Unis & Europe, livré au Sénégal
      </ThemedText>

      <ThemedView style={styles.categoriesGrid}>
        <Pressable
          style={[styles.categoryButton, { backgroundColor: Colors.primary }]}
          onPress={() => handleCategoryPress(categories[0])}
        >
          <ThemedText style={styles.categoryButtonText}>
            Mode/Fashion
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.categoryButton,
            styles.categoryButtonOutline,
            { borderColor: Colors.darkGray },
          ]}
          onPress={() => handleCategoryPress(categories[1])}
        >
          <ThemedText
            style={[
              styles.categoryButtonTextOutline,
              { color: Colors.darkGray },
            ]}
          >
            Électronique
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.categoryButton,
            styles.categoryButtonOutline,
            { borderColor: Colors.secondary },
          ]}
          onPress={() => handleCategoryPress(categories[2])}
        >
          <ThemedText
            style={[
              styles.categoryButtonTextOutline,
              { color: Colors.secondary },
            ]}
          >
            Beauté
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );

  const renderProductCard = (product: Product, index: number) => (
    <Pressable
      key={product.id}
      style={({ pressed }) => [
        styles.productCard,
        { backgroundColor: colorScheme === 'dark' ? '#1f1f1f' : '#ffffff' },
        { opacity: pressed ? 0.8 : 1 },
      ]}
      onPress={() => handleProductPress(product)}
    >
      <Image source={{ uri: product.image_url }} style={styles.productImage} />
      <ThemedView style={styles.productContent}>
        <ThemedText style={styles.productName}>{product.name}</ThemedText>
        <ThemedText style={[styles.productPrice, { color: textColor }]}>
          À partir de {product.price.toLocaleString()} {product.currency}
        </ThemedText>
        <Pressable
          style={[
            styles.orderButton,
            { backgroundColor: index === 0 ? Colors.navy : Colors.primary },
          ]}
          onPress={() => orderProduct(product)}
        >
          <ThemedText style={styles.orderButtonText}>Commander</ThemedText>
        </Pressable>
      </ThemedView>
    </Pressable>
  );

  const renderCustomRequest = () => (
    <ThemedView style={styles.customRequestSection}>
      <ThemedText style={styles.sectionTitle}>Demande Personnalisée</ThemedText>

      <ThemedView
        style={[
          styles.searchContainer,
          {
            backgroundColor:
              colorScheme === 'dark' ? '#2f2f2f' : Colors.lightGray,
          },
        ]}
      >
        <IconSymbol name="paperplane.fill" size={20} color={Colors.darkGray} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Collez votre lien Amazon/Nike/Zara ici"
          placeholderTextColor={Colors.darkGray}
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
              {
                backgroundColor:
                  colorScheme === 'dark' ? '#2f2f2f' : Colors.lightGray,
              },
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <IconSymbol
              name={category.icon}
              size={24}
              color={Colors.darkGray}
            />
            <ThemedText style={styles.categoryIconText}>
              {category.name}
            </ThemedText>
          </Pressable>
        ))}
      </ThemedView>

      <Pressable
        style={[styles.requestButton, { backgroundColor: Colors.primary }]}
        onPress={handleCustomRequest}
      >
        <ThemedText style={styles.requestButtonText}>
          Demander un devis
        </ThemedText>
      </Pressable>
    </ThemedView>
  );

  const renderTrustBadges = () => (
    <ThemedView style={styles.trustBadges}>
      <ThemedView
        style={[
          styles.trustBadge,
          {
            backgroundColor:
              colorScheme === 'dark' ? '#2f2f2f' : Colors.lightGray,
          },
        ]}
      >
        <ThemedText style={[styles.trustBadgeText, { color: Colors.navy }]}>
          Entreprise enregistrée au Sénégal
        </ThemedText>
      </ThemedView>
      <ThemedView
        style={[
          styles.trustBadge,
          {
            backgroundColor:
              colorScheme === 'dark' ? '#2f2f2f' : Colors.primaryLight,
          },
        ]}
      >
        <ThemedText style={[styles.trustBadgeText, { color: Colors.warning }]}>
          Paiement sécurisé Wave
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
        {featuredProducts.map((product, index) =>
          renderProductCard(product, index)
        )}
      </ThemedView>

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
    fontSize: 28,
    fontWeight: 'bold',
    lineHeight: 36,
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  categoryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryButtonTextOutline: {
    fontSize: 14,
    fontWeight: '600',
  },
  productsSection: {
    padding: 20,
    gap: 20,
  },
  productCard: {
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
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  productContent: {
    padding: 16,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 14,
    marginBottom: 12,
  },
  orderButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  orderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
