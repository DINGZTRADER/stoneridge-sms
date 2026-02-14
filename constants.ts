import { FeeStructure, NavigationItem, Student, Teacher, UserRole } from './types';

export const SCHOOL_YEAR = '2026';

// ── Audit §1: Exact Bank Details ──
export const BANK_NAME = 'ABSA BANK (U) LIMITED';
export const BANK_ACCOUNT_NAME = 'STONERIDGE EDUCATION SERVICES';
export const BANK_ACCOUNT_NUMBER = '6007612808';
export const BANK_BRANCH = 'HANNINGTON BRANCH';
export const BANK_SWIFT = 'BARCUGKX';

// Legacy aliases kept so existing imports don't break
export const ABSA_BANK_ACCOUNT = BANK_ACCOUNT_NUMBER;
export const ABSA_BANK_NAME = BANK_NAME;

// ── Audit §1: Fee Amounts ──
export const DEFAULT_P1_TUITION = 1_600_000;
export const DEFAULT_P1_SCHOLASTIC = 110_000;
export const DEFAULT_PRE_PRIMARY_TUITION = 1_350_000;
export const DEFAULT_PRE_PRIMARY_SCHOLASTIC = 105_000;

// ── Navigation (Audit §4: RBAC routes) ──
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { name: 'Dashboard', href: '/', roles: [UserRole.ADMIN, UserRole.TEACHER, UserRole.PARENT] },
  { name: 'Students', href: '/students', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { name: 'Add Student', href: '/students/add', roles: [UserRole.ADMIN] },
  { name: 'Finance', href: '/finance', roles: [UserRole.ADMIN] },
  { name: 'Fee Settings', href: '/finance/settings', roles: [UserRole.ADMIN] },
  { name: 'Invoice Template', href: '/finance/invoice', roles: [UserRole.ADMIN] },
  { name: 'Grading Engine', href: '/grading', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { name: 'Timetable', href: '/timetable', roles: [UserRole.ADMIN] },
  { name: 'Lesson Observation (Annex 6)', href: '/teachers/observation', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { name: 'Performance Agreement', href: '/teachers/agreement', roles: [UserRole.ADMIN] },
  { name: 'Lesson Tracking', href: '/teachers/lesson-tracking', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { name: 'Lesson Attendance', href: '/teachers/lesson-attendance', roles: [UserRole.ADMIN, UserRole.TEACHER] },
  { name: 'Admin', href: '/admin', roles: [UserRole.ADMIN] },
  { name: 'Document Q&A (RAG)', href: '/rag', roles: [UserRole.ADMIN] },
];

// ── Seed Data ──
export const STUDENT_DATA: Student[] = [
  {
    id: 's001',
    admissionNumber: 'SR-2026-001',
    firstName: 'Alice',
    lastName: 'Smith',
    dateOfBirth: '2019-03-15',
    grade: 'P.1',
    isUPE: false,
    medicalDetails: {
      allergies: 'Peanuts',
      doctorName: 'Dr. Anya Sharma',
      doctorContact: '0771112233',
    },
    emergencyContact: {
      name: 'Margaret Smith',
      phone: '0771234567',
      relationship: 'Grandmother',
    },
    guardian: {
      name: 'Jane Smith',
      relationship: 'Mother',
      phoneNumber: '0770987654',
      occupation: 'Software Engineer',
      placeOfWork: 'Acme Corp',
      nationality: 'Ugandan',
    },
  },
  {
    id: 's002',
    admissionNumber: 'SR-2026-002',
    firstName: 'Bob',
    lastName: 'Johnson',
    dateOfBirth: '2018-11-01',
    grade: 'P.2',
    isUPE: true,
    medicalDetails: {
      allergies: 'Dust',
    },
    emergencyContact: {
      name: 'Grace Johnson',
      phone: '0704567890',
      relationship: 'Aunt',
    },
    guardian: {
      name: 'John Johnson',
      relationship: 'Father',
      phoneNumber: '0701234567',
      occupation: 'IT Consultant',
      placeOfWork: 'Tech Solutions',
      nationality: 'Ugandan',
    },
  },
  {
    id: 's003',
    admissionNumber: 'SR-2026-003',
    firstName: 'Charlie',
    lastName: 'Brown',
    dateOfBirth: '2019-06-20',
    grade: 'P.1',
    isUPE: false,
    medicalDetails: {},
    emergencyContact: {
      name: 'Tom Brown',
      phone: '0789876543',
      relationship: 'Uncle',
    },
    guardian: {
      name: 'Sally Brown',
      relationship: 'Mother',
      phoneNumber: '0788765432',
      occupation: 'Graphic Designer',
      placeOfWork: 'Creative Designs',
      nationality: 'Rwandan',
    },
  },
  {
    id: 's004',
    admissionNumber: 'SR-2026-004',
    firstName: 'Diana',
    lastName: 'Musiime',
    dateOfBirth: '2020-01-10',
    grade: 'Pre-Primary',
    isUPE: false,
    medicalDetails: {
      allergies: 'Penicillin',
      doctorName: 'Dr. James Ochieng',
      doctorContact: '0752345678',
    },
    emergencyContact: {
      name: 'Patrick Musiime',
      phone: '0752111222',
      relationship: 'Father',
    },
    guardian: {
      name: 'Rose Musiime',
      relationship: 'Mother',
      phoneNumber: '0752999888',
      occupation: 'Teacher',
      placeOfWork: 'Kampala Primary School',
      nationality: 'Ugandan',
    },
  },
];

export const TEACHER_DATA: Teacher[] = [
  { id: 't001', firstName: 'Sarah', lastName: 'Davis', assignedClass: 'P.1' },
  { id: 't002', firstName: 'Michael', lastName: 'Wilson', assignedClass: 'P.2' },
  { id: 't003', firstName: 'Grace', lastName: 'Nakato', assignedClass: 'Pre-Primary' },
];

export const FINANCE_DATA: FeeStructure[] = [
  {
    grade: 'Pre-Primary',
    tuition: DEFAULT_PRE_PRIMARY_TUITION,
    scholasticMaterials: DEFAULT_PRE_PRIMARY_SCHOLASTIC,
    total: DEFAULT_PRE_PRIMARY_TUITION + DEFAULT_PRE_PRIMARY_SCHOLASTIC,
  },
  {
    grade: 'P.1',
    tuition: DEFAULT_P1_TUITION,
    scholasticMaterials: DEFAULT_P1_SCHOLASTIC,
    total: DEFAULT_P1_TUITION + DEFAULT_P1_SCHOLASTIC,
  },
  { grade: 'P.2', tuition: 1_700_000, scholasticMaterials: 120_000, total: 1_820_000 },
  { grade: 'P.3', tuition: 1_700_000, scholasticMaterials: 120_000, total: 1_820_000 },
  { grade: 'P.4', tuition: 1_800_000, scholasticMaterials: 130_000, total: 1_930_000 },
  { grade: 'P.5', tuition: 1_800_000, scholasticMaterials: 130_000, total: 1_930_000 },
  { grade: 'P.6', tuition: 1_900_000, scholasticMaterials: 140_000, total: 2_040_000 },
  { grade: 'P.7', tuition: 1_900_000, scholasticMaterials: 140_000, total: 2_040_000 },
];

// ── Audit §3: Ugandan Grading Engine ──
export const UGANDAN_GRADING_TABLE: { minScore: number; grade: string; description: string }[] = [
  { minScore: 80, grade: 'D1', description: 'Distinction 1' },
  { minScore: 75, grade: 'D2', description: 'Distinction 2' },
  { minScore: 70, grade: 'C3', description: 'Credit 3' },
  { minScore: 65, grade: 'C4', description: 'Credit 4' },
  { minScore: 60, grade: 'C5', description: 'Credit 5' },
  { minScore: 55, grade: 'C6', description: 'Credit 6' },
  { minScore: 50, grade: 'P7', description: 'Pass 7' },
  { minScore: 45, grade: 'P8', description: 'Pass 8' },
  { minScore: 0, grade: 'F9', description: 'Fail 9' },
];

/** Map a numeric score (0-100) to Ugandan grading scale */
export function getUgandanGrade(score: number): { grade: string; description: string } {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  for (const entry of UGANDAN_GRADING_TABLE) {
    if (clamped >= entry.minScore) {
      return { grade: entry.grade, description: entry.description };
    }
  }
  return { grade: 'F9', description: 'Fail 9' };
}

// ── Timetable Day/Time options ──
export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '13:00', '13:30', '14:00',
  '14:30', '15:00', '15:30', '16:00',
];

export const GRADE_OPTIONS = [
  { value: '', label: 'Select Grade' },
  { value: 'Pre-Primary', label: 'Pre-Primary' },
  { value: 'P.1', label: 'Primary 1' },
  { value: 'P.2', label: 'Primary 2' },
  { value: 'P.3', label: 'Primary 3' },
  { value: 'P.4', label: 'Primary 4' },
  { value: 'P.5', label: 'Primary 5' },
  { value: 'P.6', label: 'Primary 6' },
  { value: 'P.7', label: 'Primary 7' },
];