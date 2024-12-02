import { ComponentType } from 'react';

import { ComponentRegistry } from './componentTypes';
import { QuestionComponentProps } from './question';

/**
 * Internal storage for registered question components
 * Maps question type identifiers to their corresponding React components
 */
const components: Record<string, ComponentType<QuestionComponentProps>> = {};

/**
 * Registry implementation for managing survey question components
 *
 * @example
 * // Registering a multiple choice question component
 * Registry.register('multiple-choice', MultipleChoiceComponent);
 *
 * // Getting a registered component
 * const TextEntryComponent = Registry.get('text-entry');
 */
export const Registry: ComponentRegistry = {
  /**
   * Registers a new question component
   * @param type - Unique identifier for the question type (e.g., 'multiple-choice', 'text-entry')
   * @param component - React component that implements the question UI and behavior
   */
  register: (type: string, component: ComponentType<QuestionComponentProps>) => {
    components[type] = component;
  },

  /**
   * Retrieves a registered question component
   * @param type - The question type identifier
   * @throws Error if the requested question type is not registered
   * @returns The registered React component for the question type
   */
  get: (type: string) => {
    const component = components[type];
    if (!component) {
      throw new Error(`Question type ${type} is not supported`);
    }
    return component;
  },

  /**
   * Returns all registered question components
   * @returns Object mapping question types to their components
   */
  getAll: () => components,
};

/**
 * Export the components registry for external access
 * Useful for debugging or accessing the raw component map
 */
export const questionComponents = components;
