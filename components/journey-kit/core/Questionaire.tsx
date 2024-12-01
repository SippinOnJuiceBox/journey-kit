import { Ionicons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Animated,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';

import '../components/index';
import ContinueButton from './components/ContinueButton';
import ProgressBar from './components/ProgressBar';
import { useQuestionnaireAnimation } from './hooks/useQuestionaireAnimation';
import { useQuestionnaireValidation } from './hooks/useQuestionaireValidation';
import { Registry } from './types/QuestionComponents';
import { JourneyConfig, JourneyQuestion, QuestionComponentProps } from './types/journey';

interface QuestionnaireProps {
  config: JourneyConfig;
  onCompleted: (formData: Record<string, any>) => Promise<void>;
  onStepChange?: (currentStep: number) => void;
  initialStep?: number;
  customQuestionComponents?: Record<string, React.ComponentType<QuestionComponentProps>>;
  hideHeader?: boolean;
  initialValues?: Record<string, any>;
  defaultBackPath?: Href;
}

export default function Questionnaire({
  config,
  onCompleted,
  onStepChange,
  initialStep = 0,
  customQuestionComponents = {},
  hideHeader,
  initialValues = {},
  defaultBackPath = '/' as Href,
}: QuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [formData, setFormData] = useState<Record<string, any>>(initialValues);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stepHistory, setStepHistory] = useState<Record<number, Record<string, any>>>({
    [initialStep]: initialValues,
  });

  const router = useRouter();

  const { fadeAnim, fadeOut, fadeIn } = useQuestionnaireAnimation();
  const { isStepValid, validateStep } = useQuestionnaireValidation(config[currentStep], formData);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      fadeOut();
      setTimeout(() => {
        const previousStep = currentStep - 1;
        setCurrentStep(previousStep);
        if (stepHistory[previousStep]) {
          setFormData(stepHistory[previousStep]);
        }
        fadeIn();
      }, 200);
    } else {
      router.push(defaultBackPath);
    }
  }, [currentStep, fadeOut, fadeIn, router, stepHistory, defaultBackPath]);

  const mergedQuestionComponents = useMemo(
    () => ({ ...Registry.getAll(), ...customQuestionComponents }),
    [customQuestionComponents]
  );

  const currentStepData = useMemo(() => config[currentStep], [config, currentStep]);

  useEffect(() => {
    if (Object.keys(initialValues).length > 0) {
      setFormData((prev) => ({ ...prev, ...initialValues }));
      setStepHistory((prev) => ({
        ...prev,
        [currentStep]: { ...prev[currentStep], ...initialValues },
      }));
    }
  }, [initialValues, currentStep]);

  useEffect(() => {
    onStepChange?.(currentStep);
  }, [currentStep, onStepChange]);

  const handleInputChange = useCallback(
    (name: string, value: any, uploading: boolean = false) => {
      setFormData((prev) => {
        const newFormData = { ...prev, [name]: value };
        setStepHistory((prevHistory) => ({
          ...prevHistory,
          [currentStep]: newFormData,
        }));
        return newFormData;
      });
      setIsUploading(uploading);
    },
    [currentStep]
  );

  const handleNext = useCallback(async () => {
    if (validateStep()) {
      fadeOut();
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (currentStep < config.length - 1) {
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        if (stepHistory[nextStep]) {
          setFormData(stepHistory[nextStep]);
        }
      } else {
        setIsProcessing(true);
        try {
          await onCompleted(formData);
        } catch (error) {
          console.error(error);
        } finally {
          setIsProcessing(false);
        }
      }
      fadeIn();
    }
  }, [
    currentStep,
    config.length,
    formData,
    fadeOut,
    fadeIn,
    validateStep,
    onCompleted,
    stepHistory,
  ]);

  const renderQuestion = useCallback(
    (question: JourneyQuestion) => {
      try {
        const QuestionComponent = Registry.get(question.type);

        const commonProps = {
          question,
          onChange: handleInputChange,
          value: formData[question.name],
        };

        return <QuestionComponent {...commonProps} />;
      } catch (error) {
        console.error(`Error rendering question type ${question.type}:`, error);
        return null;
      }
    },
    [formData, handleInputChange]
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {!hideHeader && (
        <View className="mr-4 flex-row items-center gap-4 rounded-full p-4">
          <TouchableOpacity onPress={handleBack}>
            <Ionicons
              name="arrow-back"
              size={28}
              color="#000000"
              className="rounded-full"
              accessibilityLabel="Go back"
            />
          </TouchableOpacity>
          <ProgressBar current={currentStep} total={config.length} />
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
        className="flex-1">
        <Animated.View
          style={{ opacity: fadeAnim }}
          className="flex-1 px-4"
          accessibilityLiveRegion="polite">
          <Text className="text-2xl" accessibilityRole="header">
            {currentStepData.pageHeader}
          </Text>

          {currentStepData.pageSubheader && (
            <Text className="mt-2 text-base">{currentStepData.pageSubheader}</Text>
          )}

          {currentStepData.questions.map((question, index) => (
            <View key={`${question.name}-${index}`} className="mt-2">
              {renderQuestion(question)}
            </View>
          ))}
        </Animated.View>

        <View className="p-4">
          <ContinueButton
            onPress={handleNext}
            disabled={!isStepValid || isUploading || isProcessing}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
