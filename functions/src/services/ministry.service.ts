/**
 * Ministry Service
 *
 * Business logic for ministry management.
 */

import { db, serverTimestamp } from '../config/firebase';
import { getPaginatedResults, PaginatedResults } from '../utils/pagination.utils';
import slugify from 'slugify';
import {
  Ministry,
  MinistryData,
  MinistryCreateInput,
  MinistryUpdateInput,
  MinistryQueryFilters,
  LocalizedString,
} from '@ceslar/shared-types';

const COLLECTION = 'ministries';

/**
 * Get ministry by ID
 */
export async function getMinistryById(ministryId: string): Promise<Ministry | null> {
  const doc = await db.collection(COLLECTION).doc(ministryId).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...(doc.data() as MinistryData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Get ministries with pagination and filters
 */
export async function getMinistries(
  options: MinistryQueryFilters = {}
): Promise<PaginatedResults<Ministry>> {
  const {
    page = 1,
    limit = 10,
    churchId,
    type,
    isActive = true,
  } = options;

  const filters: Record<string, unknown> = { isActive };
  if (churchId) filters.churchId = churchId;
  if (type) filters.type = type;

  return getPaginatedResults(
    db.collection(COLLECTION) as FirebaseFirestore.CollectionReference<MinistryData>,
    {
      filters,
      orderBy: [{ field: 'name.es', direction: 'asc' }],
      page,
      limit,
    }
  ) as Promise<PaginatedResults<Ministry>>;
}

/**
 * Create ministry
 */
export async function createMinistry(
  data: MinistryCreateInput,
  userId: string
): Promise<Ministry> {
  const nameObj = data.name as LocalizedString;
  const nameStr = nameObj?.es || '';
  const slug = slugify(nameStr, { lower: true, strict: true });

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
  return {
    id: docRef.id,
    ...ministryData,
  } as unknown as Ministry;
}

/**
 * Update ministry
 */
export async function updateMinistry(
  ministryId: string,
  data: Partial<MinistryUpdateInput>
): Promise<Ministry | null> {
  const ref = db.collection(COLLECTION).doc(ministryId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Ministry not found');

  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await ref.update(updateData);
  return getMinistryById(ministryId);
}

/**
 * Delete ministry
 */
export async function deleteMinistry(ministryId: string): Promise<void> {
  await db.collection(COLLECTION).doc(ministryId).delete();
}
