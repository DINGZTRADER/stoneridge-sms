export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
}

export interface Student {
  id: string;
  admissionNumber: string; // Unique admission number (Audit §4)
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  grade: string;
  isUPE: boolean; // Universal Primary Education compliance
  medicalDetails: MedicalDetails;
  guardian: Guardian;
  emergencyContact: EmergencyContact; // Distinct from parent/guardian (Audit §2)
}

export interface MedicalDetails {
  allergies?: string;
  doctorName?: string;
  doctorContact?: string; // Audit §2 – Doctor's Contact
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship?: string;
}

export interface Guardian {
  name: string;
  relationship: string;
  phoneNumber: string;
  occupation?: string; // Audit §2 – Caregiver Risk Assessment
  placeOfWork?: string;
  nationality?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  assignedClass: string;
}

export interface FeeStructure {
  grade: string;
  tuition: number;
  scholasticMaterials: number;
  total: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  isUPE: boolean;
  tuition: number;
  scholasticMaterials: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL';
  createdAt: string;
}

export interface LessonObservation {
  id: string;
  teacherId: string;
  observer: string;
  date: string;
  preparationRating: number; // 1-5
  deliveryRating: number; // 1-5
  engagementRating: number; // 1-5
  assessmentRating: number; // 1-5
  comments: string;
}

export interface PerformanceAgreement {
  id: string;
  teacherId: string;
  headteacher: string;
  date: string;
  targets: string[];
  comments: string;
}

export interface LessonLog {
  id: string;
  teacherId: string;
  date: string;
  missedLessons: number;
  recoveredLessons: number;
  reason: string;
}

// Audit §3 – lesson-level attendance (not just daily)
export interface LessonAttendance {
  id: string;
  teacherId: string;
  date: string;
  lessonSlot: string; // e.g. "Monday 8:00 AM – P.1 Math"
  status: 'PRESENT' | 'ABSENT';
  reason?: string;
}

// Audit §3 – Timetable Conflict Detection
export interface TimetableEntry {
  id: string;
  teacherId: string;
  day: string; // Monday–Friday
  time: string; // HH:MM
  className: string; // e.g. P.1
  subject: string; // e.g. Math
}

// Audit §3 – Ugandan Grading Engine result
export interface GradeResult {
  score: number;
  grade: string; // D1–F9
  description: string;
}

export interface NavigationItem {
  name: string;
  href: string;
  roles: UserRole[];
}