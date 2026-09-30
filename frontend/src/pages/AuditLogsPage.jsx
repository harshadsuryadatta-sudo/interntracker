import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, User, Clock, FileText } from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export default function AuditLogsPage() {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.getAuditLogs();
        if (res.success) {
          setLogs(res.logs || []);
        }
      } catch (err) {
        toast.error('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Security Audit Logs</h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Compliance Verified
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Immutable event log of administrative mutations, report edits, and security events.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Loading security logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No audit records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Timestamp</th>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Actor</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4 sm:px-6">Metadata Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => {
                  const timestampStr = new Date(log.timestamp).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-mono text-[11px]">
                        {timestampStr}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{log.user_name || 'System'}</div>
                        <div className="text-[11px] text-slate-400">{log.user_email || 'automated'}</div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        {log.entity} #{log.entity_id}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-slate-500 font-mono text-[11px] max-w-xs truncate">
                        {log.metadata}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
