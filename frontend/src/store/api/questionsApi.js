/**
 * Questions API - RTK Query Endpoints
 *
 * Manages registration questions and categories for the questionnaire system.
 */

import { baseApi } from './baseApi';

export const questionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ==========================================
    // PUBLIC QUERIES
    // ==========================================

    getQuestions: builder.query({
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
              ...result.map(({ id }) => ({ type: 'Question', id })),
              { type: 'Question', id: 'LIST' },
            ]
          : [{ type: 'Question', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    getCategories: builder.query({
      query: () => '/questions/categories',
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'QuestionCategory', id })),
              { type: 'QuestionCategory', id: 'LIST' },
            ]
          : [{ type: 'QuestionCategory', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    getRegistrationQuestions: builder.query({
      query: (churchId) => ({
        url: '/questions/registration',
        params: churchId ? { churchId } : {},
      }),
      providesTags: [{ type: 'Question', id: 'REGISTRATION' }],
      transformResponse: (response) => response.data,
    }),

    getQuestionById: builder.query({
      query: (id) => `/questions/${id}`,
      providesTags: (result, error, id) => [{ type: 'Question', id }],
      transformResponse: (response) => response.data,
    }),

    // ==========================================
    // ADMIN: QUESTION MUTATIONS
    // ==========================================

    createQuestion: builder.mutation({
      query: (data) => ({
        url: '/questions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [
        { type: 'Question', id: 'LIST' },
        { type: 'Question', id: 'REGISTRATION' },
        { type: 'QuestionCategory', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    updateQuestion: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/questions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Question', id },
        { type: 'Question', id: 'LIST' },
        { type: 'Question', id: 'REGISTRATION' },
        { type: 'QuestionCategory', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteQuestion: builder.mutation({
      query: (id) => ({
        url: `/questions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'Question', id: 'LIST' },
        { type: 'Question', id: 'REGISTRATION' },
        { type: 'QuestionCategory', id: 'LIST' },
      ],
    }),

    reorderQuestions: builder.mutation({
      query: ({ categoryId, orderedIds }) => ({
        url: `/questions/reorder/${categoryId}`,
        method: 'PUT',
        body: { orderedIds },
      }),
      invalidatesTags: [
        { type: 'Question', id: 'LIST' },
        { type: 'Question', id: 'REGISTRATION' },
      ],
    }),

    // ==========================================
    // ADMIN: CATEGORY MUTATIONS
    // ==========================================

    createCategory: builder.mutation({
      query: (data) => ({
        url: '/questions/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'QuestionCategory', id: 'LIST' }],
      transformResponse: (response) => response.data,
    }),

    updateCategory: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/questions/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'QuestionCategory', id },
        { type: 'QuestionCategory', id: 'LIST' },
      ],
      transformResponse: (response) => response.data,
    }),

    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/questions/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'QuestionCategory', id: 'LIST' }],
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
