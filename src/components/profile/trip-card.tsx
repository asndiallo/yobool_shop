import { BodySmall, Caption, IconSymbol } from '@/components/ui';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import { Pressable, StyleSheet, View } from 'react-native';

import React from 'react';
import type { Trip } from '@/types';
import { formatShortDate } from '@/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface TripCardProps {
  trip: Trip;
  language?: string;
  onPress?: (trip: Trip) => void;
}

export const TripCard = React.memo<TripCardProps>(
  ({ trip, language = 'en', onPress }) => {
    const colorScheme = useColorScheme() ?? 'light';
    const textColor = useThemeColor({}, 'text');

    return (
      <Pressable
        style={[
          styles.card,
          { backgroundColor: Colors[colorScheme].backgroundSecondary },
        ]}
        onPress={() => onPress?.(trip)}
        accessibilityLabel={`Trip from ${trip.attributes.route_info?.departure_city} to ${trip.attributes.route_info?.destination_city}`}
        accessibilityRole="button"
      >
        <View style={styles.content}>
          <View style={styles.route}>
            <View style={styles.cityBlock}>
              <BodySmall style={[styles.cityName, { color: textColor }]}>
                {trip.attributes.route_info?.departure_city}
              </BodySmall>
              <Caption style={{ color: Colors.neutral.gray[500] }}>
                {formatShortDate(trip.attributes.departure_at, language)}
              </Caption>
            </View>

            <IconSymbol
              name="arrow.right"
              size={16}
              color={Colors.neutral.gray[400]}
            />

            <View style={styles.cityBlock}>
              <BodySmall style={[styles.cityName, { color: textColor }]}>
                {trip.attributes.route_info?.destination_city}
              </BodySmall>
              <Caption style={{ color: Colors.neutral.gray[500] }}>
                {formatShortDate(trip.attributes.arrival_at, language)}
              </Caption>
            </View>
          </View>

          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors.neutral.gray[300]}
          />
        </View>
      </Pressable>
    );
  }
);

TripCard.displayName = 'TripCard';

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  cityBlock: {
    flex: 1,
    gap: 2,
  },
  cityName: {
    fontWeight: '600',
    fontSize: 15,
  },
});
