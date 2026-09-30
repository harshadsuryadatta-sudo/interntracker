import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2, Filter, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function ExportsPage() {
  const toast = useToast();

  const [interns, setInterns] = useState([]);
  const [internFilter, setInternFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('2026-09');
  const [statusFilter, setStatusFilter] = useState('all');
  const [format, setFormat] = useState('csv');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function loadInterns() {
      try {
        const res = await api.getInterns();
        if (res.success) setInterns(res.interns);
      } catch (e) {
        console.error(e);
      }
    }
    loadInterns();
  }, []);

  const handleExport = async (chosenFormat = format) => {
    setDownloading(true);
    try {
      const blob = await api.exportReports({
        internId: internFilter || undefined,
        month: monthFilter || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        format: chosenFormat,
      });

      // Trigger browser download
      const filename = `intern_reports_${monthFilter || 'all'}_${Date.now()}.${chosenFormat === 'xlsx' ? 'xlsx' : 'csv'}`;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Export file (${filename}) generated and downloaded.`);
    } catch (err) {
      toast.error(err.message || 'Failed to generate export file.');
    } finally {
      setDownloading(false);
    }
  };

  const exportColumns = [
    'Intern Name',
    'Email',
    'Date',
    'In Time',
    'Out Time',
    'Working Hours',
    'Work Completed',
    'Tasks Completed',
    'Pending Work',
    'Notes',
    'Status',
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Data Export System</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Export verified daily work reports and attendance data to standard CSV or Excel-compatible spreadsheet.
        </p>
      </div>

      {/* Main Export Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">1. Select Filter Criteria</h2>
          <p className="text-xs text-slate-500">Apply target filters before generating your export</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Month Period
            </label>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Intern
            </label>
            <select
              value={internFilter}
              onChange={(e) => setInternFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">All Interns</option>
              {interns.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.department})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Report Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="all">All (Submitted & Drafts)</option>
              <option value="submitted">Submitted Only</option>
              <option value="draft">Drafts Only</option>
            </select>
          </div>
        </div>

        {/* Format Selector */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-base font-bold text-slate-900 mb-1">2. Choose Output Format</h2>
          <p className="text-xs text-slate-500 mb-4">Choose between standard comma-separated format or native Excel workbook</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                format === 'csv'
                  ? 'border-indigo-600 bg-indigo-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Standard CSV</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Universal comma-separated file with UTF-8 BOM encoding for Google Sheets, Notion, and Excel.
                </p>
              </div>
            </div>

            <div
              onClick={() => setFormat('xlsx')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3.5 ${
                format === 'xlsx'
                  ? 'border-emerald-600 bg-emerald-50/30'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Excel Spreadsheet (.xlsx)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Formatted binary Microsoft Excel workbook with styled column headers and optimized column widths.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Schema Preview */}
        <div className="pt-4 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
            Exported Columns Schema
          </span>
          <div className="flex flex-wrap gap-2">
            {exportColumns.map((col) => (
              <span
                key={col}
                className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Download Action Bar */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Selected: <strong className="text-slate-800">{monthFilter || 'All Time'}</strong> •{' '}
            Intern: <strong className="text-slate-800">{internFilter ? 'Selected' : 'All'}</strong> •{' '}
            Format: <strong className="uppercase text-indigo-600">{format}</strong>
          </div>

          <button
            onClick={() => handleExport(format)}
            disabled={downloading}
            className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download {format.toUpperCase()} Report
          </button>
        </div>
      </div>
    </div>
  );
}
