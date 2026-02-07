/**
 * Church Service
 *
 * Business logic for church management.
 */

import { db, serverTimestamp, increment } from '../config/firebase';
import { getPaginatedResults, PaginatedResults } from '../utils/pagination.utils';
import slugify from 'slugify';
import {
  Church,
  ChurchData,
  ChurchCreateInput,
  ChurchLeadership,
  ChurchLeadershipData,
  ChurchQueryFilters,
} from '@ceslar/shared-types';

const COLLECTION = 'churches';

/**
 * Country info
 */
interface CountryInfo {
  name: string;
  code: string;
}

/**
 * Grouped churches by country/department
 */
type GroupedChurches = Record<string, Record<string, Church[]>>;

/**
 * Get church by ID
 */
export async function getChurchById(
  churchId: string,
  includeLeadership: boolean = false
): Promise<Church | null> {
  const doc = await db.collection(COLLECTION).doc(churchId).get();

  if (!doc.exists) {
    return null;
  }

  const church: Church = {
    id: doc.id,
    ...(doc.data() as ChurchData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };

  if (includeLeadership) {
    const leadershipSnapshot = await doc.ref.collection('leadership').get();
    church.leadership = leadershipSnapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as ChurchLeadershipData),
      createdAt: d.data()?.createdAt,
      updatedAt: d.data()?.updatedAt,
    })) as ChurchLeadership[];
  }

  return church;
}

/**
 * Get church by slug
 */
export async function getChurchBySlug(slug: string): Promise<Church | null> {
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
    ...(doc.data() as ChurchData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Get churches with pagination and filters
 */
export async function getChurches(
  options: ChurchQueryFilters = {}
): Promise<PaginatedResults<Church>> {
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

  const filters: Record<string, unknown> = {};

  if (status) filters.status = status;
  if (country) filters.country = country;
  if (department) filters.department = department;
  if (city) filters.city = city;
  if (level) filters.level = level;
  if (parentChurchId) filters.parentChurchId = parentChurchId;

  const result = await getPaginatedResults(
    db.collection(COLLECTION) as FirebaseFirestore.CollectionReference<ChurchData>,
    {
      filters,
      orderBy: [{ field: 'name', direction: 'asc' }],
      page,
      limit,
    }
  );

  // Search filter (in memory for now)
  let data = result.data as Church[];
  if (search) {
    const searchLower = search.toLowerCase();
    data = data.filter(
      (church) =>
        church.name?.toLowerCase().includes(searchLower) ||
        church.city?.toLowerCase().includes(searchLower)
    );
  }

  return { data, pagination: result.pagination };
}

/**
 * Get featured churches
 */
export async function getFeaturedChurches(limit: number = 4): Promise<Church[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .where('isFeatured', '==', true)
    .orderBy('name')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as ChurchData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  }));
}

/**
 * Get headquarters church
 */
export async function getHeadquarters(): Promise<Church | null> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('level', '==', 'headquarters')
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...(doc.data() as ChurchData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Get churches grouped by country/department
 */
export async function getChurchesGrouped(): Promise<GroupedChurches> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .orderBy('country')
    .orderBy('department')
    .orderBy('name')
    .get();

  const grouped: GroupedChurches = {};

  snapshot.docs.forEach((doc) => {
    const church: Church = {
      id: doc.id,
      ...(doc.data() as ChurchData),
      createdAt: doc.data()?.createdAt,
      updatedAt: doc.data()?.updatedAt,
    };
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
 */
export async function getCountries(): Promise<CountryInfo[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .select('country', 'countryCode')
    .get();

  const countries = new Map<string, CountryInfo>();

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
 */
export async function getDepartmentsByCountry(country: string): Promise<string[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('status', '==', 'active')
    .where('country', '==', country)
    .select('department')
    .get();

  const departments = new Set<string>();

  snapshot.docs.forEach((doc) => {
    const dept = doc.data().department;
    if (dept) departments.add(dept);
  });

  return Array.from(departments).sort();
}

/**
 * Create church
 */
export async function createChurch(data: ChurchCreateInput): Promise<Church> {
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
      ...(data.stats || {}),
    },
    status: data.status || 'active',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION).add(churchData);

  // Return with id - timestamps will be resolved when read back
  return {
    id: docRef.id,
    ...churchData,
  } as unknown as Church;
}

/**
 * Update church
 */
export async function updateChurch(
  churchId: string,
  data: Partial<ChurchData>
): Promise<Church | null> {
  const churchRef = db.collection(COLLECTION).doc(churchId);
  const doc = await churchRef.get();

  if (!doc.exists) {
    throw new Error('Church not found');
  }

  const updateData: Partial<ChurchData> & { updatedAt: FirebaseFirestore.FieldValue; slug?: string } = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  // Update slug if name changed
  if (data.name && data.name !== doc.data()?.name) {
    let slug = slugify(data.name, { lower: true, strict: true });
    const existingSlug = await getChurchBySlug(slug);
    if (existingSlug && existingSlug.id !== churchId) {
      slug = `${slug}-${Date.now()}`;
    }
    updateData.slug = slug;
  }

  await churchRef.update(updateData);

  return getChurchById(churchId);
}

/**
 * Delete church
 */
export async function deleteChurch(churchId: string): Promise<void> {
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
 */
export async function addLeadership(
  churchId: string,
  data: ChurchLeadershipData
): Promise<ChurchLeadership> {
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
  } as unknown as ChurchLeadership;
}

/**
 * Remove leadership from church
 */
export async function removeLeadership(
  churchId: string,
  leadershipId: string
): Promise<void> {
  await db
    .collection(COLLECTION)
    .doc(churchId)
    .collection('leadership')
    .doc(leadershipId)
    .delete();
}

/**
 * Update church stats
 */
export async function updateChurchStats(
  churchId: string,
  stats: Partial<Record<'memberCount' | 'eventCount' | 'sermonCount' | 'ministryCount', number>>
): Promise<void> {
  const updates: Record<string, FirebaseFirestore.FieldValue> = {};

  Object.entries(stats).forEach(([key, value]) => {
    updates[`stats.${key}`] = increment(value);
  });

  updates.updatedAt = serverTimestamp();

  await db.collection(COLLECTION).doc(churchId).update(updates);
}
