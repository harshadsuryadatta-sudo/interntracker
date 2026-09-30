const { query } = require('../config/database');
const { formatMinutesToHours } = require('../utils/time');
const auditModel = require('../models/audit.model');

async function getDashboardStats(req, res) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.substring(0, 7); // e.g. "2026-09"

    // 1. Total Interns (active)
    const internsRes = await query(
      `SELECT COUNT(*) as total,
              COUNT(CASE WHEN status = 'active' THEN 1 END) as active_count
       FROM users WHERE role = 'intern'`
    );
    const totalInterns = parseInt(internsRes.rows[0].total, 10);
    const activeInterns = parseInt(internsRes.rows[0].active_count, 10);

    // 2. Attendance today (Present vs Absent)
    const presentRes = await query(
      `SELECT COUNT(DISTINCT intern_id) as present_count
       FROM attendance
       WHERE attendance_date = $1 AND (status = 'present' OR in_time IS NOT NULL)`,
      [todayStr]
    );
    const presentToday = parseInt(presentRes.rows[0].present_count, 10);
    const absentToday = Math.max(0, activeInterns - presentToday);

    // 3. Reports today (Submitted vs Pending)
    const reportsRes = await query(
      `SELECT
         COUNT(CASE WHEN status = 'submitted' THEN 1 END) as submitted_today,
         COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft_today
       FROM daily_reports
       WHERE report_date = $1`,
      [todayStr]
    );
    const reportsSubmittedToday = parseInt(reportsRes.rows[0].submitted_today, 10);
    const reportsPendingToday = Math.max(0, activeInterns - reportsSubmittedToday);

    // 4. Total working hours this month
    const hoursRes = await query(
      `SELECT COALESCE(SUM(working_minutes), 0) as total_minutes
       FROM attendance
       WHERE TO_CHAR(attendance_date, 'YYYY-MM') = $1`,
      [currentMonthStr]
    );
    const totalMinutesThisMonth = parseInt(hoursRes.rows[0].total_minutes, 10);
    const totalWorkingHoursFormatted = formatMinutesToHours(totalMinutesThisMonth);

    // 5. Instagram accounts and posts this month
    const igAccountsRes = await query('SELECT COUNT(*) as total FROM instagram_accounts');
    const totalInstagramAccounts = parseInt(igAccountsRes.rows[0].total, 10);

    const igPostsRes = await query(
      `SELECT COUNT(*) as total FROM instagram_posts
       WHERE TO_CHAR(posted_at, 'YYYY-MM') = $1`,
      [currentMonthStr]
    );
    const instagramPostsThisMonth = parseInt(igPostsRes.rows[0].total, 10);

    return res.status(200).json({
      success: true,
      stats: {
        totalInterns,
        activeInterns,
        presentToday,
        absentToday,
        reportsSubmittedToday,
        reportsPendingToday,
        totalWorkingMinutesThisMonth: totalMinutesThisMonth,
        totalWorkingHoursThisMonth: totalWorkingHoursFormatted,
        instagramAccounts: totalInstagramAccounts,
        instagramPostsThisMonth,
      },
    });
  } catch (error) {
    console.error('[GetDashboardStats Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard statistics.',
    });
  }
}

