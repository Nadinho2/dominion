import { Student, Teacher, Subject, GradeRecord, FeeInvoice, BusRoute, Announcement } from './types';

// All placeholder student accounts have been erased
export const INITIAL_STUDENTS: Student[] = [];

// All placeholder teacher accounts have been erased
export const INITIAL_TEACHERS: Teacher[] = [];

// All placeholder student grades have been erased
export const INITIAL_GRADES: GradeRecord[] = [];

// All placeholder fee records have been erased
export const INITIAL_FEES: FeeInvoice[] = [];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-1',
    name: 'Mathematics',
    code: 'MTH101',
    category: 'Core',
    curriculum: 'Blended'
  },
  {
    id: 'sub-2',
    name: 'English Language',
    code: 'ENG101',
    category: 'Core',
    curriculum: 'Blended'
  },
  {
    id: 'sub-3',
    name: 'Physics',
    code: 'PHY201',
    category: 'Sciences',
    curriculum: 'Cambridge'
  },
  {
    id: 'sub-4',
    name: 'Chemistry',
    code: 'CHM201',
    category: 'Sciences',
    curriculum: 'Cambridge'
  },
  {
    id: 'sub-5',
    name: 'Biology',
    code: 'BIO201',
    category: 'Sciences',
    curriculum: 'Blended'
  },
  {
    id: 'sub-6',
    name: 'Robotics & STEM',
    code: 'ROB101',
    category: 'Vocational',
    curriculum: 'Blended'
  },
  {
    id: 'sub-7',
    name: 'Civic & Social Education',
    code: 'CIV101',
    category: 'Arts',
    curriculum: 'Nigerian'
  },
  {
    id: 'sub-8',
    name: 'French Language',
    code: 'FRN101',
    category: 'Languages',
    curriculum: 'Cambridge'
  }
];

export const INITIAL_BUS_ROUTES: BusRoute[] = [
  {
    id: 'bus-1',
    zone: 'Zone A',
    routeTitle: 'Ajao Estate - Airport Road - Chivita Axis',
    driverName: 'Assigned Driver A',
    driverPhone: '+234 803 000 0001',
    vehicleNo: 'JJJ-842-EK (Coaster 1)',
    capacity: 32,
    registeredStudents: 0,
    fee: 85000,
    status: 'Active',
    stops: ['Asa Afariogun', 'Stella Sholanke', 'Chivita Junction', 'Ajao Roundabout']
  },
  {
    id: 'bus-2',
    zone: 'Zone B',
    routeTitle: 'Mafoluku - Oshodi - Airport Junction',
    driverName: 'Assigned Driver B',
    driverPhone: '+234 802 000 0002',
    vehicleNo: 'KJA-512-AB (Coaster 2)',
    capacity: 32,
    registeredStudents: 0,
    fee: 95000,
    status: 'Active',
    stops: ['Airport View Cres', 'Mafoluku Rd', 'Oshodi Bus Terminal', 'Murtala Muhammed Way']
  },
  {
    id: 'bus-3',
    zone: 'Zone C',
    routeTitle: 'Isolo - Ago Palace Way - Okota Axis',
    driverName: 'Assigned Driver C',
    driverPhone: '+234 809 000 0003',
    vehicleNo: 'LSR-329-XY (Toyota HiAce)',
    capacity: 18,
    registeredStudents: 0,
    fee: 110000,
    status: 'Active',
    stops: ['Ago Palace Way', 'Century Roundabout', 'Isolo Bus Stop', 'Oke-Afa']
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Welcome to the New Academic Session',
    date: '2026-10-30',
    author: 'Principal Office',
    category: 'Administrative',
    content: 'Welcome to Dominion International School Management Portal. All parents, students, and academic staff should verify their profile credentials.',
    targetRole: 'All'
  },
  {
    id: 'anc-2',
    title: 'Inter-House Sports Championship 2026 Kickoff',
    date: '2026-10-28',
    author: 'Sports Directorate',
    category: 'Sports',
    content: 'The 2026 Annual Inter-House Track & Field Heats will commence soon at the Main Sports Pavilion. All house masters (Emerald, Sapphire, Ruby, Topaz) must ensure students are in their correct house jerseys.',
    targetRole: 'All'
  }
];
