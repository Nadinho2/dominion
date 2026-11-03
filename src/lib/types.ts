export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export type HouseColor = 'Emerald' | 'Sapphire' | 'Ruby' | 'Topaz' | 'Unassigned';

export type ClassLevel =
  | 'Pre-Nursery'
  | 'Nursery 1'
  | 'Nursery 2'
  | 'Basic 1'
  | 'Basic 2'
  | 'Basic 3'
  | 'Basic 4'
  | 'Basic 5'
  | 'Basic 6'
  | 'JSS 1'
  | 'JSS 2'
  | 'JSS 3'
  | 'SSS 1'
  | 'SSS 2'
  | 'SSS 3';

export type ClassArm = 'Emerald' | 'Diamond' | 'Gold' | 'Unassigned';

export type AdmissionStatus = 'Pending Review' | 'Ready for Class' | 'Enrolled' | 'Active';

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female';
  dob: string;
  classLevel: ClassLevel;
  arm: ClassArm;
  house: HouseColor;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  bloodGroup: string;
  status: 'Active' | 'Suspended' | 'Alumni';
  admissionStatus?: AdmissionStatus;
  assignedTeacherId?: string;
  busRouteId?: string;
  avatarUrl?: string;
  joinedDate: string;
}

export interface Teacher {
  id: string;
  staffNo: string;
  name: string;
  email: string;
  phone: string;
  assignedClass?: ClassLevel;
  assignedArm?: ClassArm;
  subjects: string[];
  qualification: string;
  avatarUrl?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  category: 'Core' | 'Sciences' | 'Arts' | 'Vocational' | 'Languages';
  curriculum: 'Blended' | 'Cambridge' | 'Nigerian';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  remarks?: string;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  term: '1st Term' | '2nd Term' | '3rd Term';
  session: string; // e.g. "2026/2027"
  ca1: number; // Max 20
  ca2: number; // Max 20
  exam: number; // Max 60
  total: number; // Max 100
  grade: 'A1' | 'B2' | 'B3' | 'C4' | 'C5' | 'C6' | 'D7' | 'E8' | 'F9';
  remark: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  term: string;
  session: string;
  tuitionFee: number;
  developmentLevy: number;
  ictRobotics: number;
  laboratoryFee?: number;
  busFee?: number;
  lunchFee?: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  dueDate: string;
  paidDate?: string;
}

export interface BusRoute {
  id: string;
  zone: string;
  routeTitle: string;
  driverName: string;
  driverPhone: string;
  vehicleNo: string;
  capacity: number;
  registeredStudents: number;
  stops: string[];
  fee?: number;
  status?: 'Active' | 'Maintenance';
}

export interface Announcement {
  id: string;
  title: string;
  date: string;
  author: string;
  category: 'Academic' | 'Sports' | 'Administrative' | 'Event' | 'Emergency';
  content: string;
  targetRole: 'All' | 'Teachers' | 'Parents' | 'Students';
}

