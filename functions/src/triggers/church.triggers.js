/**
 * Church Firestore Triggers
 *
 * Handles automatic stat updates when subcollections change:
 * - Member count updates when members are added/removed
 * - Event count updates when events are created/deleted
 * - Sermon count updates when sermons are created/deleted
 */

const functions = require('firebase-functions');
const { db, increment, serverTimestamp } = require('../config/firebase');

const REGION = 'southamerica-east1';

/**
 * Trigger: When a member is added to a church's members subcollection
 */
exports.onMemberCreate = functions
  .region(REGION)
  .firestore.document('churches/{churchId}/members/{userId}')
  .onCreate(async (snap, context) => {
    const { churchId } = context.params;
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
exports.onMemberDelete = functions
  .region(REGION)
  .firestore.document('churches/{churchId}/members/{userId}')
  .onDelete(async (snap, context) => {
    const { churchId } = context.params;
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
exports.onEventCreate = functions
  .region(REGION)
  .firestore.document('events/{eventId}')
  .onCreate(async (snap) => {
    const event = snap.data();
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
exports.onEventDelete = functions
  .region(REGION)
  .firestore.document('events/{eventId}')
  .onDelete(async (snap) => {
    const event = snap.data();
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
exports.onSermonCreate = functions
  .region(REGION)
  .firestore.document('sermons/{sermonId}')
  .onCreate(async (snap) => {
    const sermon = snap.data();
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
exports.onSermonDelete = functions
  .region(REGION)
  .firestore.document('sermons/{sermonId}')
  .onDelete(async (snap) => {
    const sermon = snap.data();
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
