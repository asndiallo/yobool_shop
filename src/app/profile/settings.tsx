// ============================================================================
// ENHANCED SETTINGS SCREEN - Cleaner, more intuitive design
// ============================================================================

import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { BodySmall, Header, IconSymbol } from '@/components/ui';
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

  const renderSettingItem = (item: SettingItem, isLast: boolean = false) => {
    const iconColor = item.destructive
      ? Colors.danger
      : Colors.neutral.gray[600];
    const labelColor = item.destructive ? Colors.danger : textColor;

    return (
      <Pressable
        key={item.label}
        style={[
          styles.settingItem,
          !isLast && {
            borderBottomWidth: StyleSheet.hairlineWidth,
            borderBottomColor: Colors.neutral.gray[200],
          },
        ]}
        onPress={item.onPress}
        disabled={isLoggingOut}
        accessibilityLabel={item.label}
        accessibilityRole="button"
      >
        <View style={styles.settingLeft}>
          <IconSymbol name={item.icon as any} size={22} color={iconColor} />
          <View style={styles.settingContent}>
            <BodySmall style={[styles.settingLabel, { color: labelColor }]}>
              {item.label}
            </BodySmall>
            {item.value && (
              <BodySmall
                style={[
                  styles.settingValue,
                  { color: Colors.neutral.gray[500] },
                ]}
              >
                {item.value}
              </BodySmall>
            )}
          </View>
        </View>
        {item.showChevron && (
          <IconSymbol
            name="chevron.right"
            size={18}
            color={Colors.neutral.gray[300]}
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
            <BodySmall
              style={[styles.sectionTitle, { color: Colors.neutral.gray[500] }]}
            >
              {t('settings.account') || 'ACCOUNT'}
            </BodySmall>
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              {accountSettings.map((item, idx) =>
                renderSettingItem(item, idx === accountSettings.length - 1)
              )}
            </View>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <BodySmall
              style={[styles.sectionTitle, { color: Colors.neutral.gray[500] }]}
            >
              {t('settings.preferences') || 'PREFERENCES'}
            </BodySmall>
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              {preferenceSettings.map((item, idx) =>
                renderSettingItem(item, idx === preferenceSettings.length - 1)
              )}
            </View>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <BodySmall
              style={[styles.sectionTitle, { color: Colors.neutral.gray[500] }]}
            >
              {t('settings.dangerZone') || 'DANGER ZONE'}
            </BodySmall>
            <View
              style={[
                styles.card,
                { backgroundColor: Colors[colorScheme].backgroundSecondary },
              ]}
            >
              {dangerSettings.map((item, idx) =>
                renderSettingItem(item, idx === dangerSettings.length - 1)
              )}
            </View>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <BodySmall
              style={{
                color: Colors.neutral.gray[400],
                textAlign: 'center',
                fontSize: 12,
              }}
            >
              Yobool {t('settings.version') || 'Version'} 1.0.0
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
    marginBottom: Spacing.sm,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingLeft: Spacing.xs,
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.md,
  },
  settingContent: {
    flex: 1,
    gap: 3,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  appInfo: {
    marginTop: Spacing.md,
    paddingTop: Spacing.lg,
  },
});
