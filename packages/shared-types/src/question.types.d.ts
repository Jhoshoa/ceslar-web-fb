/**
 * Question Types
 *
 * Types for registration questions, categories, and answers.
 */
import { LocalizedString, Timestamp, WithTimestamps } from './common.types';
/**
 * Question input types
 */
export type QuestionType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'email' | 'phone' | 'url';
/**
 * Target audience for questions
 */
export type TargetAudience = 'all' | 'new_members' | 'visitors' | 'leaders' | 'members';
/**
 * Question scope
 */
export type QuestionScope = 'global' | 'church';
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
    isOther?: boolean;
}
/**
 * Question validation rules
 */
export interface QuestionValidation {
    isRequired: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: LocalizedString;
}
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
    questions?: Question[];
}
/**
 * Question category for creation
 */
export type QuestionCategoryCreateInput = QuestionCategoryData;
/**
 * Question category for update
 */
export type QuestionCategoryUpdateInput = Partial<QuestionCategoryData> & {
    id: string;
};
/**
 * Question base data (without ID and timestamps)
 */
export interface QuestionData {
    categoryId: string;
    questionText: LocalizedString;
    helpText?: LocalizedString;
    placeholder?: LocalizedString;
    questionType: QuestionType;
    options: QuestionOption[];
    validation: QuestionValidation;
    targetAudience: TargetAudience;
    scope: QuestionScope;
    churchId?: string;
    order: number;
    isActive: boolean;
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
export type QuestionUpdateInput = Partial<QuestionData> & {
    id: string;
};
/**
 * Single answer value (can be string or array for checkbox)
 */
export type AnswerValue = string | string[] | number | boolean | null;
/**
 * Answer to a single question
 */
export interface QuestionAnswer {
    questionId: string;
    questionText?: string;
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
//# sourceMappingURL=question.types.d.ts.map