/**
 * Sermon Service
 */

const { db, serverTimestamp, increment } = require('../config/firebase');
const { getPaginatedResults } = require('../utils/pagination.utils');
const slugify = require('slugify');

const COLLECTION = 'sermons';

async function getSermonById(sermonId) {
  const doc = await db.collection(COLLECTION).doc(sermonId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getSermons(options = {}) {
  const { page = 1, limit = 10, churchId, category, speakerId, isPublished = true } = options;

  const filters = { isPublished };
  if (churchId) filters.churchId = churchId;
  if (category) filters.category = category;
  if (speakerId) filters.speakerId = speakerId;

  return getPaginatedResults(db.collection(COLLECTION), {
    filters,
    orderBy: [{ field: 'date', direction: 'desc' }],
    page,
    limit,
  });
}

async function getLatestSermons(limit = 3, churchId = null) {
  let query = db.collection(COLLECTION)
    .where('isPublished', '==', true)
    .orderBy('date', 'desc')
    .limit(limit);

  if (churchId) {
    query = query.where('churchId', '==', churchId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getFeaturedSermons(limit = 3) {
  const snapshot = await db.collection(COLLECTION)
    .where('isPublished', '==', true)
    .where('isFeatured', '==', true)
    .orderBy('date', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createSermon(data, userId) {
  const slug = slugify(data.title?.es || data.title || '', { lower: true, strict: true });

  const sermonData = {
    ...data,
    slug,
    createdBy: userId,
    viewCount: 0,
    isPublished: data.isPublished ?? false,
    isFeatured: data.isFeatured ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION).add(sermonData);

  if (data.churchId) {
    await db.collection('churches').doc(data.churchId).update({
      'stats.sermonCount': increment(1),
    });
  }

  return { id: docRef.id, ...sermonData };
}

async function updateSermon(sermonId, data) {
  const ref = db.collection(COLLECTION).doc(sermonId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Sermon not found');

  data.updatedAt = serverTimestamp();
  await ref.update(data);
  return getSermonById(sermonId);
}

async function deleteSermon(sermonId) {
  const ref = db.collection(COLLECTION).doc(sermonId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data();
  await ref.delete();

  if (data.churchId) {
    await db.collection('churches').doc(data.churchId).update({
      'stats.sermonCount': increment(-1),
    });
  }
}

async function incrementViews(sermonId) {
  await db.collection(COLLECTION).doc(sermonId).update({
    viewCount: increment(1),
  });
}

module.exports = {
  getSermonById,
  getSermons,
  getLatestSermons,
  getFeaturedSermons,
  createSermon,
  updateSermon,
  deleteSermon,
  incrementViews,
};
