import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { useForm } from 'react-hook-form';

import { ThemedView } from '@/components/themed-view';
import { Button, Header, BodySmall, Heading4 } from '@/components/ui';
import { ControlledTextInput } from '@/components/ui/controlled-text-input';
import { Spacing } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';
import { useUpdateUserAttributes } from '@/hooks/use-profile';
import { useAuthHook } from '@/hooks/use-auth';
import {
  isAuthenticated,
  type UserAttributes,
  type DeepPartial,
} from '@/types';

interface ProfileEditForm {
  first_name: string;
  last_name: string;
  bio: string;
  phone_number: string;
  country: string;
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { authState } = useAuthHook();

  const updateAttributesMutation = useUpdateUserAttributes();

  // Get current user data
  const currentUser = isAuthenticated(authState) ? authState.user : null;

  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useForm<ProfileEditForm>({
    defaultValues: {
      first_name: currentUser?.attributes.first_name || '',
      last_name: currentUser?.attributes.last_name || '',
      bio: currentUser?.attributes.bio || '',
      phone_number: currentUser?.attributes.phone_number || '',
      country: currentUser?.attributes.country || '',
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async (data: ProfileEditForm) => {
    if (!isDirty) {
      Alert.alert(t('profile.noChanges'), t('profile.noChangesMessage'));
      return;
    }

    setIsSaving(true);

    try {
      const updates: DeepPartial<UserAttributes> = {
        first_name: data.first_name,
        last_name: data.last_name,
        bio: data.bio,
        phone_number: data.phone_number,
        country: data.country,
      };

      await updateAttributesMutation.mutateAsync(updates);

      Alert.alert(t('profile.success'), t('profile.profileUpdated'), [
        {
          text: t('common.ok'),
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      Alert.alert(
        t('common.error'),
        error.message || t('profile.updateFailed')
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!currentUser) {
    return (
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <Header
          title={t('profile.editProfile')}
          showBackButton
          onBackPress={() => router.back()}
        />
        <View style={styles.errorContainer}>
          <BodySmall style={{ color: textColor }}>
            {t('auth.notAuthenticated')}
          </BodySmall>
          <Button
            variant="primary"
            onPress={() => router.replace('/sign-in')}
            style={styles.loginButton}
          >
            {t('auth.signIn')}
          </Button>
        </View>
      </ThemedView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Header
          title={t('profile.editProfile')}
          showBackButton
          onBackPress={() => router.back()}
        />

        <ThemedView style={styles.content}>
          {/* Personal Information */}
          <View style={styles.section}>
            <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
              {t('profile.personalInfo')}
            </Heading4>

            <ControlledTextInput
              control={control}
              name="first_name"
              label={t('profile.firstName')}
              placeholder={t('profile.firstNamePlaceholder')}
              autoCapitalize="words"
              rules={{
                required: t('validation.firstNameRequired'),
                minLength: {
                  value: 2,
                  message: t('validation.firstNameMinLength'),
                },
              }}
            />

            <ControlledTextInput
              control={control}
              name="last_name"
              label={t('profile.lastName')}
              placeholder={t('profile.lastNamePlaceholder')}
              autoCapitalize="words"
              rules={{
                required: t('validation.lastNameRequired'),
                minLength: {
                  value: 2,
                  message: t('validation.lastNameMinLength'),
                },
              }}
            />

            <ControlledTextInput
              control={control}
              name="bio"
              label={t('profile.bio')}
              placeholder={t('profile.bioPlaceholder')}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Contact Information */}
          <View style={styles.section}>
            <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
              {t('profile.contactInfo')}
            </Heading4>

            <ControlledTextInput
              control={control}
              name="phone_number"
              label={t('profile.phone')}
              placeholder={t('profile.phonePlaceholder')}
              keyboardType="phone-pad"
              rules={{
                pattern: {
                  value:
                    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/,
                  message: t('validation.phoneInvalid'),
                },
              }}
            />

            <ControlledTextInput
              control={control}
              name="country"
              label={t('profile.country')}
              placeholder={t('profile.countryPlaceholder')}
              autoCapitalize="words"
              rules={{
                required: t('validation.countryRequired'),
              }}
            />
          </View>

          {/* Read-only fields info */}
          <View style={styles.infoBox}>
            <BodySmall style={[styles.infoText, { color: textColor }]}>
              {t('profile.accountSettingsNote')}
            </BodySmall>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button
              variant="outline"
              onPress={() => router.back()}
              style={styles.actionButton}
              disabled={isSaving}
            >
              {t('common.cancel')}
            </Button>
            <Button
              variant="primary"
              onPress={handleSubmit(onSubmit)}
              style={styles.actionButton}
              disabled={isSaving || !isDirty}
            >
              {isSaving ? t('common.saving') : t('common.save')}
            </Button>
          </View>
        </ThemedView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  loginButton: {
    minWidth: 200,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    marginBottom: Spacing.lg,
  },
  infoBox: {
    backgroundColor: 'rgba(244, 185, 66, 0.1)',
    padding: Spacing.lg,
    borderRadius: 8,
    marginBottom: Spacing.xl,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  actionButton: {
    flex: 1,
  },
});
