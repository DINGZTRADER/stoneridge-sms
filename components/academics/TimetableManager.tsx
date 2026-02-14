import React, { useState, useEffect, useCallback } from 'react';
import SelectField from '../SelectField';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { Teacher, TimetableEntry } from '../../types';
import { WEEKDAYS, TIME_SLOTS, GRADE_OPTIONS } from '../../constants';

interface TimetableManagerProps {
    teachers: Teacher[];
}

const SUBJECT_OPTIONS = [
    { value: '', label: 'Select Subject' },
    { value: 'Math', label: 'Mathematics' },
    { value: 'English', label: 'English' },
    { value: 'Science', label: 'Science' },
    { value: 'SST', label: 'Social Studies' },
    { value: 'RE', label: 'Religious Education' },
    { value: 'PE', label: 'Physical Education' },
    { value: 'Art', label: 'Art & Crafts' },
    { value: 'Music', label: 'Music' },
];

const TimetableManager: React.FC<TimetableManagerProps> = ({ teachers }) => {
    const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        teacherId: '',
        day: '',
        time: '',
        className: '',
        subject: '',
    });

    const teacherOptions = [
        { value: '', label: 'Select Teacher' },
        ...teachers.map((t) => ({
            value: t.id,
            label: `${t.firstName} ${t.lastName} (${t.assignedClass})`,
        })),
    ];

    const dayOptions = [
        { value: '', label: 'Select Day' },
        ...WEEKDAYS.map((d) => ({ value: d, label: d })),
    ];

    const timeOptions = [
        { value: '', label: 'Select Time' },
        ...TIME_SLOTS.map((t) => ({ value: t, label: t })),
    ];

    const classOptions = GRADE_OPTIONS;

    const fetchTimetable = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiService.getTimetable();
            setTimetable(data);
        } catch (err) {
            console.error('Failed to fetch timetable:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTimetable();
    }, [fetchTimetable]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        const { teacherId, day, time, className, subject } = formData;
        if (!teacherId || !day || !time || !className || !subject) {
            setErrorMessage('All fields are required.');
            setSubmitting(false);
            return;
        }

        try {
            await apiService.addTimetableEntry({ teacherId, day, time, className, subject });
            setSuccessMessage(`Scheduled ${subject} for ${className} on ${day} at ${time}.`);
            setFormData({ teacherId: '', day: '', time: '', className: '', subject: '' });
            await fetchTimetable();
        } catch (err) {
            // Audit §3: Conflict detection error
            setErrorMessage((err as Error).message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (id: string) => {
        try {
            await apiService.removeTimetableEntry(id);
            setSuccessMessage('Entry removed.');
            await fetchTimetable();
        } catch (err) {
            setErrorMessage('Failed to remove entry.');
        }
    };

    const getTeacherName = (teacherId: string) => {
        const t = teachers.find((teacher) => teacher.id === teacherId);
        return t ? `${t.firstName} ${t.lastName}` : teacherId;
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <h2 className="text-3xl font-bold mb-2 text-gray-800">Timetable Manager</h2>
            <p className="text-gray-600 mb-6 text-sm">
                Schedule lessons and detect conflicts. The system will block double-booking a teacher at the same day/time.
            </p>

            {successMessage && <AlertMessage type="success" message={successMessage} className="mb-4" />}
            {errorMessage && <AlertMessage type="error" message={errorMessage} className="mb-4" />}

            {/* Add Entry Form */}
            <form onSubmit={handleSubmit} className="mb-8 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Add Timetable Entry</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    <SelectField name="teacherId" label="Teacher" options={teacherOptions} value={formData.teacherId} onChange={handleChange} />
                    <SelectField name="day" label="Day" options={dayOptions} value={formData.day} onChange={handleChange} />
                    <SelectField name="time" label="Time" options={timeOptions} value={formData.time} onChange={handleChange} />
                    <SelectField name="className" label="Class" options={classOptions} value={formData.className} onChange={handleChange} />
                    <SelectField name="subject" label="Subject" options={SUBJECT_OPTIONS} value={formData.subject} onChange={handleChange} />
                </div>
                <div className="flex justify-end mt-4">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? <LoadingSpinner /> : 'Schedule Lesson'}
                    </Button>
                </div>
            </form>

            {/* Current Timetable */}
            <div>
                <h3 className="text-xl font-semibold mb-4 text-gray-700">Current Schedule ({timetable.length} entries)</h3>
                {timetable.length === 0 ? (
                    <AlertMessage type="info" message="No timetable entries yet. Add your first lesson above." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Day</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {timetable.map((entry) => (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3 text-sm text-gray-700">{getTeacherName(entry.teacherId)}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{entry.day}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{entry.time}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{entry.className}</td>
                                        <td className="px-4 py-3 text-sm text-gray-700">{entry.subject}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <Button variant="danger" size="sm" onClick={() => handleRemove(entry.id)}>
                                                Remove
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TimetableManager;
