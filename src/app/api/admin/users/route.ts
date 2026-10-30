import { NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export async function GET() {
  if (!secretKey) {
    return NextResponse.json({ error: 'Clerk Secret Key is not configured' }, { status: 500 });
  }

  try {
    const clerk = createClerkClient({ secretKey, publishableKey });
    const { data: users } = await clerk.users.getUserList({
      limit: 100,
      orderBy: '-created_at'
    });

    const mappedUsers = users.map((u) => {
      const email = u.emailAddresses?.[0]?.emailAddress || '';
      const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || email.split('@')[0] || 'User';
      const role = (u.publicMetadata?.role as string) || 'student';

      return {
        id: u.id,
        name,
        email,
        role,
        imageUrl: u.imageUrl || '',
        createdAt: new Date(u.createdAt).toISOString().split('T')[0]
      };
    });

    return NextResponse.json({ users: mappedUsers });
  } catch (err: any) {
    console.error('Failed to list Clerk users:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

