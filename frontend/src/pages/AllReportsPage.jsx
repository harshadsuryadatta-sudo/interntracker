import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import ReportViewModal from '../components/ReportViewModal';
import ReportModal from '../components/ReportModal';
import AttendanceModal from '../components/AttendanceModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { Link } from 'react-router-dom';

export default function AllReportsPage() {
  const toast = useToast();

  const [reports, setReports] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [search, setSearch] = useState('');
  const [internFilter, setInternFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('2026-09');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInterns = async () => {
    try {
      const res = await api.getInterns();
      if (res.success) setInterns(res.interns);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getReports({
        page,
        limit: pagination.limit,
        internId: internFilter,
        month: monthFilter,
        date: dateFilter,
        status: statusFilter,
        search,
      });

      if (res.success) {
        setReports(res.reports);
        setPagination(res.pagination);
      }
    } catch (err) {
      toast.error('Failed to load reports.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  useEffect(() => {
    fetchReports(1);
  }, [internFilter, monthFilter, dateFilter, statusFilter]);

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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">All Daily Reports</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Master review table of daily deliverables across all cohort interns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/admin/exports"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-slate-500" />
            Export Data
          </Link>
          <button
            onClick={() => {
              setSelectedReport(null);
              setAddModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Add Report
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search deliverables..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Intern Filter */}
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

          {/* Month Filter */}
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

          {/* Date Filter */}
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

          {/* Status Filter */}
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
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
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading cohort reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No daily reports match the selected filters.
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
                  <th className="py-3.5 px-4">Hours</th>
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

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Intern Info */}
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

                      {/* Date */}
                      <td className="py-3.5 px-4 font-medium text-slate-700">{dateStr}</td>

                      {/* In Time */}
                      <td className="py-3.5 px-4 text-slate-600">{r.in_time || '--'}</td>

                      {/* Out Time */}
                      <td className="py-3.5 px-4 text-slate-600">{r.out_time || '--'}</td>

                      {/* Hours */}
                      <td className="py-3.5 px-4 font-semibold text-indigo-600">{workingHours}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          r.status === 'submitted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {r.status}
                        </span>
                        {r.updated_by_name && (
                          <span className="block text-[9px] text-amber-600 font-semibold mt-0.5">
                            Modified by Admin
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
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
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setAttendanceModalOpen(true);
                            }}
                            title="Correct Attendance Times"
                            className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReport(r);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Report"
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add Report Modal */}
      <ReportModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        initialDate={new Date().toISOString().split('T')[0]}
        internId={internFilter ? parseInt(internFilter, 10) : (interns[0]?.id || null)}
        onSaved={() => fetchReports(1)}
      />

      {/* Correct Attendance Modal */}
      <AttendanceModal
        isOpen={attendanceModalOpen}
        onClose={() => setAttendanceModalOpen(false)}
        record={selectedReport ? {
          id: selectedReport.id,
          intern_name: selectedReport.intern_name,
          attendance_date: selectedReport.report_date,
          in_time: selectedReport.in_time,
          out_time: selectedReport.out_time,
          status: 'present',
        } : null}
        onSuccess={() => fetchReports(pagination.page)}
      />

      {/* Delete Confirmation */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Daily Report"
        message={`Are you sure you want to delete this report for ${selectedReport?.intern_name}?`}
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
