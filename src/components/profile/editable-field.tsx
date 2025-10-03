// ============================================================================
// EDITABLE FIELD - Inline editing with pencil/check icon toggle
// ============================================================================

import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import React, { useCallback, useState } from 'react';

import { BodySmall } from '@/components/ui/typography';
import { ControlledTextInput } from '@/components/ui/controlled-text-input';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { RegisterOptions } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { useThemeColor } from '@/hooks/use-theme-color';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => Promise<void>;
  placeholder?: string;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  rules?: RegisterOptions<{ value: string }, 'value'>;
}

export const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  placeholder,
  editable = true,
  multiline = false,
  numberOfLines,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  rules,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textColor = useThemeColor({}, 'text');

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm({
    defaultValues: { value },
  });

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    reset({ value });
  }, [value, reset]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    reset({ value });
  }, [value, reset]);

  const handleSave = useCallback(
    async (data: { value: string }) => {
      if (!isDirty || data.value === value) {
        setIsEditing(false);
        return;
      }

      setIsSaving(true);
      try {
        await onSave(data.value);
        setIsEditing(false);
      } catch (error) {
        console.error('Failed to save field:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [isDirty, value, onSave]
  );

  if (!isEditing) {
    return (
      <View style={styles.displayContainer}>
        <View style={styles.displayContent}>
          <BodySmall style={[styles.label, { color: textColor }]}>
            {label}
          </BodySmall>
          <BodySmall
            style={[styles.value, { color: textColor }]}
            numberOfLines={multiline ? undefined : 1}
          >
            {value || placeholder || '-'}
          </BodySmall>
        </View>
        {editable && (
          <Pressable
            onPress={handleEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={`Edit ${label}`}
            accessibilityRole="button"
          >
            <IconSymbol name="pencil" size={18} color={Colors.primary} />
          </Pressable>
        )}
      </View>
    );
  }

  return (
    <View style={styles.editContainer}>
      <ControlledTextInput
        control={control}
        name="value"
        label={label}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        rules={rules}
        autoFocus
      />
      <View style={styles.actions}>
        <Pressable
          onPress={handleCancel}
          style={styles.actionButton}
          disabled={isSaving}
          accessibilityLabel="Cancel"
          accessibilityRole="button"
        >
          <IconSymbol
            name="xmark.circle.fill"
            size={28}
            color={Colors.neutral.gray[400]}
          />
        </Pressable>
        <Pressable
          onPress={handleSubmit(handleSave)}
          style={styles.actionButton}
          disabled={isSaving || !isDirty}
          accessibilityLabel="Save"
          accessibilityRole="button"
        >
          {isSaving ? (
            <ActivityIndicator size="small" color={Colors.success} />
          ) : (
            <IconSymbol
              name="checkmark.circle.fill"
              size={28}
              color={isDirty ? Colors.success : Colors.neutral.gray[400]}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  displayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  displayContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 12,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
  },
  editContainer: {
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.md,
  },
  actionButton: {
    padding: Spacing.xs,
  },
});