async function getAnalytics(req, res) {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = req.query.month || todayStr.substring(0, 7);

    // 1. Attendance trend over the past 14 days or selected month
    const attendanceTrendRes = await query(
      `SELECT a.attendance_date,
              COUNT(CASE WHEN a.status = 'present' OR a.in_time IS NOT NULL THEN 1 END) as present_count,
              COALESCE(SUM(a.working_minutes), 0) as total_minutes
       FROM attendance a
       WHERE TO_CHAR(a.attendance_date, 'YYYY-MM') = $1
       GROUP BY a.attendance_date
       ORDER BY a.attendance_date ASC`,
      [currentMonthStr]
    );

    const attendanceTrend = attendanceTrendRes.rows.map(row => ({
      date: String(row.attendance_date).split('T')[0],
      presentCount: parseInt(row.present_count, 10),
      totalHours: Number((parseInt(row.total_minutes, 10) / 60).toFixed(1)),
    }));

    // 2. Reports Chart: Submitted vs Draft/Pending breakdown by date
    const reportsBreakdownRes = await query(
      `SELECT r.report_date,
              COUNT(CASE WHEN r.status = 'submitted' THEN 1 END) as submitted,
              COUNT(CASE WHEN r.status = 'draft' THEN 1 END) as draft
       FROM daily_reports r
       WHERE TO_CHAR(r.report_date, 'YYYY-MM') = $1
       GROUP BY r.report_date
       ORDER BY r.report_date ASC`,
      [currentMonthStr]
    );

    const reportsChart = reportsBreakdownRes.rows.map(row => ({
      date: String(row.report_date).split('T')[0],
      submitted: parseInt(row.submitted, 10),
      draft: parseInt(row.draft, 10),
    }));

    // 3. Working Hours by Intern for the month
    const hoursByInternRes = await query(
      `SELECT u.id, u.name,
              p.department,
              COALESCE(SUM(a.working_minutes), 0) as total_minutes
       FROM users u
       LEFT JOIN intern_profiles p ON u.id = p.user_id
       LEFT JOIN attendance a ON u.id = a.intern_id AND TO_CHAR(a.attendance_date, 'YYYY-MM') = $1
       WHERE u.role = 'intern'
       GROUP BY u.id, u.name, p.department
       ORDER BY total_minutes DESC`,
      [currentMonthStr]
    );

    const workingHoursByIntern = hoursByInternRes.rows.map(row => {
      const minutes = parseInt(row.total_minutes, 10);
      return {
        internId: row.id,
        name: row.name,
        department: row.department,
        totalMinutes: minutes,
        totalHours: Number((minutes / 60).toFixed(1)),
        formattedHours: formatMinutesToHours(minutes),
      };
    });

    // 4. Intern Performance Overview (factual report submission statistics)
    const performanceOverviewRes = await query(
      `SELECT u.id, u.name, u.email, p.department,
              COUNT(r.id) as total_reports,
              COUNT(CASE WHEN r.status = 'submitted' THEN 1 END) as submitted_reports,
              COUNT(CASE WHEN r.status = 'draft' THEN 1 END) as draft_reports,
              COALESCE(SUM(r.working_minutes), 0) as total_report_minutes
       FROM users u
       LEFT JOIN intern_profiles p ON u.id = p.user_id
       LEFT JOIN daily_reports r ON u.id = r.intern_id AND TO_CHAR(r.report_date, 'YYYY-MM') = $1
       WHERE u.role = 'intern'
       GROUP BY u.id, u.name, u.email, p.department
       ORDER BY submitted_reports DESC`,
      [currentMonthStr]
    );

    const performanceOverview = performanceOverviewRes.rows.map(row => ({
      internId: row.id,
      name: row.name,
      email: row.email,
      department: row.department,
      totalReports: parseInt(row.total_reports, 10),
      submittedReports: parseInt(row.submitted_reports, 10),
      draftReports: parseInt(row.draft_reports, 10),
      totalReportedHours: Number((parseInt(row.total_report_minutes, 10) / 60).toFixed(1)),
    }));

    return res.status(200).json({
      success: true,
      month: currentMonthStr,
      attendanceTrend,
      reportsChart,
      workingHoursByIntern,
      performanceOverview,
    });
  } catch (error) {
    console.error('[GetAnalytics Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve analytics data.',
    });
  }
}

async function getAuditLogs(req, res) {
  try {
    const logs = await auditModel.getAuditLogs(100);
    return res.status(200).json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error('[GetAuditLogs Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve audit logs.',
    });
  }
}

module.exports = {
  getDashboardStats,
  getAnalytics,
  getAuditLogs,
};
