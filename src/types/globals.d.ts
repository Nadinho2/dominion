export type Roles = 'admin' | 'teacher' | 'student' | 'parent';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }

  interface UserPublicMetadata {
    role?: Roles;
  }
}

