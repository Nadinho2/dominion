import { useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  Subject,
  GradeRecord,
  FeeInvoice,
  BusRoute,
  Announcement,
  UserRole,
  AttendanceRecord,
  ClassArm,
  ClassLevel,
  HouseColor
} from './types';
import {
  INITIAL_STUDENTS,
  INITIAL_TEACHERS,
  INITIAL_SUBJECTS,
  INITIAL_GRADES,
  INITIAL_FEES,
  INITIAL_BUS_ROUTES,
  INITIAL_ANNOUNCEMENTS
} from './mockData';
import { createClient } from './supabase/client';

const STORAGE_KEYS = {
  ROLE: 'dis_sms_role_v3',
  STUDENTS: 'dis_sms_students_v3',
  TEACHERS: 'dis_sms_teachers_v3',
  SUBJECTS: 'dis_sms_subjects_v3',
  GRADES: 'dis_sms_grades_v3',
  FEES: 'dis_sms_fees_v3',
  ATTENDANCE: 'dis_sms_attendance_v3',
  BUS_ROUTES: 'dis_sms_bus_routes_v3',
  ANNOUNCEMENTS: 'dis_sms_announcements_v3'
};

export function getStoredRole(): UserRole {
  if (typeof window === 'undefined') return 'parent';
  return (localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole) || 'parent';
}

export function setStoredRole(role: UserRole) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    window.dispatchEvent(new Event('dis_role_changed'));
  }
}

// Convert Supabase snake_case student to camelCase
function mapDbStudent(db: any): Student {
  const isPending = Boolean(
    db.admission_no?.includes('PEND') ||
    db.admission_status === 'Pending Review'
  );

  return {
    id: db.id,
    admissionNo: db.admission_no,
    firstName: db.first_name,
    lastName: db.last_name,
    gender: db.gender,
    dob: db.dob,
    classLevel: db.class_level,
    arm: isPending ? 'Unassigned' : (db.arm || 'Unassigned'),
    house: isPending ? 'Unassigned' : (db.house || 'Unassigned'),
    guardianName: db.guardian_name,
    guardianPhone: db.guardian_phone,
    guardianEmail: db.guardian_email || '',
    address: db.address || '',
    bloodGroup: db.blood_group || 'O+',
    status: db.status || 'Active',
    admissionStatus: isPending
      ? 'Pending Review'
      : (db.assigned_teacher_id ? 'Enrolled' : 'Ready for Class'),
    assignedTeacherId: db.assigned_teacher_id,
    busRouteId: db.bus_route_id,
    avatarUrl: db.avatar_url,
    joinedDate: db.joined_date || db.created_at
  };
}

