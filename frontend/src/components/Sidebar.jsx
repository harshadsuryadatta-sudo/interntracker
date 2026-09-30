import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  Users,
  FileSpreadsheet,
  DownloadCloud,
  UserCheck,
  LogOut,
  ShieldCheck,
  History,
  X,
} from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const internNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Daily Reports', path: '/reports', icon: CalendarDays },
    { label: 'Report History', path: '/reports/history', icon: History },
    { label: 'Attendance', path: '/attendance', icon: Clock },
    { label: 'Instagram Analytics', path: '/instagram', icon: InstagramIcon },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  const adminNavItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Interns', path: '/admin/interns', icon: Users },
    { label: 'All Reports', path: '/admin/reports', icon: FileSpreadsheet },
    { label: 'Attendance', path: '/admin/attendance', icon: Clock },
    { label: 'Instagram Analytics', path: '/instagram', icon: InstagramIcon },
    { label: 'Exports', path: '/admin/exports', icon: DownloadCloud },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
  ];

  const navItems = isAdmin ? adminNavItems : internNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 font-bold text-lg">
              IT
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Intern Tracker</h1>
              <p className="text-[11px] font-medium text-slate-500">Report & Analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Pill */}
        <div className="px-6 pt-4 pb-2">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            isAdmin
              ? 'bg-purple-50 text-purple-700 border border-purple-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-purple-500' : 'bg-emerald-500'}`} />
            {isAdmin ? 'ADMINISTRATOR' : 'INTERN PORTAL'}
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user?.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.name}
                  className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 font-semibold text-sm flex items-center justify-center">
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
