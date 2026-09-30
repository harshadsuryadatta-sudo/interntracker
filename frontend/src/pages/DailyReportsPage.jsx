import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { FileText, Plus, Calendar as CalendarIcon, Info } from 'lucide-react';
import CalendarView from '../components/CalendarView';
import ReportModal from '../components/ReportModal';
import ReportViewModal from '../components/ReportViewModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function DailyReportsPage() {
  const toast = useToast();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 30)); // September 2026 default
  const [reportsMap, setReportsMap] = useState({});
  const [loading, setLoading] = useState(false);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const fetchMonthReports = async (monthDate) => {
    setLoading(true);
    try {
      const monthStr = format(monthDate, 'yyyy-MM');
      const res = await api.getCalendar({ month: monthStr });
      if (res.success) {
        const map = {};
        for (const item of res.records) {
          const dateStr = item.report_date instanceof Date
            ? item.report_date.toISOString().split('T')[0]
            : String(item.report_date || '').split('T')[0];
          map[dateStr] = item;
        }
        setReportsMap(map);
      }
    } catch (err) {
      toast.error('Failed to load daily reports for this month.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthReports(currentMonth);
  }, [currentMonth]);

  const handleDateClick = async (dateKey, existingSummary) => {
    setSelectedDate(dateKey);

    if (existingSummary?.id) {
      try {
        // Fetch full report details
        const res = await api.getReportById(existingSummary.id);
        if (res.success && res.report) {
          setSelectedReport(res.report);
          setViewModalOpen(true);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // If no existing report, open the report creation form directly
    setSelectedReport(null);
    setReportModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Daily Work Reports</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Interactive Calendar
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Click on any date to create, review, or edit your daily deliverables.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setSelectedReport(null);
            setReportModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Submit New Report
        </button>
      </div>

      {/* Info banner */}
      <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center gap-3 text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          Reports submitted are timestamped and visible to your manager. Green indicators show submitted reports, yellow shows saved drafts, and red flags missing reports.
        </span>
      </div>

      {/* Main Interactive Calendar */}
      <CalendarView
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        reportsByDate={reportsMap}
        onDateClick={handleDateClick}
      />

      {/* Report Form Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        initialDate={selectedDate}
        reportToEdit={selectedReport}
        onSaved={() => fetchMonthReports(currentMonth)}
      />

      {/* Report View Modal */}
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
