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
import { router, useLocalSearchParams } from 'expo-router';
import {
  useDeleteAvatar,
  useProfile,
  useUpdateAvatar,
} from '@/hooks/use-profile';

import React from 'react';
import { ThemedView } from '@/components/themed-view';
import { isAuthenticated } from '@/types';
import { useAuthHook } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

export default function ProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { authState } = useAuthHook();

  // Determine if viewing own profile
  const currentUserId = isAuthenticated(authState) ? authState.user.id : null;
  const isOwnProfile = currentUserId === id;

  // Fetch profile data
  const { data: profileData, isLoading, error } = useProfile(id);
  const updateAvatarMutation = useUpdateAvatar();
  const deleteAvatarMutation = useDeleteAvatar();

  const profile = profileData?.data;

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(t('profile.permissions'), t('profile.permissionsMessage'), [
        { text: t('common.ok') },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const formData = new FormData();
      const asset = result.assets[0];

      formData.append('avatar', {
        uri: asset.uri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      try {
        await updateAvatarMutation.mutateAsync(formData);
        Alert.alert(t('profile.success'), t('profile.avatarUpdated'));
      } catch (error) {
        console.error(`Error updating avatar:`, error);
        Alert.alert(t('common.error'), t('profile.avatarUpdateFailed'));
      }
    }
  };

  const handleDeleteAvatar = () => {
    if (!id) return;

    Alert.alert(t('profile.deleteAvatar'), t('profile.deleteAvatarConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAvatarMutation.mutateAsync(id);
            Alert.alert(t('profile.success'), t('profile.avatarDeleted'));
          } catch (error) {
            console.error(`Error deleting avatar:`, error);
            Alert.alert(t('common.error'), t('profile.avatarDeleteFailed'));
          }
        },
      },
    ]);
  };

  const handleAvatarPress = () => {
    if (!isOwnProfile) return;

    Alert.alert(
      t('profile.changeAvatar'),
      '',
      [
        {
          text: t('profile.choosePhoto'),
          onPress: handleImagePick,
        },
        profile?.attributes.avatar_url
          ? {
              text: t('profile.removePhoto'),
              style: 'destructive',
              onPress: handleDeleteAvatar,
            }
          : null,
        { text: t('common.cancel'), style: 'cancel' },
      ].filter(Boolean) as any
    );
  };

  const renderStats = () => {
    const stats = [
      {
        label: t('profile.score'),
        value: profile?.attributes.yobool_score?.toFixed(1) || '-',
        icon: 'star.fill' as const,
      },
      {
        label: t('profile.deliveries'),
        value: profile?.attributes.successful_deliveries || 0,
        icon: 'checkmark.circle.fill' as const,
      },
      {
        label: t('profile.rating'),
        value: profile?.attributes.average_rating?.toFixed(1) || '-',
        icon: 'heart.fill' as const,
      },
    ];

    return (
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View
            key={index}
            style={[
              styles.statCard,
              { backgroundColor: Colors[colorScheme].backgroundSecondary },
            ]}
          >
            <IconSymbol
              name={stat.icon}
              size={24}
              color={Colors.primary}
              style={styles.statIcon}
            />
            <Heading3 style={{ color: textColor }}>{stat.value}</Heading3>
            <Caption style={[styles.statLabel, { color: textColor }]}>
              {stat.label}
            </Caption>
          </View>
        ))}
      </View>
    );
  };

  const renderInfoSection = () => {
    const infoItems = [
      {
        icon: 'envelope.fill' as const,
        label: t('profile.email'),
        value: profile?.attributes.email,
        visible: isOwnProfile,
      },
      {
        icon: 'phone.fill' as const,
        label: t('profile.phone'),
        value: profile?.attributes.phone_number || t('profile.notSet'),
        visible: true,
      },
      {
        icon: 'location.fill' as const,
        label: t('profile.country'),
        value: profile?.attributes.country || t('profile.notSet'),
        visible: true,
      },
      {
        icon: 'calendar' as const,
        label: t('profile.memberSince'),
        value: profile?.attributes.created_at
          ? new Date(profile.attributes.created_at).toLocaleDateString()
          : '-',
        visible: true,
      },
    ].filter((item) => item.visible);

    return (
      <ThemedView style={styles.section}>
        <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
          {t('profile.information')}
        </Heading4>
        {infoItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.infoRow,
              { borderBottomColor: Colors[colorScheme].border },
            ]}
          >
            <View style={styles.infoLeft}>
              <IconSymbol
                name={item.icon}
                size={20}
                color={Colors.neutral.gray[500]}
              />
              <BodySmall style={[styles.infoLabel, { color: textColor }]}>
                {item.label}
              </BodySmall>
            </View>
            <BodySmall style={[styles.infoValue, { color: textColor }]}>
              {item.value}
            </BodySmall>
          </View>
        ))}
      </ThemedView>
    );
  };

  const renderBioSection = () => {
    const bio = profile?.attributes.bio || t('profile.noBio');

    return (
      <ThemedView style={styles.section}>
        <View style={styles.bioHeader}>
          <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
            {t('profile.bio')}
          </Heading4>
          {isOwnProfile && (
            <Pressable onPress={() => router.push('/profile/edit')}>
              <IconSymbol name="pencil" size={20} color={Colors.primary} />
            </Pressable>
          )}
        </View>
        <BodySmall style={[styles.bioText, { color: textColor }]}>
          {bio}
        </BodySmall>
      </ThemedView>
    );
  };

  const renderActionButtons = () => {
    if (!isOwnProfile) {
      return (
        <ThemedView style={styles.actionButtons}>
          <View style={styles.actionRow}>
            <Button
              variant="primary"
              style={styles.actionButton}
              onPress={() => {
                // Navigate to chat or contact
                Alert.alert(t('profile.contact'), t('profile.contactUser'));
              }}
            >
              {t('profile.message')}
            </Button>
            <Button
              variant="outline"
              style={styles.actionButton}
              onPress={() => {
                // Report user
                Alert.alert(t('profile.report'), t('profile.reportUser'));
              }}
            >
              {t('profile.report')}
            </Button>
          </View>
        </ThemedView>
      );
    }

    return (
      <ThemedView style={styles.actionButtons}>
        <Button variant="primary" onPress={() => router.push('/profile/edit')}>
          {t('profile.editProfile')}
        </Button>
      </ThemedView>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Header
          title={t('profile.title')}
          showBackButton
          onBackPress={() => router.back()}
        />
        <View style={styles.loadingContainer}>
          <BodySmall style={{ color: textColor }}>
            {t('common.loading')}
          </BodySmall>
        </View>
      </ThemedView>
    );
  }

  if (error || !profile) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Header
          title={t('profile.title')}
          showBackButton
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle"
            size={48}
            color={Colors.danger}
          />
          <BodySmall style={[styles.errorText, { color: textColor }]}>
            {t('profile.loadError')}
          </BodySmall>
          <Button variant="primary" onPress={() => router.back()}>
            {t('common.goBack')}
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title={isOwnProfile ? t('profile.myProfile') : t('profile.title')}
        showBackButton
        onBackPress={() => router.back()}
      />

      <ThemedView style={styles.profileHeader}>
        <Pressable onPress={handleAvatarPress} disabled={!isOwnProfile}>
          <View style={styles.avatarContainer}>
            {profile.attributes.avatar_url ? (
              <Image
                source={{ uri: profile.attributes.avatar_url }}
                style={styles.avatar}
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
          {profile.attributes.first_name} {profile.attributes.last_name}
        </Heading3>

        {profile.attributes.verified_at && (
          <View style={styles.verifiedBadge}>
            <IconSymbol
              name="checkmark.seal.fill"
              size={16}
              color={Colors.success}
            />
            <Caption style={{ color: Colors.success, marginLeft: 4 }}>
              {t('profile.verified')}
            </Caption>
          </View>
        )}
      </ThemedView>

      {renderStats()}
      {renderBioSection()}
      {renderInfoSection()}
      {renderActionButtons()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.neutral.gray[200],
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
    marginBottom: Spacing.xs,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    ...Shadows.sm,
  },
  statIcon: {
    marginBottom: Spacing.sm,
  },
  statLabel: {
    marginTop: Spacing.xs,
    fontSize: 12,
    opacity: 0.7,
  },
  section: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  bioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    borderBottomWidth: 1,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoLabel: {
    opacity: 0.7,
  },
  infoValue: {
    fontWeight: '500',
  },
  actionButtons: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['2xl'],
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
  },
});
