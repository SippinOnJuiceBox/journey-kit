import * as React from 'react';
import { Alert } from 'react-native';
import { z } from 'zod';

import Questionnaire from '~/components/journey-kit/core/Questionaire';
import { JourneyConfig } from '~/components/journey-kit/core/types/journey';

export default function Screen() {
  const config: JourneyConfig = [
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
            .replace(/^\w/, c => c.toUpperCase());
  
          // Format value based on type
          const formattedValue = Array.isArray(value)
            ? value.join(', ')
            : typeof value === 'object'
            ? JSON.stringify(value)
            : value;
  
          return `${formattedKey}: ${formattedValue}`;
        })
        .join('\n');
  
      Alert.alert(
        'Form Submission',
        formattedData,
        [
          { text: 'OK', onPress: () => console.log('OK Pressed') }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return <Questionnaire config={config} onCompleted={handleComplete} initialValues={{}} />;
}
