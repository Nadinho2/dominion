import { NextRequest, NextResponse } from 'next/server';
import { createClerkClient } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  if (!secretKey) {
    return NextResponse.json({ error: 'Clerk Secret Key missing' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const {
      userId,
      role,
      name,
      email,
      phone,
      staffNo,
      assignedClass,
      assignedArm,
      subjects,
      qualification
    } = body;

    if (!userId || !role) {
      return NextResponse.json({ error: 'Missing userId or role' }, { status: 400 });
    }

    // 1. Update Clerk User Metadata
    const clerk = createClerkClient({ secretKey, publishableKey });
    await clerk.users.updateUserMetadata(userId, {
      publicMetadata: {
        role
      }
    });

    // 2. Synchronize with Supabase database if configured
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Upsert profile
      const [firstName = '', ...rest] = (name || '').split(' ');
      const lastName = rest.join(' ');
      await supabase.from('profiles').upsert(
        {
          clerk_id: userId,
          email: email || '',
          first_name: firstName,
          last_name: lastName,
          role
        },
        { onConflict: 'clerk_id' }
      );

      // If assigned as Teacher, register into teachers table
      if (role === 'teacher') {
        const staffCode = staffNo || `DIS/STF/${Math.floor(100 + Math.random() * 900)}`;
        const subjectsList = Array.isArray(subjects)
          ? subjects
          : typeof subjects === 'string'
          ? subjects.split(',').map((s: string) => s.trim()).filter(Boolean)
          : ['Mathematics'];

        await supabase.from('teachers').upsert(
          {
            staff_no: staffCode,
            name: name || 'Academic Staff',
            email: email || '',
            phone: phone || '+234 800 000 0000',
            assigned_class: assignedClass || 'SSS 2',
            assigned_arm: assignedArm || 'Emerald',
            subjects: subjectsList,
            qualification: qualification || 'B.Ed / Certified Cambridge Instructor'
          },
          { onConflict: 'email' }
        );
      }
    }

    return NextResponse.json({
      success: true,
      userId,
      role,
      message: `Role successfully updated to ${role} in Clerk and database!`
    });
  } catch (err: any) {
    console.error('Failed to assign role:', err);
    return NextResponse.json({ error: err.message || 'Failed to update user role' }, { status: 500 });
  }
}
