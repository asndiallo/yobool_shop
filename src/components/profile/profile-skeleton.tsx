import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import { StyleSheet, View } from 'react-native';

import React from 'react';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

interface SkeletonBoxProps {
  width: number | string;
  height: number;
  style?: any;
}

const SkeletonBox = React.memo<SkeletonBoxProps>(({ width, height, style }) => {
  const colorScheme = useColorScheme() ?? 'light';
  return (
    <View
      style={[
        {
          width,
          height,
          backgroundColor: Colors[colorScheme].backgroundSecondary,
          borderRadius: BorderRadius.md,
          opacity: 0.6,
        },
        style,
      ]}
    />
  );
});

SkeletonBox.displayName = 'SkeletonBox';

export const ProfileSkeleton = React.memo(() => {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.profileHeader}>
        <SkeletonBox width={100} height={100} style={{ borderRadius: 50 }} />
        <SkeletonBox
          width={180}
          height={28}
          style={{ marginTop: Spacing.md }}
        />
      </View>

      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} width={70} height={60} />
        ))}
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, gap: Spacing.lg }}>
        <SkeletonBox width="100%" height={100} />
        <SkeletonBox width="100%" height={160} />
      </View>
    </ThemedView>
  );
});

ProfileSkeleton.displayName = 'ProfileSkeleton';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
});
