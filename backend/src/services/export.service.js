const xlsx = require('xlsx');
const { formatMinutesToHours } = require('../utils/time');

function formatReportRow(report) {
  const workingHours = report.working_minutes
    ? formatMinutesToHours(report.working_minutes)
    : '0h 00m';

  const dateStr = report.report_date instanceof Date
    ? report.report_date.toISOString().split('T')[0]
    : String(report.report_date || '').split('T')[0];

  return {
    'Intern Name': report.intern_name || 'N/A',
    'Email': report.intern_email || 'N/A',
    'Date': dateStr,
    'In Time': report.in_time || '--',
    'Out Time': report.out_time || '--',
    'Working Hours': workingHours,
    'Work Completed': report.work_completed || '',
    'Tasks Completed': report.tasks_completed || '',
    'Pending Work': report.pending_work || '',
    'Notes': report.notes || '',
    'Status': (report.status || 'draft').toUpperCase(),
  };
}

function generateCSV(reports) {
  const headers = [
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

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = [
    headers.map(escapeCSV).join(','),
  ];

  for (const r of reports) {
    const rowObj = formatReportRow(r);
    const row = headers.map(h => escapeCSV(rowObj[h]));
    rows.push(row.join(','));
  }

  // Include UTF-8 BOM for Microsoft Excel compatibility
  return '\uFEFF' + rows.join('\r\n');
}

function generateExcelBuffer(reports) {
  const data = reports.map(formatReportRow);
  const worksheet = xlsx.utils.json_to_sheet(data);

  // Set column widths for better readability
  worksheet['!cols'] = [
    { wch: 22 }, // Intern Name
    { wch: 28 }, // Email
    { wch: 14 }, // Date
    { wch: 12 }, // In Time
    { wch: 12 }, // Out Time
    { wch: 15 }, // Working Hours
    { wch: 45 }, // Work Completed
    { wch: 35 }, // Tasks Completed
    { wch: 35 }, // Pending Work
    { wch: 30 }, // Notes
    { wch: 14 }, // Status
  ];

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Daily Reports');

  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = {
  formatReportRow,
  generateCSV,
  generateExcelBuffer,
};
