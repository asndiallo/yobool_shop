import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import {
  BodySmall,
  Button,
  Caption,
  Header,
  Heading4,
  IconSymbol,
} from '@/components/ui';
import { BorderRadius, Colors, Spacing } from '@/constants/theme';
import type { DeepPartial, EntityId, UserAttributes, UserId } from '@/types';
import {
  EditableField,
  EditableSection,
  ProfileHeader,
  ProfileSkeleton,
  ProfileStats,
  ReviewCard,
  TripCard,
} from '@/components/profile/';
import React, { useCallback } from 'react';
import { Trip, User, isAuthenticated } from '@/types';
import { extractRelationshipData, findIncluded } from '@/utils/json-api';
import { router, useLocalSearchParams } from 'expo-router';
import { useProfile, useUpdateProfile } from '@/hooks/use-profile';
import { useProfileReviews, useVoteOnReview } from '@/hooks/use-reviews';

import { ThemedView } from '@/components/themed-view';
import { useAuthState } from '@/contexts/AuthContext';
import { useAvatar } from '@/hooks/use-avatar';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

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

  const updateProfileMutation = useUpdateProfile();
  const profile = profileData?.data;

  const { displayAvatar, handleAvatarPress } = useAvatar({
    userId: id as UserId,
    currentAvatarUrl: profile?.attributes.avatar_url,
  });

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

      <ThemedView style={styles.profileHeaderSection}>
        <ProfileHeader
          user={profile}
          avatarUrl={displayAvatar}
          isOwnProfile={isOwnProfile}
          onAvatarPress={isOwnProfile ? handleAvatarPress : undefined}
        />
      </ThemedView>

      <ProfileStats user={profile} />

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

      {upcomingTrips.length > 0 && (
        <ThemedView style={styles.section}>
          <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
            {t('profile.upcomingTrips') || 'Upcoming Trips'}
          </Heading4>
          <View style={styles.tripsContainer}>
            {upcomingTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                language={language}
                onPress={handleTripPress}
              />
            ))}
          </View>
        </ThemedView>
      )}

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
                <ReviewCard
                  key={review.id}
                  review={review}
                  reviewer={reviewer}
                  language={language}
                  onVote={handleVoteReview}
                  isVoting={voteOnReviewMutation.isPending}
                />
              );
            })}
          </ScrollView>
        </ThemedView>
      )}

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
  profileHeaderSection: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
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
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.neutral.gray[200],
    marginVertical: Spacing.sm,
  },
  tripsContainer: {
    gap: Spacing.sm,
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
  },
  reviewsScroll: {
    marginHorizontal: -Spacing.lg,
  },
  reviewsScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
});
