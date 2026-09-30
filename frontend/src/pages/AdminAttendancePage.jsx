import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  Search,
  Filter,
  Edit,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import AttendanceModal from '../components/AttendanceModal';

export default function AdminAttendancePage() {
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [internFilter, setInternFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('2026-09');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Edit Modal
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchInterns = async () => {
    try {
      const res = await api.getInterns();
      if (res.success) setInterns(res.interns);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAttendance = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAttendance({
        page,
        limit: pagination.limit,
        internId: internFilter,
        month: monthFilter,
        date: dateFilter,
        status: statusFilter,
      });

      if (res.success) {
        setRecords(res.records);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load attendance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    fetchAttendance(1);
  }, [internFilter, monthFilter, dateFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance Monitoring</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review time clock logs, verify working hours, and correct check-in/out timestamps.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Intern */}
          <div>
            <select
              value={internFilter}
              onChange={(e) => setInternFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">All Interns</option>
              {interns.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setDateFilter('');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>

          {/* Date */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                if (e.target.value) setMonthFilter('');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading attendance records...
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No attendance records found for selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Intern</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">In Time</th>
                  <th className="py-3.5 px-4">Out Time</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r) => {
                  const dateStr = r.attendance_date instanceof Date
                    ? r.attendance_date.toISOString().split('T')[0]
                    : String(r.attendance_date || '').split('T')[0];

                  const workingHours = r.working_minutes
                    ? `${Math.floor(r.working_minutes / 60)}h ${String(r.working_minutes % 60).padStart(2, '0')}m`
                    : (r.in_time && !r.out_time ? 'In progress' : '0h 00m');

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          {r.intern_photo ? (
                            <img
                              src={r.intern_photo}
                              alt={r.intern_name}
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                              {r.intern_name ? r.intern_name[0].toUpperCase() : 'I'}
                            </div>
                          )}
                          <div>
                            <span className="font-semibold text-slate-900 block leading-tight">
                              {r.intern_name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {r.intern_department || 'Engineering'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">{dateStr}</td>
                      <td className="py-3.5 px-4 text-emerald-700 font-medium">{r.in_time || '--'}</td>
                      <td className="py-3.5 px-4 text-rose-700 font-medium">{r.out_time || '--'}</td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-600">{workingHours}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {r.status || 'present'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecord(r);
                            setAttendanceModalOpen(true);
                          }}
                          title="Correct Attendance Record"
                          className="px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors inline-flex items-center gap-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Correct
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total records)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchAttendance(pagination.page - 1)}
                className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchAttendance(pagination.page + 1)}
                className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Attendance Edit Modal */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        record={selectedRecord}
        onSuccess={() => fetchAttendance(pagination.page)}
      />
    </div>
  );
}
