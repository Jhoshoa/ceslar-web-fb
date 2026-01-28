/**
 * Ministry Service
 */

const { db, serverTimestamp } = require('../config/firebase');
const { getPaginatedResults } = require('../utils/pagination.utils');
const slugify = require('slugify');

const COLLECTION = 'ministries';

async function getMinistryById(ministryId) {
  const doc = await db.collection(COLLECTION).doc(ministryId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getMinistries(options = {}) {
  const { page = 1, limit = 10, churchId, type, isActive = true } = options;

  const filters = { isActive };
  if (churchId) filters.churchId = churchId;
  if (type) filters.type = type;

  return getPaginatedResults(db.collection(COLLECTION), {
    filters,
    orderBy: [{ field: 'name.es', direction: 'asc' }],
    page,
    limit,
  });
}

async function createMinistry(data, userId) {
  const slug = slugify(data.name?.es || data.name || '', { lower: true, strict: true });

  const ministryData = {
    ...data,
    slug,
    createdBy: userId,
    memberCount: 0,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION).add(ministryData);
  return { id: docRef.id, ...ministryData };
}

async function updateMinistry(ministryId, data) {
  const ref = db.collection(COLLECTION).doc(ministryId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Ministry not found');

  data.updatedAt = serverTimestamp();
  await ref.update(data);
  return getMinistryById(ministryId);
}

async function deleteMinistry(ministryId) {
  await db.collection(COLLECTION).doc(ministryId).delete();
}

module.exports = {
  getMinistryById,
  getMinistries,
  createMinistry,
  updateMinistry,
  deleteMinistry,
};
