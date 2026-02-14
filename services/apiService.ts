import {
  FeeStructure,
  Invoice,
  LessonAttendance,
  LessonObservation,
  LessonLog,
  PerformanceAgreement,
  Student,
  Teacher,
  TimetableEntry,
} from '../types';
import {
  STUDENT_DATA,
  TEACHER_DATA,
  FINANCE_DATA,
  DEFAULT_P1_TUITION,
  DEFAULT_P1_SCHOLASTIC,
  DEFAULT_PRE_PRIMARY_TUITION,
  DEFAULT_PRE_PRIMARY_SCHOLASTIC,
} from '../constants';

// ── Storage Keys ──
const STORAGE_KEYS = {
  students: 'sms_students',
  teachers: 'sms_teachers',
  feeStructures: 'sms_feeStructures',
  invoices: 'sms_invoices',
  lessonObservations: 'sms_lessonObservations',
  performanceAgreements: 'sms_performanceAgreements',
  lessonLogs: 'sms_lessonLogs',
  lessonAttendance: 'sms_lessonAttendance',
  timetable: 'sms_timetable',
  admissionCounter: 'sms_admissionCounter',
} as const;

// ── Persistence helpers ──
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`[SMS] Failed to persist ${key}:`, e);
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// ── ApiService ──
class ApiService {
  private students: Student[];
  private teachers: Teacher[];
  private feeStructures: FeeStructure[];
  private invoices: Invoice[];
  private lessonObservations: LessonObservation[];
  private performanceAgreements: PerformanceAgreement[];
  private lessonLogs: LessonLog[];
  private lessonAttendance: LessonAttendance[];
  private timetable: TimetableEntry[];
  private admissionCounter: number;

  constructor() {
    // Load from localStorage, falling back to seed constants on first use
    this.students = load<Student[]>(STORAGE_KEYS.students, [...STUDENT_DATA]);
    this.teachers = load<Teacher[]>(STORAGE_KEYS.teachers, [...TEACHER_DATA]);
    this.feeStructures = load<FeeStructure[]>(STORAGE_KEYS.feeStructures, [...FINANCE_DATA]);
    this.invoices = load<Invoice[]>(STORAGE_KEYS.invoices, []);
    this.lessonObservations = load<LessonObservation[]>(STORAGE_KEYS.lessonObservations, []);
    this.performanceAgreements = load<PerformanceAgreement[]>(STORAGE_KEYS.performanceAgreements, []);
    this.lessonLogs = load<LessonLog[]>(STORAGE_KEYS.lessonLogs, []);
    this.lessonAttendance = load<LessonAttendance[]>(STORAGE_KEYS.lessonAttendance, []);
    this.timetable = load<TimetableEntry[]>(STORAGE_KEYS.timetable, []);
    this.admissionCounter = load<number>(STORAGE_KEYS.admissionCounter, STUDENT_DATA.length);
  }

  // ── Persist helpers (call after every mutation) ──
  private persistStudents(): void { save(STORAGE_KEYS.students, this.students); }
  private persistTeachers(): void { save(STORAGE_KEYS.teachers, this.teachers); }
  private persistFees(): void { save(STORAGE_KEYS.feeStructures, this.feeStructures); }
  private persistInvoices(): void { save(STORAGE_KEYS.invoices, this.invoices); }
  private persistObservations(): void { save(STORAGE_KEYS.lessonObservations, this.lessonObservations); }
  private persistAgreements(): void { save(STORAGE_KEYS.performanceAgreements, this.performanceAgreements); }
  private persistLessonLogs(): void { save(STORAGE_KEYS.lessonLogs, this.lessonLogs); }
  private persistAttendance(): void { save(STORAGE_KEYS.lessonAttendance, this.lessonAttendance); }
  private persistTimetable(): void { save(STORAGE_KEYS.timetable, this.timetable); }
  private persistCounter(): void { save(STORAGE_KEYS.admissionCounter, this.admissionCounter); }

