import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  Clock,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isFuture,
  isWeekend,
  parseISO,
} from 'date-fns';

export default function CalendarView({
  currentMonth,
  onMonthChange,
  reportsByDate = {}, // { "2026-09-29": { id: 1, status: "submitted", in_time: "...", ... } }
  onDateClick,
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  const prevMonth = () => onMonthChange(subMonths(currentMonth, 1));
  const nextMonth = () => onMonthChange(addMonths(currentMonth, 1));
  const goToToday = () => onMonthChange(new Date());

  const getDayStatus = (day) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const report = reportsByDate[dateKey];

    if (isFuture(day) && !isToday(day)) {
      return { type: 'future', label: 'Future', color: 'bg-slate-100 text-slate-400 border-slate-200' };
    }

    if (report) {
      if (report.status === 'submitted') {
        return {
          type: 'submitted',
          label: 'Submitted',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-1 ring-emerald-400/30',
          dot: 'bg-emerald-500',
          report,
        };
      }
      if (report.status === 'draft') {
        return {
          type: 'draft',
          label: 'Draft',
          color: 'bg-amber-50 text-amber-700 border-amber-300 ring-1 ring-amber-400/30',
          dot: 'bg-amber-500',
          report,
        };
      }
    }

    // Past day with no report
    if (!isWeekend(day)) {
      return {
        type: 'missing',
        label: 'Missing',
        color: 'bg-rose-50/70 text-rose-700 border-rose-200 hover:border-rose-300',
        dot: 'bg-rose-500',
        report: null,
      };
    }

    return {
      type: 'weekend',
      label: 'Weekend',
      color: 'bg-slate-50/50 text-slate-400 border-slate-100',
      dot: 'bg-slate-300',
      report: null,
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
      {/* Calendar Header with Navigation */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button
            onClick={goToToday}
            className="px-2.5 py-1 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            onClick={prevMonth}
            aria-label="Previous month"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextMonth}
            aria-label="Next month"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60 text-center">
        {weekDays.map((day) => (
          <div key={day} className="py-2.5 text-[11px] font-bold text-slate-500 tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isCurrentDay = isToday(day);
          const dateKey = format(day, 'yyyy-MM-dd');
          const status = getDayStatus(day);

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDateClick(dateKey, status.report)}
              className={`min-h-[95px] sm:min-h-[110px] p-2 sm:p-2.5 transition-all cursor-pointer group flex flex-col justify-between ${
                !isCurrentMonth ? 'bg-slate-50/40 opacity-40' : 'bg-white hover:bg-indigo-50/30'
              } ${isCurrentDay ? 'bg-indigo-50/20' : ''}`}
            >
              {/* Day Number and Today badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-lg ${
                    isCurrentDay
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                {status.dot && (
                  <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                )}
              </div>

              {/* Status Badge inside Cell */}
              <div className="mt-1">
                {status.type === 'submitted' && (
                  <div className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Submitted</span>
                  </div>
                )}

                {status.type === 'draft' && (
                  <div className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                    <span className="truncate">Draft</span>
                  </div>
                )}

                {status.type === 'missing' && isCurrentMonth && (
                  <div className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[10px] sm:text-xs font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <AlertCircle className="w-3 h-3 text-rose-500 shrink-0" />
                    <span className="truncate">Missing</span>
                  </div>
                )}

                {status.type === 'future' && isCurrentMonth && (
                  <div className="text-[10px] text-slate-300 font-medium px-1">
                    Upcoming
                  </div>
                )}
              </div>

              {/* In/Out Time preview if available */}
              {status.report?.in_time && (
                <div className="text-[10px] text-slate-500 font-medium truncate hidden sm:block">
                  {status.report.in_time} - {status.report.out_time || 'Working'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Visual Legend */}
      <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-slate-500">Legend:</span>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Report Submitted</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span>Draft / Partial</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Report Missing</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-3 h-3 rounded-full bg-slate-300" />
            <span>Future / Off Day</span>
          </div>
        </div>
      </div>
    </div>
  );
}
