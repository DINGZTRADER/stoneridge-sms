import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Student } from '../../types';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../LoadingSpinner';
import AlertMessage from '../common/AlertMessage';
import Button from '../Button';

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) {
        setError("Student ID is missing.");
        setLoading(false);
        return;
      }
      try {
        const fetchedStudent = await apiService.getStudentById(id);
        if (fetchedStudent) {
          setStudent(fetchedStudent);
        } else {
          setError("Student not found.");
        }
      } catch (err) {
        console.error('Failed to fetch student:', err);
        setError("Failed to load student data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <AlertMessage type="error" message={error} className="max-w-md mx-auto" />;
  }

  if (!student) {
    return <AlertMessage type="info" message="No student data available." className="max-w-md mx-auto" />;
  }

  const hasAllergies = student.medicalDetails?.allergies && student.medicalDetails.allergies.trim() !== '';

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">
            {student.firstName} {student.lastName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Admission No: <strong>{student.admissionNumber}</strong></p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/students')}>
          Back to Students
        </Button>
      </div>

      {/* Audit §2: RED warning badge for allergies */}
      {hasAllergies && (
        <div className="bg-red-100 border-l-4 border-red-600 text-red-800 p-4 mb-6 rounded-r-md" role="alert">
          <div className="flex items-center mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white font-bold text-sm mr-3">
              ⚠
            </span>
            <p className="font-bold text-lg text-red-700">MEDICAL ALLERGY WARNING</p>
            <span className="ml-3 inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Alert
            </span>
          </div>
          <div className="ml-11 space-y-1 text-sm">
            <p><strong>Allergies:</strong> {student.medicalDetails.allergies}</p>
            {student.medicalDetails.doctorName && (
              <p><strong>Doctor:</strong> {student.medicalDetails.doctorName}</p>
            )}
            {student.medicalDetails.doctorContact && (
              <p><strong>Doctor's Contact:</strong> {student.medicalDetails.doctorContact}</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-gray-700">
        {/* Basic Information */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Basic Information</h3>
          <p><strong className="font-medium">ID:</strong> {student.id}</p>
          <p><strong className="font-medium">Admission Number:</strong> {student.admissionNumber}</p>
          <p><strong className="font-medium">Date of Birth:</strong> {student.dateOfBirth}</p>
          <p><strong className="font-medium">Grade:</strong> {student.grade}</p>
          <p><strong className="font-medium">UPE Student:</strong> {student.isUPE ? 'Yes' : 'No'}</p>
        </div>

        {/* Medical Details – Audit §2 */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Medical Details</h3>
          <p><strong className="font-medium">Allergies/Medication:</strong> {student.medicalDetails?.allergies || 'None'}</p>
          <p><strong className="font-medium">Doctor's Name:</strong> {student.medicalDetails?.doctorName || 'N/A'}</p>
          <p><strong className="font-medium">Doctor's Contact:</strong> {student.medicalDetails?.doctorContact || 'N/A'}</p>
        </div>

        {/* Emergency Contact – Audit §2: Distinct from Guardian */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Emergency Contact</h3>
          <p><strong className="font-medium">Name:</strong> {student.emergencyContact?.name || 'N/A'}</p>
          <p><strong className="font-medium">Phone:</strong> {student.emergencyContact?.phone || 'N/A'}</p>
          {student.emergencyContact?.relationship && (
            <p><strong className="font-medium">Relationship:</strong> {student.emergencyContact.relationship}</p>
          )}
        </div>

        {/* Guardian Information – Audit §2 */}
        <div>
          <h3 className="text-xl font-semibold mb-3 text-gray-700 border-b pb-2">Guardian Information</h3>
          <p><strong className="font-medium">Name:</strong> {student.guardian.name}</p>
          <p><strong className="font-medium">Relationship:</strong> {student.guardian.relationship}</p>
          <p><strong className="font-medium">Phone Number:</strong> {student.guardian.phoneNumber}</p>
          {student.guardian.occupation && (
            <p><strong className="font-medium">Occupation:</strong> {student.guardian.occupation}</p>
          )}
          {student.guardian.placeOfWork && (
            <p><strong className="font-medium">Place of Work:</strong> {student.guardian.placeOfWork}</p>
          )}
          {student.guardian.nationality && (
            <p><strong className="font-medium">Nationality:</strong> {student.guardian.nationality}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;