/**
 * Question Service
 *
 * Business logic for question and question category management.
 * Supports the registration questionnaire system.
 */

import { db, serverTimestamp, increment } from '../config/firebase';
import {
  Question,
  QuestionData,
  QuestionCreateInput,
  QuestionUpdateInput,
  QuestionCategory,
  QuestionCategoryData,
  QuestionCategoryCreateInput,
  QuestionCategoryUpdateInput,
  QuestionQueryFilters,
  QuestionCategoryFilters,
  QuestionsGroupedByCategory,
} from '@ceslar/shared-types';

const QUESTIONS_COLLECTION = 'questions';
const CATEGORIES_COLLECTION = 'questionCategories';

// ==========================================
// QUESTION CATEGORIES
// ==========================================

/**
 * Get all question categories
 */
export async function getCategories(
  options: QuestionCategoryFilters = {}
): Promise<QuestionCategory[]> {
  const { isActive = true } = options;

  const query = db
    .collection(CATEGORIES_COLLECTION)
    .where('isActive', '==', isActive)
    .orderBy('order', 'asc');

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as QuestionCategoryData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  }));
}

/**
 * Get category by ID
 */
export async function getCategoryById(
  categoryId: string
): Promise<QuestionCategory | null> {
  const doc = await db.collection(CATEGORIES_COLLECTION).doc(categoryId).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...(doc.data() as QuestionCategoryData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Create question category
 */
export async function createCategory(
  data: QuestionCategoryCreateInput
): Promise<QuestionCategory> {
  // Get max order for new category placement
  const lastCategory = await db
    .collection(CATEGORIES_COLLECTION)
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  const maxOrder = lastCategory.empty ? 0 : (lastCategory.docs[0].data().order as number);

  const categoryData = {
    name: data.name,
    description: data.description || { es: '', en: '', pt: '' },
    order: data.order != null ? data.order : maxOrder + 1,
    isActive: data.isActive !== false,
    questionCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(CATEGORIES_COLLECTION).add(categoryData);
  return {
    id: docRef.id,
    ...categoryData,
  } as unknown as QuestionCategory;
}

/**
 * Update question category
 */
export async function updateCategory(
  categoryId: string,
  data: Partial<QuestionCategoryUpdateInput>
): Promise<QuestionCategory | null> {
  const ref = db.collection(CATEGORIES_COLLECTION).doc(categoryId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Category not found');

  const updateData = { ...data, updatedAt: serverTimestamp() };
  await ref.update(updateData);
  return getCategoryById(categoryId);
}

/**
 * Delete question category
 */
export async function deleteCategory(categoryId: string): Promise<void> {
  // Check if category has questions
  const questionsSnapshot = await db
    .collection(QUESTIONS_COLLECTION)
    .where('categoryId', '==', categoryId)
    .limit(1)
    .get();

  if (!questionsSnapshot.empty) {
    throw new Error('Cannot delete category with existing questions');
  }

  await db.collection(CATEGORIES_COLLECTION).doc(categoryId).delete();
}

// ==========================================
// QUESTIONS
// ==========================================

/**
 * Get questions with optional filters
 */
export async function getQuestions(
  options: QuestionQueryFilters = {}
): Promise<Question[]> {
  const {
    categoryId,
    isActive = true,
    targetAudience,
    scope,
    churchId,
  } = options;

  let query: FirebaseFirestore.Query = db.collection(QUESTIONS_COLLECTION);

  if (isActive !== undefined) {
    query = query.where('isActive', '==', isActive);
  }
  if (categoryId) {
    query = query.where('categoryId', '==', categoryId);
  }
  if (targetAudience) {
    query = query.where('targetAudience', '==', targetAudience);
  }
  if (scope) {
    query = query.where('scope', '==', scope);
  }

  query = query.orderBy('order', 'asc');
  const snapshot = await query.get();

  let questions: Question[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as QuestionData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  }));

  // Filter by churchId if scope is 'church'
  if (churchId) {
    questions = questions.filter(
      (q) =>
        q.scope === 'global' ||
        (q.churchId && q.churchId === churchId)
    );
  }

  return questions;
}

/**
 * Get question by ID
 */
export async function getQuestionById(questionId: string): Promise<Question | null> {
  const doc = await db.collection(QUESTIONS_COLLECTION).doc(questionId).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...(doc.data() as QuestionData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Create question
 */
export async function createQuestion(data: QuestionCreateInput): Promise<Question> {
  // Get max order within the category
  const lastQuestion = await db
    .collection(QUESTIONS_COLLECTION)
    .where('categoryId', '==', data.categoryId)
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  const maxOrder = lastQuestion.empty ? 0 : (lastQuestion.docs[0].data().order as number);

  const questionData = {
    categoryId: data.categoryId,
    questionText: data.questionText,
    questionType: data.questionType,
    options: data.options || [],
    validation: data.validation || { isRequired: false },
    targetAudience: data.targetAudience || 'all',
    scope: data.scope || 'global',
    churchId: data.churchId,
    dependsOn: data.dependsOn || null,
    order: data.order != null ? data.order : maxOrder + 1,
    isActive: data.isActive !== false,
    helpText: data.helpText,
    placeholder: data.placeholder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(QUESTIONS_COLLECTION).add(questionData);

  // Increment question count on category
  await db
    .collection(CATEGORIES_COLLECTION)
    .doc(data.categoryId)
    .update({ questionCount: increment(1), updatedAt: serverTimestamp() });

  return {
    id: docRef.id,
    ...questionData,
  } as unknown as Question;
}

/**
 * Update question
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<QuestionUpdateInput>
): Promise<Question | null> {
  const ref = db.collection(QUESTIONS_COLLECTION).doc(questionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Question not found');

  const oldData = doc.data() as QuestionData;
  const updateData = { ...data, updatedAt: serverTimestamp() };

  await ref.update(updateData);

  // If category changed, update counts on both categories
  if (data.categoryId && data.categoryId !== oldData.categoryId) {
    const batch = db.batch();
    batch.update(db.collection(CATEGORIES_COLLECTION).doc(oldData.categoryId), {
      questionCount: increment(-1),
      updatedAt: serverTimestamp(),
    });
    batch.update(db.collection(CATEGORIES_COLLECTION).doc(data.categoryId), {
      questionCount: increment(1),
      updatedAt: serverTimestamp(),
    });
    await batch.commit();
  }

  return getQuestionById(questionId);
}

/**
 * Delete question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  const ref = db.collection(QUESTIONS_COLLECTION).doc(questionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Question not found');

  const data = doc.data() as QuestionData;

  await ref.delete();

  // Decrement question count on category
  if (data.categoryId) {
    await db
      .collection(CATEGORIES_COLLECTION)
      .doc(data.categoryId)
      .update({ questionCount: increment(-1), updatedAt: serverTimestamp() });
  }
}

/**
 * Reorder questions within a category
 */
export async function reorderQuestions(
  _categoryId: string,
  orderedIds: string[]
): Promise<void> {
  const batch = db.batch();

  orderedIds.forEach((id, index) => {
    const ref = db.collection(QUESTIONS_COLLECTION).doc(id);
    batch.update(ref, { order: index + 1, updatedAt: serverTimestamp() });
  });

  await batch.commit();
}

/**
 * Get questions for registration form (public-facing)
 */
export async function getRegistrationQuestions(
  churchId: string | null = null
): Promise<QuestionsGroupedByCategory[]> {
  const query = db
    .collection(QUESTIONS_COLLECTION)
    .where('isActive', '==', true)
    .where('targetAudience', 'in', ['all', 'new_members'])
    .orderBy('order', 'asc');

  const snapshot = await query.get();

  let questions: Question[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as QuestionData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  }));

  // Filter: global questions + church-specific questions
  if (churchId) {
    questions = questions.filter(
      (q) =>
        q.scope === 'global' ||
        (q.churchId && q.churchId === churchId)
    );
  } else {
    questions = questions.filter((q) => q.scope === 'global');
  }

  // Group by category
  const categories = await getCategories();
  const grouped: QuestionsGroupedByCategory[] = categories
    .map((cat) => ({
      category: cat,
      questions: questions.filter((q) => q.categoryId === cat.id),
    }))
    .filter((cat) => cat.questions.length > 0);

  return grouped;
}
