import { ComponentType } from 'react';

import { QuestionComponentProps } from './question';

/**
 * Registry interface for managing question components in the Question system.
 * This provides type-safe registration and retrieval of components.
 */
export interface ComponentRegistry {
  /**
   * Register a new question component with the registry
   * @param type - Unique identifier for the question type (e.g., 'input', 'chips')
   * @param component - React component that implements QuestionComponentProps
   * @example
   * ```typescript
   * Registry.register('input', InputComponent);
   * ```
   */
  register: (type: string, component: ComponentType<QuestionComponentProps>) => void;

  /**
   * Retrieve a registered component by its type
   * @param type - The question type to retrieve
   * @returns The registered React component
   * @throws Error if component type is not found
   * @example
   * ```typescript
   * const InputComponent = Registry.get('input');
   * ```
   */
  get: (type: string) => ComponentType<QuestionComponentProps>;

  /**
   * Get all registered components
   * @returns Object mapping question types to their components
   * @example
   * ```typescript
   * const allComponents = Registry.getAll();
   * // { input: InputComponent, chips: ChipsComponent }
   * ```
   */
  getAll: () => Record<string, ComponentType<QuestionComponentProps>>;
}
