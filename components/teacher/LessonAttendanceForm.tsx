import React, { useState, useEffect, useCallback } from 'react';
import SelectField from '../SelectField';
import InputField from '../InputField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { Teacher, LessonAttendance } from '../../types';

interface LessonAttendanceFormProps {
    teachers: Teacher[];
}

const STATUS_OPTIONS = [
    { value: '', label: 'Select Status' },
    { value: 'PRESENT', label: 'Present' },
    { value: 'ABSENT', label: 'Absent' },
];

const LessonAttendanceForm: React.FC<LessonAttendanceFormProps> = ({ teachers }) => {
    const [formData, setFormData] = useState({
        teacherId: '',
        date: new Date().toISOString().slice(0, 10),
        lessonSlot: '',
        status: '',
        reason: '',
    });

    const [records, setRecords] = useState<LessonAttendance[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const teacherOptions = [
        { value: '', label: 'Select Teacher' },
        ...teachers.map((t) => ({
            value: t.id,
            label: `${t.firstName} ${t.lastName} (${t.assignedClass})`,
        })),
    ];

    const fetchRecords = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getLessonAttendance();
            setRecords(data);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecords();
    }, [fetchRecords]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        const { teacherId, date, lessonSlot, status, reason } = formData;
        if (!teacherId || !date || !lessonSlot || !status) {
            setErrorMessage('Please fill in all required fields.');
            setSubmitting(false);
            return;
        }

        try {
            await apiService.addLessonAttendance({
                teacherId,
                date,
                lessonSlot,
                status: status as 'PRESENT' | 'ABSENT',
                reason: status === 'ABSENT' ? reason : undefined,
            });
            setSuccessMessage(`Attendance recorded: ${status} for lesson "${lessonSlot}".`);
            setFormData({
                teacherId: '', date: new Date().toISOString().slice(0, 10),
                lessonSlot: '', status: '', reason: '',
            });
            await fetchRecords();
        } catch (err) {
            setErrorMessage('Failed to record attendance.');
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    const getTeacherName = (id: string) => {
        const t = teachers.find((teacher) => teacher.id === id);
        return t ? `${t.firstName} ${t.lastName}` : id;
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Lesson Attendance Register</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Mark teachers as "Present" or "Absent" for <strong>specific lessons</strong> (not just daily attendance) – per Ministry of Education requirements.
            </p>

            {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
            {errorMessage && <AlertMessage type="error" message={errorMessage} className="mb-4" />}

            {/* Attendance Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectField
                        name="teacherId"
                        label="Teacher"
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
                    <InputField
                        label="Lesson Slot (e.g., 8:00 AM – P.1 Math)"
                        name="lessonSlot"
                        value={formData.lessonSlot}
                        onChange={handleChange}
                        placeholder="e.g., Monday 8:00 AM – P.1 Math"
                        required
                    />
                    <SelectField
                        name="status"
                        label="Status"
                        options={STATUS_OPTIONS}
                        value={formData.status}
                        onChange={handleChange}
                        required
                    />
                </div>
                {formData.status === 'ABSENT' && (
                    <div>
                        <label htmlFor="reason" className="block text-gray-700 text-sm font-bold mb-2">
                            Reason for Absence
                        </label>
                        <textarea
                            id="reason"
                            name="reason"
                            rows={3}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={formData.reason}
                            onChange={handleChange}
                            placeholder="e.g., Sick leave, Personal emergency"
                        />
                    </div>
                )}
                <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? <LoadingSpinner /> : 'Record Attendance'}
                    </Button>
                </div>
            </form>

            {/* Records Table */}
            {loading ? (
                <LoadingSpinner />
            ) : records.length === 0 ? (
                <AlertMessage type="info" message="No attendance records yet." />
            ) : (
                <div className="overflow-x-auto">
                    <h3 className="text-xl font-semibold mb-4 text-gray-700">Attendance Records ({records.length})</h3>
                    <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson Slot</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {records.map((record) => (
                                <tr key={record.id}>
                                    <td className="px-4 py-3 text-sm text-gray-700">{getTeacherName(record.teacherId)}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{record.date}</td>
                                    <td className="px-4 py-3 text-sm text-gray-700">{record.lessonSlot}</td>
                                    <td className="px-4 py-3 text-sm">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'PRESENT'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-500">{record.reason || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default LessonAttendanceForm;
