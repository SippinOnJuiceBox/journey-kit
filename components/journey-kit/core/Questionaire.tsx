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

import { ContinueButton, ProgressBar } from './components';
import { useQuestionnaireAnimation } from './hooks/useQuestionaireAnimation';
import { useQuestionnaireValidation } from './hooks/useQuestionaireValidation';
import { Registry } from './types/QuestionComponents';
import { QuestionConfig, QuestionQuestion, QuestionComponentProps } from './types/question';

interface QuestionnaireProps {
  /** Configuration object defining all steps and questions in the questionnaire */
  config: QuestionConfig;

  /** Callback fired when questionnaire is completed. Receives complete form data */
  onCompleted: (formData: Record<string, any>) => Promise<void>;

  /** Optional callback fired whenever the current step changes */
  onStepChange?: (currentStep: number) => void;

  /** Starting step index. Defaults to 0 */
  initialStep?: number;

  /** Optional map of custom question components to override defaults */
  customQuestionComponents?: Record<string, React.ComponentType<QuestionComponentProps>>;

  /** Whether to hide the default header with back button and progress indicator */
  hideHeader?: boolean;

  /** Initial form values to pre-populate fields */
  initialValues?: Record<string, any>;

  /** Path to navigate back to when on first step. Defaults to '/' */
  defaultBackPath?: Href;

  /**
   * Optional async validation before proceeding to next step.
   * Return true to allow navigation, false to prevent
   */
  onBeforeNext?: (currentStep: number, formData: Record<string, any>) => Promise<boolean>;

  /**
   * Optional async validation before going back.
   * Return true to allow navigation, false to prevent
   */
  onBeforeBack?: (currentStep: number) => Promise<boolean>;

  /**
   * Optional function to programmatically control current step.
   * Receives setState function to update step index
   */
  goToStep?: (setStep: (step: number) => void) => void;

  /**
   * Custom header renderer. Receives current step info and back handler.
   * Only used if hideHeader is false.
   */
  renderHeader?: (props: {
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
  }) => React.ReactNode;

  /**
   * Custom question renderer. Receives question config and default renderer.
   * Use to customize individual question display.
   */
  renderQuestion?: (
    question: QuestionQuestion,
    defaultRender: (question: QuestionQuestion) => React.ReactNode
  ) => React.ReactNode;

  /**
   * Custom footer renderer. Receives navigation handlers and step state.
   * Use to customize navigation buttons and progress display.
   */
  renderFooter?: (props: {
    onNext: () => void;
    isValid: boolean;
    isProcessing: boolean;
    isUploading: boolean;
    currentStep: number;
    totalSteps: number;
    onBack: () => void;
  }) => React.ReactNode;
}

export default function Questionnaire({
  config,
  onCompleted,
  onStepChange,
  onBeforeBack,
  onBeforeNext,
  initialStep = 0,
  customQuestionComponents = {},
  hideHeader,
  initialValues = {},
  defaultBackPath = '/' as Href,
  renderHeader,
  renderQuestion,
  renderFooter,
  goToStep,
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
  const { isStepValid, validateStep, errors, setFieldDirty } = useQuestionnaireValidation(
    config[currentStep],
    formData
  );

  const handleBack = useCallback(async () => {
    if (currentStep > 0) {
      // Check if we can go back
      if (onBeforeBack) {
        const canGoBack = await onBeforeBack(currentStep);
        if (!canGoBack) return;
      }

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
  }, [currentStep, fadeOut, fadeIn, router, stepHistory, defaultBackPath, onBeforeBack]);

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
    if (goToStep) {
      goToStep(setCurrentStep);
    }
  }, [goToStep]);

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
      setFieldDirty(name);
      setIsUploading(uploading);
    },
    [currentStep, setFieldDirty]
  );

  const handleNext = useCallback(async () => {
    if (validateStep()) {
      // Check if we can proceed
      if (onBeforeNext) {
        const canProceed = await onBeforeNext(currentStep, formData);
        if (!canProceed) return;
      }

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
    onBeforeNext,
  ]);

  const defaultQuestionRenderer = useCallback(
    (question: QuestionQuestion) => {
      try {
        const QuestionComponent = Registry.get(question.type);

        const commonProps = {
          question,
          onChange: handleInputChange,
          value: formData[question.name],
          error: errors[question.name], // Now errors is in scope
        };

        return <QuestionComponent {...commonProps} />;
      } catch (error) {
        console.error(`Error rendering question type ${question.type}:`, error);
        return null;
      }
    },
    [formData, handleInputChange, errors] // Add errors to dependencies
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {!hideHeader && (
        <>
          {renderHeader ? (
            renderHeader({
              currentStep,
              totalSteps: config.length,
              onBack: handleBack,
            })
          ) : (
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
        </>
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
              {renderQuestion
                ? renderQuestion(question, defaultQuestionRenderer)
                : defaultQuestionRenderer(question)}
            </View>
          ))}
        </Animated.View>

        <View className="p-4">
          {renderFooter ? (
            renderFooter({
              currentStep,
              totalSteps: config.length,
              onNext: handleNext,
              isValid: isStepValid,
              isProcessing,
              isUploading,
              onBack: handleBack,
            })
          ) : (
            <ContinueButton
              onPress={handleNext}
              disabled={!isStepValid || isUploading || isProcessing}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
