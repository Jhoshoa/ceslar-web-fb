/**
 * One-time script to promote a user to system_admin
 *
 * Usage:
 *   npx ts-node scripts/promote-admin.ts <email>
 *
 * Example:
 *   npx ts-node scripts/promote-admin.ts admin@ceslar.org
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS environment variable set to service account key path
 *   - Or run from a machine with default credentials configured
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const auth = admin.auth();
const db = admin.firestore();

async function promoteToAdmin(email: string): Promise<void> {
  console.log(`\nPromoting user to system_admin: ${email}\n`);

  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    console.log(`Found user: ${userRecord.uid}`);

    // Update custom claims
    const newClaims = {
      systemRole: 'system_admin',
      churchRoles: userRecord.customClaims?.churchRoles || {},
      permissions: [
        'read:public',
        'read:users',
        'write:users',
        'delete:users',
        'read:churches',
        'write:churches',
        'delete:churches',
        'read:events',
        'write:events',
        'delete:events',
        'read:sermons',
        'write:sermons',
        'delete:sermons',
        'read:ministries',
        'write:ministries',
        'delete:ministries',
        'manage:system',
      ],
      createdAt: userRecord.customClaims?.createdAt || new Date().toISOString(),
    };

    await auth.setCustomUserClaims(userRecord.uid, newClaims);
    console.log('✓ Updated custom claims');

    // Update Firestore document
    const userRef = db.collection('users').doc(userRecord.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        systemRole: 'system_admin',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log('✓ Updated Firestore document');
    } else {
      console.log('⚠ User document not found in Firestore (will be created on next login)');
    }

    console.log('\n✅ Successfully promoted user to system_admin!');
    console.log('\nIMPORTANT: The user must sign out and sign back in for changes to take effect.\n');

  } catch (error) {
    if ((error as any).code === 'auth/user-not-found') {
      console.error(`\n❌ Error: User with email "${email}" not found.`);
      console.error('Make sure the user has registered first.\n');
    } else {
      console.error('\n❌ Error promoting user:', error);
    }
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('\nUsage: npx ts-node scripts/promote-admin.ts <email>\n');
  console.error('Example: npx ts-node scripts/promote-admin.ts admin@ceslar.org\n');
  process.exit(1);
}

// Run the promotion
promoteToAdmin(email)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
