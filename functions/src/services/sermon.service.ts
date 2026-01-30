/**
 * Sermon Service
 *
 * Business logic for sermon management.
 */

import { db, serverTimestamp, increment } from '../config/firebase';
import { getPaginatedResults, PaginatedResults } from '../utils/pagination.utils';
import slugify from 'slugify';
import {
  Sermon,
  SermonData,
  SermonCreateInput,
  SermonUpdateInput,
  SermonQueryFilters,
  LocalizedString,
} from '@ceslar/shared-types';

const COLLECTION = 'sermons';

/**
 * Get sermon by ID
 */
export async function getSermonById(sermonId: string): Promise<Sermon | null> {
  const doc = await db.collection(COLLECTION).doc(sermonId).get();
  if (!doc.exists) return null;
  return {
    id: doc.id,
    ...(doc.data() as SermonData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  };
}

/**
 * Get sermons with pagination and filters
 */
export async function getSermons(
  options: SermonQueryFilters = {}
): Promise<PaginatedResults<Sermon>> {
  const {
    page = 1,
    limit = 10,
    churchId,
    category,
    speakerId,
    isPublished = true,
  } = options;

  const filters: Record<string, unknown> = { isPublished };
  if (churchId) filters.churchId = churchId;
  if (category) filters.category = category;
  if (speakerId) filters.speakerId = speakerId;

  return getPaginatedResults(
    db.collection(COLLECTION) as FirebaseFirestore.CollectionReference<SermonData>,
    {
      filters,
      orderBy: [{ field: 'date', direction: 'desc' }],
      page,
      limit,
    }
  ) as Promise<PaginatedResults<Sermon>>;
}

/**
 * Get latest sermons
 */
export async function getLatestSermons(
  limit: number = 3,
  churchId: string | null = null
): Promise<Sermon[]> {
  let query = db
    .collection(COLLECTION)
    .where('isPublished', '==', true)
    .orderBy('date', 'desc')
    .limit(limit);

  if (churchId) {
    query = db
      .collection(COLLECTION)
      .where('churchId', '==', churchId)
      .where('isPublished', '==', true)
      .orderBy('date', 'desc')
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as SermonData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  }));
}

/**
 * Get featured sermons
 */
export async function getFeaturedSermons(limit: number = 3): Promise<Sermon[]> {
  const snapshot = await db
    .collection(COLLECTION)
    .where('isPublished', '==', true)
    .where('isFeatured', '==', true)
    .orderBy('date', 'desc')
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as SermonData),
    createdAt: doc.data()?.createdAt,
    updatedAt: doc.data()?.updatedAt,
  }));
}

/**
 * Create sermon
 */
export async function createSermon(
  data: SermonCreateInput,
  userId: string
): Promise<Sermon> {
  const titleObj = data.title as LocalizedString;
  const titleStr = titleObj?.es || '';
  const slug = slugify(titleStr, { lower: true, strict: true });

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

  return {
    id: docRef.id,
    ...sermonData,
  } as unknown as Sermon;
}

/**
 * Update sermon
 */
export async function updateSermon(
  sermonId: string,
  data: Partial<SermonUpdateInput>
): Promise<Sermon | null> {
  const ref = db.collection(COLLECTION).doc(sermonId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Sermon not found');

  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await ref.update(updateData);
  return getSermonById(sermonId);
}

/**
 * Delete sermon
 */
export async function deleteSermon(sermonId: string): Promise<void> {
  const ref = db.collection(COLLECTION).doc(sermonId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data() as SermonData;
  await ref.delete();

  if (data.churchId) {
    await db.collection('churches').doc(data.churchId).update({
      'stats.sermonCount': increment(-1),
    });
  }
}

/**
 * Increment sermon view count
 */
export async function incrementViews(sermonId: string): Promise<void> {
  await db.collection(COLLECTION).doc(sermonId).update({
    viewCount: increment(1),
  });
}
