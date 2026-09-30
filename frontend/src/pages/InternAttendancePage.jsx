import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function InternAttendancePage() {
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState('2026-09');
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  const fetchAttendance = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAttendance({ month, page, limit: 15 });
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
    fetchAttendance(1);
  }, [month]);

  // Aggregate stats
  const totalMinutes = records.reduce((acc, r) => acc + (r.working_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalRemainingMinutes = totalMinutes % 60;
  const presentDays = records.filter((r) => r.status === 'present' || r.in_time).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Attendance Log</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track daily clock-in and clock-out timestamps and hours logged.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500">Month:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Present Days
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-2">{presentDays} Days</p>
          <span className="text-[11px] text-slate-400">Recorded for {month}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-indigo-500" /> Total Hours
          </span>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {totalHours}h {String(totalRemainingMinutes).padStart(2, '0')}m
          </p>
          <span className="text-[11px] text-slate-400">Total logged working time</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-purple-500" /> Avg. Daily Shift
          </span>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {presentDays > 0 ? (totalMinutes / presentDays / 60).toFixed(1) : 0} Hours
          </p>
          <span className="text-[11px] text-slate-400">Per present working day</span>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading attendance...
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No attendance records found for {month}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Date</th>
                  <th className="py-3.5 px-4">In Time</th>
                  <th className="py-3.5 px-4">Out Time</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
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
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-emerald-700 font-medium">{r.in_time || '--'}</td>
                      <td className="py-3.5 px-4 text-rose-700 font-medium">{r.out_time || '--'}</td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-600">{workingHours}</td>
                      <td className="py-3.5 px-4 sm:px-6">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                          {r.status || 'present'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
