import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './layouts/ProtectedRoute';

// Pages
import LoginPage from './pages/LoginPage';
import InternDashboard from './pages/InternDashboard';
import DailyReportsPage from './pages/DailyReportsPage';
import ReportHistoryPage from './pages/ReportHistoryPage';
import InternAttendancePage from './pages/InternAttendancePage';
import InstagramAnalyticsPage from './pages/InstagramAnalyticsPage';
import ProfilePage from './pages/ProfilePage';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import InternManagementPage from './pages/InternManagementPage';
import AllReportsPage from './pages/AllReportsPage';
import AdminAttendancePage from './pages/AdminAttendancePage';
import ExportsPage from './pages/ExportsPage';
import AuditLogsPage from './pages/AuditLogsPage';

function RootRedirect() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={isAdmin ? '/admin/dashboard' : '/dashboard'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Login Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                {/* Intern Space */}
                <Route path="/dashboard" element={<InternDashboard />} />
                <Route path="/reports" element={<DailyReportsPage />} />
                <Route path="/reports/history" element={<ReportHistoryPage />} />
                <Route path="/attendance" element={<InternAttendancePage />} />
                <Route path="/instagram" element={<InstagramAnalyticsPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Space */}
                <Route element={<ProtectedRoute adminOnly />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/interns" element={<InternManagementPage />} />
                  <Route path="/admin/reports" element={<AllReportsPage />} />
                  <Route path="/admin/attendance" element={<AdminAttendancePage />} />
                  <Route path="/admin/exports" element={<ExportsPage />} />
                  <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                </Route>
              </Route>
            </Route>

            {/* Root and Fallback */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