  // ── Admission Number generator (Audit §4: unique) ──
  private generateAdmissionNumber(): string {
    this.admissionCounter++;
    this.persistCounter();
    return `SR-2026-${this.admissionCounter.toString().padStart(3, '0')}`;
  }

  // ══════════════════════════════════════════════════════════
  // STUDENTS
  // ══════════════════════════════════════════════════════════
  async getStudents(): Promise<Student[]> {
    await sleep(150);
    return this.students;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    await sleep(100);
    return this.students.find((s) => s.id === id);
  }

  async addStudent(newStudent: Omit<Student, 'id' | 'admissionNumber'>): Promise<Student> {
    await sleep(300);
    const id = `s${(this.students.length + 1).toString().padStart(3, '0')}`;
    const admissionNumber = this.generateAdmissionNumber();

    if (this.students.some((s) => s.admissionNumber === admissionNumber)) {
      throw new Error(`Admission number ${admissionNumber} already exists.`);
    }

    const student: Student = { ...newStudent, id, admissionNumber };
    this.students.push(student);
    this.persistStudents();
    return student;
  }

  async bulkAddStudents(newStudents: Omit<Student, 'id' | 'admissionNumber'>[]): Promise<Student[]> {
    await sleep(500);
    const added: Student[] = [];
    for (const ns of newStudents) {
      const id = `s${(this.students.length + 1).toString().padStart(3, '0')}`;
      const admissionNumber = this.generateAdmissionNumber();
      const student: Student = { ...ns, id, admissionNumber };
      this.students.push(student);
      added.push(student);
    }
    this.persistStudents();
    return added;
  }

  async updateStudent(id: string, updatedFields: Partial<Student>): Promise<Student | undefined> {
    await sleep(300);
    const index = this.students.findIndex((s) => s.id === id);
    if (index > -1) {
      this.students[index] = { ...this.students[index], ...updatedFields };
      this.persistStudents();
      return this.students[index];
    }
    return undefined;
  }

  async deleteStudent(id: string): Promise<boolean> {
    await sleep(200);
    const index = this.students.findIndex((s) => s.id === id);
    if (index > -1) {
      this.students.splice(index, 1);
      this.persistStudents();
      return true;
    }
    return false;
  }

  async getStudentCount(): Promise<number> {
    return this.students.length;
  }

  async getUPEStudentCount(): Promise<number> {
    return this.students.filter((s) => s.isUPE).length;
  }

