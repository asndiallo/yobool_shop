import { ThemedView } from '@/components/themed-view';
import { BorderRadius, Spacing } from '@/constants/theme';
import { type ViewStyle } from 'react-native';
import { Button, type ButtonVariant } from './button';

interface PillItem {
  id: string;
  label: string;
  isActive?: boolean;
}

interface PillsProps {
  items: PillItem[];
  onItemPress: (itemId: string) => void;
  style?: ViewStyle;
  activeVariant?: ButtonVariant;
  inactiveVariant?: ButtonVariant;
}

export function Pills({
  items,
  onItemPress,
  style,
  activeVariant = 'primary',
  inactiveVariant = 'outline',
}: PillsProps) {
  return (
    <ThemedView style={[defaultStyles.container, style]}>
      {items.map((item) => (
        <Button
          key={item.id}
          variant={item.isActive ? activeVariant : inactiveVariant}
          size="sm"
          style={defaultStyles.pill}
          onPress={() => onItemPress(item.id)}
        >
          {item.label}
        </Button>
      ))}
    </ThemedView>
  );
}

const defaultStyles = {
  container: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.sm,
  },
  pill: {
    borderRadius: BorderRadius.xl,
  },
};