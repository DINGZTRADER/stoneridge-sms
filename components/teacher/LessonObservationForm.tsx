import React, { useState } from 'react';
import InputField from '../InputField';
import SelectField from '../SelectField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { Teacher } from '../../types';

interface LessonObservationFormProps {
  teachers: Teacher[];
}

const ratingOptions = [
  { value: '', label: 'Select Rating' },
  { value: '1', label: '1 - Needs Improvement' },
  { value: '2', label: '2 - Fair' },
  { value: '3', label: '3 - Good' },
  { value: '4', label: '4 - Very Good' },
  { value: '5', label: '5 - Excellent' },
];

const LessonObservationForm: React.FC<LessonObservationFormProps> = ({ teachers }) => {
  const [formData, setFormData] = useState({
    teacherId: '',
    observer: '',
    date: new Date().toISOString().slice(0, 10),
    preparationRating: '',
    deliveryRating: '',
    engagementRating: '',
    assessmentRating: '',
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

    const { teacherId, observer, date, comments } = formData;
    const preparationRating = parseInt(formData.preparationRating, 10);
    const deliveryRating = parseInt(formData.deliveryRating, 10);
    const engagementRating = parseInt(formData.engagementRating, 10);
    const assessmentRating = parseInt(formData.assessmentRating, 10);

    if (
      !teacherId ||
      !observer ||
      !date ||
      isNaN(preparationRating) ||
      isNaN(deliveryRating) ||
      isNaN(engagementRating) ||
      isNaN(assessmentRating)
    ) {
      setErrorMessage('Please fill in all required fields and select ratings.');
      setLoading(false);
      return;
    }

    try {
      await apiService.addLessonObservation({
        teacherId,
        observer,
        date,
        preparationRating,
        deliveryRating,
        engagementRating,
        assessmentRating,
        comments,
      });
      setSuccessMessage('Lesson observation (Annex 6) recorded successfully!');
      setFormData({ // Reset form
        teacherId: '', observer: '', date: new Date().toISOString().slice(0, 10),
        preparationRating: '', deliveryRating: '', engagementRating: '', assessmentRating: '', comments: '',
      });
    } catch (err) {
      console.error('Failed to add lesson observation:', err);
      setErrorMessage('Failed to record lesson observation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Annex 6 Lesson Observation Form</h2>

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
            label="Observer Name"
            name="observer"
            value={formData.observer}
            onChange={handleChange}
            required
          />
          <InputField
            label="Date of Observation"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Rating Scale (1-5)</h3>
          <p className="text-sm text-gray-600 italic mb-4">1: Needs Improvement, 5: Excellent</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Preparation"
              name="preparationRating"
              options={ratingOptions}
              value={formData.preparationRating}
              onChange={handleChange}
              required
            />
            <SelectField
              label="Delivery"
              name="deliveryRating"
              options={ratingOptions}
              value={formData.deliveryRating}
              onChange={handleChange}
              required
            />
            <SelectField
              label="Engagement"
              name="engagementRating"
              options={ratingOptions}
              value={formData.engagementRating}
              onChange={handleChange}
              required
            />
            <SelectField
              label="Assessment"
              name="assessmentRating"
              options={ratingOptions}
              value={formData.assessmentRating}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <label htmlFor="comments" className="block text-gray-700 text-sm font-bold mb-2">
            Comments/Feedback
          </label>
          <textarea
            id="comments"
            name="comments"
            rows={5}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            value={formData.comments}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="flex justify-end pt-6">
          <Button type="submit" disabled={loading}>
            {loading ? <LoadingSpinner /> : 'Submit Observation'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LessonObservationForm;