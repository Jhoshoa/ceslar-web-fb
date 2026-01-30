/**
 * Membership Service
 *
 * Business logic for church membership management.
 */

import { db, serverTimestamp, increment, arrayUnion } from '../config/firebase';
import { setChurchRole, removeChurchRole } from './auth.service';
import {
  ChurchRole,
  UserChurchMembership,
  RegistrationAnswer,
  MembershipStatus,
} from '@ceslar/shared-types';

/**
 * Membership request result
 */
interface MembershipRequestResult {
  success: boolean;
  membership: UserChurchMembership;
}

/**
 * Simple success result
 */
interface SuccessResult {
  success: boolean;
}

/**
 * Pending membership request
 */
interface PendingMembershipRequest {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  role: ChurchRole;
  status: MembershipStatus;
  registrationAnswers: RegistrationAnswer[];
  requestedAt: FirebaseFirestore.Timestamp;
}

/**
 * Request membership to a church
 */
export async function requestMembership(
  userId: string,
  churchId: string,
  answers: RegistrationAnswer[] = []
): Promise<MembershipRequestResult> {
  const userRef = db.collection('users').doc(userId);
  const churchRef = db.collection('churches').doc(churchId);

  const [userDoc, churchDoc] = await Promise.all([userRef.get(), churchRef.get()]);
  if (!userDoc.exists) throw new Error('User not found');
  if (!churchDoc.exists) throw new Error('Church not found');

  const userData = userDoc.data()!;
  const churchData = churchDoc.data()!;

  // Check if already a member
  const existingMembership = (userData.churchMemberships as UserChurchMembership[] | undefined)?.find(
    (m) => m.churchId === churchId
  );
  if (existingMembership) throw new Error('Already a member or request pending');

  const membership: UserChurchMembership = {
    churchId,
    churchName: churchData.name,
    role: 'visitor',
    status: 'pending',
    joinedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Add to user's memberships
  await userRef.update({
    churchMemberships: arrayUnion(membership),
    registrationAnswers: answers.length
      ? arrayUnion(...answers)
      : userData.registrationAnswers,
    updatedAt: serverTimestamp(),
  });

  // Add to church members subcollection
  await churchRef.collection('members').doc(userId).set({
    userId,
    displayName: userData.displayName,
    email: userData.email,
    photoURL: userData.photoURL,
    role: 'visitor',
    status: 'pending',
    registrationAnswers: answers,
    requestedAt: serverTimestamp(),
  });

  return { success: true, membership };
}

/**
 * Get user's memberships
 */
export async function getMyMemberships(userId: string): Promise<UserChurchMembership[]> {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new Error('User not found');
  return (userDoc.data()?.churchMemberships as UserChurchMembership[]) || [];
}

/**
 * Get pending membership requests for a church
 */
export async function getPendingRequests(
  churchId: string
): Promise<PendingMembershipRequest[]> {
  const snapshot = await db
    .collection('churches')
    .doc(churchId)
    .collection('members')
    .where('status', '==', 'pending')
    .orderBy('requestedAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<PendingMembershipRequest, 'id'>),
  }));
}

/**
 * Approve membership request
 */
export async function approveMembership(
  churchId: string,
  userId: string,
  role: ChurchRole = 'member'
): Promise<SuccessResult> {
  const userRef = db.collection('users').doc(userId);
  const memberRef = db
    .collection('churches')
    .doc(churchId)
    .collection('members')
    .doc(userId);

  const [userDoc, memberDoc] = await Promise.all([userRef.get(), memberRef.get()]);
  if (!userDoc.exists) throw new Error('User not found');
  if (!memberDoc.exists) throw new Error('Membership request not found');

  // Update member document
  await memberRef.update({
    role,
    status: 'approved',
    approvedAt: serverTimestamp(),
  });

  // Update user's memberships array
  const userData = userDoc.data()!;
  const memberships: UserChurchMembership[] = userData.churchMemberships || [];
  const membershipIndex = memberships.findIndex((m) => m.churchId === churchId);

  if (membershipIndex >= 0) {
    memberships[membershipIndex] = {
      ...memberships[membershipIndex],
      role,
      status: 'approved',
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  await userRef.update({
    churchMemberships: memberships,
    updatedAt: serverTimestamp(),
  });

  // Set custom claims
  await setChurchRole(userId, churchId, role);

  // Update church stats
  await db.collection('churches').doc(churchId).update({
    'stats.memberCount': increment(1),
  });

  return { success: true };
}

/**
 * Reject membership request
 */
export async function rejectMembership(
  churchId: string,
  userId: string,
  reason: string = ''
): Promise<SuccessResult> {
  const memberRef = db
    .collection('churches')
    .doc(churchId)
    .collection('members')
    .doc(userId);
  const userRef = db.collection('users').doc(userId);

  await memberRef.update({
    status: 'rejected',
    rejectionReason: reason,
    rejectedAt: serverTimestamp(),
  });

  // Remove from user's memberships
  const userDoc = await userRef.get();
  const memberships: UserChurchMembership[] =
    userDoc.data()?.churchMemberships || [];
  const updatedMemberships = memberships.filter((m) => m.churchId !== churchId);

  await userRef.update({
    churchMemberships: updatedMemberships,
    updatedAt: serverTimestamp(),
  });

  return { success: true };
}

/**
 * Leave church
 */
export async function leaveChurch(
  userId: string,
  churchId: string
): Promise<SuccessResult> {
  const memberRef = db
    .collection('churches')
    .doc(churchId)
    .collection('members')
    .doc(userId);
  const userRef = db.collection('users').doc(userId);

  await memberRef.delete();

  const userDoc = await userRef.get();
  const memberships: UserChurchMembership[] =
    userDoc.data()?.churchMemberships || [];
  const updatedMemberships = memberships.filter((m) => m.churchId !== churchId);

  await userRef.update({
    churchMemberships: updatedMemberships,
    updatedAt: serverTimestamp(),
  });

  await removeChurchRole(userId, churchId);

  await db.collection('churches').doc(churchId).update({
    'stats.memberCount': increment(-1),
  });

  return { success: true };
}

/**
 * Update member role
 */
export async function updateMemberRole(
  churchId: string,
  userId: string,
  role: ChurchRole
): Promise<SuccessResult> {
  const memberRef = db
    .collection('churches')
    .doc(churchId)
    .collection('members')
    .doc(userId);
  const userRef = db.collection('users').doc(userId);

  await memberRef.update({ role, updatedAt: serverTimestamp() });

  const userDoc = await userRef.get();
  const memberships: UserChurchMembership[] =
    userDoc.data()?.churchMemberships || [];
  const membershipIndex = memberships.findIndex((m) => m.churchId === churchId);

  if (membershipIndex >= 0) {
    memberships[membershipIndex].role = role;
    memberships[membershipIndex].updatedAt = new Date().toISOString();
    await userRef.update({
      churchMemberships: memberships,
      updatedAt: serverTimestamp(),
    });
  }

  await setChurchRole(userId, churchId, role);

  return { success: true };
}