  // ══════════════════════════════════════════════════════════
  // TEACHERS
  // ══════════════════════════════════════════════════════════
  async getTeachers(): Promise<Teacher[]> {
    await sleep(150);
    return this.teachers;
  }

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    await sleep(100);
    return this.teachers.find((t) => t.id === id);
  }

  async getTeacherCount(): Promise<number> {
    return this.teachers.length;
  }

  // ══════════════════════════════════════════════════════════
  // FINANCE
  // ══════════════════════════════════════════════════════════
  async getFeeStructures(): Promise<FeeStructure[]> {
    await sleep(150);
    return this.feeStructures;
  }

  async getFeeForGrade(grade: string): Promise<FeeStructure | undefined> {
    return this.feeStructures.find((f) => f.grade === grade);
  }

  async updateFeeStructure(grade: string, tuition: number, scholasticMaterials: number): Promise<FeeStructure | undefined> {
    await sleep(300);
    const index = this.feeStructures.findIndex((f) => f.grade === grade);
    if (index > -1) {
      this.feeStructures[index] = {
        ...this.feeStructures[index],
        tuition,
        scholasticMaterials,
        total: tuition + scholasticMaterials,
      };
      this.persistFees();
      return this.feeStructures[index];
    }
    return undefined;
  }

  // ══════════════════════════════════════════════════════════
  // INVOICES (Audit §1 & §5)
  // ══════════════════════════════════════════════════════════
  async createInvoice(studentId: string): Promise<Invoice> {
    await sleep(300);
    const student = this.students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found');

    const fee = this.feeStructures.find((f) => f.grade === student.grade);
    if (!fee) throw new Error(`No fee structure for grade ${student.grade}`);

    // Audit §1: UPE Compliance – Tuition = 0, Scholastic > 0
    const effectiveTuition = student.isUPE ? 0 : fee.tuition;
    const effectiveTotal = effectiveTuition + fee.scholasticMaterials;

    const invoice: Invoice = {
      id: `INV-${Date.now()}`,
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      grade: student.grade,
      isUPE: student.isUPE,
      tuition: effectiveTuition,
      scholasticMaterials: fee.scholasticMaterials,
      total: effectiveTotal,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    this.invoices.push(invoice);
    this.persistInvoices();
    return invoice;
  }

  async getInvoices(): Promise<Invoice[]> {
    await sleep(100);
    return this.invoices;
  }

  async markInvoicePaid(invoiceId: string): Promise<Invoice | undefined> {
    await sleep(200);
    const index = this.invoices.findIndex((i) => i.id === invoiceId);
    if (index > -1) {
      this.invoices[index] = { ...this.invoices[index], status: 'PAID' };
      this.persistInvoices();
      return this.invoices[index];
    }
    return undefined;
  }

  async getPendingInvoiceCount(): Promise<number> {
    return this.invoices.filter((i) => i.status === 'PENDING').length;
  }

  async getTotalRevenue(): Promise<number> {
    return this.invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0);
  }

  // ══════════════════════════════════════════════════════════
  // MINISTRY COMPLIANCE FORMS
  // ══════════════════════════════════════════════════════════
  async addLessonObservation(observation: Omit<LessonObservation, 'id'>): Promise<LessonObservation> {
    await sleep(300);
    const id = `lo${(this.lessonObservations.length + 1).toString().padStart(3, '0')}`;
    const record = { ...observation, id };
    this.lessonObservations.push(record);
    this.persistObservations();
    return record;
  }

  async addPerformanceAgreement(agreement: Omit<PerformanceAgreement, 'id'>): Promise<PerformanceAgreement> {
    await sleep(300);
    const id = `pa${(this.performanceAgreements.length + 1).toString().padStart(3, '0')}`;
    const record = { ...agreement, id };
    this.performanceAgreements.push(record);
    this.persistAgreements();
    return record;
  }

  async addLessonLog(log: Omit<LessonLog, 'id'>): Promise<LessonLog> {
    await sleep(300);
    const id = `ll${(this.lessonLogs.length + 1).toString().padStart(3, '0')}`;
    const record = { ...log, id };
    this.lessonLogs.push(record);
    this.persistLessonLogs();
    return record;
  }

  // ══════════════════════════════════════════════════════════
  // LESSON ATTENDANCE (Audit §3: per-lesson)
  // ══════════════════════════════════════════════════════════
  async addLessonAttendance(entry: Omit<LessonAttendance, 'id'>): Promise<LessonAttendance> {
    await sleep(200);
    const id = `la${(this.lessonAttendance.length + 1).toString().padStart(3, '0')}`;
    const record = { ...entry, id };
    this.lessonAttendance.push(record);
    this.persistAttendance();
    return record;
  }

  async getLessonAttendance(): Promise<LessonAttendance[]> {
    await sleep(100);
    return this.lessonAttendance;
  }

  // ══════════════════════════════════════════════════════════
  // TIMETABLE & CONFLICT DETECTION (Audit §3)
  // ══════════════════════════════════════════════════════════
  async getTimetable(): Promise<TimetableEntry[]> {
    await sleep(100);
    return this.timetable;
  }

  async addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> {
    await sleep(200);

    // Conflict: same teacher, same day & time
    const conflict = this.timetable.find(
      (t) => t.teacherId === entry.teacherId && t.day === entry.day && t.time === entry.time
    );
    if (conflict) {
      const teacher = this.teachers.find((t) => t.id === entry.teacherId);
      const name = teacher ? `${teacher.firstName} ${teacher.lastName}` : entry.teacherId;
      throw new Error(
        `SCHEDULING CONFLICT: ${name} is already scheduled for "${conflict.subject}" in ${conflict.className} on ${conflict.day} at ${conflict.time}. Cannot assign to "${entry.subject}" in ${entry.className} at the same time.`
      );
    }

    const id = `tt${(this.timetable.length + 1).toString().padStart(3, '0')}`;
    const record = { ...entry, id };
    this.timetable.push(record);
    this.persistTimetable();
    return record;
  }

  async removeTimetableEntry(id: string): Promise<boolean> {
    await sleep(100);
    const index = this.timetable.findIndex((t) => t.id === id);
    if (index > -1) {
      this.timetable.splice(index, 1);
      this.persistTimetable();
      return true;
    }
    return false;
  }

  // ══════════════════════════════════════════════════════════
  // AGGREGATES
  // ══════════════════════════════════════════════════════════
  async getStaffAttendanceRate(): Promise<number> {
    if (this.lessonAttendance.length === 0) return 100;
    const present = this.lessonAttendance.filter((a) => a.status === 'PRESENT').length;
    return Math.round((present / this.lessonAttendance.length) * 100);
  }

  // ══════════════════════════════════════════════════════════
  // SEEDING
  // ══════════════════════════════════════════════════════════
  async seedDatabase(): Promise<string> {
    await sleep(500);

    // Ensure Pre-Primary fee
    if (!this.feeStructures.some((f) => f.grade === 'Pre-Primary')) {
      this.feeStructures.push({
        grade: 'Pre-Primary',
        tuition: DEFAULT_PRE_PRIMARY_TUITION,
        scholasticMaterials: DEFAULT_PRE_PRIMARY_SCHOLASTIC,
        total: DEFAULT_PRE_PRIMARY_TUITION + DEFAULT_PRE_PRIMARY_SCHOLASTIC,
      });
    }

    // Ensure P.1 fee matches audit constants
    const p1Idx = this.feeStructures.findIndex((f) => f.grade === 'P.1');
    const p1Fee: FeeStructure = {
      grade: 'P.1',
      tuition: DEFAULT_P1_TUITION,
      scholasticMaterials: DEFAULT_P1_SCHOLASTIC,
      total: DEFAULT_P1_TUITION + DEFAULT_P1_SCHOLASTIC,
    };
    if (p1Idx > -1) {
      this.feeStructures[p1Idx] = p1Fee;
    } else {
      this.feeStructures.push(p1Fee);
    }
    this.persistFees();

    // Generate sample invoices for all students that don't have one yet
    for (const student of this.students) {
      const fee = this.feeStructures.find((f) => f.grade === student.grade);
      if (fee && !this.invoices.some((i) => i.studentId === student.id)) {
        const effectiveTuition = student.isUPE ? 0 : fee.tuition;
        this.invoices.push({
          id: `INV-SEED-${student.id}`,
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          grade: student.grade,
          isUPE: student.isUPE,
          tuition: effectiveTuition,
          scholasticMaterials: fee.scholasticMaterials,
          total: effectiveTuition + fee.scholasticMaterials,
          status: student.id === 's001' ? 'PAID' : 'PENDING',
          createdAt: new Date().toISOString(),
        });
      }
    }
    this.persistInvoices();

    return `Database seeded: ${this.students.length} students, ${this.invoices.length} invoices, ${this.feeStructures.length} fee structures saved to browser storage.`;
  }

  // ── Full Reset (clears localStorage & reinitializes from seed constants) ──
  resetDatabase(): void {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    this.students = [...STUDENT_DATA];
    this.teachers = [...TEACHER_DATA];
    this.feeStructures = [...FINANCE_DATA];
    this.invoices = [];
    this.lessonObservations = [];
    this.performanceAgreements = [];
    this.lessonLogs = [];
    this.lessonAttendance = [];
    this.timetable = [];
    this.admissionCounter = STUDENT_DATA.length;

    // Persist the clean slate
    this.persistStudents();
    this.persistTeachers();
    this.persistFees();
    this.persistInvoices();
    this.persistObservations();
    this.persistAgreements();
    this.persistLessonLogs();
    this.persistAttendance();
    this.persistTimetable();
    this.persistCounter();
  }
}

export const apiService = new ApiService();