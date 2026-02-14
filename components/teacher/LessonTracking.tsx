import React, { useState } from 'react';
import InputField from '../InputField';
import SelectField from '../SelectField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { Teacher } from '../../types';

interface LessonTrackingProps {
  teachers: Teacher[];
}

const LessonTracking: React.FC<LessonTrackingProps> = ({ teachers }) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    date: new Date().toISOString().slice(0, 10),
    missedLessons: '0',
    recoveredLessons: '0',
    reason: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teacherOptions = [
    { value: '', label: 'Select Teacher' },
    ...teachers.map((teacher) => ({
      value: teacher.id,
      label: `${teacher.firstName} ${teacher.lastName} (${teacher.assignedClass})`,
    })),
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const { teacherId, date, reason } = formData;
    const missedLessons = parseInt(formData.missedLessons, 10);
    const recoveredLessons = parseInt(formData.recoveredLessons, 10);

    if (!teacherId || !date || (missedLessons === 0 && recoveredLessons === 0) || (missedLessons > 0 && !reason)) {
      setErrorMessage('Please select a teacher, date, provide lesson counts, and a reason if lessons were missed.');
      setLoading(false);
      return;
    }

    try {
      await apiService.addLessonLog({
        teacherId,
        date,
        missedLessons,
        recoveredLessons,
        reason,
      });
      setSuccessMessage('Lesson tracking entry recorded successfully!');
      setFormData({ // Reset form
        teacherId: '', date: new Date().toISOString().slice(0, 10),
        missedLessons: '0', recoveredLessons: '0', reason: '',
      });
    } catch (err) {
      console.error('Failed to add lesson log:', err);
      setErrorMessage('Failed to record lesson tracking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Missed/Recovered Lessons Tracking</h2>

      {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
      {errorMessage && <AlertMessage type="error" message={errorMessage} className="mb-4" />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Teacher"
            name="teacherId"
            options={teacherOptions}
            value={formData.teacherId}
            onChange={handleChange}
            required
          />
          <InputField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Lesson Counts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Missed Lessons"
              name="missedLessons"
              type="number"
              value={formData.missedLessons}
              onChange={handleChange}
              min="0"
              required
            />
            <InputField
              label="Recovered Lessons"
              name="recoveredLessons"
              type="number"
              value={formData.recoveredLessons}
              onChange={handleChange}
              min="0"
              required
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">
            Reason for Missed Lessons (if any)
          </label>
          <textarea
            id="reason"
            name="reason"
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.reason}
            onChange={handleChange}
            placeholder="e.g., Teacher was on sick leave, School holiday, Field trip."
          ></textarea>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Submit Tracking'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonTracking;