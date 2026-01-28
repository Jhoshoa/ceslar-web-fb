/**
 * Membership Service
 */

const { db, serverTimestamp, increment, arrayUnion, arrayRemove } = require('../config/firebase');
const { setChurchRole, removeChurchRole } = require('./auth.service');

async function requestMembership(userId, churchId, answers = []) {
  const userRef = db.collection('users').doc(userId);
  const churchRef = db.collection('churches').doc(churchId);

  const [userDoc, churchDoc] = await Promise.all([userRef.get(), churchRef.get()]);
  if (!userDoc.exists) throw new Error('User not found');
  if (!churchDoc.exists) throw new Error('Church not found');

  const userData = userDoc.data();
  const churchData = churchDoc.data();

  // Check if already a member
  const existingMembership = userData.churchMemberships?.find((m) => m.churchId === churchId);
  if (existingMembership) throw new Error('Already a member or request pending');

  const membership = {
    churchId,
    churchName: churchData.name,
    churchSlug: churchData.slug,
    role: 'visitor',
    status: 'pending',
    requestedAt: new Date().toISOString(),
  };

  // Add to user's memberships
  await userRef.update({
    churchMemberships: arrayUnion(membership),
    registrationAnswers: answers.length ? arrayUnion(...answers) : userData.registrationAnswers,
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

async function getMyMemberships(userId) {
  const userDoc = await db.collection('users').doc(userId).get();
  if (!userDoc.exists) throw new Error('User not found');
  return userDoc.data().churchMemberships || [];
}

async function getPendingRequests(churchId) {
  const snapshot = await db.collection('churches').doc(churchId)
    .collection('members')
    .where('status', '==', 'pending')
    .orderBy('requestedAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function approveMembership(churchId, userId, role = 'member') {
  const userRef = db.collection('users').doc(userId);
  const memberRef = db.collection('churches').doc(churchId).collection('members').doc(userId);

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
  const userData = userDoc.data();
  const memberships = userData.churchMemberships || [];
  const membershipIndex = memberships.findIndex((m) => m.churchId === churchId);

  if (membershipIndex >= 0) {
    memberships[membershipIndex] = {
      ...memberships[membershipIndex],
      role,
      status: 'approved',
      approvedAt: new Date().toISOString(),
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

async function rejectMembership(churchId, userId, reason = '') {
  const memberRef = db.collection('churches').doc(churchId).collection('members').doc(userId);
  const userRef = db.collection('users').doc(userId);

  await memberRef.update({
    status: 'rejected',
    rejectionReason: reason,
    rejectedAt: serverTimestamp(),
  });

  // Remove from user's memberships
  const userDoc = await userRef.get();
  const memberships = userDoc.data()?.churchMemberships || [];
  const updatedMemberships = memberships.filter((m) => m.churchId !== churchId);

  await userRef.update({
    churchMemberships: updatedMemberships,
    updatedAt: serverTimestamp(),
  });

  return { success: true };
}

async function leaveChurch(userId, churchId) {
  const memberRef = db.collection('churches').doc(churchId).collection('members').doc(userId);
  const userRef = db.collection('users').doc(userId);

  await memberRef.delete();

  const userDoc = await userRef.get();
  const memberships = userDoc.data()?.churchMemberships || [];
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

async function updateMemberRole(churchId, userId, role) {
  const memberRef = db.collection('churches').doc(churchId).collection('members').doc(userId);
  const userRef = db.collection('users').doc(userId);

  await memberRef.update({ role, updatedAt: serverTimestamp() });

  const userDoc = await userRef.get();
  const memberships = userDoc.data()?.churchMemberships || [];
  const membershipIndex = memberships.findIndex((m) => m.churchId === churchId);

  if (membershipIndex >= 0) {
    memberships[membershipIndex].role = role;
    await userRef.update({ churchMemberships: memberships, updatedAt: serverTimestamp() });
  }

  await setChurchRole(userId, churchId, role);

  return { success: true };
}

module.exports = {
  requestMembership,
  getMyMemberships,
  getPendingRequests,
  approveMembership,
  rejectMembership,
  leaveChurch,
  updateMemberRole,
};
