/**
 * Stats Service
 *
 * Aggregates statistics for public display.
 */

import { db } from '../config/firebase';

/**
 * Public stats response
 */
export interface PublicStats {
  yearsOfService: number;
  churchesCount: number;
  countriesCount: number;
  membersCount: number;
}

/**
 * Get public statistics for the about page
 */
export async function getPublicStats(): Promise<PublicStats> {
  // Calculate years of service (founded September 24, 1969)
  const foundingDate = new Date(1969, 8, 24); // Month is 0-indexed
  const now = new Date();
  const yearsOfService = Math.floor(
    (now.getTime() - foundingDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  );

  // Get active churches count
  const churchesSnapshot = await db
    .collection('churches')
    .where('status', '==', 'active')
    .count()
    .get();
  const churchesCount = churchesSnapshot.data().count;

  // Get unique countries from active churches
  const countriesSnapshot = await db
    .collection('churches')
    .where('status', '==', 'active')
    .select('address.country')
    .get();

  const uniqueCountries = new Set<string>();
  countriesSnapshot.docs.forEach((doc) => {
    const country = doc.data()?.address?.country;
    if (country) {
      uniqueCountries.add(country);
    }
  });
  const countriesCount = uniqueCountries.size;

  // Get total members count from all active churches
  const membersSnapshot = await db
    .collection('churches')
    .where('status', '==', 'active')
    .select('stats.memberCount')
    .get();

  let membersCount = 0;
  membersSnapshot.docs.forEach((doc) => {
    const memberCount = doc.data()?.stats?.memberCount || 0;
    membersCount += memberCount;
  });

  return {
    yearsOfService,
    churchesCount,
    countriesCount: Math.max(countriesCount, 1), // At least 1 country
    membersCount,
  };
}
