import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import StudentList from './components/student/StudentList';
import StudentForm from './components/student/StudentForm';
import StudentProfile from './components/student/StudentProfile';
import FinanceTable from './components/finance/FinanceTable';
import FeeSettingForm from './components/finance/FeeSettingForm';
import LessonObservationForm from './components/teacher/LessonObservationForm';
import PerformanceAgreementForm from './components/teacher/PerformanceAgreementForm';
import LessonTracking from './components/teacher/LessonTracking';
import LessonAttendanceForm from './components/teacher/LessonAttendanceForm';
import AdminDashboard from './components/admin/AdminDashboard';
import DocumentQASystem from './components/rag/DocumentQASystem';
import GradingEngine from './components/academics/GradingEngine';
import TimetableManager from './components/academics/TimetableManager';
import ForbiddenPage from './components/common/ForbiddenPage';
import { InvoiceTemplate } from './components/finance/InvoiceTemplate';
import { UserRole } from './types';
import { STUDENT_DATA, TEACHER_DATA, FINANCE_DATA } from './constants';

function App() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(UserRole.ADMIN);

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentUserRole(event.target.value as UserRole);
  };

  const isAdmin = currentUserRole === UserRole.ADMIN;

  return (
    <div className="flex flex-col h-full">
      {/* Role Selector for demonstration */}
      <div className="p-2 bg-gray-100 flex items-center justify-end space-x-2 text-sm text-gray-700">
        <label htmlFor="role-select">Simulate Role:</label>
        <select
          id="role-select"
          value={currentUserRole}
          onChange={handleRoleChange}
          className="p-1 border border-gray-300 rounded"
        >
          {Object.values(UserRole).map((role) => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>

      <Routes>
        <Route path="/" element={<Layout currentUserRole={currentUserRole} />}>
          {/* Default route */}
          {isAdmin ? (
            <Route index element={<Navigate to="/admin" replace />} />
          ) : (
            <Route index element={<div className="p-4 text-center text-xl font-bold">Welcome to Stoneridge SMS!</div>} />
          )}

          {/* Student Routes */}
          <Route path="students" element={<StudentList />} />
          <Route path="students/add" element={<StudentForm />} />
          <Route path="students/:id" element={<StudentProfile />} />

          {/* Finance Routes – Audit §4: RBAC, show 403 for non-admin */}
          {isAdmin ? (
            <>
              <Route path="finance" element={<FinanceTable fees={FINANCE_DATA} />} />
              <Route path="finance/settings" element={<FeeSettingForm />} />
              <Route path="finance/invoice" element={<InvoiceTemplate student={STUDENT_DATA[0]} fees={FINANCE_DATA.find(f => f.grade === STUDENT_DATA[0].grade) || FINANCE_DATA[0]} />} />
            </>
          ) : (
            <Route path="finance/*" element={<ForbiddenPage />} />
          )}

          {/* Grading Engine – Audit §3 */}
          <Route path="grading" element={<GradingEngine />} />

          {/* Timetable – Audit §3: Conflict Detection */}
          {isAdmin ? (
            <Route path="timetable" element={<TimetableManager teachers={TEACHER_DATA} />} />
          ) : (
            <Route path="timetable" element={<ForbiddenPage />} />
          )}

          {/* Teacher Routes */}
          <Route path="teachers/observation" element={<LessonObservationForm teachers={TEACHER_DATA} />} />
          <Route path="teachers/agreement" element={<PerformanceAgreementForm teachers={TEACHER_DATA} />} />
          <Route path="teachers/lesson-tracking" element={<LessonTracking teachers={TEACHER_DATA} />} />
          <Route path="teachers/lesson-attendance" element={<LessonAttendanceForm teachers={TEACHER_DATA} />} />

          {/* Admin Routes – Audit §4: RBAC, show 403 for non-admin */}
          {isAdmin ? (
            <>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="rag" element={<DocumentQASystem />} />
            </>
          ) : (
            <>
              <Route path="admin" element={<ForbiddenPage />} />
              <Route path="admin/*" element={<ForbiddenPage />} />
              <Route path="settings" element={<ForbiddenPage />} />
              <Route path="settings/*" element={<ForbiddenPage />} />
            </>
          )}

          {/* Fallback */}
          <Route path="*" element={<ForbiddenPage />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;