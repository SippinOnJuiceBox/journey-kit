import { MotiPressable } from 'moti/interactions';
import React from 'react';
import { Text, View } from 'react-native';


/**
 * Props for the ContinueButton component
 * @property {() => void} onPress - Callback function executed when button is pressed
 * @property {boolean} [disabled] - Whether the button is disabled (default: false)
 * @property {React.ReactNode} [children] - Optional custom content to render inside 
 */
type ContinueButtonProps = {
  onPress: () => void;
  disabled?: boolean;
  children?: React.ReactNode;
};

export default function ContinueButton({
  onPress,
  disabled = false,
  children,
}: ContinueButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      onPress();
    }
  };

  return (
    <MotiPressable
      onPress={handlePress}
      disabled={disabled}
      animate={({ pressed }: any) => {
        'worklet';
        return {
          scale: pressed ? 0.95 : 1,
          opacity: pressed ? 0.5 : 1,
        };
      }}
      transition={{ type: 'timing', duration: 100 }}>
      <View className={`w-full rounded-full py-4 ${disabled ? 'bg-stone-100' : 'bg-stone-700'}`}>
        {children ? children : <Text className={`text-center text-lg  ${disabled ? 'text-white' : 'text-stone-200'}`}>Continue</Text>}
      </View>
    </MotiPressable>
  );
}
