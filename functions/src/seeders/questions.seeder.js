/**
 * Questions Seeder
 *
 * Seeds question categories and questions for the registration form system.
 * Supports multilingual content (es, en, pt).
 */

const { FieldValue } = require('firebase-admin/firestore');
const questionsData = require('./data/questions.json');

const QUESTIONS_COLLECTION = 'questions';
const CATEGORIES_COLLECTION = 'questionCategories';

/**
 * Seed question categories and questions
 */
async function seedQuestions(db, auth, options = {}) {
  const { force = false } = options;
  const questionsCollection = db.collection(QUESTIONS_COLLECTION);
  const categoriesCollection = db.collection(CATEGORIES_COLLECTION);

  // Check if data already exists
  if (!force) {
    const snapshot = await questionsCollection.limit(1).get();
    if (!snapshot.empty) {
      console.log('(already exist, skipping)');
      return 0;
    }
  }

  let count = 0;

  // Seed categories first
  for (const category of questionsData.categories) {
    const categoryDoc = {
      name: category.name,
      description: category.description,
      order: category.order,
      isActive: true,
      questionCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await categoriesCollection.doc(category.id).set(categoryDoc);
    count++;
  }

  // Seed questions and update category counts
  const categoryCounts = {};

  for (const question of questionsData.questions) {
    const categoryInfo = questionsData.categories.find((c) => c.id === question.categoryId);

    const questionDoc = {
      categoryId: question.categoryId,
      categoryName: categoryInfo ? categoryInfo.name : { es: '', en: '', pt: '' },
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || [],
      validation: question.validation || { isRequired: false },
      targetAudience: question.targetAudience || 'all',
      scope: question.scope || 'global',
      churchIds: question.churchIds || [],
      conditionalDisplay: question.conditionalDisplay || null,
      order: question.order,
      isActive: true,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await questionsCollection.add(questionDoc);
    count++;

    // Track category counts
    categoryCounts[question.categoryId] = (categoryCounts[question.categoryId] || 0) + 1;
  }

  // Update category question counts
  for (const [categoryId, questionCount] of Object.entries(categoryCounts)) {
    await categoriesCollection.doc(categoryId).update({ questionCount });
  }

  return count;
}

/**
 * Clear questions and categories
 */
async function clearQuestions(db) {
  let count = 0;

  // Clear questions
  const questionsSnapshot = await db.collection(QUESTIONS_COLLECTION).get();
  for (const doc of questionsSnapshot.docs) {
    await doc.ref.delete();
    count++;
  }

  // Clear categories
  const categoriesSnapshot = await db.collection(CATEGORIES_COLLECTION).get();
  for (const doc of categoriesSnapshot.docs) {
    await doc.ref.delete();
    count++;
  }

  return count;
}

module.exports = { seedQuestions, clearQuestions };
