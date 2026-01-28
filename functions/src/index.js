/**
 * Firebase Cloud Functions Entry Point
 *
 * This file exports all Cloud Functions:
 * - HTTP Functions (Express API)
 * - Auth Triggers
 * - Firestore Triggers (church stats, user sync)
 * - Scheduled Functions (future)
 */

const functions = require('firebase-functions');

// Region configuration
const REGION = 'southamerica-east1';

// ==========================================
// HTTP API (Express)
// ==========================================
const api = require('./api');
exports.api = functions.region(REGION).https.onRequest(api);

// ==========================================
// AUTH TRIGGERS
// ==========================================
const authTriggers = require('./triggers/auth.triggers');

exports.onUserCreate = authTriggers.onUserCreate;
exports.onUserDelete = authTriggers.onUserDelete;

// ==========================================
// FIRESTORE TRIGGERS - Church Stats
// ==========================================
const churchTriggers = require('./triggers/church.triggers');

exports.onMemberCreate = churchTriggers.onMemberCreate;
exports.onMemberDelete = churchTriggers.onMemberDelete;
exports.onEventCreate = churchTriggers.onEventCreate;
exports.onEventDelete = churchTriggers.onEventDelete;
exports.onSermonCreate = churchTriggers.onSermonCreate;
exports.onSermonDelete = churchTriggers.onSermonDelete;

// ==========================================
// FIRESTORE TRIGGERS - User Sync
// ==========================================
const userTriggers = require('./triggers/user.triggers');

exports.onUserUpdate = userTriggers.onUserUpdate;
exports.onUserRoleChange = userTriggers.onUserRoleChange;

// ==========================================
// SCHEDULED FUNCTIONS (Future)
// ==========================================
// Will be added as needed for:
// - Email digests
// - Data cleanup
// - Report generation
