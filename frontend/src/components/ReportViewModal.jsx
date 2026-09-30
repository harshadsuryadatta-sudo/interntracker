import React from 'react';
import { X, Calendar, Clock, User, Briefcase, FileText, CheckCircle2, AlertCircle, Edit, ExternalLink } from 'lucide-react';

export default function ReportViewModal({ isOpen, onClose, report, onEdit }) {
  if (!isOpen || !report) return null;

  const dateStr = report.report_date instanceof Date
    ? report.report_date.toISOString().split('T')[0]
    : String(report.report_date || '').split('T')[0];

  const workingHours = report.working_minutes
    ? `${Math.floor(report.working_minutes / 60)}h ${String(report.working_minutes % 60).padStart(2, '0')}m`
    : '0h 00m';

  const isSubmitted = report.status === 'submitted';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isSubmitted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {isSubmitted ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Daily Work Report</h2>
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                  isSubmitted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {report.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {report.intern_name ? `${report.intern_name} • ` : ''}{dateStr}
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

        {/* Content Details */}
        <div className="mt-5 space-y-4">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{dateStr}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-500" /> In Time
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{report.in_time || '--'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-rose-500" /> Out Time
              </span>
              <p className="text-xs font-semibold text-slate-800 mt-1">{report.out_time || '--'}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-indigo-500" /> Total Hours
              </span>
              <p className="text-xs font-semibold text-indigo-600 mt-1">{workingHours}</p>
            </div>
          </div>

          {/* Work Completed */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Work Completed</h4>
            <div className="p-3.5 bg-slate-50 rounded-xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100">
              {report.work_completed || 'No description provided.'}
            </div>
          </div>

          {/* Tasks Completed */}
          {report.tasks_completed && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Tasks Completed</h4>
              <div className="p-3.5 bg-slate-50 rounded-xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed border border-slate-100">
                {report.tasks_completed}
              </div>
            </div>
          )}

          {/* Pending Work */}
          {report.pending_work && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Pending Work</h4>
              <div className="p-3.5 bg-amber-50/50 rounded-xl text-sm text-amber-900 whitespace-pre-wrap leading-relaxed border border-amber-100">
                {report.pending_work}
              </div>
            </div>
          )}

          {/* Notes */}
          {report.notes && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Additional Notes</h4>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-100">
                {report.notes}
              </div>
            </div>
          )}

          {/* Attachments */}
          {report.attachments && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Attachments</h4>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-indigo-600 flex items-center gap-2 border border-slate-100">
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="truncate">{report.attachments}</span>
              </div>
            </div>
          )}

          {/* Audit stamps */}
          <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span>Created: {new Date(report.created_at).toLocaleString()}</span>
            {report.updated_by_name && (
              <span className="text-amber-600 font-medium">
                Last modified by Admin: {report.updated_by_name}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Close
          </button>
          {onEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(report);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Report
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
