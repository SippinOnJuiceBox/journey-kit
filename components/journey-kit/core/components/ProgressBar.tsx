import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

/**
 * Props for the ProgressBar component
 * @property {number} current - Current step or position in the progression (0-based index)
 * @property {number} total - Total number of steps or positions
 */
type ProgressBarProps = {
  current: number;
  total: number;
};

export function ProgressBar({ current, total }: ProgressBarProps) {
  // Shared value for tracking animation progress
  const progress = useSharedValue(0);

  useEffect(() => {
    const targetProgress = (current / total) * 100;
    progress.value = withTiming(targetProgress, {
      duration: 150,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [current, total]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value}%`,
    };
  });

  return (
    <View className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100">
      <Animated.View className="h-full rounded-full bg-stone-700" style={animatedStyle} />
    </View>
  );
}
