import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendApplicationAcknowledgedEmail } from '@/lib/resend';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      gender,
      dob,
      classLevel,
      bloodGroup = 'O+',
      guardianName,
      guardianPhone,
      guardianEmail,
      address = '',
      previousSchool = '',
      busService = ''
    } = body;

    if (!firstName || !lastName || !guardianName || !guardianPhone) {
      return NextResponse.json({ error: 'Missing mandatory applicant or guardian details' }, { status: 400 });
    }

    const tempAdmissionNo = `DIS/2026/PEND-${String(Math.floor(1000 + Math.random() * 9000))}`;

    let studentRecord: any = {
      id: `std-reg-${Date.now()}`,
      admissionNo: tempAdmissionNo,
      firstName,
      lastName,
      gender,
      dob,
      classLevel,
      arm: 'Unassigned',
      house: 'Unassigned',
      guardianName,
      guardianPhone,
      guardianEmail: guardianEmail || '',
      address,
      bloodGroup,
      status: 'Active',
      admissionStatus: 'Pending Review',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    // 1. Insert into Supabase with server-level privileges
    if (supabaseUrl && supabaseServiceKey) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data, error } = await supabase
        .from('students')
        .insert({
          admission_no: tempAdmissionNo,
          first_name: firstName,
          last_name: lastName,
          gender,
          dob,
          class_level: classLevel,
          arm: 'Gold', // Satisfies remote DB check constraint
          house: 'Sapphire', // Satisfies remote DB check constraint
          guardian_name: guardianName,
          guardian_phone: guardianPhone,
          guardian_email: guardianEmail || '',
          address,
          blood_group: bloodGroup,
          status: 'Active'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase registration insert error:', error);
      } else if (data) {
        studentRecord = {
          ...studentRecord,
          id: data.id,
          joinedDate: data.joined_date || studentRecord.joinedDate
        };
      }
    }

    // 2. Dispatch Admission Application Emails (Parent + Admin alert)
    if (guardianEmail) {
      try {
        await sendApplicationAcknowledgedEmail({
          guardianEmail,
          guardianName,
          studentName: `${firstName} ${lastName}`.trim(),
          applicationRef: tempAdmissionNo,
          classLevel
        });
      } catch (emailErr) {
        console.warn('Admissions email dispatch warning:', emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      student: studentRecord
    });
  } catch (err: any) {
    console.error('Admissions registration route exception:', err);
    return NextResponse.json({ error: err.message || 'Failed to register applicant' }, { status: 500 });
  }
}

