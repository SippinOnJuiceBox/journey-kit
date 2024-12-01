import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
} from 'react-native';

import { Registry } from '../core/types/QuestionComponents';
import { QuestionComponentProps, BaseQuestion, QuestionTypes } from '../core/types/journey';

// Declare input question type
declare module '../core/types/journey' {
  interface QuestionTypes {
    input: {
      placeholder?: string;
    };
  }
}

// Create input-specific question type
type InputQuestion = BaseQuestion & { type: 'input' } & QuestionTypes['input'];

// Input-specific props
interface InputProps extends Omit<QuestionComponentProps, 'question'> {
  question: InputQuestion;
  debounceTime?: number;
  inputProps?: Partial<TextInputProps>;
}

function InputQuestion({
  question,
  value = '',
  onChange,
  debounceTime = 100,
  inputProps = {},
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [localValue, setLocalValue] = useState(value?.toString() || '');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalValue(value?.toString() || '');
  }, [value]);

  const handleChange = useCallback(
    (text: string) => {
      setLocalValue(text);
      setError(null);

      if (!text && !question.validation) {
        setError(null);
      }
    },
    [question.validation]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        if (question.validation) {
          try {
            question.validation.parse(localValue);
            setError(null);
          } catch (err) {
            if (err instanceof Error) {
              setError(err.message);
            }
            return;
          }
        }
        onChange(question.name, localValue);
      }
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [localValue, value, onChange, question.name, question.validation, debounceTime]);

  const handleFocus = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      inputProps.onFocus?.(e);
    },
    [inputProps]
  );

  const handleBlur = useCallback(
    (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(false);
      inputProps.onBlur?.(e);
    },
    [inputProps]
  );

  const getBorderColor = () => {
    if (error) return '#EF4444';
    if (isFocused) return '#797269';
    return 'transparent';
  };

  return (
    <View className="mb-4">
      <Text className="mb-2 text-lg text-stone-700" accessibilityRole="header">
        {question.question}
      </Text>

      <View
        style={{
          borderColor: getBorderColor(),
        }}
        className="rounded-2xl border-2 bg-stone-100">
        <TextInput
          className="p-4"
          placeholder={question.placeholder}
          placeholderTextColor="#797269"
          value={localValue}
          onChangeText={handleChange}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={question.question}
          accessibilityHint={question.placeholder}
          {...inputProps}
        />
      </View>

      {error && (
        <Text className="mt-1 text-sm text-red-500" accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

// Register the component
Registry.register('input', InputQuestion as React.ComponentType<QuestionComponentProps>);

export default InputQuestion;
