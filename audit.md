Here is the comprehensive **`audit.md`** file.

You should save this file in the root of your project folder. It serves as the "Acceptance Criteria" for your AI (or a human QA tester) to verify that the system is not just a generic template, but a **production-grade** solution tailored specifically for **The Stoneridge School** and compliant with **Ugandan Law**.

***

# STONERIDGE SMS: PRODUCTION AUDIT CHECKLIST

> **Instructions for QA/AI:** Run this audit against the deployed application. All items must pass for the system to be considered "Production Ready."

## 1. Financial Integrity (Stoneridge Fee Structure)
*Reference: Source 583 (Fee Structure Image) & Source 132 (Education Act)*

- [ ] **Fee Component Logic:** Does the database store "Tuition" and "Scholastic Materials" as separate records rather than a single hardcoded total? (Crucial for accounting).
- [ ] **Data Accuracy (P.1 Class):** Create a test invoice for a P.1 student. Does it auto-calculate to exactly **1,710,000 UGX** (1,600,000 Tuition + 110,000 Scholastic)?
- [ ] **Data Accuracy (Pre-Primary):** Create a test invoice for a Pre-Primary student. Does it auto-calculate to **1,455,000 UGX** (1,350,000 Tuition + 105,000 Scholastic)?
- [ ] **Bank Details on PDF:** Generate a PDF Invoice. Does the footer display the exact bank details?
    - **Bank:** ABSA BANK (U) LIMITED
    - **Account Name:** STONERIDGE EDUCATION SERVICES
    - **Account Number:** 6007612808
    - **Branch:** HANNINGTON BRANCH
    - **Swift:** BARCUGKX
- [ ] **UPE Compliance Rule:** Set a student's status to `isUPE = true`. Does the system automatically set their **Tuition** to `0` while keeping **Scholastic Materials** > `0`? (Mandatory compliance with *Education Act 2008*).

## 2. Admissions & Legal Liability (Application Form)
*Reference: Source 582 (Application Form) & Source 96 (Student Profile)*

- [ ] **Medical Alert System:** On the "Add Student" form, is there a specific field for **"Health Allergies/Medication"**?
- [ ] **Liability Warning:** If a student has "Peanut Allergy" entered, does their Profile View display a **RED** warning badge? (Safety requirement).
- [ ] **Doctor's Contact:** Is the "Doctor’s Name" and "Doctor’s Contact" field available and visible on the student profile?
- [ ] **Caregiver Risk Assessment:** Does the Guardian form capture **"Place of Work"**, **"Occupation"**, and **"Nationality"**? (Required by Stoneridge for fee collection risk analysis).
- [ ] **Emergency Contact:** Is the Emergency Contact distinct from the Parent/Guardian?

## 3. Ministry of Education Compliance (HR & Academics)
*Reference: Source 378 (Performance Guidelines) & Source 31 (Grading)*

- [ ] **Annex 6 Implementation:** Go to the Teacher Appraisal section. Is there a digital version of **"Annex 6: Lesson Observation Form"**?
    - Does it use a **1–5 Rating Scale** (Poor to Excellent)?
    - Does it cover the 4 Ministry standards: *Preparation, Delivery, Learner Engagement, Assessment*?
- [ ] **Lesson Attendance:** Is there a digital register to mark teachers as "Present" or "Absent" for specific lessons (not just daily attendance)?
- [ ] **Ugandan Grading Engine:** Enter a score of **81**. Does the system automatically map it to **"D1"**?
    - *Check:* 76 = D2, 72 = C3, 66 = C4, 61 = C5, 56 = C6, 52 = P7, 47 = P8, <45 = F9.
- [ ] **Timetable Conflict Detection:** Try to schedule "Teacher A" for "Math" in "P.1" at **Monday 8:00 AM** and simultaneously for "Science" in "P.2" at **Monday 8:00 AM**. Does the system block this and throw an error?

## 4. Technical & Security Architecture
*Reference: Source 106 (Enterprise Blueprint) & Source 24 (Next.js)*

- [ ] **Role-Based Access Control (RBAC):**
    - Log in as a user with role `TEACHER`. Try to navigate to `/finance` or `/settings`. Are you redirected or shown a "403 Forbidden" error?
- [ ] **Database Integrity:** Check the `Student` table. Is the `admissionNumber` field unique? (Prevent duplicate students).
- [ ] **Seeding:** Run `npx prisma db seed`. Does it successfully populate the database with the 2026 Fee Structure and Academic Calendar without errors?
- [ ] **Build Check:** Run `npm run build`. Does the Next.js build complete without TypeScript errors?

## 5. UI/UX & Branding
*Reference: Source 90-101 (Dashboard Visuals)*

- [ ] **Brand Identity:** Is the Sidebar background color **Deep Maroon** (`#800000`)?
- [ ] **School Year Badge:** Does the top header explicitly show **"School Year: 2026"**?
- [ ] **Dashboard Stats:** Does the Admin Dashboard display the 4 critical cards from the design?
    - *Total Students, Revenue Collected, Staff Attendance, Pending Invoices.*
- [ ] **Financial Tables:** In the Finance view, are "Tuition" and "Scholastic Material" displayed in **separate columns** (not merged)?