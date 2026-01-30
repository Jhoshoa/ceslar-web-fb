/**
 * Firebase Cloud Functions Entry Point
 *
 * This file exports all Cloud Functions:
 * - HTTP Functions (Express API)
 * - Auth Triggers
 * - Firestore Triggers (church stats, user sync)
 * - Scheduled Functions (future)
 */

import * as functions from 'firebase-functions';

// Region configuration
const REGION = 'southamerica-east1';

// ==========================================
// HTTP API (Express)
// ==========================================
import app from './api';
export const api = functions.region(REGION).https.onRequest(app);

// ==========================================
// AUTH TRIGGERS
// ==========================================
import * as authTriggers from './triggers/auth.triggers';

export const onUserCreate = authTriggers.onUserCreate;
export const onUserDelete = authTriggers.onUserDelete;

// ==========================================
// FIRESTORE TRIGGERS - Church Stats
// ==========================================
import * as churchTriggers from './triggers/church.triggers';

export const onMemberCreate = churchTriggers.onMemberCreate;
export const onMemberDelete = churchTriggers.onMemberDelete;
export const onEventCreate = churchTriggers.onEventCreate;
export const onEventDelete = churchTriggers.onEventDelete;
export const onSermonCreate = churchTriggers.onSermonCreate;
export const onSermonDelete = churchTriggers.onSermonDelete;

// ==========================================
// FIRESTORE TRIGGERS - User Sync
// ==========================================
import * as userTriggers from './triggers/user.triggers';

export const onUserUpdate = userTriggers.onUserUpdate;
export const onUserRoleChange = userTriggers.onUserRoleChange;

// ==========================================
// SCHEDULED FUNCTIONS (Future)
// ==========================================
// Will be added as needed for:
// - Email digests
// - Data cleanup
// - Report generation
