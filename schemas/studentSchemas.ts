import { z } from 'zod';

export const medicalDetailsSchema = z.object({
  allergies: z.string().trim().optional(),
  doctorName: z.string().trim().optional(),
  doctorContact: z.string().trim().optional(), // Audit §2
});

export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, 'Emergency contact name is required'),
  phone: z.string().trim().min(1, 'Emergency contact phone is required'),
  relationship: z.string().trim().optional(),
});

export const guardianSchema = z.object({
  name: z.string().trim().min(1, 'Guardian name is required'),
  relationship: z.string().trim().min(1, 'Relationship is required'),
  phoneNumber: z.string().trim().min(1, 'Phone number is required'),
  occupation: z.string().trim().optional(), // Audit §2
  placeOfWork: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
});

export const studentSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').min(1, 'Date of birth is required'),
  grade: z.string().min(1, 'Grade is required'),
  isUPE: z.boolean(),
  medicalDetails: medicalDetailsSchema,
  emergencyContact: emergencyContactSchema,
  guardian: guardianSchema,
});

// Schema for CSV row validation
export const csvStudentRowSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)').min(1, 'Date of birth is required'),
  grade: z.string().min(1, 'Grade is required'),
  isUPE: z.string().refine(val => ['true', 'false'].includes(val.toLowerCase()), 'isUPE must be "true" or "false"'),
  allergies: z.string().trim().optional(),
  doctorName: z.string().trim().optional(),
  doctorContact: z.string().trim().optional(),
  emergencyContactName: z.string().trim().min(1, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().trim().min(1, 'Emergency contact phone is required'),
  emergencyContactRelationship: z.string().trim().optional(),
  guardianName: z.string().trim().min(1, 'Guardian name is required'),
  guardianRelationship: z.string().trim().min(1, 'Guardian relationship is required'),
  guardianPhoneNumber: z.string().trim().min(1, 'Guardian phone number is required'),
  guardianOccupation: z.string().trim().optional(),
  guardianPlaceOfWork: z.string().trim().optional(),
  guardianNationality: z.string().trim().optional(),
});