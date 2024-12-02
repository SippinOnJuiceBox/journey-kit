/* eslint-disable @typescript-eslint/no-redeclare */
import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';

import { Registry } from '../core/types/QuestionComponents';
import { QuestionComponentProps, BaseQuestion, QuestionTypes } from '../core/types/question';

// Declare input question type
declare module '../core/types/Question' {
  interface QuestionTypes {
    input: Partial<TextInputProps> & {
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

function InputQuestion({ question, value = '', onChange }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = useCallback(
    (text: string) => {
      onChange(question.name, text);
    },
    [onChange, question.name]
  );

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View className="mb-4">
      <Text className="mb-2 text-lg text-stone-700" accessibilityRole="header">
        {question.question}
      </Text>

      <View
        style={{
          borderColor: isFocused ? '#797269' : 'transparent',
        }}
        className="rounded-2xl border-2 bg-stone-100">
        <TextInput
          className="p-4"
          placeholder={question.placeholder}
          placeholderTextColor="#797269"
          value={value}
          onChangeText={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessibilityLabel={question.question}
          accessibilityHint={question.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          {...question} // Spread all TextInput props from question
        />
      </View>
    </View>
  );
}

// Register the component
Registry.register('input', InputQuestion as React.ComponentType<QuestionComponentProps>);

export default InputQuestion;
