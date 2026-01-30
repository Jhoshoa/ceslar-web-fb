/**
 * Questions API - RTK Query Endpoints
 *
 * Manages registration questions and categories for the questionnaire system.
 */

import { baseApi, TagType } from './baseApi';
import type {
  Question,
  QuestionCategory,
  QuestionCreateInput,
  QuestionUpdateInput,
  QuestionCategoryCreateInput,
  QuestionCategoryUpdateInput,
  TargetAudience,
  QuestionScope,
  QuestionsGroupedByCategory,
} from '@ceslar/shared-types';

/**
 * Query parameters for fetching questions
 */
interface GetQuestionsParams {
  categoryId?: string;
  targetAudience?: TargetAudience;
  scope?: QuestionScope;
  churchId?: string;
}

/**
 * Update question params with ID
 */
interface UpdateQuestionParams extends QuestionUpdateInput {
  id: string;
}

/**
 * Update category params with ID
 */
interface UpdateCategoryParams extends QuestionCategoryUpdateInput {
  id: string;
}

/**
 * Reorder questions params
 */
interface ReorderQuestionsParams {
  categoryId: string;
  orderedIds: string[];
}

export const questionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC QUERIES
    // ==========================================

    getQuestions: builder.query<Question[], GetQuestionsParams>({
      query: (params = {}) => ({
        url: '/questions',
        params: {
          categoryId: params.categoryId,
          targetAudience: params.targetAudience,
          scope: params.scope,
          churchId: params.churchId,
        },
      }),
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Question' as TagType, id })),
              { type: 'Question' as TagType, id: 'LIST' },
            ]
          : [{ type: 'Question' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: Question[] }) => response.data,
    }),

    getCategories: builder.query<QuestionCategory[], void>({
      query: () => '/questions/categories',
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'QuestionCategory' as TagType, id })),
              { type: 'QuestionCategory' as TagType, id: 'LIST' },
            ]
          : [{ type: 'QuestionCategory' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: QuestionCategory[] }) => response.data,
    }),

    getRegistrationQuestions: builder.query<QuestionsGroupedByCategory[], string | undefined>({
      query: (churchId) => ({
        url: '/questions/registration',
        params: churchId ? { churchId } : {},
      }),
      providesTags: [{ type: 'Question' as TagType, id: 'REGISTRATION' }],
      transformResponse: (response: { data: QuestionsGroupedByCategory[] }) => response.data,
    }),

    getQuestionById: builder.query<Question, string>({
      query: (id) => `/questions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Question' as TagType, id }],
      transformResponse: (response: { data: Question }) => response.data,
    }),

    // ==========================================
    // ADMIN: QUESTION MUTATIONS
    // ==========================================

    createQuestion: builder.mutation<Question, QuestionCreateInput>({
      query: (data) => ({
        url: '/questions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Question' as TagType, id: 'LIST' },
        { type: 'Question' as TagType, id: 'REGISTRATION' },
        { type: 'QuestionCategory' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: Question }) => response.data,
    }),

    updateQuestion: builder.mutation<Question, UpdateQuestionParams>({
      query: ({ id, ...data }) => ({
        url: `/questions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Question' as TagType, id },
        { type: 'Question' as TagType, id: 'LIST' },
        { type: 'Question' as TagType, id: 'REGISTRATION' },
        { type: 'QuestionCategory' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: Question }) => response.data,
    }),

    deleteQuestion: builder.mutation<void, string>({
      query: (id) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Question' as TagType, id: 'LIST' },
        { type: 'Question' as TagType, id: 'REGISTRATION' },
        { type: 'QuestionCategory' as TagType, id: 'LIST' },
      ],
    }),

    reorderQuestions: builder.mutation<void, ReorderQuestionsParams>({
      query: ({ categoryId, orderedIds }) => ({
        url: `/questions/reorder/${categoryId}`,
        method: 'PUT',
        body: { orderedIds },
      }),
      invalidatesTags: [
        { type: 'Question' as TagType, id: 'LIST' },
        { type: 'Question' as TagType, id: 'REGISTRATION' },
      ],
    }),

    // ==========================================
    // ADMIN: CATEGORY MUTATIONS
    // ==========================================

    createCategory: builder.mutation<QuestionCategory, QuestionCategoryCreateInput>({
      query: (data) => ({
        url: '/questions/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'QuestionCategory' as TagType, id: 'LIST' }],
      transformResponse: (response: { data: QuestionCategory }) => response.data,
    }),

    updateCategory: builder.mutation<QuestionCategory, UpdateCategoryParams>({
      query: ({ id, ...data }) => ({
        url: `/questions/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'QuestionCategory' as TagType, id },
        { type: 'QuestionCategory' as TagType, id: 'LIST' },
      ],
      transformResponse: (response: { data: QuestionCategory }) => response.data,
    }),

    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({
        url: `/questions/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'QuestionCategory' as TagType, id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetQuestionsQuery,
  useGetCategoriesQuery,
  useGetRegistrationQuestionsQuery,
  useGetQuestionByIdQuery,
  useCreateQuestionMutation,
  useUpdateQuestionMutation,
  useDeleteQuestionMutation,
  useReorderQuestionsMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = questionsApi;

// Alias for backwards compatibility
export const useGetQuestionCategoriesQuery = useGetCategoriesQuery;
