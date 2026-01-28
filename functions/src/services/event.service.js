/**
 * Event Service
 *
 * Business logic for event management.
 */

const { db, serverTimestamp, increment } = require('../config/firebase');
const { getPaginatedResults } = require('../utils/pagination.utils');
const slugify = require('slugify');

const COLLECTION = 'events';

async function getEventById(eventId) {
  const doc = await db.collection(COLLECTION).doc(eventId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function getEvents(options = {}) {
  const { page = 1, limit = 10, churchId, type, status, startDate, endDate, isPublic, search } = options;

  const filters = {};
  if (churchId) filters.churchId = churchId;
  if (type) filters.type = type;
  if (status) filters.status = status;
  if (typeof isPublic === 'boolean') filters.isPublic = isPublic;

  return getPaginatedResults(db.collection(COLLECTION), {
    filters,
    orderBy: [{ field: 'startDate', direction: 'asc' }],
    page,
    limit,
  });
}

async function getUpcomingEvents(limit = 3, churchId = null) {
  let query = db.collection(COLLECTION)
    .where('status', '==', 'published')
    .where('isPublic', '==', true)
    .where('startDate', '>=', new Date().toISOString())
    .orderBy('startDate', 'asc')
    .limit(limit);

  if (churchId) {
    query = query.where('churchId', '==', churchId);
  }

  const snapshot = await query.get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function createEvent(data, userId) {
  const slug = slugify(data.title?.es || data.title || '', { lower: true, strict: true });

  const eventData = {
    ...data,
    slug,
    createdBy: userId,
    status: data.status || 'draft',
    isPublic: data.isPublic ?? true,
    registration: data.registration || { required: false, maxAttendees: 0, currentAttendees: 0 },
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

  return { id: docRef.id, ...eventData };
}

async function updateEvent(eventId, data) {
  const ref = db.collection(COLLECTION).doc(eventId);
  const doc = await ref.get();
  if (!doc.exists) throw new Error('Event not found');

  data.updatedAt = serverTimestamp();
  await ref.update(data);
  return getEventById(eventId);
}

async function deleteEvent(eventId) {
  const ref = db.collection(COLLECTION).doc(eventId);
  const doc = await ref.get();
  if (!doc.exists) return;

  const data = doc.data();

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

async function registerForEvent(eventId, userId, userData) {
  const eventRef = db.collection(COLLECTION).doc(eventId);
  const event = await eventRef.get();
  if (!event.exists) throw new Error('Event not found');

  const eventData = event.data();
  if (eventData.registration?.maxAttendees > 0 &&
      eventData.registration.currentAttendees >= eventData.registration.maxAttendees) {
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

async function cancelRegistration(eventId, userId) {
  const eventRef = db.collection(COLLECTION).doc(eventId);
  await eventRef.collection('registrations').doc(userId).delete();
  await eventRef.update({
    'registration.currentAttendees': increment(-1),
  });
}

module.exports = {
  getEventById,
  getEvents,
  getUpcomingEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  cancelRegistration,
};
