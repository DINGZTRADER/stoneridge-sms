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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let admissionCounter = STUDENT_DATA.length;

class ApiService {
  private students: Student[] = [...STUDENT_DATA];
  private teachers: Teacher[] = [...TEACHER_DATA];
  private feeStructures: FeeStructure[] = [...FINANCE_DATA];
  private invoices: Invoice[] = [];
  private lessonObservations: LessonObservation[] = [];
  private performanceAgreements: PerformanceAgreement[] = [];
  private lessonLogs: LessonLog[] = [];
  private lessonAttendance: LessonAttendance[] = [];
  private timetable: TimetableEntry[] = [];

  // ── Admission Number generator (Audit §4: unique) ──
  private generateAdmissionNumber(): string {
    admissionCounter++;
    return `SR-2026-${admissionCounter.toString().padStart(3, '0')}`;
  }

  // ── Students ──
  async getStudents(): Promise<Student[]> {
    await sleep(300);
    return this.students;
  }

  async getStudentById(id: string): Promise<Student | undefined> {
    await sleep(200);
    return this.students.find((s) => s.id === id);
  }

  async addStudent(newStudent: Omit<Student, 'id' | 'admissionNumber'>): Promise<Student> {
    await sleep(500);
    const id = `s${(this.students.length + 1).toString().padStart(3, '0')}`;
    const admissionNumber = this.generateAdmissionNumber();

    // Duplicate admission number check
    if (this.students.some((s) => s.admissionNumber === admissionNumber)) {
      throw new Error(`Admission number ${admissionNumber} already exists.`);
    }

    const student: Student = { ...newStudent, id, admissionNumber };
    this.students.push(student);
    return student;
  }

  async bulkAddStudents(newStudents: Omit<Student, 'id' | 'admissionNumber'>[]): Promise<Student[]> {
    await sleep(1000);
    const addedStudents: Student[] = [];
    for (const ns of newStudents) {
      const id = `s${(this.students.length + 1).toString().padStart(3, '0')}`;
      const admissionNumber = this.generateAdmissionNumber();
      const student: Student = { ...ns, id, admissionNumber };
      this.students.push(student);
      addedStudents.push(student);
    }
    return addedStudents;
  }

  async updateStudent(id: string, updatedFields: Partial<Student>): Promise<Student | undefined> {
    await sleep(500);
    const index = this.students.findIndex((s) => s.id === id);
    if (index > -1) {
      this.students[index] = { ...this.students[index], ...updatedFields };
      return this.students[index];
    }
    return undefined;
  }

  async getStudentCount(): Promise<number> {
    await sleep(100);
    return this.students.length;
  }

  async getUPEStudentCount(): Promise<number> {
    await sleep(100);
    return this.students.filter((s) => s.isUPE).length;
  }

  // ── Teachers ──
  async getTeachers(): Promise<Teacher[]> {
    await sleep(300);
    return this.teachers;
  }

  async getTeacherById(id: string): Promise<Teacher | undefined> {
    await sleep(200);
    return this.teachers.find((t) => t.id === id);
  }

  async getTeacherCount(): Promise<number> {
    await sleep(100);
    return this.teachers.length;
  }

  // ── Finance ──
  async getFeeStructures(): Promise<FeeStructure[]> {
    await sleep(300);
    return this.feeStructures;
  }

  async getFeeForGrade(grade: string): Promise<FeeStructure | undefined> {
    await sleep(100);
    return this.feeStructures.find((f) => f.grade === grade);
  }

  async updateFeeStructure(grade: string, tuition: number, scholasticMaterials: number): Promise<FeeStructure | undefined> {
    await sleep(500);
    const index = this.feeStructures.findIndex((f) => f.grade === grade);
    if (index > -1) {
      this.feeStructures[index] = {
        ...this.feeStructures[index],
        tuition,
        scholasticMaterials,
        total: tuition + scholasticMaterials,
      };
      return this.feeStructures[index];
    }
    return undefined;
  }

  // ── Invoices (Audit §1 & §5) ──
  async createInvoice(studentId: string): Promise<Invoice> {
    await sleep(400);
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
    return invoice;
  }

  async getInvoices(): Promise<Invoice[]> {
    await sleep(200);
    return this.invoices;
  }

  async getPendingInvoiceCount(): Promise<number> {
    await sleep(100);
    return this.invoices.filter((i) => i.status === 'PENDING').length;
  }

  async getTotalRevenue(): Promise<number> {
    await sleep(100);
    return this.invoices
      .filter((i) => i.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0);
  }

  // ── Ministry Compliance Forms ──
  async addLessonObservation(observation: Omit<LessonObservation, 'id'>): Promise<LessonObservation> {
    await sleep(500);
    const id = `lo${(this.lessonObservations.length + 1).toString().padStart(3, '0')}`;
    const newObservation = { ...observation, id };
    this.lessonObservations.push(newObservation);
    return newObservation;
  }

