import React, { useState } from 'react';
import InputField from '../InputField';
import SelectField from '../SelectField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { Teacher } from '../../types';

interface PerformanceAgreementFormProps {
  teachers: Teacher[];
}

const PerformanceAgreementForm: React.FC<PerformanceAgreementFormProps> = ({ teachers }) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    headteacher: '',
    date: new Date().toISOString().slice(0, 10),
    targetsInput: '', // For multi-line input
    comments: '',
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

    const { teacherId, headteacher, date, targetsInput, comments } = formData;
    const targets = targetsInput.split('\n').filter(target => target.trim() !== '');

    if (!teacherId || !headteacher || !date || targets.length === 0) {
      setErrorMessage('Please fill in all required fields including at least one target.');
      setLoading(false);
      return;
    }

    try {
      await apiService.addPerformanceAgreement({
        teacherId,
        headteacher,
        date,
        targets,
        comments,
      });
      setSuccessMessage('Performance agreement recorded successfully!');
      setFormData({ // Reset form
        teacherId: '', headteacher: '', date: new Date().toISOString().slice(0, 10),
        targetsInput: '', comments: '',
      });
    } catch (err) {
      console.error('Failed to add performance agreement:', err);
      setErrorMessage('Failed to record performance agreement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Teacher Performance Agreement</h2>

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
            label="Headteacher Name"
            name="headteacher"
            value={formData.headteacher}
            onChange={handleChange}
            required
          />
          <InputField
            label="Agreement Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label htmlFor="targetsInput" className="block text-gray-700 text-sm font-bold mb-2">
            Specific Targets (one per line)
          </label>
          <textarea
            id="targetsInput"
            name="targetsInput"
            rows={6}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.targetsInput}
            onChange={handleChange}
            placeholder={`e.g.,\n- Syllabus Coverage: 90% for P.1 Math\n- Improve student engagement by 15%\n- Submit lesson plans on time weekly`}
            required
          ></textarea>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label htmlFor="comments" className="block text-gray-700 text-sm font-bold mb-2">
            Comments
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={4}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.comments}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Create Agreement'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PerformanceAgreementForm;