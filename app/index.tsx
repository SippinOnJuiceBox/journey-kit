import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Alert, TouchableOpacity, View, Text } from 'react-native';
import { z } from 'zod';

import Questionnaire from '~/components/journey-kit/core/Questionaire';
import { QuestionConfig } from '~/components/journey-kit/core/types/question';

export default function Screen() {
  const config: QuestionConfig = [
    {
      pageHeader: "Let's get started",
      pageSubheader: 'Tell us about yourself',
      questions: [
        {
          name: 'firstName',
          question: "What's your first name?",
          placeholder: 'Enter your first name',
          type: 'input',
          validation: z.string().min(2, 'Name must be at least 2 characters'),
          autoComplete: 'email',
        },
        {
          name: 'lastName',
          question: "What's your last name?",
          placeholder: 'Enter your last name',
          type: 'input',
          validation: z.string().min(2, 'Name must be at least 2 characters'),
          autoComplete: 'name',
        },
      ],
    },
    {
      pageHeader: 'Contact Info',
      pageSubheader: 'How can we reach you?',
      questions: [
        {
          name: 'email',
          question: 'What is your email address?',
          placeholder: 'Enter your email',
          type: 'input',
          validation: z.string().email('Please enter a valid email'),
        },
      ],
    },
  ];

  const handleComplete = async (formData: Record<string, any>) => {
    try {
      const formattedData = Object.entries(formData)
        .map(([key, value]) => {
          // Capitalize and format key
          const formattedKey = key
            .split(/(?=[A-Z])/)
            .join(' ')
            .toLowerCase()
            .replace(/^\w/, (c) => c.toUpperCase());

          // Format value based on type
          const formattedValue = Array.isArray(value)
            ? value.join(', ')
            : typeof value === 'object'
              ? JSON.stringify(value)
              : value;

          return `${formattedKey}: ${formattedValue}`;
        })
        .join('\n');

      Alert.alert('Form Submission', formattedData, [
        { text: 'OK', onPress: () => console.log('OK Pressed') },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <Questionnaire
      config={config}
      onCompleted={handleComplete}
      renderHeader={({ currentStep, totalSteps }) => (
        <View className="bg-blue-800 p-2">
          <Text className="text-center text-lg text-white">
            Step {currentStep + 1} of {totalSteps}
          </Text>
        </View>
      )}
      // renderQuestion={(question, defaultRender) => (
      //   <View className="my-2 rounded-lg bg-gray-50 p-4">
      //     {defaultRender(question)}
      //     {question.question && (
      //       <Text className="mt-2 text-sm text-gray-500">{question.question}</Text>
      //     )}
      //   </View>
      // )}
      // renderFooter={({ onNext, onBack, isValid, isProcessing }) => (
      //   <View className="flex-row justify-between gap-4 p-4">
      //     <TouchableOpacity onPress={onBack} className="flex-1 rounded-full bg-gray-200 p-4">
      //       <Text className="text-center text-gray-800">Back</Text>
      //     </TouchableOpacity>

      //     <TouchableOpacity
      //       onPress={onNext}
      //       disabled={!isValid || isProcessing}
      //       className={`flex-1 rounded-full bg-blue-500 p-4 ${!isValid || isProcessing ? 'opacity-50' : ''}`}>
      //       <Text className="text-center text-white">
      //         {isProcessing ? 'Processing...' : 'Continue'}
      //       </Text>
      //     </TouchableOpacity>
      //   </View>
      // )}
    />
  );
}