  async addPerformanceAgreement(agreement: Omit<PerformanceAgreement, 'id'>): Promise<PerformanceAgreement> {
    await sleep(500);
    const id = `pa${(this.performanceAgreements.length + 1).toString().padStart(3, '0')}`;
    const newAgreement = { ...agreement, id };
    this.performanceAgreements.push(newAgreement);
    return newAgreement;
  }

  async addLessonLog(log: Omit<LessonLog, 'id'>): Promise<LessonLog> {
    await sleep(500);
    const id = `ll${(this.lessonLogs.length + 1).toString().padStart(3, '0')}`;
    const newLog = { ...log, id };
    this.lessonLogs.push(newLog);
    return newLog;
  }

  // ── Lesson Attendance (Audit §3: lesson-level attendance) ──
  async addLessonAttendance(entry: Omit<LessonAttendance, 'id'>): Promise<LessonAttendance> {
    await sleep(300);
    const id = `la${(this.lessonAttendance.length + 1).toString().padStart(3, '0')}`;
    const newEntry = { ...entry, id };
    this.lessonAttendance.push(newEntry);
    return newEntry;
  }

  async getLessonAttendance(): Promise<LessonAttendance[]> {
    await sleep(200);
    return this.lessonAttendance;
  }

  // ── Timetable & Conflict Detection (Audit §3) ──
  async getTimetable(): Promise<TimetableEntry[]> {
    await sleep(200);
    return this.timetable;
  }

  async addTimetableEntry(entry: Omit<TimetableEntry, 'id'>): Promise<TimetableEntry> {
    await sleep(300);

    // Conflict detection: same teacher, same day & time
    const conflict = this.timetable.find(
      (t) => t.teacherId === entry.teacherId && t.day === entry.day && t.time === entry.time
    );
    if (conflict) {
      const teacher = this.teachers.find((t) => t.id === entry.teacherId);
      const teacherName = teacher ? `${teacher.firstName} ${teacher.lastName}` : entry.teacherId;
      throw new Error(
        `SCHEDULING CONFLICT: ${teacherName} is already scheduled for "${conflict.subject}" in ${conflict.className} on ${conflict.day} at ${conflict.time}. Cannot assign to "${entry.subject}" in ${entry.className} at the same time.`
      );
    }

    const id = `tt${(this.timetable.length + 1).toString().padStart(3, '0')}`;
    const newEntry = { ...entry, id };
    this.timetable.push(newEntry);
    return newEntry;
  }

  async removeTimetableEntry(id: string): Promise<boolean> {
    await sleep(200);
    const index = this.timetable.findIndex((t) => t.id === id);
    if (index > -1) {
      this.timetable.splice(index, 1);
      return true;
    }
    return false;
  }

  // ── Staff Attendance aggregate ──
  async getStaffAttendanceRate(): Promise<number> {
    await sleep(100);
    if (this.lessonAttendance.length === 0) return 100;
    const present = this.lessonAttendance.filter((a) => a.status === 'PRESENT').length;
    return Math.round((present / this.lessonAttendance.length) * 100);
  }

  // ── Seeding ──
  async seedDatabase(): Promise<string> {
    await sleep(1000);

    // Ensure fee structures for Pre-Primary and P.1 are present
    if (!this.feeStructures.some((f) => f.grade === 'Pre-Primary')) {
      this.feeStructures.push({
        grade: 'Pre-Primary',
        tuition: DEFAULT_PRE_PRIMARY_TUITION,
        scholasticMaterials: DEFAULT_PRE_PRIMARY_SCHOLASTIC,
        total: DEFAULT_PRE_PRIMARY_TUITION + DEFAULT_PRE_PRIMARY_SCHOLASTIC,
      });
    }
    if (!this.feeStructures.some((f) => f.grade === 'P.1' && f.tuition === DEFAULT_P1_TUITION && f.scholasticMaterials === DEFAULT_P1_SCHOLASTIC)) {
      // Update existing P.1 if different
      const existing = this.feeStructures.findIndex((f) => f.grade === 'P.1');
      if (existing > -1) {
        this.feeStructures[existing] = {
          grade: 'P.1',
          tuition: DEFAULT_P1_TUITION,
          scholasticMaterials: DEFAULT_P1_SCHOLASTIC,
          total: DEFAULT_P1_TUITION + DEFAULT_P1_SCHOLASTIC,
        };
      } else {
        this.feeStructures.push({
          grade: 'P.1',
          tuition: DEFAULT_P1_TUITION,
          scholasticMaterials: DEFAULT_P1_SCHOLASTIC,
          total: DEFAULT_P1_TUITION + DEFAULT_P1_SCHOLASTIC,
        });
      }
    }

    // Generate sample invoices for dashboard
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
          status: student.id === 's001' ? 'PAID' : 'PENDING', // One paid, rest pending for demo
          createdAt: new Date().toISOString(),
        });
      }
    }

    return `Database seeded successfully with 2026 fees (including Pre-Primary & P.1), ${this.students.length} students, and ${this.invoices.length} invoices.`;
  }
}

export const apiService = new ApiService();