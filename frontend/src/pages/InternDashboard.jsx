import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import ReportModal from '../components/ReportModal';
import ReportViewModal from '../components/ReportViewModal';
import { Link } from 'react-router-dom';

export default function InternDashboard() {
  const { user } = useAuth();
  const toast = useToast();

  const [todayData, setTodayData] = useState(null);
  const [stats, setStats] = useState({ submittedCount: 0, pendingCount: 0 });
  const [recentReports, setRecentReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const [todayRes, reportsRes] = await Promise.all([
        api.getTodayAttendance(),
        api.getReports({ limit: 5 }),
      ]);

      if (todayRes.success) {
        setTodayData(todayRes.today);
      }

      if (reportsRes.success) {
        const reports = reportsRes.reports;
        setRecentReports(reports);

        const submitted = reports.filter((r) => r.status === 'submitted').length;
        const drafts = reports.filter((r) => r.status === 'draft').length;
        setStats({
          submittedCount: submitted,
          pendingCount: drafts,
        });
      }
    } catch (err) {
      console.error('Failed to load intern dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCheckIn = async () => {
    setActionLoading(true);
    try {
      const res = await api.checkIn();
      toast.success(res.message);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Check-in failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionLoading(true);
    try {
      const res = await api.checkOut();
      toast.success(res.message);
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.message || 'Check-out failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Determine Greeting based on hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const attendance = todayData?.attendance;
  const isCheckedIn = Boolean(attendance?.in_time);
  const isCheckedOut = Boolean(attendance?.out_time);

  const todayReport = todayData?.report;
  const isReportSubmitted = todayReport?.status === 'submitted';

  return (
    <div className="space-y-6">
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl shadow-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            Intern Workstation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-sm text-indigo-100/70 mt-1 max-w-xl">
            Track your daily work deliverables, check in & out accurately, and stay organized.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            {todayReport ? 'Edit Today\'s Report' : 'Submit Today\'s Report'}
          </button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Today's Date */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
            Today's Date
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-2 truncate">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </p>
          <span className="text-[10px] text-slate-400">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Today's In Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            In Time
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-2">
            {attendance?.in_time || '--:--'}
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">
            {isCheckedIn ? 'Recorded' : 'Not yet checked in'}
          </span>
        </div>

        {/* Today's Out Time */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-500" />
            Out Time
          </span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-2">
            {attendance?.out_time || '--:--'}
          </p>
          <span className="text-[10px] text-slate-400">
            {isCheckedOut ? 'Recorded' : 'Pending checkout'}
          </span>
        </div>

        {/* Today's Working Hours */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
            Working Hours
          </span>
          <p className="text-base sm:text-lg font-bold text-indigo-600 mt-2">
            {todayData?.formattedWorkingHours || '0h 00m'}
          </p>
          <span className="text-[10px] text-slate-400">
            {isCheckedOut ? 'Shift completed' : isCheckedIn ? 'Timer active' : 'Shift not started'}
          </span>
        </div>

        {/* Reports Submitted */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            Submitted
          </span>
          <p className="text-base sm:text-lg font-bold text-emerald-600 mt-2">
            {stats.submittedCount}
          </p>
          <span className="text-[10px] text-slate-400">Recent approved</span>
        </div>

        {/* Pending Reports */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Drafts / Pending
          </span>
          <p className="text-base sm:text-lg font-bold text-amber-600 mt-2">
            {stats.pendingCount}
          </p>
          <span className="text-[10px] text-slate-400">Require submission</span>
        </div>
      </div>

      {/* TODAY'S ATTENDANCE Action Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              TODAY'S ATTENDANCE
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Time Clock & Attendance Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Check in upon starting work and check out when finishing your shift. Total hours are calculated automatically.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isCheckedIn ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>In: <strong>{attendance?.in_time || 'Not registered'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isCheckedOut ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <span>Out: <strong>{attendance?.out_time || 'Not registered'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Total: <strong className="text-indigo-600">{todayData?.formattedWorkingHours || '0h 00m'}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isCheckedIn ? (
              <button
                type="button"
                onClick={handleCheckIn}
                disabled={actionLoading}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                CHECK IN
              </button>
            ) : !isCheckedOut ? (
              <button
                type="button"
                onClick={handleCheckOut}
                disabled={actionLoading}
                className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
                CHECK OUT
              </button>
            ) : (
              <div className="px-5 py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Checked Out for Today ({todayData?.formattedWorkingHours})
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Daily Reports Table Preview */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Recent Daily Work Reports</h3>
            <p className="text-xs text-slate-500">Your latest work submissions</p>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 hover:underline"
          >
            Open Interactive Calendar <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No reports recorded yet. Click "Submit Today's Report" to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">In Time</th>
                  <th className="py-3 px-4">Out Time</th>
                  <th className="py-3 px-4">Working Hours</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentReports.map((r) => {
                  const dateStr = r.report_date instanceof Date
                    ? r.report_date.toISOString().split('T')[0]
                    : String(r.report_date || '').split('T')[0];
                  const hoursStr = r.working_minutes
                    ? `${Math.floor(r.working_minutes / 60)}h ${String(r.working_minutes % 60).padStart(2, '0')}m`
                    : '0h 00m';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-800">{dateStr}</td>
                      <td className="py-3 px-4 text-slate-600">{r.in_time || '--'}</td>
                      <td className="py-3 px-4 text-slate-600">{r.out_time || '--'}</td>
                      <td className="py-3 px-4 font-medium text-indigo-600">{hoursStr}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedReport(r);
                            setViewModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialDate={new Date().toISOString().split('T')[0]}
        reportToEdit={todayReport}
        onSaved={fetchDashboardData}
      />

      {/* View Modal */}
      <ReportViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        report={selectedReport}
        onEdit={(rep) => {
          setSelectedReport(rep);
          setReportModalOpen(true);
        }}
      />
    </div>
  );
}
