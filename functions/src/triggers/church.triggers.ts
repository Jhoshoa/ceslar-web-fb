/**
 * Church Firestore Triggers
 *
 * Handles automatic stat updates when subcollections change:
 * - Member count updates when members are added/removed
 * - Event count updates when events are created/deleted
 * - Sermon count updates when sermons are created/deleted
 */

import * as functions from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db, increment, serverTimestamp } from '../config/firebase';

const REGION = 'southamerica-east1';

/**
 * Context params for member triggers
 */
interface MemberParams {
  churchId: string;
  userId: string;
}

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
export const onMemberCreate = functions
  .region(REGION)
  .firestore.document('churches/{churchId}/members/{userId}')
  .onCreate(async (_snap: QueryDocumentSnapshot, context: functions.EventContext) => {
    const { churchId } = context.params as unknown as MemberParams;
    console.log(`Member added to church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.memberCount': increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating member count for church ${churchId}:`, error);
    }
  });

/**
 * Trigger: When a member is removed from a church's members subcollection
 */
export const onMemberDelete = functions
  .region(REGION)
  .firestore.document('churches/{churchId}/members/{userId}')
  .onDelete(async (_snap: QueryDocumentSnapshot, context: functions.EventContext) => {
    const { churchId } = context.params as unknown as MemberParams;
    console.log(`Member removed from church: ${churchId}`);

    try {
      await db.collection('churches').doc(churchId).update({
        'stats.memberCount': increment(-1),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`Error updating member count for church ${churchId}:`, error);
    }
  });

/**
 * Trigger: When an event is created - update church event count
 */
export const onEventCreate = functions
  .region(REGION)
  .firestore.document('events/{eventId}')
  .onCreate(async (snap: QueryDocumentSnapshot) => {
    const event = snap.data() as EventData;
    const { churchId } = event;

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
  });

/**
 * Trigger: When an event is deleted - update church event count
 */
export const onEventDelete = functions
  .region(REGION)
  .firestore.document('events/{eventId}')
  .onDelete(async (snap: QueryDocumentSnapshot) => {
    const event = snap.data() as EventData;
    const { churchId } = event;

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
  });

/**
 * Trigger: When a sermon is created - update church sermon count
 */
export const onSermonCreate = functions
  .region(REGION)
  .firestore.document('sermons/{sermonId}')
  .onCreate(async (snap: QueryDocumentSnapshot) => {
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
  });

/**
 * Trigger: When a sermon is deleted - update church sermon count
 */
export const onSermonDelete = functions
  .region(REGION)
  .firestore.document('sermons/{sermonId}')
  .onDelete(async (snap: QueryDocumentSnapshot) => {
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
  });
