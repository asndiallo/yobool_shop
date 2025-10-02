// ============================================================================
// CONTROLLED TEXT INPUT - React Hook Form compatible wrapper
// ============================================================================

import {
  Control,
  Controller,
  FieldPath,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';
import { TextInput, type TextInputProps } from './text-input';

interface ControlledTextInputProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<TFieldValues>;
  name: TName;
  rules?: RegisterOptions<TFieldValues, TName>;
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
  rules,
  ...textInputProps
}: ControlledTextInputProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
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
