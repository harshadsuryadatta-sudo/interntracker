const reportModel = require('../models/report.model');
const auditModel = require('../models/audit.model');

async function getReports(req, res) {
  try {
    const isIntern = req.user.role === 'intern';
    const internId = isIntern ? req.user.id : (req.query.internId || null);

    const {
      month,
      date,
      status,
      search,
      page = 1,
      limit = 15,
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 15));
    const offset = (parsedPage - 1) * parsedLimit;

    const result = await reportModel.getReports({
      internId,
      month,
      date,
      status,
      search,
      limit: parsedLimit,
      offset,
    });

    return res.status(200).json({
      success: true,
      reports: result.reports,
      pagination: {
        total: result.total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(result.total / parsedLimit),
      },
    });
  } catch (error) {
    console.error('[GetReports Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve daily reports.',
    });
  }
}

async function getReportById(req, res) {
  try {
    const { id } = req.params;
    const report = await reportModel.getReportById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (req.user.role === 'intern' && report.intern_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to view this report.',
      });
    }

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('[GetReportById Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve report.',
    });
  }
}

async function saveReport(req, res) {
  try {
    const isIntern = req.user.role === 'intern';
    const internId = isIntern ? req.user.id : (req.body.internId || req.user.id);

    const {
      reportDate,
      inTime,
      outTime,
      workCompleted,
      tasksCompleted,
      pendingWork,
      notes,
      status = 'draft',
      attachments,
    } = req.body;

    if (!reportDate) {
      return res.status(400).json({
        success: false,
        message: 'Report date is required.',
      });
    }

    const report = await reportModel.createOrUpdateReport({
      internId,
      reportDate,
      inTime,
      outTime,
      workCompleted,
      tasksCompleted,
      pendingWork,
      notes,
      status,
      attachments,
      updatedBy: isIntern ? null : req.user.id,
    });

    const actionText = status === 'submitted' ? 'SUBMIT_REPORT' : 'SAVE_DRAFT_REPORT';
    await auditModel.logAction(req.user.id, actionText, 'DAILY_REPORT', report.id, {
      reportDate,
      status,
      internId,
    });

    return res.status(200).json({
      success: true,
      message: status === 'submitted' ? 'Report submitted successfully.' : 'Draft saved successfully.',
      report,
    });
  } catch (error) {
    console.error('[SaveReport Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save daily report.',
    });
  }
}

async function updateReport(req, res) {
  try {
    const { id } = req.params;
    const existing = await reportModel.getReportById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (req.user.role === 'intern' && existing.intern_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to edit this report.',
      });
    }

    const {
      inTime,
      outTime,
      workCompleted,
      tasksCompleted,
      pendingWork,
      notes,
      status,
      attachments,
    } = req.body;

    const isAdmin = req.user.role === 'admin';

    const updated = await reportModel.updateReport(id, {
      inTime,
      outTime,
      workCompleted,
      tasksCompleted,
      pendingWork,
      notes,
      status,
      attachments,
      updatedBy: isAdmin ? req.user.id : existing.updated_by,
    });

    await auditModel.logAction(req.user.id, 'UPDATE_REPORT', 'DAILY_REPORT', id, {
      updatedByRole: req.user.role,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Report updated successfully.',
      report: updated,
    });
  } catch (error) {
    console.error('[UpdateReport Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update report.',
    });
  }
}

async function deleteReport(req, res) {
  try {
    const { id } = req.params;
    const existing = await reportModel.getReportById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Report not found.',
      });
    }

    if (req.user.role === 'intern') {
      if (existing.intern_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden. You do not have permission to delete this report.',
        });
      }
      if (existing.status === 'submitted') {
        return res.status(403).json({
          success: false,
          message: 'Submitted reports cannot be deleted by interns. Please contact an admin.',
        });
      }
    }

    await reportModel.deleteReport(id);

    await auditModel.logAction(req.user.id, 'DELETE_REPORT', 'DAILY_REPORT', id, {
      reportDate: existing.report_date,
      internId: existing.intern_id,
    });

    return res.status(200).json({
      success: true,
      message: 'Report deleted successfully.',
    });
  } catch (error) {
    console.error('[DeleteReport Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete report.',
    });
  }
}

async function getCalendar(req, res) {
  try {
    const isIntern = req.user.role === 'intern';
    const internId = isIntern ? req.user.id : (req.query.internId || req.user.id);
    const { month } = req.query;

    if (!month) {
      return res.status(400).json({
        success: false,
        message: 'Month is required (format: YYYY-MM).',
      });
    }

    const records = await reportModel.getCalendarStatusForMonth(internId, month);

    return res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error('[GetCalendar Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve calendar data.',
    });
  }
}

module.exports = {
  getReports,
  getReportById,
  saveReport,
  updateReport,
  deleteReport,
  getCalendar,
};

