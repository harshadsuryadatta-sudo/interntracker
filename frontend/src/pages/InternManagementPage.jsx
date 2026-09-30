import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Edit,
  Trash2,
  KeyRound,
  UserCheck,
  UserX,
  Phone,
  Mail,
  Building,
  Calendar,
  MoreVertical,
  Clock,
  FileText,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import InternModal from '../components/InternModal';
import ResetPasswordModal from '../components/ResetPasswordModal';
import ConfirmationModal from '../components/ConfirmationModal';

export default function InternManagementPage() {
  const toast = useToast();

  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');

  // Modals
  const [internModalOpen, setInternModalOpen] = useState(false);
  const [internToEdit, setInternToEdit] = useState(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [internToReset, setInternToReset] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [internToDelete, setInternToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await api.getInterns({ search, department, status });
      if (res.success) {
        setInterns(res.interns);
      }
    } catch (err) {
      toast.error('Failed to load interns list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, [department, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInterns();
  };

  const handleToggleStatus = async (intern) => {
    const newStatus = intern.status === 'active' ? 'disabled' : 'active';
    try {
      await api.updateIntern(intern.id, { status: newStatus });
      toast.success(`Intern "${intern.name}" is now ${newStatus}.`);
      fetchInterns();
    } catch (err) {
      toast.error(err.message || 'Failed to update intern status.');
    }
  };

  const handleDeleteIntern = async () => {
    if (!internToDelete) return;
    setDeleteLoading(true);
    try {
      await api.deleteIntern(internToDelete.id);
      toast.success(`Intern "${internToDelete.name}" was deleted.`);
      setDeleteModalOpen(false);
      fetchInterns();
    } catch (err) {
      toast.error(err.message || 'Failed to delete intern.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Intern Management</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage cohort accounts, departments, profiles, and access credentials.
          </p>
        </div>

        <button
          onClick={() => {
            setInternToEdit(null);
            setInternModalOpen(true);
          }}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Add Intern
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or department..."
              className="w-full pl-10 pr-3.5 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">All Departments</option>
              <option value="Full Stack Engineering">Full Stack Engineering</option>
              <option value="Backend & Data Systems">Backend & Data Systems</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Social Media & Growth">Social Media & Growth</option>
              <option value="Product Operations">Product Operations</option>
            </select>
          </div>

          <div className="flex gap-2">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Interns Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading cohort interns...
          </div>
        ) : interns.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No interns found. Click "Add Intern" to create an account.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Joining Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {interns.map((intern) => {
                  const joiningDateStr = intern.joining_date
                    ? new Date(intern.joining_date).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '--';

                  const isActive = intern.status === 'active';

                  return (
                    <tr key={intern.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Photo */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          {intern.profile_photo ? (
                            <img
                              src={intern.profile_photo}
                              alt={intern.name}
                              className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                              {intern.name[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900 leading-tight">
                              {intern.name}
                            </div>
                            {intern.phone && (
                              <div className="text-[11px] text-slate-400 mt-0.5">{intern.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {intern.email}
                      </td>

                      {/* Department */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {intern.department || 'General'}
                      </td>

                      {/* Joining Date */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {joiningDateStr}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(intern)}
                          title="Click to toggle status"
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider transition-colors ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {intern.status}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setInternToEdit(intern);
                              setInternModalOpen(true);
                            }}
                            title="Edit Intern"
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setInternToReset(intern);
                              setResetModalOpen(true);
                            }}
                            title="Reset Password"
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setInternToDelete(intern);
                              setDeleteModalOpen(true);
                            }}
                            title="Delete Intern"
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
      </div>

      {/* Intern Modal (Add/Edit) */}
      <InternModal
        isOpen={internModalOpen}
        onClose={() => setInternModalOpen(false)}
        internToEdit={internToEdit}
        onSuccess={fetchInterns}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        intern={internToReset}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Intern Account"
        message={`Are you sure you want to delete ${internToDelete?.name}'s account? All associated reports and attendance records will be removed.`}
        confirmText="Delete Account"
        isDanger={true}
        isLoading={deleteLoading}
        onConfirm={handleDeleteIntern}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}
