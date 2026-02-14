import React, { useState } from 'react';
import Button from '../Button';
import SelectField from '../SelectField';
import InputField from '../InputField';
import LoadingSpinner from '../LoadingSpinner';
import AlertMessage from '../common/AlertMessage';
import { apiService } from '../../services/apiService';

interface BulkActionsModalProps {
  selectedStudentIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}

const gradeOptions = [
  { value: '', label: 'Select Grade' },
  { value: 'P.1', label: 'Primary 1' },
  { value: 'P.2', label: 'Primary 2' },
  { value: 'P.3', label: 'Primary 3' },
  { value: 'P.4', label: 'Primary 4' },
  { value: 'P.5', label: 'Primary 5' },
  { value: 'P.6', label: 'Primary 6' },
  { value: 'P.7', label: 'Primary 7' },
];

const upeOptions = [
  { value: '', label: 'Select UPE Status' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const BulkActionsModal: React.FC<BulkActionsModalProps> = ({ selectedStudentIds, onClose, onSuccess }) => {
  const [newGrade, setNewGrade] = useState<string>('');
  const [newUpeStatus, setNewUpeStatus] = useState<string>('');
  const [newGuardianPhoneNumber, setNewGuardianPhoneNumber] = useState<string>('');

  const [loadingGrade, setLoadingGrade] = useState<boolean>(false);
  const [loadingUpe, setLoadingUpe] = useState<boolean>(false);
  const [loadingGuardianPhone, setLoadingGuardianPhone] = useState<boolean>(false);

  const [gradeMessage, setGradeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [upeMessage, setUpeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [guardianPhoneMessage, setGuardianPhoneMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApplyGrade = async () => {
    if (!newGrade) {
      setGradeMessage({ type: 'error', text: 'Please select a new grade.' });
      return;
    }
    setLoadingGrade(true);
    setGradeMessage(null);
    try {
      for (const studentId of selectedStudentIds) {
        await apiService.updateStudent(studentId, { grade: newGrade });
      }
      setGradeMessage({ type: 'success', text: `Successfully updated grade for ${selectedStudentIds.length} students to ${newGrade}.` });
      onSuccess();
    } catch (error) {
      console.error('Bulk update grade failed:', error);
      setGradeMessage({ type: 'error', text: 'Failed to update grades.' });
    } finally {
      setLoadingGrade(false);
    }
  };

  const handleApplyUpeStatus = async () => {
    if (newUpeStatus === '') {
      setUpeMessage({ type: 'error', text: 'Please select a UPE status.' });
      return;
    }
    setLoadingUpe(true);
    setUpeMessage(null);
    const isUPE = newUpeStatus === 'true';
    try {
      for (const studentId of selectedStudentIds) {
        await apiService.updateStudent(studentId, { isUPE });
      }
      setUpeMessage({ type: 'success', text: `Successfully updated UPE status for ${selectedStudentIds.length} students to ${isUPE ? 'Yes' : 'No'}.` });
      onSuccess();
    } catch (error) {
      console.error('Bulk update UPE status failed:', error);
      setUpeMessage({ type: 'error', text: 'Failed to update UPE status.' });
    } finally {
      setLoadingUpe(false);
    }
  };

  const handleApplyGuardianPhone = async () => {
    if (!newGuardianPhoneNumber.trim()) {
      setGuardianPhoneMessage({ type: 'error', text: 'Please enter a new phone number.' });
      return;
    }
    setLoadingGuardianPhone(true);
    setGuardianPhoneMessage(null);
    try {
      for (const studentId of selectedStudentIds) {
        // Fetch student to preserve other guardian details
        const student = await apiService.getStudentById(studentId);
        if (student) {
          await apiService.updateStudent(studentId, {
            guardian: { ...student.guardian, phoneNumber: newGuardianPhoneNumber.trim() },
          });
        }
      }
      setGuardianPhoneMessage({ type: 'success', text: `Successfully updated guardian phone for ${selectedStudentIds.length} students.` });
      onSuccess();
    } catch (error) {
      console.error('Bulk update guardian phone failed:', error);
      setGuardianPhoneMessage({ type: 'error', text: 'Failed to update guardian phone numbers.' });
    } finally {
      setLoadingGuardianPhone(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50" aria-labelledby="bulk-actions-modal-title" role="dialog" aria-modal="true">
      <div className="relative p-8 border w-full max-w-2xl md:max-w-3xl lg:max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 id="bulk-actions-modal-title" className="text-2xl font-bold text-gray-800">
            Perform Bulk Actions on {selectedStudentIds.length} Student{selectedStudentIds.length !== 1 ? 's' : ''}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-light leading-none">
            &times;
          </button>
        </div>

        <div className="space-y-6">
          {/* Change Grade */}
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="text-lg font-semibold mb-3 text-gray-700">Change Grade</h4>
            {gradeMessage && <AlertMessage type={gradeMessage.type} message={gradeMessage.text} className="mb-4" />}
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <SelectField
                  name="newGrade"
                  options={gradeOptions}
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  label="Select New Grade"
                  className="mb-0" // Adjust margin as it's in a flex container
                />
              </div>
              <Button onClick={handleApplyGrade} disabled={loadingGrade || !newGrade}>
                {loadingGrade ? <LoadingSpinner /> : 'Apply Grade'}
              </Button>
            </div>
          </div>

          {/* Update UPE Status */}
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="text-lg font-semibold mb-3 text-gray-700">Update UPE Status</h4>
            {upeMessage && <AlertMessage type={upeMessage.type} message={upeMessage.text} className="mb-4" />}
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <SelectField
                  name="newUpeStatus"
                  options={upeOptions}
                  value={newUpeStatus}
                  onChange={(e) => setNewUpeStatus(e.target.value)}
                  label="Mark as UPE Student?"
                  className="mb-0"
                />
              </div>
              <Button onClick={handleApplyUpeStatus} disabled={loadingUpe || newUpeStatus === ''}>
                {loadingUpe ? <LoadingSpinner /> : 'Apply UPE Status'}
              </Button>
            </div>
          </div>

          {/* Update Guardian Contact */}
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <h4 className="text-lg font-semibold mb-3 text-gray-700">Update Guardian Phone Number</h4>
            {guardianPhoneMessage && <AlertMessage type={guardianPhoneMessage.type} message={guardianPhoneMessage.text} className="mb-4" />}
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <InputField
                  name="newGuardianPhoneNumber"
                  type="tel"
                  placeholder="e.g., 0771234567"
                  value={newGuardianPhoneNumber}
                  onChange={(e) => setNewGuardianPhoneNumber(e.target.value)}
                  label="New Guardian Phone Number"
                  className="mb-0"
                />
              </div>
              <Button onClick={handleApplyGuardianPhone} disabled={loadingGuardianPhone || !newGuardianPhoneNumber.trim()}>
                {loadingGuardianPhone ? <LoadingSpinner /> : 'Update Phone'}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsModal;