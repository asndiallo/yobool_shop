import * as ImagePicker from 'expo-image-picker';

import { useCallback, useState } from 'react';
import { useDeleteAvatar, useUpdateAvatar } from './use-profile';

import { Alert } from 'react-native';
import type { UserId } from '@/types';
import { useTranslation } from './use-translation';

export interface UseAvatarOptions {
  userId: UserId;
  currentAvatarUrl?: string | null;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const useAvatar = ({
  userId,
  currentAvatarUrl,
  onSuccess,
  onError,
}: UseAvatarOptions) => {
  const [optimisticAvatar, setOptimisticAvatar] = useState<string | null>(null);
  const updateAvatarMutation = useUpdateAvatar();
  const deleteAvatarMutation = useDeleteAvatar();
  const { t } = useTranslation();

  const displayAvatar = optimisticAvatar || currentAvatarUrl || null;

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
        onSuccess?.();
      } catch (error) {
        setOptimisticAvatar(null);
        console.error('Error updating avatar:', error);
        Alert.alert(
          t('common.error') || 'Error',
          'Failed to update avatar. Please try again.'
        );
        onError?.(error as Error);
      }
    }
  }, [t, updateAvatarMutation, onSuccess, onError]);

  const handleDeleteAvatar = useCallback(async () => {
    setOptimisticAvatar(null);

    try {
      await deleteAvatarMutation.mutateAsync(userId);
      onSuccess?.();
    } catch (error) {
      setOptimisticAvatar(currentAvatarUrl || null);
      console.error('Error deleting avatar:', error);
      Alert.alert(
        t('common.error') || 'Error',
        'Failed to delete avatar. Please try again.'
      );
      onError?.(error as Error);
    }
  }, [userId, currentAvatarUrl, deleteAvatarMutation, t, onSuccess, onError]);

  const handleAvatarPress = useCallback(() => {
    const hasAvatar = displayAvatar !== null;

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
  }, [displayAvatar, t, handleImagePick, handleDeleteAvatar]);

  return {
    displayAvatar,
    isUpdating:
      updateAvatarMutation.isPending || deleteAvatarMutation.isPending,
    handleAvatarPress,
    handleImagePick,
    handleDeleteAvatar,
  };
};
