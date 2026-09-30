import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import ReportViewModal from '../components/ReportViewModal';
import ReportModal from '../components/ReportModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function ReportHistoryPage() {
  const toast = useToast();

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('2026-09');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getReports({
        page,
        limit: pagination.limit,
        search,
        date: dateFilter,
        month: monthFilter,
        status: statusFilter,
      });

      if (res.success) {
        setReports(res.reports);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load report history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(1);
  }, [monthFilter, statusFilter, dateFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchReports(1);
  };

  const handleDelete = async () => {
    if (!selectedReport) return;
    setDeleteLoading(true);
    try {
      await api.deleteReport(selectedReport.id);
      toast.success('Report deleted successfully.');
      setDeleteModalOpen(false);
      fetchReports(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete report.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Report History</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review, search, and manage all your past daily work report submissions.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deliverables, tasks, or keywords..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Month Filter */}
          <div>
            <input
              type="month"
              value={monthFilter}
              onChange={(e) => {
                setMonthFilter(e.target.value);
                setDateFilter('');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Specific Date Filter */}
          <div>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                if (e.target.value) setMonthFilter('');
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="draft">Draft</option>
            </select>
            <button
              type="submit"
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No reports match the selected criteria.
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
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((r) => {
                  const dateStr = r.report_date instanceof Date
                    ? r.report_date.toISOString().split('T')[0]
                    : String(r.report_date || '').split('T')[0];

                  const workingHours = r.working_minutes
                    ? `${Math.floor(r.working_minutes / 60)}h ${String(r.working_minutes % 60).padStart(2, '0')}m`
                    : '0h 00m';

                  const isDraft = r.status === 'draft';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 font-semibold text-slate-800">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.in_time || '--'}</td>
                      <td className="py-3.5 px-4 text-slate-600">{r.out_time || '--'}</td>
                      <td className="py-3.5 px-4 font-semibold text-indigo-600">{workingHours}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setViewModalOpen(true);
                            }}
                            title="View Report"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setEditModalOpen(true);
                            }}
                            title="Edit Report"
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {isDraft && (
                            <button
                              onClick={() => {
                                setSelectedReport(r);
                                setDeleteModalOpen(true);
                              }}
                              title="Delete Draft"
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page {pagination.page} of {pagination.totalPages} ({pagination.total} total reports)
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchReports(pagination.page - 1)}
                className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchReports(pagination.page + 1)}
                className="p-1.5 text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-lg"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      <ReportViewModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        report={selectedReport}
        onEdit={(rep) => {
          setSelectedReport(rep);
          setEditModalOpen(true);
        }}
      />

      {/* Edit Modal */}
      <ReportModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        reportToEdit={selectedReport}
        onSaved={() => fetchReports(pagination.page)}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Draft Report"
        message="Are you sure you want to delete this draft report? This action cannot be undone."
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
