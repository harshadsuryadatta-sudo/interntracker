import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, CheckCircle2, Save, FileText, Send, Paperclip } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ReportModal({
  isOpen,
  onClose,
  initialDate,
  reportToEdit = null,
  onSaved,
  internId = null, // for admin editing/creating on behalf of an intern
}) {
  const toast = useToast();

  const [date, setDate] = useState('');
  const [inTime, setInTime] = useState('');
  const [outTime, setOutTime] = useState('');
  const [workCompleted, setWorkCompleted] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState('');
  const [pendingWork, setPendingWork] = useState('');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (reportToEdit) {
        const rawDate = reportToEdit.report_date instanceof Date
          ? reportToEdit.report_date.toISOString().split('T')[0]
          : String(reportToEdit.report_date || '').split('T')[0];

        setDate(rawDate);
        setInTime(reportToEdit.in_time || '');
        setOutTime(reportToEdit.out_time || '');
        setWorkCompleted(reportToEdit.work_completed || '');
        setTasksCompleted(reportToEdit.tasks_completed || '');
        setPendingWork(reportToEdit.pending_work || '');
        setNotes(reportToEdit.notes || '');
        setAttachments(reportToEdit.attachments || '');
      } else {
        const defaultDate = initialDate || new Date().toISOString().split('T')[0];
        setDate(defaultDate);
        setInTime('09:30 AM');
        setOutTime('06:00 PM');
        setWorkCompleted('');
        setTasksCompleted('');
        setPendingWork('');
        setNotes('');
        setAttachments('');
      }
    }
  }, [isOpen, reportToEdit, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (targetStatus) => {
    if (!date) {
      toast.error('Please select a report date.');
      return;
    }

    if (targetStatus === 'submitted' && !workCompleted.trim()) {
      toast.error('Please describe the work completed before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        internId,
        reportDate: date,
        inTime,
        outTime,
        workCompleted,
        tasksCompleted,
        pendingWork,
        notes,
        status: targetStatus,
        attachments,
      };

      if (reportToEdit?.id) {
        await api.updateReport(reportToEdit.id, payload);
      } else {
        await api.saveReport(payload);
      }

      toast.success(
        targetStatus === 'submitted'
          ? 'Daily report submitted successfully!'
          : 'Report draft saved successfully.'
      );
      if (onSaved) onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save report.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {reportToEdit ? 'Edit Daily Work Report' : 'Submit Daily Work Report'}
              </h2>
              <p className="text-xs text-slate-500">Record your activities, deliverables, and progress</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-5 space-y-4">
          {/* Date & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                In Time
              </label>
              <input
                type="text"
                value={inTime}
                onChange={(e) => setInTime(e.target.value)}
                placeholder="e.g. 10:04 AM"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                Out Time
              </label>
              <input
                type="text"
                value={outTime}
                onChange={(e) => setOutTime(e.target.value)}
                placeholder="e.g. 06:12 PM"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Work Completed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Work Completed <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={workCompleted}
              onChange={(e) => setWorkCompleted(e.target.value)}
              placeholder="Detailed description of deliverables completed today..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Tasks Completed */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tasks Completed (Bullet points / list)
            </label>
            <textarea
              rows={2}
              value={tasksCompleted}
              onChange={(e) => setTasksCompleted(e.target.value)}
              placeholder="• Code review for authentication module&#10;• Designed dashboard responsive layout"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Pending Work */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Pending Work / Blockers
            </label>
            <textarea
              rows={2}
              value={pendingWork}
              onChange={(e) => setPendingWork(e.target.value)}
              placeholder="Tasks remaining for tomorrow or pending senior approval..."
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
            />
          </div>

          {/* Additional Notes & Attachments */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Notes
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Team sync highlights, learnings, etc."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                Attachments (Link/Ref)
              </label>
              <input
                type="text"
                value={attachments}
                onChange={(e) => setAttachments(e.target.value)}
                placeholder="Figma URL, PR link, document..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Automatic working hours will be calculated on submission.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSubmit('draft')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-slate-500" />
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleSubmit('submitted')}
              disabled={loading}
              className="flex-1 sm:flex-initial px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {reportToEdit ? 'Update Report' : 'Submit Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
