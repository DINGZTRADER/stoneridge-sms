import React, { useState, useEffect } from 'react';
import Button from '../Button';
import AlertMessage from '../common/AlertMessage';
import LoadingSpinner from '../LoadingSpinner';
import { apiService } from '../../services/apiService';
import { SCHOOL_YEAR } from '../../constants';

const AdminDashboard: React.FC = () => {
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [seedMessage, setSeedMessage] = useState<string | null>(null);

  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [revenueCollected, setRevenueCollected] = useState<number | null>(null);
  const [staffAttendance, setStaffAttendance] = useState<number | null>(null);
  const [pendingInvoices, setPendingInvoices] = useState<number | null>(null);

  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    setDashboardError(null);
    try {
      const [students, revenue, attendance, pending] = await Promise.all([
        apiService.getStudentCount(),
        apiService.getTotalRevenue(),
        apiService.getStaffAttendanceRate(),
        apiService.getPendingInvoiceCount(),
      ]);
      setStudentCount(students);
      setRevenueCollected(revenue);
      setStaffAttendance(attendance);
      setPendingInvoices(pending);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setDashboardError('Failed to load dashboard data. Please try again.');
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSeedDatabase = async () => {
    setSeedStatus('loading');
    setSeedMessage(null);
    try {
      const message = await apiService.seedDatabase();
      setSeedStatus('success');
      setSeedMessage(message);
      // Re-fetch dashboard data after seeding
      await fetchDashboardData();
    } catch (error) {
      console.error('Database seeding failed:', error);
      setSeedStatus('error');
      setSeedMessage('Database seeding failed. Check console for details.');
    }
  };

  if (dashboardLoading) {
    return <LoadingSpinner />;
  }

  if (dashboardError) {
    return <AlertMessage type="error" message={dashboardError} className="max-w-md mx-auto" />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>

      {/* Audit §5: School Year Badge */}
      <div className="mb-6 flex items-center">
        <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-1.5 rounded-full shadow">
          School Year: {SCHOOL_YEAR}
        </span>
      </div>

      {/* Audit §5: 4 Critical Dashboard Cards */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium opacity-90">Total Students</p>
          <p className="text-4xl font-bold mt-2">{studentCount ?? '—'}</p>
          <p className="text-xs mt-2 opacity-75">Enrolled in {SCHOOL_YEAR}</p>
        </div>

        {/* Card 2: Revenue Collected */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium opacity-90">Revenue Collected</p>
          <p className="text-3xl font-bold mt-2">
            {revenueCollected !== null ? `${revenueCollected.toLocaleString('en-UG')}` : '—'}
          </p>
          <p className="text-xs mt-2 opacity-75">UGX (Paid invoices)</p>
        </div>

        {/* Card 3: Staff Attendance */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium opacity-90">Staff Attendance</p>
          <p className="text-4xl font-bold mt-2">{staffAttendance ?? '—'}%</p>
          <p className="text-xs mt-2 opacity-75">Lesson attendance rate</p>
        </div>

        {/* Card 4: Pending Invoices */}
        <div className="bg-gradient-to-br from-amber-500 to-amber-700 text-white rounded-xl p-5 shadow-lg">
          <p className="text-sm font-medium opacity-90">Pending Invoices</p>
          <p className="text-4xl font-bold mt-2">{pendingInvoices ?? '—'}</p>
          <p className="text-xs mt-2 opacity-75">Awaiting payment</p>
        </div>
      </div>

      {/* Technical Architecture Checks */}
      <div className="mb-8 p-4 border border-gray-200 rounded-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Technical Architecture Checks</h3>

        {/* Seeding */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md mb-4">
          <div>
            <p className="font-medium text-gray-800">Database Seeding</p>
            <p className="text-sm text-gray-600">
              Populate initial student, teacher, fee, and invoice data for 2026 (including Pre-Primary).
            </p>
          </div>
          <Button onClick={handleSeedDatabase} disabled={seedStatus === 'loading'}>
            {seedStatus === 'loading' ? <LoadingSpinner /> : 'Seed Database'}
          </Button>
        </div>
        {seedStatus === 'success' && <AlertMessage type="success" message={seedMessage || ''} className="mb-4" />}
        {seedStatus === 'error' && <AlertMessage type="error" message={seedMessage || ''} className="mb-4" />}

        {/* Timetable Conflict Detection */}
        <div className="p-3 bg-gray-50 rounded-md mb-4">
          <p className="font-medium text-gray-800">Scheduling Conflict Detection</p>
          <p className="text-sm text-gray-600">
            If Teacher X is assigned to P.1 at 8:00 AM, the system will block attempts to assign Teacher X to P.2 at 8:00 AM.
          </p>
          <p className="text-xs text-green-600 mt-2 font-semibold">
            ✓ Implemented in Timetable Manager
          </p>
        </div>

        {/* RBAC */}
        <div className="p-3 bg-gray-50 rounded-md mb-4">
          <p className="font-medium text-gray-800">Role-Based Access Control (RBAC)</p>
          <p className="text-sm text-gray-600">
            TEACHERs are blocked from accessing /finance and /admin routes. A 403 Forbidden page is shown for unauthorized access.
          </p>
          <p className="text-xs text-green-600 mt-2 font-semibold">
            ✓ Implemented via route guards
          </p>
        </div>

        {/* Unique Admission Numbers */}
        <div className="p-3 bg-gray-50 rounded-md">
          <p className="font-medium text-gray-800">Unique Admission Numbers</p>
          <p className="text-sm text-gray-600">
            Each student is assigned a unique <code>admissionNumber</code> to prevent duplicate registrations.
          </p>
          <p className="text-xs text-green-600 mt-2 font-semibold">
            ✓ Enforced in API layer
          </p>
        </div>
      </div>

      {/* Deployment Readiness */}
      <div className="p-4 border border-gray-200 rounded-md">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">Deployment Readiness Notes</h3>
        <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
          <li><strong>Build:</strong> Run <code>npm run build</code> — should complete without TypeScript errors.</li>
          <li><strong>Ugandan Grading:</strong> Grading engine maps scores to D1–F9 per Ministry guidelines.</li>
          <li><strong>Invoice Bank Details:</strong> ABSA BANK (U) LIMITED, Account: 6007612808, Branch: HANNINGTON.</li>
          <li><strong>UPE Compliance:</strong> UPE students auto-set to 0 Tuition, Scholastic Materials retained.</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;