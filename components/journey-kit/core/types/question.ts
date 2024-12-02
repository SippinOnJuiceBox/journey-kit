import { ReactNode } from 'react';
import { z } from 'zod';

/**
 * Type alias for React nodes that can be used as icons
 */
export type IconType = ReactNode;

/**
 * Base interface that defines the common properties all question types must implement.
 * This ensures consistency across different question types in the Question flow.
 */
export interface BaseQuestion {
  /** Unique identifier for the question field */
  name: string;
  /** The question text displayed to the user */
  question: string;
  /** Optional additional text displayed below the question */
  subheading?: string;
  /** Zod schema for validating the question's answer */
  validation?: z.ZodType<any>;
}

/**
 * Empty interface that serves as a registry for all question types.
 * Question components will augment this interface with their specific properties.
 * @example
 * ```typescript
 * declare module './Question' {
 *   interface QuestionTypes {
 *     input: {
 *       placeholder?: string;
 *     }
 *   }
 * }
 * ```
 */
export interface QuestionTypes {}

/**
 * Creates a union type that combines BaseQuestion with specific properties
 * for each registered question type. This type is automatically updated
 * when new question types are added to QuestionTypes.
 */
export type QuestionQuestion = BaseQuestion &
  {
    [K in keyof QuestionTypes]: { type: K } & QuestionTypes[K];
  }[keyof QuestionTypes];

/**
 * Defines the structure of a single step in the Question process.
 * Each step can contain multiple questions and optional header text.
 */
export interface QuestionStep {
  /** Main header text for the step */
  pageHeader: string;
  /** Optional subheader text providing additional context */
  pageSubheader?: string;
  /** Array of questions to be displayed in this step */
  questions: QuestionQuestion[];
}

/**
 * Configuration type for the entire Question flow.
 * Consists of an array of steps that will be displayed in sequence.
 * @example
 * ```typescript
 * const config: QuestionConfig = [{
 *   pageHeader: "Personal Info",
 *   questions: [{
 *     type: 'input',
 *     name: 'email',
 *     question: 'What is your email?'
 *     validation: z.string().email('Please enter a valid email'),
 *   }]
 * }];
 * ```
 */
export type QuestionConfig = QuestionStep[];

/**
 * Base props interface that all question components will receive.
 * Provides consistent prop types across different question components.
 */
export interface QuestionComponentProps {
  /** The question configuration object */
  question: QuestionQuestion;
  /** Current value of the question field */
  value: any;
  /**
   * Callback function to update the question's value
   * @param name - The name of the question field
   * @param value - The new value for the field
   */
  onChange: (name: string, value: any) => void;
}
