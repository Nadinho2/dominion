import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      studentId,
      action = 'approve',
      house,
      admissionNo,
      teacherId,
      arm,
      classLevel,
      updates
    } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Missing required studentId parameter' }, { status: 400 });
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let dbUpdates: Record<string, any> = {};

    if (action === 'approve') {
      // Valid house constraint check
      const validHouse = ['Emerald', 'Sapphire', 'Ruby', 'Topaz'].includes(house)
        ? house
        : 'Emerald';
      
      dbUpdates = {
        house: validHouse,
        admission_no: admissionNo
      };
      
      // If arm is not provided or invalid, ensure a valid arm constraint
      if (arm && ['Emerald', 'Diamond', 'Gold'].includes(arm)) {
        dbUpdates.arm = arm;
      }
    } else if (action === 'claim') {
      dbUpdates = {
        assigned_teacher_id: teacherId,
        arm: arm && ['Emerald', 'Diamond', 'Gold'].includes(arm) ? arm : 'Gold',
        class_level: classLevel
      };
    } else if (action === 'release') {
      dbUpdates = {
        assigned_teacher_id: null
      };
    } else if (action === 'update' && updates) {
      if (updates.firstName) dbUpdates.first_name = updates.firstName;
      if (updates.lastName) dbUpdates.last_name = updates.lastName;
      if (updates.classLevel) dbUpdates.class_level = updates.classLevel;
      if (updates.house && ['Emerald', 'Sapphire', 'Ruby', 'Topaz'].includes(updates.house)) {
        dbUpdates.house = updates.house;
      }
      if (updates.arm && ['Emerald', 'Diamond', 'Gold'].includes(updates.arm)) {
        dbUpdates.arm = updates.arm;
      }
      if (updates.guardianName) dbUpdates.guardian_name = updates.guardianName;
      if (updates.guardianPhone) dbUpdates.guardian_phone = updates.guardianPhone;
      if (updates.guardianEmail) dbUpdates.guardian_email = updates.guardianEmail;
      if (updates.address) dbUpdates.address = updates.address;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.admissionNo) dbUpdates.admission_no = updates.admissionNo;
      if (updates.bloodGroup) dbUpdates.blood_group = updates.bloodGroup;
      if (updates.busRouteId !== undefined) dbUpdates.bus_route_id = updates.busRouteId;
    }

    const { data, error } = await supabase
      .from('students')
      .update(dbUpdates)
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Supabase student update error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      student: data,
      message: `Student successfully updated (${action})`
    });
  } catch (err: any) {
    console.error('Server student update exception:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

