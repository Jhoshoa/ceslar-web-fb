/**
 * Event Service
 *
 * Business logic for event management.
 */

import { db, serverTimestamp, increment } from '../config/firebase';
import { getPaginatedResults, PaginatedResults } from '../utils/pagination.utils';
import slugify from 'slugify';
import {
  Event,
  EventData,
  EventCreateInput,
  EventUpdateInput,
  EventQueryFilters,
  LocalizedString,
} from '@ceslar/shared-types';

const COLLECTION = 'events';

/**
 * User data for event registration
 */
interface EventRegistrationUserData {
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  [key: string]: unknown;
}

/**
 * Get event by ID
 */
export async function getEventById(eventId: string): Promise<Event | null> {
  const doc = await db.collection(COLLECTION).doc(eventId).get();
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
  } as Event;
}

/**
 * Get events with pagination and filters
 */
export async function getEvents(
  options: EventQueryFilters = {}
): Promise<PaginatedResults<Event>> {
  const {
    page = 1,
    limit = 10,
    churchId,
    type,
    status,
    isPublic,
  } = options;

  const filters: Record<string, unknown> = {};
  if (churchId) filters.churchId = churchId;
  if (type) filters.type = type;
  if (status) filters.status = status;
  if (typeof isPublic === 'boolean') filters.isPublic = isPublic;

  return getPaginatedResults(
    db.collection(COLLECTION) as FirebaseFirestore.CollectionReference<EventData>,
    {
      filters,
      orderBy: [{ field: 'startDate', direction: 'asc' }],
      page,
      limit,
    }
  ) as Promise<PaginatedResults<Event>>;
}

/**
 * Get upcoming events
 */
export async function getUpcomingEvents(
  limit: number = 3,
  churchId: string | null = null
): Promise<Event[]> {
  let query = db
    .collection(COLLECTION)
    .where('status', '==', 'published')
    .where('isPublic', '==', true)
    .where('startDate', '>=', new Date().toISOString())
    .orderBy('startDate', 'asc')
    .limit(limit);

  if (churchId) {
    query = db
      .collection(COLLECTION)
      .where('churchId', '==', churchId)
      .where('status', '==', 'published')
      .where('isPublic', '==', true)
      .where('startDate', '>=', new Date().toISOString())
      .orderBy('startDate', 'asc')
      .limit(limit);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Event[];
}

/**
 * Create event
 */
export async function createEvent(
  data: EventCreateInput,
  userId: string
): Promise<Event> {
  const titleObj = data.title as LocalizedString;
  const titleStr = titleObj?.es || '';
  const slug = slugify(titleStr, { lower: true, strict: true });

  const eventData = {
    ...data,
    slug,
    createdBy: userId,
    status: data.status || 'draft',
    isPublic: data.isPublic ?? true,
    registration: data.registration || {
      required: false,
      maxAttendees: 0,
      currentAttendees: 0,
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await db.collection(COLLECTION).add(eventData);

  // Update church stats
  if (data.churchId) {
    await db.collection('churches').doc(data.churchId).update({
      'stats.eventCount': increment(1),
    });
  }

  return {
    id: docRef.id,
    ...eventData,
  } as unknown as Event;
}

/**
 * Update event
 */
export async function updateEvent(
  eventId: string,
  data: Partial<EventUpdateInput>
): Promise<Event | null> {
  const ref = db.collection(COLLECTION).doc(eventId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Event not found');

  const updateData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  await ref.update(updateData);
  return getEventById(eventId);
}

/**
 * Delete event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  const ref = db.collection(COLLECTION).doc(eventId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data() as EventData;

  // Delete registrations subcollection
  const registrations = await ref.collection('registrations').get();
  const batch = db.batch();
  registrations.docs.forEach((d) => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();

  // Update church stats
  if (data.churchId) {
    await db.collection('churches').doc(data.churchId).update({
      'stats.eventCount': increment(-1),
    });
  }
}

/**
 * Register for event
 */
export async function registerForEvent(
  eventId: string,
  userId: string,
  userData: EventRegistrationUserData
): Promise<{ success: boolean }> {
  const eventRef = db.collection(COLLECTION).doc(eventId);
  const event = await eventRef.get();
  if (!event.exists) throw new Error('Event not found');

  const eventData = event.data() as EventData;
  if (
    eventData.registration?.maxAttendees &&
    eventData.registration.maxAttendees > 0 &&
    (eventData.registration.currentAttendees || 0) >= eventData.registration.maxAttendees
  ) {
    throw new Error('Event is full');
  }

  await eventRef.collection('registrations').doc(userId).set({
    userId,
    ...userData,
    status: 'registered',
    registeredAt: serverTimestamp(),
  });

  await eventRef.update({
    'registration.currentAttendees': increment(1),
  });

  return { success: true };
}

/**
 * Cancel registration
 */
export async function cancelRegistration(
  eventId: string,
  userId: string
): Promise<void> {
  const eventRef = db.collection(COLLECTION).doc(eventId);
  await eventRef.collection('registrations').doc(userId).delete();
  await eventRef.update({
    'registration.currentAttendees': increment(-1),
  });
}
