/**
 * Church Firestore Triggers
 *
 * Handles automatic stat updates when subcollections change:
 * - Member count updates when members are added/removed
 * - Event count updates when events are created/deleted
 * - Sermon count updates when sermons are created/deleted
 */

import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { db, increment, serverTimestamp } from '../config/firebase';

const REGION = 'southamerica-east1';

/**
 * Event document data
 */
interface EventData {
  churchId?: string;
  [key: string]: unknown;
}

/**
 * Sermon document data
 */
interface SermonData {
  churchId?: string;
  [key: string]: unknown;
}

/**
 * Trigger: When a member is added to a church's members subcollection
 */
export const onMemberCreate = onDocumentCreated(
  { document: 'churches/{churchId}/members/{userId}', region: REGION },
  async (event) => {
    const churchId = event.params.churchId;
    console.log(`Member added to church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.memberCount': increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating member count for church ${churchId}:`, error);
    }
  }
);

/**
 * Trigger: When a member is removed from a church's members subcollection
 */
export const onMemberDelete = onDocumentDeleted(
  { document: 'churches/{churchId}/members/{userId}', region: REGION },
  async (event) => {
    const churchId = event.params.churchId;
    console.log(`Member removed from church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.memberCount': increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating member count for church ${churchId}:`, error);
    }
  }
);

/**
 * Trigger: When an event is created - update church event count
 */
export const onEventCreate = onDocumentCreated(
  { document: 'events/{eventId}', region: REGION },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const eventData = snap.data() as EventData;
    const { churchId } = eventData;

    if (!churchId) return;

    console.log(`Event created for church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.eventCount': increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating event count for church ${churchId}:`, error);
    }
  }
);

/**
 * Trigger: When an event is deleted - update church event count
 */
export const onEventDelete = onDocumentDeleted(
  { document: 'events/{eventId}', region: REGION },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const eventData = snap.data() as EventData;
    const { churchId } = eventData;

    if (!churchId) return;

    console.log(`Event deleted for church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.eventCount': increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating event count for church ${churchId}:`, error);
    }
  }
);

/**
 * Trigger: When a sermon is created - update church sermon count
 */
export const onSermonCreate = onDocumentCreated(
  { document: 'sermons/{sermonId}', region: REGION },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const sermon = snap.data() as SermonData;
    const { churchId } = sermon;

    if (!churchId) return;

    console.log(`Sermon created for church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.sermonCount': increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating sermon count for church ${churchId}:`, error);
    }
  }
);

/**
 * Trigger: When a sermon is deleted - update church sermon count
 */
export const onSermonDelete = onDocumentDeleted(
  { document: 'sermons/{sermonId}', region: REGION },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const sermon = snap.data() as SermonData;
    const { churchId } = sermon;

    if (!churchId) return;

    console.log(`Sermon deleted for church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.sermonCount': increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating sermon count for church ${churchId}:`, error);
    }
  }
);
