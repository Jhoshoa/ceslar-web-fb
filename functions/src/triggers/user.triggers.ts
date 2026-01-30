/**
 * User Firestore Triggers
 *
 * Handles data synchronization when user profiles change:
 * - Syncs displayName/photoURL to church member subcollections
 * - Syncs speaker info to sermons when user profile changes
 * - Updates leadership entries when user info changes
 */

import * as functions from 'firebase-functions';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { db, serverTimestamp } from '../config/firebase';
import { UserChurchMembership } from '@ceslar/shared-types';

const REGION = 'southamerica-east1';

/**
 * User document data structure for triggers
 */
interface UserData {
  displayName?: string;
  firstName?: string;
  lastName?: string;
  photoURL?: string | null;
  email?: string;
  systemRole?: string;
  isActive?: boolean;
  churchMemberships?: UserChurchMembership[];
}

/**
 * Context params for user triggers
 */
interface UserParams {
  userId: string;
}

/**
 * Trigger: When a user document is updated
 *
 * Syncs relevant fields to denormalized locations:
 * - churches/{churchId}/members/{userId} (displayName, photoURL, email)
 * - sermons where speakerId matches (speakerName)
 * - churches leadership subcollection entries
 */
export const onUserUpdate = functions
  .region(REGION)
  .firestore.document('users/{userId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext) => {
    const { userId } = context.params as unknown as UserParams;
    const before = change.before.data() as UserData;
    const after = change.after.data() as UserData;

    // Check if display-relevant fields changed
    const displayNameChanged = before.displayName !== after.displayName;
    const photoURLChanged = before.photoURL !== after.photoURL;
    const emailChanged = before.email !== after.email;
    const nameChanged =
      before.firstName !== after.firstName || before.lastName !== after.lastName;

    if (!displayNameChanged && !photoURLChanged && !emailChanged && !nameChanged) {
      return; // No relevant changes
    }

    console.log(`User profile updated: ${userId} - syncing denormalized data`);

    const batch = db.batch();
    let batchCount = 0;
    const MAX_BATCH = 450; // Stay under 500 limit

    try {
      const memberships = after.churchMemberships || [];

      // Sync to church member subcollections
      for (const membership of memberships) {
        if (batchCount >= MAX_BATCH) break;

        const memberRef = db
          .collection('churches')
          .doc(membership.churchId)
          .collection('members')
          .doc(userId);

        const memberUpdate: Record<string, unknown> = {};
        if (displayNameChanged) memberUpdate.displayName = after.displayName;
        if (photoURLChanged) memberUpdate.photoURL = after.photoURL;
        if (emailChanged) memberUpdate.email = after.email;
        memberUpdate.updatedAt = serverTimestamp();

        batch.update(memberRef, memberUpdate);
        batchCount++;
      }

      // Sync speaker name to sermons if name changed
      if (displayNameChanged || nameChanged) {
        const fullName =
          after.displayName || `${after.firstName || ''} ${after.lastName || ''}`.trim();

        if (fullName) {
          const sermonsSnapshot = await db
            .collection('sermons')
            .where('speakerId', '==', userId)
            .get();

          for (const doc of sermonsSnapshot.docs) {
            if (batchCount >= MAX_BATCH) break;
            batch.update(doc.ref, {
              speakerName: fullName,
              updatedAt: serverTimestamp(),
            });
            batchCount++;
          }
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`Synced ${batchCount} documents for user ${userId}`);
      }
    } catch (error) {
      console.error(`Error syncing user data for ${userId}:`, error);
    }
  });

/**
 * Trigger: When a user's systemRole changes (detected via custom claims update)
 * This handles role-related side effects on the Firestore side.
 */
export const onUserRoleChange = functions
  .region(REGION)
  .firestore.document('users/{userId}')
  .onUpdate(async (change: functions.Change<QueryDocumentSnapshot>, context: functions.EventContext) => {
    const { userId } = context.params as unknown as UserParams;
    const before = change.before.data() as UserData;
    const after = change.after.data() as UserData;

    if (before.systemRole === after.systemRole) return;

    console.log(
      `User role changed: ${userId} from ${before.systemRole} to ${after.systemRole}`
    );

    // If user is deactivated (role set to something indicating inactive)
    if (before.isActive && !after.isActive) {
      console.log(`User ${userId} deactivated - no cascading action needed`);
    }
  });