export function useSchoolStore() {
  const [role, setRole] = useState<UserRole>('parent');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [teachers, setTeachers] = useState<Teacher[]>(INITIAL_TEACHERS);
  const [subjects, setSubjects] = useState<Subject[]>(INITIAL_SUBJECTS);
  const [grades, setGrades] = useState<GradeRecord[]>(INITIAL_GRADES);
  const [fees, setFees] = useState<FeeInvoice[]>(INITIAL_FEES);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [busRoutes, setBusRoutes] = useState<BusRoute[]>(INITIAL_BUS_ROUTES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize from LocalStorage and sync with Supabase
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
    if (savedRole) setRole(savedRole);

    const savedStudents = localStorage.getItem(STORAGE_KEYS.STUDENTS);
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (e) {
        console.error('Failed to parse students', e);
      }
    }

    const savedGrades = localStorage.getItem(STORAGE_KEYS.GRADES);
    if (savedGrades) {
      try {
        setGrades(JSON.parse(savedGrades));
      } catch (e) {
        console.error('Failed to parse grades', e);
      }
    }

    const savedFees = localStorage.getItem(STORAGE_KEYS.FEES);
    if (savedFees) {
      try {
        setFees(JSON.parse(savedFees));
      } catch (e) {
        console.error('Failed to parse fees', e);
      }
    }

    setIsLoaded(true);

    // Sync from Supabase if online
    const supabase = createClient();
    if (supabase) {
      supabase.from('students').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(mapDbStudent);
          setStudents(mapped);
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(mapped));
        }
      });

      supabase.from('teachers').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setTeachers(
            data.map((t: any) => ({
              id: t.id,
              staffNo: t.staff_no,
              name: t.name,
              email: t.email,
              phone: t.phone,
              assignedClass: t.assigned_class,
              assignedArm: t.assigned_arm,
              subjects: t.subjects || [],
              qualification: t.qualification
            }))
          );
        }
      });

      supabase.from('subjects').select('*').then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          setSubjects(data);
        }
      });
    }

    const handleRoleChange = () => {
      const current = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
      if (current) setRole(current);
    };

    window.addEventListener('dis_role_changed', handleRoleChange);
    return () => window.removeEventListener('dis_role_changed', handleRoleChange);
  }, []);

  const changeRole = (newRole: UserRole) => {
    setRole(newRole);
    setStoredRole(newRole);
  };

  const addStudent = async (newStudent: Omit<Student, 'id' | 'admissionNo' | 'joinedDate'>) => {
    const admissionNo = `DIS/2026/${String(students.length + 401).padStart(4, '0')}`;
    const student: Student = {
      ...newStudent,
      id: `std-${Date.now()}`,
      admissionNo,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [student, ...students];
    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    }

    // Attempt Supabase insert
    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from('students').insert({
          admission_no: admissionNo,
          first_name: newStudent.firstName,
          last_name: newStudent.lastName,
          gender: newStudent.gender,
          dob: newStudent.dob,
          class_level: newStudent.classLevel,
          arm: newStudent.arm,
          house: newStudent.house,
          guardian_name: newStudent.guardianName,
          guardian_phone: newStudent.guardianPhone,
          guardian_email: newStudent.guardianEmail,
          address: newStudent.address,
          blood_group: newStudent.bloodGroup,
          status: newStudent.status
        });
      } catch (e) {
        console.warn('Supabase sync warning (running local mode):', e);
      }
    }

    return student;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const updated = students.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    }
  };

  const addGrade = async (grade: Omit<GradeRecord, 'id' | 'total' | 'grade' | 'remark'>) => {
    const total = grade.ca1 + grade.ca2 + grade.exam;
    let computedGrade: GradeRecord['grade'] = 'F9';
    let computedRemark = 'Needs intensive improvement.';

    if (total >= 75) {
      computedGrade = 'A1';
      computedRemark = 'Distinction / Excellent performance';
    } else if (total >= 70) {
      computedGrade = 'B2';
      computedRemark = 'Very Good';
    } else if (total >= 65) {
      computedGrade = 'B3';
      computedRemark = 'Good';
    } else if (total >= 60) {
      computedGrade = 'C4';
      computedRemark = 'Credit';
    } else if (total >= 55) {
      computedGrade = 'C5';
      computedRemark = 'Credit';
    } else if (total >= 50) {
      computedGrade = 'C6';
      computedRemark = 'Pass';
    } else if (total >= 45) {
      computedGrade = 'D7';
      computedRemark = 'Pass';
    } else if (total >= 40) {
      computedGrade = 'E8';
      computedRemark = 'Weak Pass';
    }

    const newGrade: GradeRecord = {
      ...grade,
      id: `grd-${Date.now()}`,
      total,
      grade: computedGrade,
      remark: computedRemark
    };

    const updated = [newGrade, ...grades];
    setGrades(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(updated));
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase.from('grades').insert({
          student_id: grade.studentId,
          subject_code: grade.subjectCode,
          subject_name: grade.subjectName,
          term: grade.term,
          session: grade.session,
          ca1: grade.ca1,
          ca2: grade.ca2,
          exam: grade.exam,
          grade: computedGrade,
          remark: computedRemark
        });
      } catch (e) {
        console.warn('Supabase sync warning:', e);
      }
    }

    return newGrade;
  };

  const recordPayment = async (invoiceId: string, amount: number) => {
    const updated = fees.map((inv) => {
      if (inv.id === invoiceId) {
        const newPaid = inv.paidAmount + amount;
        const newBal = Math.max(0, inv.totalAmount - newPaid);
        const newStatus: FeeInvoice['status'] = newBal === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
        return {
          ...inv,
          paidAmount: newPaid,
          balance: newBal,
          status: newStatus,
          paidDate: new Date().toISOString().split('T')[0]
        };
      }
      return inv;
    });
    setFees(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updated));
    }
  };

  const recordAttendance = async (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newRecords = records.map((r) => ({
      ...r,
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    }));
    const updated = [...newRecords, ...attendance];
    setAttendance(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(updated));
    }
  };

  const addAnnouncement = async (item: Omit<Announcement, 'id' | 'date'>) => {
    const newAnc: Announcement = {
      ...item,
      id: `anc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [newAnc, ...announcements];
    setAnnouncements(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(updated));
    }
  };

  // 1. Teacher Claims Student from Admission Pool (Locks out other teachers)
  const claimStudent = async (studentId: string, teacherId: string, classArm: ClassArm, classLevel?: ClassLevel) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          assignedTeacherId: teacherId,
          arm: classArm,
          classLevel: classLevel || s.classLevel,
          admissionStatus: 'Enrolled' as const
        };
      }
      return s;
    });

    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from('students')
          .update({
            assigned_teacher_id: teacherId,
            arm: classArm,
            class_level: classLevel
          })
          .eq('id', studentId);
      } catch (e) {
        console.warn('Supabase claimStudent warning:', e);
      }
    }
  };

  // 2. Release Student back to the Unassigned Pool
  const releaseStudentToPool = async (studentId: string) => {
    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          assignedTeacherId: undefined,
          arm: 'Unassigned' as const,
          admissionStatus: 'Ready for Class' as const
        };
      }
      return s;
    });

    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from('students')
          .update({
            assigned_teacher_id: null,
            arm: 'Unassigned',
            admission_status: 'Ready for Class'
          })
          .eq('id', studentId);
      } catch (e) {
        console.warn('Supabase releaseStudent warning:', e);
      }
    }
  };

  // 3. Admin Assigns House and Approves Admission Number
  const assignHouseAndApprove = async (studentId: string, house: HouseColor, customAdmissionNo?: string) => {
    const targetStudent = students.find((s) => s.id === studentId);
    const finalAdmissionNo =
      customAdmissionNo ||
      (targetStudent?.admissionNo.includes('PEND')
        ? `DIS/2026/${String(students.filter((s) => !s.admissionNo.includes('PEND')).length + 401).padStart(4, '0')}`
        : targetStudent?.admissionNo || `DIS/2026/0499`);

    const updated = students.map((s) => {
      if (s.id === studentId) {
        return {
          ...s,
          house,
          admissionNo: finalAdmissionNo,
          admissionStatus: 'Ready for Class' as const
        };
      }
      return s;
    });

    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from('students')
          .update({
            house,
            admission_no: finalAdmissionNo
          })
          .eq('id', studentId);
      } catch (e) {
        console.warn('Supabase assignHouse warning:', e);
      }
    }

    // Dispatch Official Admission & House Induction Email
    if (targetStudent?.guardianEmail && typeof window !== 'undefined') {
      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'admission_welcome',
          payload: {
            guardianEmail: targetStudent.guardianEmail,
            guardianName: targetStudent.guardianName || 'Parent / Guardian',
            studentName: `${targetStudent.firstName} ${targetStudent.lastName}`,
            admissionNo: finalAdmissionNo,
            classLevel: targetStudent.classLevel,
            house
          }
        })
      }).catch(e => console.warn('Admission welcome email dispatch warning:', e));
    }
  };

  // 4. Public Self-Registration for Students & Parents
  const selfRegisterStudent = async (
    applicant: Omit<Student, 'id' | 'admissionNo' | 'joinedDate' | 'arm' | 'house' | 'admissionStatus'> & {
      house?: HouseColor;
    }
  ) => {
    try {
      const res = await fetch('/api/admissions/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicant)
      });
      const data = await res.json();
      if (data.student) {
        const updated = [data.student, ...students.filter((s) => s.id !== data.student.id)];
        setStudents(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
        }
        return data.student as Student;
      }
    } catch (e) {
      console.warn('API registration call fallback to local:', e);
    }

    const tempNo = `DIS/2026/PEND-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const newStd: Student = {
      ...applicant,
      id: `std-reg-${Date.now()}`,
      admissionNo: tempNo,
      arm: 'Unassigned',
      house: applicant.house || 'Unassigned',
      admissionStatus: 'Pending Review',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const updated = [newStd, ...students];
    setStudents(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(updated));
    }

    return newStd;
  };

  // 5. Admin Assigns Teacher to Class Arm & Subjects
  const assignTeacher = async (
    teacherId: string,
    assignedClass: ClassLevel,
    assignedArm: ClassArm,
    subjectsList: string[]
  ) => {
    const updated = teachers.map((t) => {
      if (t.id === teacherId) {
        return {
          ...t,
          assignedClass,
          assignedArm,
          subjects: subjectsList
        };
      }
      return t;
    });

    setTeachers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(updated));
    }

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from('teachers')
          .update({
            assigned_class: assignedClass,
            assigned_arm: assignedArm,
            subjects: subjectsList
          })
          .eq('id', teacherId);
      } catch (e) {
        console.warn('Supabase assignTeacher warning:', e);
      }
    }
  };

  // 6. Admin Bus Route Management
  const addBusRoute = async (routeData: Omit<BusRoute, 'id'>) => {
    const newRoute: BusRoute = {
      ...routeData,
      id: `bus-${Date.now()}`
    };
    const updated = [...busRoutes, newRoute];
    setBusRoutes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BUS_ROUTES, JSON.stringify(updated));
    }
  };

  const updateBusRoute = async (id: string, updates: Partial<BusRoute>) => {
    const updated = busRoutes.map((r) => (r.id === id ? { ...r, ...updates } : r));
    setBusRoutes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BUS_ROUTES, JSON.stringify(updated));
    }
  };

  const deleteBusRoute = async (id: string) => {
    const updated = busRoutes.filter((r) => r.id !== id);
    setBusRoutes(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.BUS_ROUTES, JSON.stringify(updated));
    }
  };

  // 7. Admin Curriculum / Subject Management
  const addSubject = async (subjectData: Omit<Subject, 'id'>) => {
    const newSub: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`
    };
    const updated = [...subjects, newSub];
    setSubjects(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(updated));
    }
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    const updated = subjects.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setSubjects(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(updated));
    }
  };

  const deleteSubject = async (id: string) => {
    const updated = subjects.filter((s) => s.id !== id);
    setSubjects(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(updated));
    }
  };

  // 8. Admin Fee Invoice Management
  const addFeeInvoice = async (invData: Omit<FeeInvoice, 'id'>) => {
    const newInv: FeeInvoice = {
      ...invData,
      id: `inv-${Date.now()}`
    };
    const updated = [newInv, ...fees];
    setFees(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updated));
    }
  };

  const updateFeeInvoice = async (id: string, updates: Partial<FeeInvoice>) => {
    const updated = fees.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFees(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updated));
    }
  };

  const deleteFeeInvoice = async (id: string) => {
    const updated = fees.filter((f) => f.id !== id);
    setFees(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.FEES, JSON.stringify(updated));
    }
  };

  return {
    isLoaded,
    role,
    changeRole,
    students,
    teachers,
    subjects,
    grades,
    fees,
    attendance,
    busRoutes,
    announcements,
    addStudent,
    updateStudent,
    claimStudent,
    releaseStudentToPool,
    assignHouseAndApprove,
    selfRegisterStudent,
    assignTeacher,
    addGrade,
    recordPayment,
    recordAttendance,
    addAnnouncement,
    addBusRoute,
    updateBusRoute,
    deleteBusRoute,
    addSubject,
    updateSubject,
    deleteSubject,
    addFeeInvoice,
    updateFeeInvoice,
    deleteFeeInvoice
  };
}
