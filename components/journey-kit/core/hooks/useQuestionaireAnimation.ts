import { useState, useCallback } from 'react';
import { Animated } from 'react-native';

/**
 * Hook that manages fade animations for questionnaire transitions
 *
 * @returns {Object} Animation controls and values
 * @property {Animated.Value} fadeAnim - Animated value for opacity
 * @property {() => void} fadeOut - Function to trigger fade out animation
 * @property {() => void} fadeIn - Function to trigger fade in animation
 */
export const useQuestionnaireAnimation = () => {
  const [fadeAnim] = useState(new Animated.Value(1));

  const fadeOut = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const fadeIn = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 50,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return { fadeAnim, fadeOut, fadeIn };
};
