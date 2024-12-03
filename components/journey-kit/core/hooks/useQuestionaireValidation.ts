import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';

import { QuestionStep } from '../types/question';

/**
 * Hook for managing questionnaire step validation and error states
 *
 * @param {QuestionStep} currentStep - Current questionnaire step configuration
 * @param {Record<string, any>} formData - Form data to validate
 *
 * @returns {Object} Validation state and controls
 * @property {boolean} isStepValid - Whether current step's data is valid
 * @property {() => boolean} validateStep - Function to manually trigger validation
 * @property {Record<string, string>} errors - Object containing field-specific error messages
 */
export const useQuestionnaireValidation = (
  currentStep: QuestionStep,
  formData: Record<string, any>
) => {
  const [isStepValid, setIsStepValid] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dirtyFields, setDirtyFields] = useState<Record<string, boolean>>({}); // Track per-field dirty state

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

  const validateStep = useCallback(() => {
    const schema = createValidationSchema();
    const allFieldsDirty = currentStep.questions.reduce(
      (acc, question) => {
        acc[question.name] = true;
        return acc;
      },
      {} as Record<string, boolean>
    );
    setDirtyFields(allFieldsDirty);

    try {
      schema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce(
          (acc, curr) => {
            const field = curr.path[0] as string;
            acc[field] = curr.message;
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(newErrors);
      }
      return false;
    }
  }, [formData, createValidationSchema, currentStep.questions]);

  useEffect(() => {
    if (Object.keys(dirtyFields).length === 0) return;

    if (currentStep.questions.every((q) => !q.validation)) {
      setIsStepValid(true);
      setErrors({});
      return;
    }

    const schema = createValidationSchema();

    try {
      schema.parse(formData);
      setIsStepValid(true);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce(
          (acc, curr) => {
            const field = curr.path[0] as string;
            // Only show errors for dirty fields
            if (dirtyFields[field]) {
              acc[field] = curr.message;
            }
            return acc;
          },
          {} as Record<string, string>
        );
        setErrors(newErrors);
      }
      setIsStepValid(false);
    }
  }, [formData, createValidationSchema, currentStep.questions, dirtyFields]);

  useEffect(() => {
    setDirtyFields({});
  }, [currentStep]);

  const setFieldDirty = useCallback((fieldName: string) => {
    setDirtyFields((prev) => ({ ...prev, [fieldName]: true }));
  }, []);

  return {
    isStepValid,
    validateStep,
    errors,
    setFieldDirty,
  };
};
