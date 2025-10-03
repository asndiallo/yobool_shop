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
import type { DeepPartial, EntityId, UserAttributes, UserId } from '@/types';
import { EditableField, EditableSection } from '@/components/profile/';
import React, { useCallback, useState } from 'react';
import { Trip, User, isAuthenticated } from '@/types';
import { extractRelationshipData, findIncluded } from '@/utils/json-api';
import { router, useLocalSearchParams } from 'expo-router';
import {
  useDeleteAvatar,
  useProfile,
  useUpdateAvatar,
  useUpdateProfile,
} from '@/hooks/use-profile';
import { useProfileReviews, useVoteOnReview } from '@/hooks/use-reviews';

import { ThemedView } from '@/components/themed-view';
import { useAuthState } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  fr: 'fr-FR',
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
};

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { state: authState } = useAuthState();

  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);

  const currentUserId = isAuthenticated(authState) ? authState.user.id : null;
  const isOwnProfile = currentUserId === id;

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
  const updateProfileMutation = useUpdateProfile();

  const profile = profileData?.data;

  const { data: reviewsData } = useProfileReviews(id as UserId);
  const voteOnReviewMutation = useVoteOnReview(id as UserId);

  const upcomingTrips =
    profile?.relationships?.trips?.data && profileData?.included
      ? extractRelationshipData<Trip>(
          profileData.included,
          profile.relationships.trips.data,
          'trip'
        ).slice(0, 3)
      : [];

  const reviews = reviewsData?.data
    ? [...reviewsData.data].sort((a, b) => {
        return b.attributes.vote_count - a.attributes.vote_count;
      })
    : [];

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

      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        Alert.alert(
          t('common.error') || 'Error',
          'Image is too large. Please select an image under 5MB.'
        );
        return;
      }

      setOptimisticAvatar(asset.uri);

      const formData = new FormData();
      formData.append('user[avatar]', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      try {
        await updateAvatarMutation.mutateAsync(formData);
      } catch (error) {
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

    setOptimisticAvatar(null);

    try {
      await deleteAvatarMutation.mutateAsync(id);
    } catch (error) {
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
    router.push('/profile/settings');
  }, []);

  const handleFieldUpdate = useCallback(
    async (field: keyof UserAttributes, value: string) => {
      if (!id) return;

      const updates: DeepPartial<UserAttributes> = {
        [field]: value,
      };

      await updateProfileMutation.mutateAsync({ id, data: updates });
    },
    [id, updateProfileMutation]
  );

  const handleTripPress = useCallback((trip: Trip) => {
    console.log('Trip pressed:', trip.id);
  }, []);

  const handleMessagePress = useCallback(() => {
    if (!profile) return;
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
            console.log('Report user:', profile.id);
          },
        },
      ]
    );
  }, [profile, t]);

  const handleVoteReview = useCallback(
    async (reviewId: EntityId) => {
      try {
        await voteOnReviewMutation.mutateAsync(reviewId);
      } catch (error) {
        console.error('Error voting on review:', error);
      }
    },
    [voteOnReviewMutation]
  );

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

  const displayAvatar = optimisticAvatar || profile.attributes.avatar_url;

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
              <IconSymbol name="gearshape.fill" size={24} color={textColor} />
            </Pressable>
          ) : undefined
        }
      />

      {/* Compact Profile Header */}
      <ThemedView style={styles.profileHeader}>
        <View style={styles.headerRow}>
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
            <Heading3 style={[styles.name, { color: textColor }]}>
              {profile.attributes.full_name}
            </Heading3>

            <View style={styles.metaRow}>
              {profile.attributes.is_verified && (
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

              {profile.attributes.country && (
                <>
                  <Caption
                    style={[
                      styles.metaText,
                      { color: Colors.neutral.gray[500] },
                    ]}
                  >
                    {profile.attributes.country}
                  </Caption>
                  <View style={styles.metaDot} />
                </>
              )}

              <Caption
                style={[styles.metaText, { color: Colors.neutral.gray[500] }]}
              >
                {t('profile.memberSince') || 'Member Since'}{' '}
                {new Date(profile.attributes.member_since).getFullYear()}
              </Caption>
            </View>
          </View>
        </View>
      </ThemedView>

      {/* Inline Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Heading4 style={{ color: textColor }}>
            {profile.attributes.yobool_score?.toFixed(0) || '75'}
          </Heading4>
          <Caption style={[styles.statLabel, { color: textColor }]}>
            {t('profile.score') || 'Score'}
          </Caption>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Heading4 style={{ color: textColor }}>
            {profile.attributes.successful_deliveries || 0}
          </Heading4>
          <Caption style={[styles.statLabel, { color: textColor }]}>
            {t('profile.deliveries') || 'Deliveries'}
          </Caption>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statItem}>
          <Heading4 style={{ color: textColor }}>
            {profile.attributes.average_rating?.toFixed(1) || '-'}
          </Heading4>
          <Caption style={[styles.statLabel, { color: textColor }]}>
            {t('profile.rating') || 'Rating'}
          </Caption>
        </View>
      </View>

      {/* Bio Section */}
      {(isOwnProfile || profile.attributes.bio) && (
        <ThemedView style={styles.section}>
          <View
            style={[
              styles.card,
              { backgroundColor: Colors[colorScheme].backgroundSecondary },
            ]}
          >
            <EditableField
              label={t('profile.bio') || 'Bio'}
              value={profile.attributes.bio || ''}
              onSave={(value) => handleFieldUpdate('bio', value)}
              placeholder={
                t('profile.bioPlaceholder') || 'Tell us about yourself'
              }
              editable={isOwnProfile}
              multiline
              numberOfLines={3}
            />
          </View>
        </ThemedView>
      )}

      {/* Info Section - Streamlined */}
      <ThemedView style={styles.section}>
        <EditableSection
          title={t('profile.information') || 'Information'}
          editable={isOwnProfile}
        >
          {(isEditMode) => (
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              <EditableField
                label={t('profile.firstName') || 'First Name'}
                value={profile.attributes.first_name || ''}
                onSave={(value) => handleFieldUpdate('first_name', value)}
                placeholder={
                  t('profile.firstNamePlaceholder') || 'Enter first name'
                }
                editable={isEditMode}
                autoCapitalize="words"
                rules={{
                  required:
                    t('validation.firstNameRequired') ||
                    'First name is required',
                  minLength: {
                    value: 2,
                    message:
                      t('validation.firstNameMinLength') ||
                      'Minimum 2 characters',
                  },
                }}
              />
              <View style={styles.divider} />

              <EditableField
                label={t('profile.lastName') || 'Last Name'}
                value={profile.attributes.last_name || ''}
                onSave={(value) => handleFieldUpdate('last_name', value)}
                placeholder={
                  t('profile.lastNamePlaceholder') || 'Enter last name'
                }
                editable={isEditMode}
                autoCapitalize="words"
                rules={{
                  required:
                    t('validation.lastNameRequired') || 'Last name is required',
                  minLength: {
                    value: 2,
                    message:
                      t('validation.lastNameMinLength') ||
                      'Minimum 2 characters',
                  },
                }}
              />

              {(isOwnProfile || profile.attributes.phone_number) && (
                <>
                  <View style={styles.divider} />
                  <EditableField
                    label={t('profile.phone') || 'Phone'}
                    value={profile.attributes.phone_number || ''}
                    onSave={(value) => handleFieldUpdate('phone_number', value)}
                    placeholder={
                      t('profile.phonePlaceholder') || 'Enter phone number'
                    }
                    editable={isEditMode}
                    keyboardType="phone-pad"
                    rules={{
                      pattern: {
                        value:
                          /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                        message:
                          t('validation.phoneInvalid') ||
                          'Invalid phone number',
                      },
                    }}
                  />
                </>
              )}

              <View style={styles.divider} />

              <EditableField
                label={t('profile.country') || 'Country'}
                value={profile.attributes.country || ''}
                onSave={(value) => handleFieldUpdate('country', value)}
                placeholder={t('profile.countryPlaceholder') || 'Enter country'}
                editable={isEditMode}
                autoCapitalize="words"
                rules={{
                  required:
                    t('validation.countryRequired') || 'Country is required',
                }}
              />
            </View>
          )}
        </EditableSection>
      </ThemedView>

      {/* Compact Trip Cards */}
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
                <View style={styles.tripContent}>
                  <View style={styles.tripRoute}>
                    <View style={styles.cityBlock}>
                      <BodySmall
                        style={[styles.cityName, { color: textColor }]}
                      >
                        {trip.attributes.route_info?.departure_city}
                      </BodySmall>
                      <Caption style={{ color: Colors.neutral.gray[500] }}>
                        {formatShortDate(
                          trip.attributes.departure_at,
                          language
                        )}
                      </Caption>
                    </View>

                    <IconSymbol
                      name="arrow.right"
                      size={16}
                      color={Colors.neutral.gray[400]}
                    />

                    <View style={styles.cityBlock}>
                      <BodySmall
                        style={[styles.cityName, { color: textColor }]}
                      >
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
            ))}
          </View>
        </ThemedView>
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <ThemedView style={styles.section}>
          <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
            {t('profile.reviews') || 'Reviews'} ({reviews.length})
          </Heading4>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.reviewsScrollContent}
            style={styles.reviewsScroll}
          >
            {reviews.map((review) => {
              const reviewer = review.relationships?.reviewer?.data
                ? ((profileData?.included
                    ? findIncluded<User>(
                        profileData.included,
                        review.relationships.reviewer.data.type,
                        review.relationships.reviewer.data.id
                      )
                    : undefined) as User | undefined)
                : undefined;

              return (
                <View
                  key={review.id}
                  style={[
                    styles.reviewCard,
                    {
                      backgroundColor: Colors[colorScheme].backgroundSecondary,
                    },
                  ]}
                >
                  <View style={styles.reviewHeader}>
                    <View style={styles.reviewerInfo}>
                      {reviewer && (
                        <>
                          {reviewer.attributes.avatar_url ? (
                            <Image
                              source={{ uri: reviewer.attributes.avatar_url }}
                              style={styles.reviewerAvatar}
                              accessibilityIgnoresInvertColors
                            />
                          ) : (
                            <View
                              style={[
                                styles.reviewerAvatarPlaceholder,
                                {
                                  backgroundColor:
                                    Colors[colorScheme].background,
                                },
                              ]}
                            >
                              <IconSymbol
                                name="person.fill"
                                size={16}
                                color={Colors.neutral.gray[400]}
                              />
                            </View>
                          )}
                          <View style={styles.reviewerDetails}>
                            <BodySmall
                              style={[
                                styles.reviewerName,
                                { color: textColor },
                              ]}
                            >
                              {reviewer.attributes.first_name}
                            </BodySmall>
                            <Caption
                              style={{ color: Colors.neutral.gray[500] }}
                            >
                              {formatShortDate(
                                review.attributes.created_at,
                                language
                              )}
                            </Caption>
                          </View>
                        </>
                      )}
                    </View>

                    <View style={styles.ratingContainer}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <IconSymbol
                          key={index}
                          name={
                            index < review.attributes.rating
                              ? 'star.fill'
                              : 'star'
                          }
                          size={14}
                          color={
                            index < review.attributes.rating
                              ? Colors.warning
                              : Colors.neutral.gray[300]
                          }
                        />
                      ))}
                    </View>
                  </View>

                  {review.attributes.text && (
                    <BodySmall
                      style={[styles.reviewComment, { color: textColor }]}
                      numberOfLines={4}
                    >
                      {review.attributes.text}
                    </BodySmall>
                  )}

                  <Pressable
                    style={styles.helpfulButton}
                    onPress={() => handleVoteReview(review.id)}
                    disabled={voteOnReviewMutation.isPending}
                    accessibilityLabel="Mark review as helpful"
                    accessibilityRole="button"
                  >
                    <IconSymbol
                      name="hand.thumbsup"
                      size={13}
                      color={Colors.neutral.gray[500]}
                    />
                    <Caption style={{ color: Colors.neutral.gray[500] }}>
                      {t('profile.helpful') || 'Helpful'} (
                      {review.attributes.votes_count})
                    </Caption>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>
        </ThemedView>
      )}

      {/* Action Buttons */}
      {!isOwnProfile && (
        <ThemedView style={styles.actionButtons}>
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
        </ThemedView>
      )}

      {/* Referral Code for Own Profile */}
      {isOwnProfile && profile.attributes.referral_code && (
        <ThemedView style={styles.referralSection}>
          <Caption
            style={{
              color: Colors.neutral.gray[500],
              marginBottom: Spacing.xs,
            }}
          >
            {t('profile.yourReferralCode') || 'Your Referral Code'}
          </Caption>
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
            <IconSymbol name="doc.on.doc" size={18} color={Colors.primary} />
          </Pressable>
        </ThemedView>
      )}
    </ScrollView>
  );
}

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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
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
  badgesContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  badgeChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: `${Colors.success}20`,
    justifyContent: 'center',
    alignItems: 'center',
  },
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
  section: {
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.neutral.gray[200],
    marginVertical: Spacing.sm,
  },
  tripsContainer: {
    gap: Spacing.sm,
  },
  tripCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  tripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tripRoute: {
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
  actionButtons: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  referralSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  referralCode: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    ...Shadows.sm,
  },
  reviewsScroll: {
    marginHorizontal: -Spacing.lg,
  },
  reviewsScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  reviewCard: {
    width: 280,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
    ...Shadows.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    flex: 1,
  },
  reviewerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  reviewerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerDetails: {
    flex: 1,
    gap: 2,
  },
  reviewerName: {
    fontWeight: '600',
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    lineHeight: 20,
    fontSize: 14,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.neutral.gray[200],
  },
});
