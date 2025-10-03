// ============================================================================
// SETTINGS SCREEN - Account management and preferences
// ============================================================================

import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BodySmall, Header, Heading4, IconSymbol } from '@/components/ui';
import { BorderRadius, Colors, Shadows, Spacing } from '@/constants/theme';
import React, { useCallback, useState } from 'react';
import { RequireAuth, useAuth } from '@/contexts/AuthContext';

import { ThemedView } from '@/components/themed-view';
import { isAuthenticated } from '@/types';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTranslation } from '@/hooks/use-translation';

interface SettingItem {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  destructive?: boolean;
  showChevron?: boolean;
}

export default function SettingsScreen() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { state: authState, actions } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    Alert.alert(
      t('settings.logout') || 'Logout',
      t('settings.logoutConfirm') || 'Are you sure you want to logout?',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('settings.logout') || 'Logout',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await actions.logout();
              router.replace('/sign-in');
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert(
                t('common.error') || 'Error',
                t('settings.logoutError') ||
                  'Failed to logout. Please try again.'
              );
            } finally {
              setIsLoggingOut(false);
              router.replace('/(tabs)');
            }
          },
        },
      ]
    );
  }, [t, actions]);

  const handleChangeEmail = useCallback(() => {
    Alert.alert(
      t('settings.changeEmail') || 'Change Email',
      t('settings.changeEmailMessage') || 'This feature is not yet implemented.'
    );
  }, [t]);

  const handleChangePassword = useCallback(() => {
    Alert.alert(
      t('settings.changePassword') || 'Change Password',
      t('settings.changePasswordMessage') ||
        'This feature is not yet implemented.'
    );
  }, [t]);

  const handleChangeLanguage = useCallback(() => {
    Alert.alert(
      t('settings.language') || 'Language',
      t('settings.languageMessage') || 'This feature is not yet implemented.'
    );
  }, [t]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      t('settings.deleteAccount') || 'Delete Account',
      t('settings.deleteAccountWarning') ||
        'This action is permanent and cannot be undone. All your data will be deleted.',
      [
        {
          text: t('common.cancel') || 'Cancel',
          style: 'cancel',
        },
        {
          text: t('common.delete') || 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('settings.deleteAccountConfirm') || 'Are you absolutely sure?',
              t('settings.deleteAccountFinal') ||
                'Type your email to confirm account deletion.',
              [
                {
                  text: t('common.cancel') || 'Cancel',
                  style: 'cancel',
                },
                {
                  text: t('common.delete') || 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion
                    console.log('Delete account');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  }, [t]);

  const currentUser = isAuthenticated(authState) ? authState.user : null;

  const accountSettings: SettingItem[] = [
    {
      icon: 'envelope.fill',
      label: t('settings.changeEmail') || 'Change Email',
      value: currentUser?.attributes.email || '',
      onPress: handleChangeEmail,
      showChevron: true,
    },
    {
      icon: 'lock.fill',
      label: t('settings.changePassword') || 'Change Password',
      onPress: handleChangePassword,
      showChevron: true,
    },
  ];

  const preferenceSettings: SettingItem[] = [
    {
      icon: 'globe',
      label: t('settings.language') || 'Language',
      value: t('settings.languageValue') || 'English',
      onPress: handleChangeLanguage,
      showChevron: true,
    },
  ];

  const dangerSettings: SettingItem[] = [
    {
      icon: 'trash.fill',
      label: t('settings.deleteAccount') || 'Delete Account',
      onPress: handleDeleteAccount,
      destructive: true,
      showChevron: true,
    },
    {
      icon: 'rectangle.portrait.and.arrow.right',
      label: t('settings.logout') || 'Logout',
      onPress: handleLogout,
      destructive: true,
      showChevron: false,
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const iconColor = item.destructive
      ? Colors.danger
      : Colors.neutral.gray[500];
    const labelColor = item.destructive ? Colors.danger : textColor;

    return (
      <Pressable
        key={item.label}
        style={[
          styles.settingItem,
          {
            borderBottomColor: Colors[colorScheme].border,
          },
        ]}
        onPress={item.onPress}
        disabled={isLoggingOut}
        accessibilityLabel={item.label}
        accessibilityRole="button"
      >
        <View style={styles.settingLeft}>
          <View
            style={[
              styles.iconContainer,
              {
                backgroundColor: item.destructive
                  ? `${Colors.danger}15`
                  : Colors[colorScheme].background,
              },
            ]}
          >
            <IconSymbol name={item.icon as any} size={20} color={iconColor} />
          </View>
          <View style={styles.settingContent}>
            <BodySmall style={[styles.settingLabel, { color: labelColor }]}>
              {item.label}
            </BodySmall>
            {item.value && (
              <BodySmall style={[styles.settingValue, { color: textColor }]}>
                {item.value}
              </BodySmall>
            )}
          </View>
        </View>
        {item.showChevron && (
          <IconSymbol
            name="chevron.right"
            size={16}
            color={Colors.neutral.gray[400]}
          />
        )}
      </Pressable>
    );
  };

  return (
    <RequireAuth
      fallback={
        <ThemedView style={[styles.container, { backgroundColor }]}>
          <Header
            title={t('settings.title') || 'Settings'}
            showBackButton
            onBackPress={() => router.back()}
          />
          <View style={styles.errorContainer}>
            <BodySmall style={{ color: textColor }}>
              {t('auth.notAuthenticated') || 'Not authenticated'}
            </BodySmall>
          </View>
        </ThemedView>
      }
    >
      <ScrollView
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.scrollContent}
      >
        <Header
          title={t('settings.title') || 'Settings'}
          showBackButton
          onBackPress={() => router.back()}
        />

        <View style={styles.content}>
          {/* Account Settings */}
          <View style={styles.section}>
            <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
              {t('settings.account') || 'Account'}
            </Heading4>
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              {accountSettings.map(renderSettingItem)}
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Heading4 style={[styles.sectionTitle, { color: textColor }]}>
              {t('settings.preferences') || 'Preferences'}
            </Heading4>
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              {preferenceSettings.map(renderSettingItem)}
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Heading4 style={[styles.sectionTitle, { color: Colors.danger }]}>
              {t('settings.dangerZone') || 'Danger Zone'}
            </Heading4>
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              {dangerSettings.map(renderSettingItem)}
            </View>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <BodySmall style={{ color: textColor, textAlign: 'center' }}>
              {t('settings.version') || 'Version'}: 1.0.0
            </BodySmall>
          </View>
        </View>
      </ScrollView>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  content: {
    padding: Spacing.lg,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    gap: 2,
  },
  settingLabel: {
    fontSize: 15,
  },
  settingValue: {
    fontSize: 13,
  },
  appInfo: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.xl,
  },
});
