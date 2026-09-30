const attendanceModel = require('../models/attendance.model');
const reportModel = require('../models/report.model');
const auditModel = require('../models/audit.model');
const { formatCurrentTime, formatMinutesToHours } = require('../utils/time');

async function getToday(req, res) {
  try {
    const isIntern = req.user.role === 'intern';
    const internId = isIntern ? req.user.id : (req.query.internId || req.user.id);
    const todayStr = new Date().toISOString().split('T')[0];

    const attendance = await attendanceModel.getTodayAttendance(internId, todayStr);
    const report = await reportModel.getReportByInternAndDate(internId, todayStr);

    return res.status(200).json({
      success: true,
      today: {
        date: todayStr,
        attendance: attendance || null,
        report: report || null,
        formattedWorkingHours: attendance && attendance.working_minutes
          ? formatMinutesToHours(attendance.working_minutes)
          : (attendance && attendance.in_time ? 'In progress' : '0h 00m'),
      },
    });
  } catch (error) {
    console.error('[GetToday Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve today\'s attendance status.',
    });
  }
}

async function checkIn(req, res) {
  try {
    const internId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = formatCurrentTime(new Date());

    const record = await attendanceModel.checkIn(internId, todayStr, nowTime);

    await auditModel.logAction(internId, 'CHECK_IN', 'ATTENDANCE', record.id, {
      time: nowTime,
      date: todayStr,
    });

    return res.status(200).json({
      success: true,
      message: `Checked in successfully at ${nowTime}.`,
      attendance: record,
    });
  } catch (error) {
    console.error('[CheckIn Controller Error]:', error);
    const status = error.message.includes('already checked in') ? 400 : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Check-in failed.',
    });
  }
}

async function checkOut(req, res) {
  try {
    const internId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = formatCurrentTime(new Date());

    const record = await attendanceModel.checkOut(internId, todayStr, nowTime);

    await auditModel.logAction(internId, 'CHECK_OUT', 'ATTENDANCE', record.id, {
      time: nowTime,
      date: todayStr,
      workingMinutes: record.working_minutes,
    });

    return res.status(200).json({
      success: true,
      message: `Checked out successfully at ${nowTime}. Total hours: ${formatMinutesToHours(record.working_minutes)}.`,
      attendance: record,
      formattedWorkingHours: formatMinutesToHours(record.working_minutes),
    });
  } catch (error) {
    console.error('[CheckOut Controller Error]:', error);
    const status = error.message.includes('Please check in') || error.message.includes('already checked out')
      ? 400
      : 500;
    return res.status(status).json({
      success: false,
      message: error.message || 'Check-out failed.',
    });
  }
}

async function getAttendance(req, res) {
  try {
    const isIntern = req.user.role === 'intern';
    const internId = isIntern ? req.user.id : (req.query.internId || null);

    const { date, month, status, page = 1, limit = 20 } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (parsedPage - 1) * parsedLimit;

    const result = await attendanceModel.getAttendanceRecords({
      internId,
      date,
      month,
      status,
      limit: parsedLimit,
      offset,
    });

    return res.status(200).json({
      success: true,
      records: result.records,
      pagination: {
        total: result.total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages: Math.ceil(result.total / parsedLimit),
      },
    });
  } catch (error) {
    console.error('[GetAttendance Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve attendance records.',
    });
  }
}

async function updateAttendanceRecord(req, res) {
  try {
    const { id } = req.params;
    const { inTime, outTime, status } = req.body;

    const updated = await attendanceModel.updateAttendance(id, { inTime, outTime, status });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found.',
      });
    }

    await auditModel.logAction(req.user.id, 'UPDATE_ATTENDANCE', 'ATTENDANCE', id, {
      inTime,
      outTime,
      status,
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance record corrected successfully.',
      record: updated,
    });
  } catch (error) {
    console.error('[UpdateAttendanceRecord Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance record.',
    });
  }
}

module.exports = {
  getToday,
  checkIn,
  checkOut,
  getAttendance,
  updateAttendanceRecord,
};

