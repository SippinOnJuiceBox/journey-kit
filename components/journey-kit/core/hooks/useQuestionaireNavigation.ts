import { Router } from 'expo-router';
import { useCallback } from 'react';

/**
 * Hook for managing questionnaire navigation with animations
 *
 * @param {number} currentStep - Current step index in the questionnaire
 * @param {Router} router - Expo Router instance for navigation
 * @param {() => void} fadeOut - Animation function for fading out content
 * @param {(step: number) => void} setCurrentStep - Function to update current step
 *
 * @returns {Object} Navigation controls
 * @property {() => void} handleBack - Function to handle back navigation
 */
export const useQuestionnaireNavigation = (
  currentStep: number,
  router: Router,
  fadeOut: () => void,
  setCurrentStep: (step: number) => void
) => {
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      fadeOut();
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
      }, 200);
    } else {
      router.navigate('/');
    }
  }, [currentStep, router, fadeOut, setCurrentStep]);

  return { handleBack };
};
