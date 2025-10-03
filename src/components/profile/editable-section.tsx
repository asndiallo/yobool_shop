// ============================================================================
// EDITABLE SECTION - Section with edit mode toggle for multiple fields
// ============================================================================

import { BodySmall, Heading4 } from '@/components/ui/typography';
import { Colors, Spacing } from '@/constants/theme';
import { Pressable, StyleSheet, View } from 'react-native';
import React, { useCallback, useState } from 'react';

import { useThemeColor } from '@/hooks/use-theme-color';

interface EditableSectionProps {
  title: string;
  children: (isEditMode: boolean, exitEditMode: () => void) => React.ReactNode;
  editable?: boolean;
}

export const EditableSection: React.FC<EditableSectionProps> = ({
  title,
  children,
  editable = true,
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const textColor = useThemeColor({}, 'text');

  const handleToggleEdit = useCallback(() => {
    setIsEditMode((prev) => !prev);
  }, []);

  const exitEditMode = useCallback(() => {
    setIsEditMode(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Heading4 style={{ color: textColor }}>{title}</Heading4>
        {editable && (
          <Pressable
            onPress={handleToggleEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel={isEditMode ? 'Exit edit mode' : 'Edit section'}
            accessibilityRole="button"
          >
            {isEditMode ? (
              <BodySmall style={[styles.editText, { color: Colors.primary }]}>
                Done
              </BodySmall>
            ) : (
              <BodySmall style={[styles.editText, { color: Colors.primary }]}>
                Edit
              </BodySmall>
            )}
          </Pressable>
        )}
      </View>
      <View style={styles.content}>{children(isEditMode, exitEditMode)}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editText: {
    fontWeight: '600',
    fontSize: 15,
  },
  content: {
    gap: Spacing.sm,
  },
});
