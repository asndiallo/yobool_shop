// ============================================================================
// CONTROLLED TEXT INPUT - React Hook Form compatible wrapper
// ============================================================================

import { Control, Controller, FieldPath, FieldValues } from 'react-hook-form';
import { TextInput, type TextInputProps } from './text-input';

interface ControlledTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<TFieldValues>;
  name: TName;
}

/**
 * Controlled TextInput component that integrates with react-hook-form
 * Handles error display from form validation automatically
 */
export function ControlledTextInput<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  control,
  name,
  ...textInputProps
}: ControlledTextInputProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: { onChange, onBlur, value },
        fieldState: { error },
      }) => (
        <TextInput
          value={value as string}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          {...textInputProps}
        />
      )}
    />
  );
}
