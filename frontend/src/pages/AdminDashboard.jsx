import React, { useState, useEffect } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  FileCheck2,
  FileClock,
  Clock,
  Sparkles,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
} from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [month, setMonth] = useState('2026-09');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminAnalytics(month),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (analyticsRes.success) setAnalytics(analyticsRes);
    } catch (err) {
      toast.error('Failed to load admin analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [month]);

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-sm">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Aggregating enterprise telemetry...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Admin Command Center</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Enterprise overview of intern attendance, report submissions, and Instagram metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label className="text-xs font-semibold text-slate-500">Period:</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-1.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white"
          />
        </div>
      </div>

      {/* 8 Dashboard Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {/* Total Interns */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Interns</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{stats?.totalInterns || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1">{stats?.activeInterns || 0} currently active</span>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present Today</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-3">{stats?.presentToday || 0}</p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1">Checked in shift</span>
        </div>

        {/* Absent Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Absent Today</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-3">{stats?.absentToday || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1">Not yet registered</span>
        </div>

        {/* Reports Submitted Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports Today</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600 mt-3">{stats?.reportsSubmittedToday || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1">Submitted for today</span>
        </div>

        {/* Reports Pending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Reports Pending</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileClock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-3">{stats?.reportsPendingToday || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1">Awaiting submission</span>
        </div>

        {/* Total Working Hours This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Hours Month</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-600 mt-3">{stats?.totalWorkingHoursThisMonth || '0h 00m'}</p>
          <span className="text-[11px] text-slate-400 mt-1">Logged across cohort</span>
        </div>

        {/* Instagram Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Instagram Pages</span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <InstagramIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-pink-600 mt-3">{stats?.instagramAccounts || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1">Monitored channels</span>
        </div>

        {/* Instagram Posts This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">IG Posts Month</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-3">{stats?.instagramPostsThisMonth || 0}</p>
          <span className="text-[11px] text-slate-400 mt-1">Published in {month}</span>
        </div>
      </div>

      {/* Analytics Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Attendance Trend Over Period */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Attendance Over Selected Period</h3>
              <p className="text-xs text-slate-500">Daily intern attendance count</p>
            </div>
            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
              Attendance
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.attendanceTrend || []}>
                <defs>
                  <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="presentCount"
                  name="Interns Present"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorAttendance)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Submitted vs Pending Reports */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Reports: Submitted vs Drafts</h3>
              <p className="text-xs text-slate-500">Report submission breakdown by date</p>
            </div>
            <div className="px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
              Reports
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.reportsChart || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="submitted" name="Submitted" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="draft" name="Draft / Partial" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Working Hours by Intern */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Total Working Hours by Intern ({month})</h3>
              <p className="text-xs text-slate-500">Accumulated verified shift hours</p>
            </div>
            <div className="px-2.5 py-1 bg-purple-50 text-purple-600 rounded-lg text-xs font-bold">
              Working Hours
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.workingHoursByIntern || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit="h" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(val) => [`${val} hours`, 'Logged Time']}
                />
                <Bar dataKey="totalHours" name="Total Hours" fill="#8b5cf6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Intern Performance Overview (Factual Report Submission Statistics) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Intern Performance Overview</h3>
            <p className="text-xs text-slate-500">Factual report submission rates and hours logged for {month}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Intern</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Submitted Reports</th>
                <th className="py-3.5 px-4">Drafts</th>
                <th className="py-3.5 px-4">Total Reports</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Reported Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.performanceOverview || []).map((row) => (
                <tr key={row.internId} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="font-semibold text-slate-900">{row.name}</div>
                    <div className="text-[11px] text-slate-400">{row.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.department || 'Engineering'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                      {row.submittedReports}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800">
                      {row.draftReports}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{row.totalReports}</td>
                  <td className="py-3.5 px-4 sm:px-6 text-right font-bold text-indigo-600">
                    {row.totalReportedHours} hrs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
