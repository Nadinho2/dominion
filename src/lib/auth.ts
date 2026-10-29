import { auth, currentUser } from '@clerk/nextjs/server';
import { Roles } from '@/types/globals';

/**
 * Server-side helper to check if the current user has a specific role
 */
export async function checkRole(role: Roles): Promise<boolean> {
  const { sessionClaims, orgRole } = await auth();

  // 1. Check Clerk Organization role (e.g. org:admin)
  if (role === 'admin' && orgRole === 'org:admin') {
    return true;
  }

  // 2. Check Custom JWT Claims / Public Metadata
  const userRole = sessionClaims?.metadata?.role;
  return userRole === role;
}

/**
 * Get current user role from Clerk session or user metadata
 */
export async function getUserRole(): Promise<Roles | null> {
  const { sessionClaims, orgRole } = await auth();

  if (orgRole === 'org:admin') {
    return 'admin';
  }

  if (sessionClaims?.metadata?.role) {
    return sessionClaims.metadata.role;
  }

  const user = await currentUser();
  const publicRole = user?.publicMetadata?.role as Roles;

  return publicRole || null;
}

