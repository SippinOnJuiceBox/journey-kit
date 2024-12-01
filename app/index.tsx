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
      console.log('Form completed:', formData);
      // Navigate or perform other actions here
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return <Questionnaire config={config} onCompleted={handleComplete} initialValues={{}} />;
}
