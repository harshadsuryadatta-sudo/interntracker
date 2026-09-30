const reportModel = require('../models/report.model');
const exportService = require('../services/export.service');
const auditModel = require('../models/audit.model');

async function exportReports(req, res) {
  try {
    const {
      internId,
      month,
      date,
      status,
      search,
      format = 'csv',
    } = req.query;

    const result = await reportModel.getReports({
      internId: internId ? parseInt(internId, 10) : null,
      month,
      date,
      status: status || null,
      search: search || '',
      limit: 10000,
      offset: 0,
    });

    const reports = result.reports;
    const timestampStr = new Date().toISOString().split('T')[0];
    const filenameBase = `social_media_intern_reports_${month || date || timestampStr}`;

    await auditModel.logAction(req.user.id, 'EXPORT_REPORTS', 'EXPORT', '0', {
      format,
      recordsCount: reports.length,
      filters: { internId, month, date, status },
    });

    if (format === 'xlsx' || format === 'excel') {
      const buffer = exportService.generateExcelBuffer(reports);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
      return res.send(buffer);
    } else {
      const csvData = exportService.generateCSV(reports);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.csv"`);
      return res.send(csvData);
    }
  } catch (error) {
    console.error('[ExportReports Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate report export file.',
    });
  }
}

module.exports = {
  exportReports,
};
