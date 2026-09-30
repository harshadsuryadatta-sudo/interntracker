import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AttendanceModal({ isOpen, onClose, record, onSuccess }) {
  const toast = useToast();
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [status, setStatus] = useState('present');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && record) {
      setInTime(record.in_time || '');
      setOutTime(record.out_time || '');
      setStatus(record.status || 'present');
    }
  }, [isOpen, record]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateAttendance(record.id, {
        inTime,
        outTime,
        status,
      });
      toast.success('Attendance record updated successfully.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update attendance.');
    } finally {
      setLoading(false);
    }
  };

  const dateStr = record.attendance_date instanceof Date
    ? record.attendance_date.toISOString().split('T')[0]
    : String(record.attendance_date || '').split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Correct Attendance</h2>
              <p className="text-xs text-slate-500">
                {record.intern_name} • {dateStr}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Check-In Time
            </label>
            <input
              type="text"
              value={inTime}
              onChange={(e) => setInTime(e.target.value)}
              placeholder="e.g. 10:04 AM"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Check-Out Time
            </label>
            <input
              type="text"
              value={outTime}
              onChange={(e) => setOutTime(e.target.value)}
              placeholder="e.g. 06:12 PM"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Attendance Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="present">Present</option>
              <option value="half_day">Half Day</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Correction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
