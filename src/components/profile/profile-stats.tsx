import { Caption, Heading4 } from '@/components/ui';
import { Colors, Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

import React from 'react';
import type { User } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

interface ProfileStatsProps {
  user: User;
}

export const ProfileStats = React.memo<ProfileStatsProps>(({ user }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.statsRow}>
      <View style={styles.statItem}>
        <Heading4>{user.attributes.yobool_score?.toFixed(0) || '75'}</Heading4>
        <Caption style={styles.statLabel}>
          {t('profile.score') || 'Score'}
        </Caption>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Heading4>{user.attributes.successful_deliveries || 0}</Heading4>
        <Caption style={styles.statLabel}>
          {t('profile.deliveries') || 'Deliveries'}
        </Caption>
      </View>

      <View style={styles.statDivider} />

      <View style={styles.statItem}>
        <Heading4>{user.attributes.average_rating?.toFixed(1) || '-'}</Heading4>
        <Caption style={styles.statLabel}>
          {t('profile.rating') || 'Rating'}
        </Caption>
      </View>
    </View>
  );
});

ProfileStats.displayName = 'ProfileStats';

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutral.gray[200],
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
