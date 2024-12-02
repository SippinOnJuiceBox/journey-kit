
# React Native Simple Questionaire Kit (still in progress)
A simple type-safe library to make engaging onboarding flows and surveys in React Native.

• Type-safe form validation with Zod
• Smooth animated transitions
• Customizable question components
• Built-in navigation handling
• Progressive form state management

**This is still in progress but if you want to use it all you have to do is copy the journey-kit/ folder in /components**

### Video demo
![demo](https://github.com/user-attachments/assets/c30d94cb-29ac-4b7e-b4df-576bbbaf26bb)


## Dependencies

Required peer dependencies:
```json
{
  "react-native-reanimated": "^3.0.0",
  "zod": "^3.0.0",
  "expo-router": "^2.0.0"
}
```

## Quick Start

```typescript
import { Questionnaire } from '@your-org/questionnaire-lib';

const config = [{
  pageHeader: "Personal Information",
  pageSubheader: "Tell us about yourself",
  questions: [{
    type: 'input',
    name: 'fullName',
    question: "What's your name?",
    validation: z.string().min(2, "Please enter your name")
  }]
}];

function MyQuestionnaire() {
  const handleComplete = async (data) => {
    console.log('Form completed:', data);
  };

  return (
    <Questionnaire
      config={config}
      onCompleted={handleComplete}
    />
  );
}
```

## Core Concepts

### Configuration Structure
Each questionnaire consists of steps, and each step contains questions:

```typescript
type JourneyConfig = {
  pageHeader: string;
  pageSubheader?: string;
  questions: Question[];
}[];
```

### Question Types
Questions are defined with common properties and type-specific properties:

```typescript
interface BaseQuestion {
  name: string;
  question: string;
  subheading?: string;
  validation?: z.ZodType<any>;
}
```

## Creating a Questionnaire

### 1. Define Your Configuration

```typescript
const questionnaireConfig = [
  {
    pageHeader: "Getting Started",
    pageSubheader: "Let's get to know you better",
    questions: [
      {
        type: 'input',
        name: 'email',
        question: "What's your email address?",
        validation: z.string().email("Please enter a valid email")
      },
      {
        type: 'multiple-choice',
        name: 'preference',
        question: "How did you hear about us?",
        options: ['Social Media', 'Friend', 'Advertisement']
      }
    ]
  }
];
```

### 2. Create Custom Question Components

```typescript
import { QuestionComponentProps } from '@your-org/questionnaire-lib';

function CustomInputQuestion({ question, value, onChange }: QuestionComponentProps) {
  return (
    <View>
      <Text>{question.question}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(question.name, text)}
      />
    </View>
  );
}

// Register your component
Registry.register('custom-input', CustomInputQuestion);
```

### 3. Implement the Questionnaire

```typescript
function JourneyFlow() {
  const handleComplete = async (formData) => {
    try {
      await submitData(formData);
      router.push('/success');
    } catch (error) {
      console.error('Submission failed:', error);
    }
  };

  return (
    <Questionnaire
      config={questionnaireConfig}
      onCompleted={handleComplete}
      initialStep={0}
      customQuestionComponents={{
        'custom-input': CustomInputQuestion
      }}
    />
  );
}
```

## Question Types

### Built-in Types
- Input
- Multiple Choice
- Checkbox
- Text Area
- File Upload
- Slider
- Date Picker

### Creating Custom Types

1. Define the type interface:
```typescript
declare module '@your-org/questionnaire-lib' {
  interface QuestionTypes {
    'rating-scale': {
      min: number;
      max: number;
      step: number;
    }
  }
}
```

2. Create the component:
```typescript
function RatingScale({ question, value, onChange }: QuestionComponentProps) {
  return (
    <Slider
      minimum={question.min}
      maximum={question.max}
      step={question.step}
      value={value}
      onValueChange={(val) => onChange(question.name, val)}
    />
  );
}
```

3. Register the component:
```typescript
Registry.register('rating-scale', RatingScale);
```

## Validation

### Using Zod Schemas

```typescript
const questionConfig = {
  type: 'input',
  name: 'age',
  question: "What's your age?",
  validation: z.number()
    .min(18, "Must be at least 18")
    .max(120, "Invalid age")
};
```

### Custom Validation

```typescript
const customValidation = z.string().refine(
  (value) => validatePhoneNumber(value),
  "Please enter a valid phone number"
);
```

## Styling

The library uses Tailwind CSS for styling. Customize appearance through className props:

```typescript
<Questionnaire
  config={config}
  className="bg-white p-4"
  questionClassName="mb-4"
/>
```

## Advanced Usage

### Progress Tracking

```typescript
function JourneyWithProgress() {
  const [progress, setProgress] = useState(0);

  return (
    <>
      <ProgressIndicator value={progress} />
      <Questionnaire
        config={config}
        onStepChange={(step) => setProgress((step / config.length) * 100)}
      />
    </>
  );
}
```

### State Management

```typescript
function ManagedQuestionnaire() {
  const [formData, setFormData] = useState({});

  return (
    <Questionnaire
      config={config}
      initialValues={formData}
      onStepComplete={(stepData) => {
        setFormData(prev => ({...prev, ...stepData}));
      }}
    />
  );
}
```

## API Reference

### Questionnaire Props
| Prop | Type | Description |
|------|------|-------------|
| config | JourneyConfig | Questionnaire configuration |
| onCompleted | (data: any) => Promise<void> | Completion callback |
| initialStep | number | Starting step index |
| customQuestionComponents | Record<string, Component> | Custom question components |
| hideHeader | boolean | Hide default header |
| initialValues | Record<string, any> | Initial form values |

### Hooks
- `useQuestionnaireAnimation`: Manage fade transitions
- `useQuestionnaireNavigation`: Handle navigation
- `useQuestionnaireValidation`: Form validation

### Example of a custom component
```tsx
import React from 'react';
import { View } from 'react-native';

import { Registry } from '../core/types/QuestionComponents';
import { QuestionComponentProps, BaseQuestion } from '../core/types/onboarding';

/**
 * Step 1: Define your question type by declaring the additional props
 * your question type needs in the QuestionTypes interface
 */
declare module '../core/types/onboarding' {
  interface QuestionTypes {
    yourType: {
      // Add your question-specific properties here
      someOption?: string;
      anotherOption?: number;
    }
  }
}

/**
 * Step 2: Create a type that combines the base question with your specific props
 * This gives you proper typing for the question prop in your component
 */
type YourQuestionType = BaseQuestion & { type: 'yourType' } & QuestionTypes['yourType'];

/**
 * Step 3: Define your component's props interface
 * Extend the base props but override the question prop with your specific type
 */
interface YourComponentProps extends Omit<QuestionComponentProps, 'question'> {
  question: YourQuestionType;
  // Add any additional props your component needs
  customProp?: string;
}

/**
 * Step 4: Create your component
 * Use the props interface you defined above
 */
function YourComponent({
  question,
  value,
  onChange,
  customProp,
}: YourComponentProps) {
  // Your component logic here
  
  return (
    <View>
      {/* Your component JSX */}
    </View>
  );
}

/**
 * Step 5: Register your component with the Registry
 * Use the same type name you declared in QuestionTypes
 */
Registry.register('yourType', YourComponent as React.ComponentType<QuestionComponentProps>);

export default YourComponent;
```
