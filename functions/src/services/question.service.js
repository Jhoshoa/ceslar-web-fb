/**
 * Question Service
 *
 * Business logic for question and question category management.
 * Supports the registration questionnaire system.
 */

const { db, serverTimestamp, increment } = require('../config/firebase');
const { getPaginatedResults } = require('../utils/pagination.utils');

const QUESTIONS_COLLECTION = 'questions';
const CATEGORIES_COLLECTION = 'questionCategories';

// ==========================================
// QUESTION CATEGORIES
// ==========================================

/**
 * Get all question categories
 */
async function getCategories(options = {}) {
  const { isActive = true } = options;

  const query = db
    .collection(CATEGORIES_COLLECTION)
    .where('isActive', '==', isActive)
    .orderBy('order', 'asc');

  const snapshot = await query.get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Get category by ID
 */
async function getCategoryById(categoryId) {
  const doc = await db.collection(CATEGORIES_COLLECTION).doc(categoryId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Create question category
 */
async function createCategory(data) {
  // Get max order for new category placement
  const lastCategory = await db
    .collection(CATEGORIES_COLLECTION)
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  const maxOrder = lastCategory.empty ? 0 : lastCategory.docs[0].data().order;

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
  return { id: docRef.id, ...categoryData };
}

/**
 * Update question category
 */
async function updateCategory(categoryId, data) {
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
async function deleteCategory(categoryId) {
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
async function getQuestions(options = {}) {
  const {
    categoryId,
    isActive = true,
    targetAudience,
    scope,
    churchId,
  } = options;

  let query = db.collection(QUESTIONS_COLLECTION);

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

  let questions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filter by churchId if scope is 'church'
  if (churchId) {
    questions = questions.filter(
      (q) => q.scope === 'global' || (q.churchIds && q.churchIds.includes(churchId)),
    );
  }

  return questions;
}

/**
 * Get question by ID
 */
async function getQuestionById(questionId) {
  const doc = await db.collection(QUESTIONS_COLLECTION).doc(questionId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Create question
 */
async function createQuestion(data) {
  // Get max order within the category
  const lastQuestion = await db
    .collection(QUESTIONS_COLLECTION)
    .where('categoryId', '==', data.categoryId)
    .orderBy('order', 'desc')
    .limit(1)
    .get();

  const maxOrder = lastQuestion.empty ? 0 : lastQuestion.docs[0].data().order;

  const questionData = {
    categoryId: data.categoryId,
    categoryName: data.categoryName || { es: '', en: '', pt: '' },
    questionText: data.questionText,
    questionType: data.questionType,
    options: data.options || [],
    validation: data.validation || {},
    targetAudience: data.targetAudience || 'all',
    scope: data.scope || 'global',
    churchIds: data.churchIds || [],
    conditionalDisplay: data.conditionalDisplay || null,
    order: data.order != null ? data.order : maxOrder + 1,
    isActive: data.isActive !== false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(QUESTIONS_COLLECTION).add(questionData);

  // Increment question count on category
  await db
    .collection(CATEGORIES_COLLECTION)
    .doc(data.categoryId)
    .update({ questionCount: increment(1), updatedAt: serverTimestamp() });

  return { id: docRef.id, ...questionData };
}

/**
 * Update question
 */
async function updateQuestion(questionId, data) {
  const ref = db.collection(QUESTIONS_COLLECTION).doc(questionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Question not found');

  const oldData = doc.data();
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
async function deleteQuestion(questionId) {
  const ref = db.collection(QUESTIONS_COLLECTION).doc(questionId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Question not found');

  const { categoryId } = doc.data();

  await ref.delete();

  // Decrement question count on category
  if (categoryId) {
    await db
      .collection(CATEGORIES_COLLECTION)
      .doc(categoryId)
      .update({ questionCount: increment(-1), updatedAt: serverTimestamp() });
  }
}

/**
 * Reorder questions within a category
 */
async function reorderQuestions(categoryId, orderedIds) {
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
async function getRegistrationQuestions(churchId = null) {
  let query = db
    .collection(QUESTIONS_COLLECTION)
    .where('isActive', '==', true)
    .where('targetAudience', 'in', ['all', 'new_members'])
    .orderBy('order', 'asc');

  const snapshot = await query.get();

  let questions = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Filter: global questions + church-specific questions
  if (churchId) {
    questions = questions.filter(
      (q) => q.scope === 'global' || (q.churchIds && q.churchIds.includes(churchId)),
    );
  } else {
    questions = questions.filter((q) => q.scope === 'global');
  }

  // Group by category
  const categories = await getCategories();
  const grouped = categories
    .map((cat) => ({
      ...cat,
      questions: questions.filter((q) => q.categoryId === cat.id),
    }))
    .filter((cat) => cat.questions.length > 0);

  return grouped;
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  getRegistrationQuestions,
};
