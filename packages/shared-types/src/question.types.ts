/**
 * Question Types
 *
 * Types for registration questions, categories, and answers.
 */

import {
  LocalizedString,
  Timestamp,
  WithTimestamps,
} from './common.types';

// ============================================
// ENUMS & LITERALS
// ============================================

/**
 * Question input types
 */
export type QuestionType =
  | 'text'       // Single line text
  | 'textarea'   // Multi-line text
  | 'select'     // Dropdown select
  | 'radio'      // Radio buttons (single choice)
  | 'checkbox'   // Checkboxes (multiple choice)
  | 'date'       // Date picker
  | 'number'     // Number input
  | 'email'      // Email input
  | 'phone'      // Phone input
  | 'url';       // URL input

/**
 * Target audience for questions
 */
export type TargetAudience =
  | 'all'           // Everyone
  | 'new_members'   // New members only
  | 'visitors'      // Visitors only
  | 'leaders'       // Leaders only
  | 'members';      // Members only

/**
 * Question scope
 */
export type QuestionScope =
  | 'global'    // All churches
  | 'church';   // Specific church only

// ============================================
// QUESTION OPTION
// ============================================

/**
 * Option labels in multiple languages
 */
export interface QuestionOptionLabels {
  es: string;
  en: string;
  pt: string;
}

/**
 * Question option for select/radio/checkbox
 */
export interface QuestionOption {
  value: string;
  labels: QuestionOptionLabels;
  order: number;
  isOther?: boolean;  // "Other" option with text input
}

// ============================================
// QUESTION VALIDATION
// ============================================

/**
 * Question validation rules
 */
export interface QuestionValidation {
  isRequired: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;  // for number type
  max?: number;  // for number type
  pattern?: string;  // regex pattern
  customMessage?: LocalizedString;  // Custom error message
}

// ============================================
// QUESTION CATEGORY
// ============================================

/**
 * Question category data
 */
export interface QuestionCategoryData {
  name: LocalizedString;
  description: LocalizedString;
  order: number;
  isActive?: boolean;
  icon?: string;
  color?: string;
}

/**
 * Full QuestionCategory document
 */
export interface QuestionCategory extends QuestionCategoryData, WithTimestamps {
  id: string;
  questions?: Question[];  // Populated when needed
}

/**
 * Question category for creation
 */
export type QuestionCategoryCreateInput = QuestionCategoryData;

/**
 * Question category for update
 */
export type QuestionCategoryUpdateInput = Partial<QuestionCategoryData> & { id: string };

// ============================================
// QUESTION DOCUMENT
// ============================================

/**
 * Question base data (without ID and timestamps)
 */
export interface QuestionData {
  // Reference
  categoryId: string;

  // Content
  questionText: LocalizedString;
  helpText?: LocalizedString;
  placeholder?: LocalizedString;

  // Type
  questionType: QuestionType;

  // Options (for select/radio/checkbox)
  options: QuestionOption[];

  // Validation
  validation: QuestionValidation;

  // Targeting
  targetAudience: TargetAudience;
  scope: QuestionScope;
  churchId?: string;  // Only for church-specific questions

  // Ordering
  order: number;

  // Status
  isActive: boolean;

  // Conditional logic (optional)
  dependsOn?: {
    questionId: string;
    value: string | string[];
  };
}

/**
 * Full Question document
 */
export interface Question extends QuestionData, WithTimestamps {
  id: string;
  createdBy?: string;
}

/**
 * Question for creation
 */
export type QuestionCreateInput = QuestionData;

/**
 * Question for update
 */
export type QuestionUpdateInput = Partial<QuestionData> & { id: string };

// ============================================
// ANSWERS
// ============================================

/**
 * Single answer value (can be string or array for checkbox)
 */
export type AnswerValue = string | string[] | number | boolean | null;

/**
 * Answer to a single question
 */
export interface QuestionAnswer {
  questionId: string;
  questionText?: string;  // Denormalized for display
  categoryId?: string;
  answer: AnswerValue;
  answeredAt: Timestamp;
}

/**
 * Complete set of registration answers
 */
export interface RegistrationAnswers {
  userId: string;
  churchId?: string;
  eventId?: string;
  answers: QuestionAnswer[];
  submittedAt: Timestamp;
  updatedAt: Timestamp;
}

// ============================================
// QUERY FILTERS
// ============================================

/**
 * Question list query filters
 */
export interface QuestionQueryFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  questionType?: QuestionType;
  targetAudience?: TargetAudience;
  scope?: QuestionScope;
  churchId?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Question category filters
 */
export interface QuestionCategoryFilters {
  isActive?: boolean;
}

// ============================================
// FORM BUILDING
// ============================================

/**
 * Questions grouped by category for form display
 */
export interface QuestionsGroupedByCategory {
  category: QuestionCategory;
  questions: Question[];
}

/**
 * Form configuration for registration
 */
export interface RegistrationForm {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  categories: QuestionsGroupedByCategory[];
  targetAudience: TargetAudience;
  isActive: boolean;
}
