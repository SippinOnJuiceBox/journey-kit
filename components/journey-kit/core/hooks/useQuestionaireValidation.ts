import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

import { QuestionStep } from '../types/question';

/**
 * Hook for managing questionnaire step validation
 *
 * @param {QuestionStep} currentStep - Current questionnaire step configuration
 * @param {Record<string, any>} formData - Form data to validate
 *
 * @returns {Object} Validation state and controls
 * @property {boolean} isStepValid - Whether current step's data is valid
 * @property {() => boolean} validateStep - Function to manually trigger validation
 */
export const useQuestionnaireValidation = (
  currentStep: QuestionStep,
  formData: Record<string, any>
) => {
  const [isStepValid, setIsStepValid] = useState(false);

  /**
   * Dynamically creates a Zod validation schema based on current step's questions
   * Only includes questions that have validation rules defined
   *
   * @returns {z.ZodObject} Combined validation schema for current step
   */
  const createValidationSchema = useCallback(() => {
    return z.object(
      currentStep.questions.reduce(
        (acc, question) => {
          if (question.validation) {
            acc[question.name] = question.validation;
          }
          return acc;
        },
        {} as Record<string, z.ZodType<any>>
      )
    );
  }, [currentStep]);

  /**
   * Manually validates the current step's form data
   * Logs first validation error if validation fails
   *
   * @returns {boolean} Whether validation passed
   */
  const validateStep = useCallback(() => {
    const schema = createValidationSchema();

    try {
      schema.parse(formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        console.error(firstError.message);
      }
      return false;
    }
  }, [formData, createValidationSchema]);

  useEffect(() => {
    const schema = createValidationSchema();
    try {
      schema.parse(formData);
      setIsStepValid(true);
    } catch {
      setIsStepValid(false);
    }
  }, [formData, createValidationSchema]);

  return { isStepValid, validateStep };
};
