import React, { useState } from 'react';
import { z } from 'zod';
import { studentSchema } from '../../schemas/studentSchemas';
import InputField from '../InputField';
import SelectField from '../SelectField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { Student } from '../../types';
import { GRADE_OPTIONS } from '../../constants';

type StudentFormData = z.infer<typeof studentSchema>;

const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<StudentFormData>>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    isUPE: false,
    medicalDetails: {
      allergies: '',
      doctorName: '',
      doctorContact: '',
    },
    emergencyContact: {
      name: '',
      phone: '',
      relationship: '',
    },
    guardian: {
      name: '',
      relationship: '',
      phoneNumber: '',
      occupation: '',
      placeOfWork: '',
      nationality: '',
    },
  });
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;

    if (name.startsWith('medicalDetails.')) {
      setFormData((prev) => ({
        ...prev,
        medicalDetails: {
          ...prev.medicalDetails,
          [name.split('.')[1]]: value,
        } as typeof prev.medicalDetails,
      }));
    } else if (name.startsWith('emergencyContact.')) {
      setFormData((prev) => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [name.split('.')[1]]: value,
        } as typeof prev.emergencyContact,
      }));
    } else if (name.startsWith('guardian.')) {
      setFormData((prev) => ({
        ...prev,
        guardian: {
          ...prev.guardian,
          [name.split('.')[1]]: value,
        } as typeof prev.guardian,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);
    setErrorMessage(null);
    setLoading(true);

    try {
      const parsedData = studentSchema.parse(formData);
      const newStudent = await apiService.addStudent(parsedData as Omit<Student, 'id' | 'admissionNumber'>);
      setSuccessMessage(`Student ${newStudent.firstName} ${newStudent.lastName} (${newStudent.admissionNumber}) added successfully!`);
      setFormData({
        firstName: '', lastName: '', dateOfBirth: '', grade: '', isUPE: false,
        medicalDetails: { allergies: '', doctorName: '', doctorContact: '' },
        emergencyContact: { name: '', phone: '', relationship: '' },
        guardian: { name: '', relationship: '', phoneNumber: '', occupation: '', placeOfWork: '', nationality: '' },
      });
      navigate(`/students/${newStudent.id}`);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.issues);
        setErrorMessage('Please correct the validation errors.');
      } else {
        setErrorMessage('Failed to add student. Please try again.');
        console.error('API Error:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (path: string) => {
    const error = errors.find(err => err.path.join('.') === path);
    return error ? error.message : undefined;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Student</h2>

      {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Student Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="First Name"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
            error={getErrorMessage('firstName')}
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
            error={getErrorMessage('lastName')}
          />
          <InputField
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={handleChange}
            error={getErrorMessage('dateOfBirth')}
          />
          <SelectField
            label="Grade"
            name="grade"
            value={formData.grade || ''}
            onChange={handleChange}
            options={GRADE_OPTIONS}
            error={getErrorMessage('grade')}
          />
          <div className="md:col-span-2 flex items-center mb-4">
            <input
              id="isUPE"
              name="isUPE"
              type="checkbox"
              checked={formData.isUPE || false}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-indigo-600"
            />
            <label htmlFor="isUPE" className="ml-2 block text-sm text-gray-900">
              UPE (Universal Primary Education) Student
              <p className="text-xs text-gray-500 italic">Tuition will be zero for UPE students (Education Act 2008 compliance).</p>
            </label>
          </div>
        </div>

        {/* Medical Details – Audit §2 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Medical Details & Liability</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Health Allergies / Medication"
              name="medicalDetails.allergies"
              value={formData.medicalDetails?.allergies || ''}
              onChange={handleChange}
              error={getErrorMessage('medicalDetails.allergies')}
              placeholder="e.g., Peanut Allergy, Penicillin"
            />
            <InputField
              label="Doctor's Name"
              name="medicalDetails.doctorName"
              value={formData.medicalDetails?.doctorName || ''}
              onChange={handleChange}
              error={getErrorMessage('medicalDetails.doctorName')}
            />
            <InputField
              label="Doctor's Contact"
              name="medicalDetails.doctorContact"
              value={formData.medicalDetails?.doctorContact || ''}
              onChange={handleChange}
              error={getErrorMessage('medicalDetails.doctorContact')}
              placeholder="e.g., 0771234567"
            />
          </div>
        </div>

        {/* Emergency Contact – Audit §2: Distinct from Parent/Guardian */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Emergency Contact</h3>
          <p className="text-sm text-gray-500 italic mb-3">This must be a different person from the parent/guardian.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Emergency Contact Name"
              name="emergencyContact.name"
              value={formData.emergencyContact?.name || ''}
              onChange={handleChange}
              error={getErrorMessage('emergencyContact.name')}
            />
            <InputField
              label="Emergency Contact Phone"
              name="emergencyContact.phone"
              value={formData.emergencyContact?.phone || ''}
              onChange={handleChange}
              error={getErrorMessage('emergencyContact.phone')}
              placeholder="e.g., 0771234567"
            />
            <InputField
              label="Relationship to Student"
              name="emergencyContact.relationship"
              value={formData.emergencyContact?.relationship || ''}
              onChange={handleChange}
              error={getErrorMessage('emergencyContact.relationship')}
              placeholder="e.g., Grandmother, Uncle"
            />
          </div>
        </div>

        {/* Guardian/Caregiver Data – Audit §2 */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Guardian / Caregiver Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Guardian Name"
              name="guardian.name"
              value={formData.guardian?.name || ''}
              onChange={handleChange}
              error={getErrorMessage('guardian.name')}
            />
            <InputField
              label="Relationship"
              name="guardian.relationship"
              value={formData.guardian?.relationship || ''}
              onChange={handleChange}
              error={getErrorMessage('guardian.relationship')}
            />
            <InputField
              label="Phone Number"
              name="guardian.phoneNumber"
              value={formData.guardian?.phoneNumber || ''}
              onChange={handleChange}
              error={getErrorMessage('guardian.phoneNumber')}
            />
            <InputField
              label="Occupation"
              name="guardian.occupation"
              value={formData.guardian?.occupation || ''}
              onChange={handleChange}
              error={getErrorMessage('guardian.occupation')}
            />
            <InputField
              label="Place of Work"
              name="guardian.placeOfWork"
              value={formData.guardian?.placeOfWork || ''}
              onChange={handleChange}
              error={getErrorMessage('guardian.placeOfWork')}
            />
            <InputField
              label="Nationality"
              name="guardian.nationality"
              value={formData.guardian?.nationality || ''}
              onChange={handleChange}
              error={getErrorMessage('guardian.nationality')}
            />
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Add Student'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;