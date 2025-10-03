import { Caption, Heading3, IconSymbol } from '@/components/ui';
import { Colors, Shadows, Spacing } from '@/constants/theme';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { countryCodeToFlag, getYear } from '@/utils';

import React from 'react';
import type { User } from '@/types';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTranslation } from '@/hooks/use-translation';

interface ProfileHeaderProps {
  user: User;
  avatarUrl: string | null;
  isOwnProfile: boolean;
  onAvatarPress?: () => void;
}

export const ProfileHeader = React.memo<ProfileHeaderProps>(
  ({ user, avatarUrl, isOwnProfile, onAvatarPress }) => {
    const { t } = useTranslation();
    const colorScheme = useColorScheme() ?? 'light';

    return (
      <View style={styles.headerRow}>
        <Pressable
          onPress={onAvatarPress}
          disabled={!isOwnProfile}
          accessibilityLabel={
            isOwnProfile ? 'Change profile picture' : 'Profile picture'
          }
          accessibilityRole="button"
        >
          <View style={styles.avatarContainer}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={styles.avatar}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  {
                    backgroundColor: Colors[colorScheme].backgroundSecondary,
                  },
                ]}
              >
                <IconSymbol
                  name="person.fill"
                  size={42}
                  color={Colors.neutral.gray[400]}
                />
              </View>
            )}
            {isOwnProfile && (
              <View style={styles.editBadge}>
                <IconSymbol
                  name="camera.fill"
                  size={12}
                  color={Colors.neutral.white}
                />
              </View>
            )}
          </View>
        </Pressable>

        <View style={styles.nameContainer}>
          <Heading3 style={styles.name}>{user.attributes.full_name}</Heading3>

          <View style={styles.metaRow}>
            {user.attributes.is_verified && (
              <>
                <IconSymbol
                  name="checkmark.seal.fill"
                  size={13}
                  color={Colors.success}
                />
                <Caption style={[styles.metaText, { color: Colors.success }]}>
                  {t('profile.verified') || 'Verified'}
                </Caption>
                <View style={styles.metaDot} />
              </>
            )}

            {user.attributes.country && (
              <>
                <Caption
                  style={[styles.metaText, { color: Colors.neutral.gray[500] }]}
                >
                  {countryCodeToFlag(user.attributes.country)}
                </Caption>
                <View style={styles.metaDot} />
              </>
            )}

            <Caption
              style={[styles.metaText, { color: Colors.neutral.gray[500] }]}
            >
              {t('profile.memberSince') || 'Member Since'}{' '}
              {getYear(user.attributes.member_since)}
            </Caption>
          </View>
        </View>
      </View>
    );
  }
);

ProfileHeader.displayName = 'ProfileHeader';

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.sm,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  nameContainer: {
    flex: 1,
    gap: 4,
  },
  name: {
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.neutral.gray[400],
  },
});
