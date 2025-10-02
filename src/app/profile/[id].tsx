import * as ImagePicker from 'expo-image-picker';

import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  BodySmall,
  Button,
  Caption,
  Header,
  Heading3,
  Heading4,
  IconSymbol,
} from '@/components/ui';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import React, { useCallback, useState } from 'react';
import { Trip, isAuthenticated } from '@/types';
import { router, useLocalSearchParams } from 'expo-router';
import {
  useDeleteAvatar,
  useProfile,
  useUpdateAvatar,
} from '@/hooks/use-profile';

import { ThemedView } from '@/components/themed-view';
import { extractRelationshipData } from '@/utils/json-api';
import { useAuthHook } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

// ============================================================================
// LOCALE MAPPING
// ============================================================================

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatDate = (dateString: string, language: string = 'en'): string => {
  try {
    const bcp47Locale = LOCALE_MAP[language] || 'en-US';
    return new Date(dateString).toLocaleDateString(bcp47Locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

const formatShortDate = (
  dateString: string,
  language: string = 'en'
): string => {
  try {
    const bcp47Locale = LOCALE_MAP[language] || 'en-US';
    return new Date(dateString).toLocaleDateString(bcp47Locale, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};

// ============================================================================
// SKELETON LOADING COMPONENT
// ============================================================================

const SkeletonBox = ({
  width,
  height,
  style,
}: {
  width: number | string;
  height: number;
  style?: any;
}) => {
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
};

const ProfileSkeleton = () => {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.profileHeader}>
        <SkeletonBox width={120} height={120} style={{ borderRadius: 60 }} />
        <SkeletonBox
          width={200}
          height={32}
          style={{ marginTop: Spacing.md }}
        />
        <SkeletonBox
          width={100}
          height={20}
          style={{ marginTop: Spacing.xs }}
        />
      </View>

      <View style={styles.statsContainer}>
        {[1, 2, 3].map((i) => (
          <SkeletonBox key={i} width="30%" height={100} />
        ))}
      </View>

      <View style={{ paddingHorizontal: Spacing.lg, gap: Spacing.lg }}>
        <SkeletonBox width="100%" height={120} />
        <SkeletonBox width="100%" height={180} />
      </View>
    </ThemedView>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { authState } = useAuthHook();

  // Optimistic avatar state
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);

  // Determine if viewing own profile
  const currentUserId = isAuthenticated(authState) ? authState.user.id : null;
  const isOwnProfile = currentUserId === id;

  // Fetch profile data with optimized staleTime
  const {
    data: profileData,
    isLoading,
    error,
  } = useProfile(id, {
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateAvatarMutation = useUpdateAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  const profile = profileData?.data;

  // Extract upcoming trips - server already filters, no need to filter again
  const upcomingTrips =
    profile?.relationships?.trips?.data && profileData?.included
      ? extractRelationshipData<Trip>(
          profileData.included,
          profile.relationships.trips.data,
          'trip'
        ).slice(0, 3)
      : [];

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleImagePick = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t('profile.permissions') || 'Permission Required',
        t('profile.permissionsMessage') ||
          'We need photo library access to update your avatar',
        [{ text: t('common.ok') || 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];

      // Validate file size (max 5MB)
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert(
          t('common.error') || 'Error',
          'Image is too large. Please select an image under 5MB.'
        );
        return;
      }

      // Optimistic update
      setOptimisticAvatar(asset.uri);

      const formData = new FormData();
      formData.append('avatar', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      try {
        await updateAvatarMutation.mutateAsync(formData);
        // Success - optimistic state will be replaced by server data
      } catch (error) {
        // Rollback optimistic update
        setOptimisticAvatar(null);
        console.error('Error updating avatar:', error);
        Alert.alert(
          t('common.error') || 'Error',
          'Failed to update avatar. Please try again.'
        );
      }
    }
  }, [t, updateAvatarMutation]);

  const handleDeleteAvatar = useCallback(async () => {
    if (!id) return;

    // Optimistic update
    setOptimisticAvatar(null);

    try {
      await deleteAvatarMutation.mutateAsync(id);
      // Success
    } catch (error) {
      // Rollback - restore original avatar
      setOptimisticAvatar(profile?.attributes.avatar_url || null);
      console.error('Error deleting avatar:', error);
      Alert.alert(
        t('common.error') || 'Error',
        'Failed to delete avatar. Please try again.'
      );
    }
  }, [id, profile?.attributes.avatar_url, deleteAvatarMutation, t]);

  const handleAvatarPress = useCallback(() => {
    if (!isOwnProfile) return;

    const hasAvatar = optimisticAvatar || profile?.attributes.avatar_url;

    Alert.alert(
      t('profile.changeAvatar') || 'Change Avatar',
      '',
      [
        {
          text: t('profile.choosePhoto') || 'Choose Photo',
          onPress: handleImagePick,
        },
        hasAvatar
          ? {
              text: t('profile.removePhoto') || 'Remove Photo',
              style: 'destructive',
              onPress: () => {
                Alert.alert(
                  t('profile.deleteAvatar') || 'Delete Avatar',
                  t('profile.deleteAvatarConfirm') ||
                    'Are you sure you want to remove your avatar?',
                  [
                    { text: t('common.cancel') || 'Cancel', style: 'cancel' },
                    {
                      text: t('common.delete') || 'Delete',
                      style: 'destructive',
                      onPress: handleDeleteAvatar,
                    },
                  ]
                );
              },
            }
          : null,
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
      ].filter(Boolean) as any
    );
  }, [
    isOwnProfile,
    optimisticAvatar,
    profile?.attributes.avatar_url,
    t,
    handleImagePick,
    handleDeleteAvatar,
  ]);

  const handleSettingsPress = useCallback(() => {
    router.push('/profile/edit');
  }, []);

  const handleTripPress = useCallback((trip: Trip) => {
    // TODO: Navigate to trip details instead of alert
    // router.push(`/trips/${trip.id}`);
    console.log('Trip pressed:', trip.id);
  }, []);

  const handleMessagePress = useCallback(() => {
    if (!profile) return;
    // TODO: Implement messaging functionality
    // router.push(`/messages/${profile.id}`);
    console.log('Message user:', profile.id);
  }, [profile]);

  const handleReportPress = useCallback(() => {
    if (!profile) return;
    Alert.alert(
      t('profile.report') || 'Report User',
      t('profile.reportUser') || 'Are you sure you want to report this user?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('profile.report') || 'Report',
          style: 'destructive',
          onPress: () => {
            // TODO: Implement report functionality
            console.log('Report user:', profile.id);
          },
        },
      ]
    );
  }, [profile, t]);

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  if (isLoading || !profile) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Header
          title={t('profile.title') || 'Profile'}
          showBackButton
          onBackPress={() => router.back()}
        />
        {error ? (
          <View style={styles.errorContainer}>
            <IconSymbol
              name="exclamationmark.triangle"
              size={48}
              color={Colors.danger}
            />
            <BodySmall style={[styles.errorText, { color: textColor }]}>
              {t('profile.loadError') || 'Failed to load profile'}
            </BodySmall>
            <Button variant="primary" onPress={() => router.back()}>
              {t('common.goBack') || 'Go Back'}
            </Button>
          </View>
        ) : (
          <ProfileSkeleton />
        )}
      </ThemedView>
    );
  }

  const statsData = [
    {
      label: t('profile.score') || 'Score',
      value: profile.attributes.yobool_score?.toFixed(0) || '75',
      sublabel: '/100',
      icon: 'star.fill' as const,
      color: Colors.warning,
    },
    {
      label: t('profile.deliveries') || 'Deliveries',
      value: profile.attributes.successful_deliveries || 0,
      icon: 'checkmark.circle.fill' as const,
      color: Colors.success,
    },
    {
      label: t('profile.rating') || 'Rating',
      value: profile.attributes.average_rating?.toFixed(1) || '-',
      sublabel: profile.attributes.average_rating ? '/5.0' : '',
      icon: 'heart.fill' as const,
      color: Colors.danger,
      badge: profile.attributes.reviews_count
        ? `${profile.attributes.reviews_count} ${
            t('profile.reviews') || 'reviews'
          }`
        : undefined,
    },
  ];

  const infoItems = [
    {
      icon: 'envelope.fill' as const,
      label: t('profile.email') || 'Email',
      value: profile.attributes.email,
      visible: isOwnProfile && profile.attributes.email,
    },
    {
      icon: 'phone.fill' as const,
      label: t('profile.phone') || 'Phone',
      value:
        profile.attributes.phone_number || t('profile.notSet') || 'Not set',
      visible: isOwnProfile || profile.attributes.phone_number,
    },
    {
      icon: 'location.fill' as const,
      label: t('profile.country') || 'Country',
      value: profile.attributes.country || t('profile.notSet') || 'Not set',
      visible: true,
    },
    {
      icon: 'calendar' as const,
      label: t('profile.memberSince') || 'Member Since',
      value: profile.attributes.member_since
        ? formatDate(profile.attributes.member_since, language)
        : '-',
      visible: true,
    },
    {
      icon: 'gift.fill' as const,
      label: t('profile.birthday') || 'Birthday',
      value: profile.attributes.birthday
        ? formatDate(profile.attributes.birthday, language)
        : t('profile.notSet') || 'Not set',
      visible: isOwnProfile,
    },
    {
      icon: 'person.2.fill' as const,
      label: t('profile.referrals') || 'Referrals',
      value: `${profile.attributes.referred_users_count || 0} ${
        t('profile.users') || 'users'
      }`,
      visible:
        isOwnProfile && profile.attributes.referred_users_count !== undefined,
    },
  ].filter((item) => item.visible);

  const verificationBadges = [];
  if (profile.attributes.is_verified) {
    verificationBadges.push({
      icon: 'checkmark.seal.fill' as const,
      label: t('profile.verified') || 'Verified',
      color: Colors.success,
    });
  }
  if (profile.attributes.can_accept_bookings) {
    verificationBadges.push({
      icon: 'creditcard.fill' as const,
      label: t('profile.canAcceptBookings') || 'Can Accept Bookings',
      color: Colors.primary,
    });
  }

  const displayAvatar = optimisticAvatar || profile.attributes.avatar_url;
  const bio = profile.attributes.bio || t('profile.noBio') || 'No bio yet';

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      <Header
        title={
          isOwnProfile
            ? t('profile.myProfile') || 'My Profile'
            : profile.attributes.full_name
        }
        showBackButton
        onBackPress={() => router.back()}
        rightElement={
          isOwnProfile ? (
            <Pressable
              onPress={handleSettingsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Settings"
              accessibilityRole="button"
            >
              <IconSymbol name="gear" size={24} color={textColor} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Profile Header */}
      <ThemedView style={styles.profileHeader}>
        <Pressable
          onPress={handleAvatarPress}
          disabled={!isOwnProfile}
          accessibilityLabel={
            isOwnProfile ? 'Change profile picture' : 'Profile picture'
          }
          accessibilityRole="button"
        >
          <View style={styles.avatarContainer}>
            {displayAvatar ? (
              <Image
                source={{ uri: displayAvatar }}
                style={styles.avatar}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: Colors[colorScheme].backgroundSecondary },
                ]}
              >
                <IconSymbol
                  name="person.fill"
                  size={64}
                  color={Colors.neutral.gray[400]}
                />
              </View>
            )}
            {isOwnProfile && (
              <View style={styles.editBadge}>
                <IconSymbol
                  name="camera.fill"
                  size={16}
                  color={Colors.neutral.white}
                />
              </View>
            )}
          </View>
        </Pressable>

        <Heading3 style={[styles.name, { color: textColor }]}>
          {profile.attributes.full_name}
        </Heading3>

        {verificationBadges.length > 0 && (
          <View style={styles.badgesContainer}>
            {verificationBadges.map((badge, index) => (
              <View
                key={index}
                style={[styles.badge, { backgroundColor: `${badge.color}15` }]}
              >
                <IconSymbol name={badge.icon} size={14} color={badge.color} />
                <Caption
                  style={{
                    color: badge.color,
                    marginLeft: 4,
                    fontWeight: '600',
                  }}
                >
                  {badge.label}
                </Caption>
              </View>
            ))}
          </View>
        )}
      </ThemedView>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {statsData.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].backgroundSecondary },
            ]}
          >
            <View
              style={[
                styles.statIconBg,
                { backgroundColor: `${stat.color}15` },
              ]}
            >
              <IconSymbol name={stat.icon} size={24} color={stat.color} />
            </View>
            <View style={styles.statContent}>
              <View style={styles.statValueRow}>
                <Heading3 style={{ color: textColor }}>{stat.value}</Heading3>
                {stat.sublabel && (
                  <Caption style={[styles.statSublabel, { color: textColor }]}>
                    {stat.sublabel}
                  </Caption>
                )}
              </View>
              <Caption style={[styles.statLabel, { color: textColor }]}>
                {stat.label}
              </Caption>
              {stat.badge && (
                <Caption
                  style={[
                    styles.statBadge,
                    { backgroundColor: `${stat.color}20` },
                  ]}
                >
                  {stat.badge}
                </Caption>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Bio Section */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <Heading4 style={{ color: textColor }}>
            {t('profile.bio') || 'Bio'}
          </Heading4>
          {isOwnProfile && (
            <Pressable
              onPress={handleSettingsPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel="Edit bio"
              accessibilityRole="button"
            >
              <IconSymbol name="pencil" size={18} color={Colors.primary} />
            </Pressable>
          )}
        </View>
        <View
          style={[
            styles.card,
            { backgroundColor: Colors[colorScheme].backgroundSecondary },
          ]}
        >
          <BodySmall style={[styles.bioText, { color: textColor }]}>
            {bio}
          </BodySmall>
        </View>
      </ThemedView>

      {/* Info Section */}
      <ThemedView style={styles.section}>
        <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
          {t('profile.information') || 'Information'}
        </Heading4>
        <View
          style={[
            styles.card,
            { backgroundColor: Colors[colorScheme].backgroundSecondary },
          ]}
        >
          {infoItems.map((item, index) => (
            <View
              key={index}
              style={[
                styles.infoRow,
                index < infoItems.length - 1 && {
                  borderBottomWidth: Math.max(StyleSheet.hairlineWidth, 0.5),
                  borderBottomColor: Colors[colorScheme].border,
                },
              ]}
            >
              <View style={styles.infoLeft}>
                <View
                  style={[
                    styles.infoIconBg,
                    { backgroundColor: Colors[colorScheme].background },
                  ]}
                >
                  <IconSymbol
                    name={item.icon}
                    size={18}
                    color={Colors.neutral.gray[500]}
                  />
                </View>
                <BodySmall style={[styles.infoLabel, { color: textColor }]}>
                  {item.label}
                </BodySmall>
              </View>
              <BodySmall
                style={[styles.infoValue, { color: textColor }]}
                numberOfLines={1}
              >
                {item.value}
              </BodySmall>
            </View>
          ))}
        </View>
      </ThemedView>

      {/* Upcoming Trips */}
      {upcomingTrips.length > 0 && (
        <ThemedView style={styles.section}>
          <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
            {t('profile.upcomingTrips') || 'Upcoming Trips'}
          </Heading4>
          <View style={styles.tripsContainer}>
            {upcomingTrips.map((trip) => (
              <Pressable
                key={trip.id}
                style={[
                  styles.tripCard,
                  { backgroundColor: Colors[colorScheme].backgroundSecondary },
                ]}
                onPress={() => handleTripPress(trip)}
                accessibilityLabel={`Trip from ${trip.attributes.route_info?.departure_city} to ${trip.attributes.route_info?.destination_city}`}
                accessibilityRole="button"
              >
                <View style={styles.tripHeader}>
                  <View
                    style={[
                      styles.tripStatusBadge,
                      {
                        backgroundColor:
                          trip.attributes.status === 'active'
                            ? `${Colors.success}20`
                            : `${Colors.primary}20`,
                      },
                    ]}
                  >
                    <Caption
                      style={{
                        color:
                          trip.attributes.status === 'active'
                            ? Colors.success
                            : Colors.primary,
                        fontWeight: '600',
                        textTransform: 'capitalize',
                      }}
                    >
                      {trip.attributes.status}
                    </Caption>
                  </View>
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={Colors.neutral.gray[400]}
                  />
                </View>

                <View style={styles.tripRoute}>
                  <View style={styles.tripLocation}>
                    <IconSymbol
                      name="airplane.departure"
                      size={20}
                      color={Colors.primary}
                    />
                    <View style={styles.tripLocationText}>
                      <BodySmall
                        style={[styles.tripCity, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {trip.attributes.route_info?.departure_city}
                      </BodySmall>
                      <Caption style={{ color: textColor, opacity: 0.6 }}>
                        {formatShortDate(
                          trip.attributes.departure_at,
                          language
                        )}
                      </Caption>
                    </View>
                  </View>

                  <IconSymbol
                    name="arrow.right"
                    size={20}
                    color={Colors.neutral.gray[400]}
                  />

                  <View style={styles.tripLocation}>
                    <IconSymbol
                      name="airplane.arrival"
                      size={20}
                      color={Colors.success}
                    />
                    <View style={styles.tripLocationText}>
                      <BodySmall
                        style={[styles.tripCity, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {trip.attributes.route_info?.destination_city}
                      </BodySmall>
                      <Caption style={{ color: textColor, opacity: 0.6 }}>
                        {formatShortDate(trip.attributes.arrival_at, language)}
                      </Caption>
                    </View>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </ThemedView>
      )}

      {/* Action Buttons */}
      <ThemedView style={styles.actionButtons}>
        {!isOwnProfile ? (
          <View style={styles.actionRow}>
            <Button
              variant="primary"
              style={styles.actionButton}
              onPress={handleMessagePress}
            >
              {t('profile.message') || 'Message'}
            </Button>
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={handleReportPress}
            >
              {t('profile.report') || 'Report'}
            </Button>
          </View>
        ) : (
          <>
            <Button variant="primary" onPress={handleSettingsPress}>
              {t('profile.editProfile') || 'Edit Profile'}
            </Button>
            {profile.attributes.referral_code && (
              <View style={styles.referralContainer}>
                <BodySmall style={{ color: textColor, opacity: 0.7 }}>
                  {t('profile.yourReferralCode') || 'Your Referral Code'}
                </BodySmall>
                <Pressable
                  style={[
                    styles.referralCode,
                    {
                      backgroundColor: Colors[colorScheme].backgroundSecondary,
                    },
                  ]}
                  onPress={() => {
                    Alert.alert(
                      t('profile.referralCode') || 'Referral Code',
                      profile.attributes.referral_code!
                    );
                  }}
                  accessibilityLabel="Copy referral code"
                  accessibilityRole="button"
                >
                  <Heading4 style={{ color: Colors.primary }}>
                    {profile.attributes.referral_code}
                  </Heading4>
                  <IconSymbol
                    name="doc.on.doc"
                    size={20}
                    color={Colors.primary}
                  />
                </Pressable>
              </View>
            )}
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  errorText: {
    textAlign: 'center',
    opacity: 0.7,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.md,
  },
  name: {
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  statContent: {
    alignItems: 'center',
    width: '100%',
  },
  statValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.xs,
  },
  statSublabel: {
    fontSize: 12,
    opacity: 0.5,
    marginLeft: 2,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
  },
  statBadge: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    fontSize: 10,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  bioText: {
    lineHeight: 22,
    opacity: 0.8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoLabel: {
    opacity: 0.7,
    flex: 1,
  },
  infoValue: {
    fontWeight: '600',
    maxWidth: '45%',
    textAlign: 'right',
  },
  tripsContainer: {
    gap: Spacing.md,
  },
  tripCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  tripStatusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  tripLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  tripLocationText: {
    flex: 1,
  },
  tripCity: {
    fontWeight: '600',
    marginBottom: 2,
  },
  actionButtons: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  referralContainer: {
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  referralCode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
});
