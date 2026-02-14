import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Student, UserRole } from '../../types';
import Button from '../Button';
import StudentImportForm from './StudentImportForm';
import { apiService } from '../../services/apiService';
import LoadingSpinner from '../LoadingSpinner';
import AlertMessage from '../common/AlertMessage';
import BulkActionsModal from './BulkActionsModal';
import ConfirmationDialog from '../common/ConfirmationDialog';

type SortKey = keyof Student | 'fullName';

const StudentList: React.FC = () => {
  const navigate = useNavigate();
  const { currentUserRole } = useOutletContext<{ currentUserRole: UserRole }>();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState<boolean>(false);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState<boolean>(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey | null; direction: 'asc' | 'desc' }>({ key: 'admissionNumber', direction: 'asc' });

  const importFormRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUserRole === UserRole.ADMIN;

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedStudents = await apiService.getStudents();
      setStudents(fetchedStudents);
      setSelectedStudentIds([]);
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setError('Failed to load student data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleActionSuccess = () => {
    fetchStudents();
    setShowBulkActionsModal(false);
  };

  const scrollToImportForm = () => {
    importFormRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedStudentIds(students.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
    const studentId = e.target.value;
    setSelectedStudentIds((prev) =>
      e.target.checked ? [...prev, studentId] : prev.filter((id) => id !== studentId)
    );
  };

  const handleOpenBulkActions = () => {
    if (selectedStudentIds.length > 0) setShowConfirmationDialog(true);
  };

  const handleConfirmBulkActions = () => {
    setShowConfirmationDialog(false);
    setShowBulkActionsModal(true);
  };

  const handleCancelBulkActions = () => {
    setShowConfirmationDialog(false);
    setShowBulkActionsModal(false);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const filteredAndSortedStudents = useMemo(() => {
    let result = [...students];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((student) =>
        student.firstName.toLowerCase().includes(query) ||
        student.lastName.toLowerCase().includes(query) ||
        student.admissionNumber.toLowerCase().includes(query) ||
        student.grade.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aVal: string;
        let bVal: string;
        if (sortConfig.key === 'fullName') {
          aVal = `${a.firstName} ${a.lastName}`.toLowerCase();
          bVal = `${b.firstName} ${b.lastName}`.toLowerCase();
        } else {
          aVal = String((a as Record<string, unknown>)[sortConfig.key] ?? '').toLowerCase();
          bVal = String((b as Record<string, unknown>)[sortConfig.key] ?? '').toLowerCase();
        }
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [students, sortConfig, searchQuery]);

  const requestSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
  };

  const isAllSelected = selectedStudentIds.length === students.length && students.length > 0;
  const isAnySelected = selectedStudentIds.length > 0;

  if (loading) return <LoadingSpinner />;
  if (error) return <AlertMessage type="error" message={error} className="max-w-md mx-auto" />;

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student List</h2>
        {isAdmin && (
          <div className="space-x-2">
            <Button onClick={() => navigate('/students/add')}>Add New Student</Button>
            <Button onClick={scrollToImportForm} variant="secondary">Import Students (CSV)</Button>
            <Button
              onClick={handleOpenBulkActions}
              disabled={!isAnySelected}
              variant="primary"
              aria-label={`Perform bulk actions on ${selectedStudentIds.length} students`}
            >
              Perform Bulk Actions ({selectedStudentIds.length})
            </Button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="student-search" className="sr-only">Search Students</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {/* Search Icon */}
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            id="student-search"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by name, admission number, or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        {filteredAndSortedStudents.length === 0 ? (
          <AlertMessage type="info" message={searchQuery ? "No students match your search." : "No students found. Add new students or import from CSV."} className="mb-4" />
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {isAdmin && (
                  <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                      onChange={handleSelectAll}
                      checked={isAllSelected}
                      aria-label="Select all students"
                    />
                  </th>
                )}
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('admissionNumber')}>
                  Admission # {getSortIcon('admissionNumber')}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('fullName')}>
                  Name {getSortIcon('fullName')}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700" onClick={() => requestSort('grade')}>
                  Grade {getSortIcon('grade')}
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPE</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allergies</th>
                <th scope="col" className="relative px-4 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedStudents.map((student) => (
                <tr key={student.id} className={student.medicalDetails?.allergies ? 'bg-red-50' : ''}>
                  {isAdmin && (
                    <td className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-indigo-600 rounded"
                        value={student.id}
                        onChange={handleSelectStudent}
                        checked={selectedStudentIds.includes(student.id)}
                        aria-label={`Select student ${student.firstName} ${student.lastName}`}
                      />
                    </td>
                  )}
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{student.admissionNumber}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.firstName} {student.lastName}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.grade}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{student.isUPE ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm">
                    {student.medicalDetails?.allergies ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white">
                        ⚠ {student.medicalDetails.allergies}
                      </span>
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="outline" size="sm" onClick={() => navigate(`/students/${student.id}`)}>
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isAdmin && (
        <div ref={importFormRef}>
          <StudentImportForm onImportSuccess={handleActionSuccess} />
        </div>
      )}

      {isAdmin && showConfirmationDialog && (
        <ConfirmationDialog
          message={`Are you sure you want to perform bulk actions on ${selectedStudentIds.length} selected student(s)?`}
          onConfirm={handleConfirmBulkActions}
          onCancel={handleCancelBulkActions}
          confirmButtonText="Proceed"
        />
      )}

      {isAdmin && showBulkActionsModal && (
        <BulkActionsModal
          selectedStudentIds={selectedStudentIds}
          onClose={handleCancelBulkActions}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
};

export default StudentList;