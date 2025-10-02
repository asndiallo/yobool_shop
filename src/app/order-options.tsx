import React from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import {
  Heading3,
  BodySmall,
  Caption,
  IconSymbol,
  type IconSymbolName,
} from '@/components/ui';
import {
  Colors,
  Spacing,
  Opacity,
  BorderRadius,
  Shadows,
} from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

interface OrderOption {
  id: string;
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  onPress: () => void;
}

export default function OrderModal() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryBackground = useThemeColor({}, 'backgroundSecondary');
  const insets = useSafeAreaInsets();

  const orderOptions: OrderOption[] = [
    {
      id: 'popular-stores',
      title: t('order.popularStores'),
      subtitle: t('order.popularStoresSubtitle'),
      icon: 'star.fill',
      onPress: () => {
        router.push('/stores');
      },
    },
    {
      id: 'product-url',
      title: t('order.productUrl'),
      subtitle: t('order.productUrlSubtitle'),
      icon: 'link',
      onPress: () => {
        // TODO: Navigate to URL input screen
        console.log('Navigate to URL input');
      },
    },
    {
      id: 'manual-entry',
      title: t('order.manualEntry'),
      subtitle: t('order.manualEntrySubtitle'),
      icon: 'pencil',
      onPress: () => {
        // TODO: Navigate to manual entry screen
        console.log('Navigate to manual entry');
      },
    },
  ];

  const renderOrderOption = (option: OrderOption) => (
    <Pressable
      key={option.id}
      style={({ pressed }) => [
        styles.optionCard,
        {
          backgroundColor: secondaryBackground,
          opacity: pressed ? Opacity.secondary : Opacity.primary,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={option.onPress}
      accessibilityRole="button"
      accessibilityLabel={`${option.title}. ${option.subtitle}`}
    >
      <View style={styles.optionContent}>
        <View style={styles.optionLeft}>
          <IconSymbol name={option.icon} size={18} color={Colors.primary} />
          <View style={styles.optionTextContainer}>
            <BodySmall style={[styles.optionTitle, { color: textColor }]}>
              {option.title}
            </BodySmall>
            <Caption
              style={[
                styles.optionSubtitle,
                {
                  color:
                    colorScheme === 'dark'
                      ? Colors.neutral.gray[300]
                      : Colors.neutral.gray[600],
                },
              ]}
            >
              {option.subtitle}
            </Caption>
          </View>
        </View>
        <IconSymbol
          name="chevron.right"
          size={16}
          color={Colors.neutral.gray[400]}
        />
      </View>
    </Pressable>
  );

  return (
    <ThemedView
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
    >
      {/* Header */}
      <ThemedView style={styles.header}>
        <Pressable
          style={({ pressed }) => [
            styles.closeButton,
            {
              backgroundColor: pressed
                ? Colors.neutral.gray[200]
                : Colors.neutral.gray[100],
            },
          ]}
          onPress={() => router.dismiss()}
          accessibilityRole="button"
          accessibilityLabel="Close"
        >
          <IconSymbol name="xmark" size={18} color={Colors.neutral.gray[600]} />
        </Pressable>
      </ThemedView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Title Section */}
        <ThemedView style={styles.titleSection}>
          <Heading3 style={[styles.title, { color: textColor }]}>
            {t('order.createOrder')}
          </Heading3>
          <Caption
            style={[
              styles.subtitle,
              {
                color:
                  colorScheme === 'dark'
                    ? Colors.neutral.gray[300]
                    : Colors.neutral.gray[600],
              },
            ]}
          >
            {t('order.subtitle')}
          </Caption>
        </ThemedView>

        {/* Pro Tip - Keeping as is */}
        <ThemedView style={styles.proTipContainer}>
          <ThemedView style={styles.proTipContent}>
            <IconSymbol
              name="lightbulb.fill"
              size={16}
              color={Colors.warning}
            />
            <Caption
              style={[
                styles.proTipText,
                {
                  color:
                    colorScheme === 'dark'
                      ? Colors.neutral.gray[300]
                      : Colors.neutral.gray[600],
                },
              ]}
            >
              <BodySmall style={{ fontWeight: '600', color: Colors.warning }}>
                Pro Tip:{' '}
              </BodySmall>
              {t('order.proTip')}
            </Caption>
          </ThemedView>
        </ThemedView>

        {/* Order Options - Full width cards with spacing */}
        <ThemedView style={styles.optionsContainer}>
          {orderOptions.map(renderOrderOption)}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Spacing['2xl'],
    alignItems: 'flex-start',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['4xl'],
  },
  titleSection: {
    paddingHorizontal: Spacing['2xl'],
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  proTipContainer: {
    marginHorizontal: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
  },
  proTipContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  proTipText: {
    fontSize: 14,
    lineHeight: 18,
    flex: 1,
  },
  optionsContainer: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  optionCard: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.neutral.gray[100],
    ...Shadows.sm,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  optionTextContainer: {
    flex: 1,
    gap: Spacing.xs,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
  optionSubtitle: {
    fontSize: 13,
    lineHeight: 16,
  },
});
