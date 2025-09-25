// ============================================================================
// COMPONENT TYPES - React component props and UI-related types
// ============================================================================

import { PressableProps, TextInputProps } from 'react-native';
import {
  Coordinates,
  Currency,
  FormattedPlace,
  Money,
  NotificationType,
  TransportMode,
  User,
} from './core';

import { FontAwesome } from '@expo/vector-icons';
import { ReactNode } from 'react';

// ============================================================================
// BASE COMPONENT TYPES
// ============================================================================

export interface BaseProps {
  readonly isDark?: boolean;
  readonly className?: string;
  readonly addExtraMarginBottom?: boolean;
}

// Generic picker base
export interface BasePickerProps<TValue = unknown> extends BaseProps {
  readonly onSelect?: (value: TValue) => void;
  readonly onClose?: () => void;
}

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'outline'
  | 'success';
export type TextVariant =
  | 'primary'
  | 'default'
  | 'secondary'
  | 'danger'
  | 'success';

export interface ButtonProps extends PressableProps, BaseProps {
  readonly title: string;
  readonly onPress: () => void;
  readonly bgVariant?: ButtonVariant;
  readonly textVariant?: TextVariant;
  readonly loading?: boolean;
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
}

// ============================================================================
// INPUT COMPONENTS
// ============================================================================

export interface CustomInputProps extends BaseProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly error?: string;
  readonly placeholder?: string;
  readonly secureTextEntry?: boolean;
}

// Enhanced input props that extend React Native TextInput
export interface InputProps
  extends Omit<TextInputProps, 'onChangeText'>,
    BaseProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly error?: string;
}

// ============================================================================
// PICKER COMPONENTS
// ============================================================================

export interface AddressPickerProps extends BasePickerProps<FormattedPlace> {
  readonly title: string;
  readonly onAddressSelect: (place: FormattedPlace) => void;
  readonly selectedLocation: Coordinates;
  readonly setSelectedLocation: (location: Coordinates) => void;
}

export interface CityPickerProps extends BasePickerProps<FormattedPlace> {
  readonly title?: string;
  readonly inputPlaceholder?: string;
  readonly fetchGeocodeData?: boolean;
  readonly containerStyle?: string;
}

export interface DatePickerProps extends BasePickerProps<Date> {
  readonly initialValue: Date;
  readonly title?: string;
  readonly visible?: boolean;
  readonly onChange?: (date: Date) => void;
}

export interface CustomDatePickerProps extends BaseProps {
  readonly title?: string;
  readonly value: Date;
  readonly onChange?: (date: Date) => void;
  readonly onClose?: () => void;
  readonly visible?: boolean;
}

export interface WeightPickerProps extends BasePickerProps<string> {
  readonly initialValue: number;
  readonly step?: number;
  readonly min?: number;
  readonly max?: number;
  readonly needsConfirmation?: boolean;
  readonly renderCustomHeader?: boolean;
  readonly title?: string;
}

export interface PricePerKgPickerProps extends BasePickerProps<number> {
  readonly weightLimit?: number;
  readonly initialPrice: number;
  readonly currency?: Currency;
  readonly minPrice?: number;
  readonly maxPrice?: number;
  readonly step?: number;
  readonly recommendedRange?: { readonly min: number; readonly max: number };
  readonly renderCustomHeader?: boolean;
}

// ============================================================================
// TRANSPORT & MODE COMPONENTS
// ============================================================================

export interface TransportModePickerProps
  extends BasePickerProps<TransportMode> {
  readonly title: string;
  readonly initialMode: TransportMode;
  readonly isPro?: boolean;
}

export interface TransportModeButtonProps extends BaseProps {
  readonly label: string;
  readonly icon: keyof typeof FontAwesome.glyphMap;
  readonly selected: boolean;
  readonly disabled: boolean;
  readonly onPress: () => void;
}

export interface TransportIconProps extends BaseProps {
  readonly mode: TransportMode;
  readonly size?: number;
  readonly color?: string;
}

// ============================================================================
// GOOGLE PLACES & LOCATION
// ============================================================================

export interface GoogleInputProps extends BaseProps {
  readonly handlePress: (params: FormattedPlace & { address?: string }) => void;
  readonly initialLocation?: string;
  readonly containerStyle?: string;
  readonly textInputBackgroundColor?: string;
  readonly onCloseInput?: () => void;
  readonly countryScope?: [string];
  readonly onlyCities?: boolean;
  readonly fetchGeocodeData?: boolean;
}

// ============================================================================
// EXPANDABLE INPUT - Complex component
// ============================================================================

export type ExpandableInputType = 'city' | 'date' | 'weight';
export type ExpandableInputValue = string | number | Money;

export interface ExpandableInputProps
  extends Omit<TextInputProps, 'onChangeText' | 'value'>,
    BaseProps {
  readonly type: ExpandableInputType;
  readonly value: ExpandableInputValue;
  readonly onValueChange: (value: string | number) => void;
  readonly onSwap?: () => void;
  readonly pickerProps?: CityPickerProps | WeightPickerProps | DatePickerProps;
}

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

export interface ModalHeaderSectionProps extends BaseProps {
  readonly onClose: () => void;
  readonly title: string;
  readonly subtitle?: string;
}

// ============================================================================
// FORM COMPONENTS
// ============================================================================

export interface BookingFormData {
  readonly description: string;
  readonly category_id: string;
  readonly length: string;
  readonly width: string;
  readonly height: string;
}

export interface SearchFormData {
  readonly departure: string;
  readonly destination: string;
  readonly date: string;
  readonly weight: number;
}

export interface ReviewFormParams {
  readonly review: {
    readonly rating: number;
    readonly text: string;
  };
}

export interface LoginResponseData {
  readonly message: string;
  readonly data: {
    readonly data: User;
  };
}

// ============================================================================
// DATE COMPONENTS
// ============================================================================

export type DateEditorType =
  | 'departure'
  | 'arrival'
  | 'latest_drop_off'
  | 'latest_delivery';

export interface DateEditorState {
  readonly type: DateEditorType | null;
  readonly visible: boolean;
}

// ============================================================================
// DISPLAY COMPONENTS
// ============================================================================

export interface TripDetailsProps extends BaseProps {
  readonly departure: string;
  readonly destination: string;
  readonly transportMode: TransportMode;
}

export interface BookingsInfoProps extends BaseProps {
  readonly count: number;
}

// ============================================================================
// NOTIFICATION COMPONENTS
// ============================================================================

export interface NotificationItemProps extends BaseProps {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly type: NotificationType;
  readonly createdAt: string;
  readonly isRead: boolean;
  readonly onPress?: () => void;
  readonly onMarkAsRead?: (id: string) => void;
}

// ============================================================================
// TYPE GUARDS FOR COMPONENT PROPS
// ============================================================================

export function isDatePickerProps(props: unknown): props is DatePickerProps {
  return typeof props === 'object' && props !== null && 'initialValue' in props;
}

export function isCityPickerProps(props: unknown): props is CityPickerProps {
  return typeof props === 'object' && props !== null && 'title' in props;
}

export function isWeightPickerProps(
  props: unknown
): props is WeightPickerProps {
  return typeof props === 'object' && props !== null && 'initialValue' in props;
}
