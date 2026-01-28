/**
 * Church Service
 *
 * Business logic for church management.
 */

const { db, serverTimestamp, increment } = require('../config/firebase');
const { getPaginatedResults } = require('../utils/pagination.utils');
const slugify = require('slugify');

const COLLECTION = 'churches';

/**
 * Get church by ID
 *
 * @param {string} churchId - Church ID
 * @param {boolean} includeLeadership - Include leadership subcollection
 * @returns {Promise<Object|null>} Church data or null
 */
async function getChurchById(churchId, includeLeadership = false) {
  const doc = await db.collection(COLLECTION).doc(churchId).get();

  if (!doc.exists) {
    return null;
  }

  const church = {
    id: doc.id,
    ...doc.data(),
  };

  if (includeLeadership) {
    const leadershipSnapshot = await doc.ref.collection('leadership').get();
    church.leadership = leadershipSnapshot.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  }

  return church;
}

/**
 * Get church by slug
 *
 * @param {string} slug - Church slug
 * @returns {Promise<Object|null>} Church data or null
 */
async function getChurchBySlug(slug) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

/**
 * Get churches with pagination and filters
 *
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated churches
 */
async function getChurches(options = {}) {
  const {
    page = 1,
    limit = 10,
    country,
    department,
    city,
    level,
    status = 'active',
    search,
    parentChurchId,
  } = options;

  const filters = {};

  if (status) filters.status = status;
  if (country) filters.country = country;
  if (department) filters.department = department;
  if (city) filters.city = city;
  if (level) filters.level = level;
  if (parentChurchId) filters.parentChurchId = parentChurchId;

  let result = await getPaginatedResults(db.collection(COLLECTION), {
    filters,
    orderBy: [{ field: 'name', direction: 'asc' }],
    page,
    limit,
  });

  // Search filter (in memory for now)
  if (search) {
    const searchLower = search.toLowerCase();
    result.data = result.data.filter(
      (church) =>
        church.name?.toLowerCase().includes(searchLower) ||
        church.city?.toLowerCase().includes(searchLower),
    );
  }

  return result;
}

/**
 * Get featured churches
 *
 * @param {number} limit - Number of churches
 * @returns {Promise<Array>} Featured churches
 */
async function getFeaturedChurches(limit = 4) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .where('isFeatured', '==', true)
    .orderBy('name')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

/**
 * Get headquarters church
 *
 * @returns {Promise<Object|null>} Headquarters church
 */
async function getHeadquarters() {
  const snapshot = await db
    .collection(COLLECTION)
    .where('level', '==', 'headquarters')
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  };
}

/**
 * Get churches grouped by country/department
 *
 * @returns {Promise<Object>} Grouped churches
 */
async function getChurchesGrouped() {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .orderBy('country')
    .orderBy('department')
    .orderBy('name')
    .get();

  const grouped = {};

  snapshot.docs.forEach((doc) => {
    const church = { id: doc.id, ...doc.data() };
    const country = church.country || 'Other';
    const department = church.department || 'Other';

    if (!grouped[country]) {
      grouped[country] = {};
    }
    if (!grouped[country][department]) {
      grouped[country][department] = [];
    }
    grouped[country][department].push(church);
  });

  return grouped;
}

/**
 * Get available countries
 *
 * @returns {Promise<Array>} List of countries
 */
async function getCountries() {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .select('country', 'countryCode')
    .get();

  const countries = new Map();

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.country && !countries.has(data.country)) {
      countries.set(data.country, {
        name: data.country,
        code: data.countryCode || '',
      });
    }
  });

  return Array.from(countries.values()).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get departments by country
 *
 * @param {string} country - Country name
 * @returns {Promise<Array>} List of departments
 */
async function getDepartmentsByCountry(country) {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .where('country', '==', country)
    .select('department')
    .get();

  const departments = new Set();

  snapshot.docs.forEach((doc) => {
    const dept = doc.data().department;
    if (dept) departments.add(dept);
  });

  return Array.from(departments).sort();
}

/**
 * Create church
 *
 * @param {Object} data - Church data
 * @returns {Promise<Object>} Created church
 */
async function createChurch(data) {
  // Generate slug from name
  let slug = slugify(data.name, { lower: true, strict: true });

  // Check for duplicate slug
  const existingSlug = await getChurchBySlug(slug);
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  const churchData = {
    ...data,
    slug,
    stats: {
      memberCount: 0,
      eventCount: 0,
      sermonCount: 0,
    },
    status: data.status || 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION).add(churchData);

  return {
    id: docRef.id,
    ...churchData,
  };
}

/**
 * Update church
 *
 * @param {string} churchId - Church ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated church
 */
async function updateChurch(churchId, data) {
  const churchRef = db.collection(COLLECTION).doc(churchId);
  const doc = await churchRef.get();

  if (!doc.exists) {
    throw new Error('Church not found');
  }

  // Update slug if name changed
  if (data.name && data.name !== doc.data().name) {
    let slug = slugify(data.name, { lower: true, strict: true });
    const existingSlug = await getChurchBySlug(slug);
    if (existingSlug && existingSlug.id !== churchId) {
      slug = `${slug}-${Date.now()}`;
    }
    data.slug = slug;
  }

  data.updatedAt = serverTimestamp();

  await churchRef.update(data);

  return getChurchById(churchId);
}

/**
 * Delete church
 *
 * @param {string} churchId - Church ID
 * @returns {Promise<void>}
 */
async function deleteChurch(churchId) {
  const churchRef = db.collection(COLLECTION).doc(churchId);

  // Delete subcollections
  const batch = db.batch();

  const leadershipSnapshot = await churchRef.collection('leadership').get();
  leadershipSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

  const membersSnapshot = await churchRef.collection('members').get();
  membersSnapshot.docs.forEach((doc) => batch.delete(doc.ref));

  batch.delete(churchRef);

  await batch.commit();
}

/**
 * Add leadership to church
 *
 * @param {string} churchId - Church ID
 * @param {Object} data - Leadership data
 * @returns {Promise<Object>} Added leadership
 */
async function addLeadership(churchId, data) {
  const churchRef = db.collection(COLLECTION).doc(churchId);
  const church = await churchRef.get();

  if (!church.exists) {
    throw new Error('Church not found');
  }

  const leadershipData = {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await churchRef.collection('leadership').add(leadershipData);

  return {
    id: docRef.id,
    ...leadershipData,
  };
}

/**
 * Remove leadership from church
 *
 * @param {string} churchId - Church ID
 * @param {string} leadershipId - Leadership entry ID
 * @returns {Promise<void>}
 */
async function removeLeadership(churchId, leadershipId) {
  await db
    .collection(COLLECTION)
    .doc(churchId)
    .collection('leadership')
    .doc(leadershipId)
    .delete();
}

/**
 * Update church stats
 *
 * @param {string} churchId - Church ID
 * @param {Object} stats - Stats to update
 * @returns {Promise<void>}
 */
async function updateChurchStats(churchId, stats) {
  const updates = {};

  Object.entries(stats).forEach(([key, value]) => {
    updates[`stats.${key}`] = increment(value);
  });

  updates.updatedAt = serverTimestamp();

  await db.collection(COLLECTION).doc(churchId).update(updates);
}

module.exports = {
  getChurchById,
  getChurchBySlug,
  getChurches,
  getFeaturedChurches,
  getHeadquarters,
  getChurchesGrouped,
  getCountries,
  getDepartmentsByCountry,
  createChurch,
  updateChurch,
  deleteChurch,
  addLeadership,
  removeLeadership,
  updateChurchStats,
};
