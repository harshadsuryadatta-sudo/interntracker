const { query } = require('../config/database');
const { calculateWorkingMinutes } = require('../utils/time');

async function getReports({
  internId = null,
  month = null, // e.g. "2026-09"
  date = null,  // e.g. "2026-09-30"
  status = null,
  search = '',
  limit = 20,
  offset = 0,
} = {}) {
  let sql = `
    SELECT r.id, r.intern_id, r.report_date, r.in_time, r.out_time, r.working_minutes,
           r.work_completed, r.tasks_completed, r.pending_work, r.notes, r.status,
           r.attachments, r.created_at, r.updated_at, r.submitted_at, r.updated_by,
           u.name as intern_name, u.email as intern_email, u.username as intern_username,
           p.department as intern_department, p.profile_photo as intern_photo,
           admin_u.name as updated_by_name
    FROM daily_reports r
    JOIN users u ON r.intern_id = u.id
    LEFT JOIN intern_profiles p ON u.id = p.user_id
    LEFT JOIN users admin_u ON r.updated_by = admin_u.id
    WHERE 1=1
  `;
  const params = [];
  let index = 1;

  if (internId) {
    sql += ` AND r.intern_id = $${index++}`;
    params.push(internId);
  }

  if (date) {
    sql += ` AND r.report_date = $${index++}`;
    params.push(date);
  } else if (month) {
    sql += ` AND TO_CHAR(r.report_date, 'YYYY-MM') = $${index++}`;
    params.push(month);
  }

  if (status && status !== 'all') {
    sql += ` AND r.status = $${index++}`;
    params.push(status);
  }

  if (search) {
    sql += ` AND (
      LOWER(u.name) LIKE $${index} OR
      LOWER(r.work_completed) LIKE $${index} OR
      LOWER(r.tasks_completed) LIKE $${index} OR
      LOWER(r.pending_work) LIKE $${index}
    )`;
    params.push(`%${search.trim().toLowerCase()}%`);
    index++;
  }

  const countSql = `SELECT COUNT(*) as total FROM (${sql}) sub`;
  const countRes = await query(countSql, params);
  const totalCount = parseInt(countRes.rows[0].total, 10);

  sql += ` ORDER BY r.report_date DESC, r.id DESC LIMIT $${index++} OFFSET $${index++}`;
  params.push(limit, offset);

  const res = await query(sql, params);
  return {
    reports: res.rows,
    total: totalCount,
    limit,
    offset,
  };
}

async function getReportById(id) {
  const sql = `
    SELECT r.id, r.intern_id, r.report_date, r.in_time, r.out_time, r.working_minutes,
           r.work_completed, r.tasks_completed, r.pending_work, r.notes, r.status,
           r.attachments, r.created_at, r.updated_at, r.submitted_at, r.updated_by,
           u.name as intern_name, u.email as intern_email, u.username as intern_username,
           p.department as intern_department, p.profile_photo as intern_photo,
           admin_u.name as updated_by_name
    FROM daily_reports r
    JOIN users u ON r.intern_id = u.id
    LEFT JOIN intern_profiles p ON u.id = p.user_id
    LEFT JOIN users admin_u ON r.updated_by = admin_u.id
    WHERE r.id = $1
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function getReportByInternAndDate(internId, date) {
  const sql = `
    SELECT r.*, u.name as intern_name, u.email as intern_email, u.username as intern_username
    FROM daily_reports r
    JOIN users u ON r.intern_id = u.id
    WHERE r.intern_id = $1 AND r.report_date = $2
  `;
  const res = await query(sql, [internId, date]);
  return res.rows[0] || null;
}

async function createOrUpdateReport({
  internId,
  reportDate,
  inTime = '',
  outTime = '',
  workCompleted = '',
  tasksCompleted = '',
  pendingWork = '',
  notes = '',
  status = 'draft',
  attachments = '',
  updatedBy = null,
}) {
  const workingMinutes = calculateWorkingMinutes(inTime, outTime);
  const submittedAt = status === 'submitted' ? new Date() : null;

  const sql = `
    INSERT INTO daily_reports (
      intern_id, report_date, in_time, out_time, working_minutes,
      work_completed, tasks_completed, pending_work, notes, status,
      attachments, submitted_at, updated_by, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP)
    ON CONFLICT (intern_id, report_date) DO UPDATE
    SET in_time = EXCLUDED.in_time,
        out_time = EXCLUDED.out_time,
        working_minutes = EXCLUDED.working_minutes,
        work_completed = EXCLUDED.work_completed,
        tasks_completed = EXCLUDED.tasks_completed,
        pending_work = EXCLUDED.pending_work,
        notes = EXCLUDED.notes,
        status = EXCLUDED.status,
        attachments = EXCLUDED.attachments,
        submitted_at = COALESCE(daily_reports.submitted_at, EXCLUDED.submitted_at),
        updated_by = EXCLUDED.updated_by,
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;

  const res = await query(sql, [
    internId,
    reportDate,
    inTime,
    outTime,
    workingMinutes,
    workCompleted,
    tasksCompleted,
    pendingWork,
    notes,
    status,
    attachments,
    submittedAt,
    updatedBy,
  ]);

  return res.rows[0];
}

async function updateReport(id, {
  inTime,
  outTime,
  workCompleted,
  tasksCompleted,
  pendingWork,
  notes,
  status,
  attachments,
  updatedBy,
}) {
  const current = await getReportById(id);
  if (!current) return null;

  const newInTime = inTime !== undefined ? inTime : current.in_time;
  const newOutTime = outTime !== undefined ? outTime : current.out_time;
  const workingMinutes = calculateWorkingMinutes(newInTime, newOutTime);

  const updates = [];
  const values = [];
  let idx = 1;

  updates.push(`in_time = $${idx++}`);
  values.push(newInTime);

  updates.push(`out_time = $${idx++}`);
  values.push(newOutTime);

  updates.push(`working_minutes = $${idx++}`);
  values.push(workingMinutes);

  if (workCompleted !== undefined) {
    updates.push(`work_completed = $${idx++}`);
    values.push(workCompleted);
  }
  if (tasksCompleted !== undefined) {
    updates.push(`tasks_completed = $${idx++}`);
    values.push(tasksCompleted);
  }
  if (pendingWork !== undefined) {
    updates.push(`pending_work = $${idx++}`);
    values.push(pendingWork);
  }
  if (notes !== undefined) {
    updates.push(`notes = $${idx++}`);
    values.push(notes);
  }
  if (status !== undefined) {
    updates.push(`status = $${idx++}`);
    values.push(status);
  }
  if (attachments !== undefined) {
    updates.push(`attachments = $${idx++}`);
    values.push(attachments);
  }
  if (updatedBy !== undefined) {
    updates.push(`updated_by = $${idx++}`);
    values.push(updatedBy);
  }

  if (status === 'submitted' && !current.submitted_at) {
    updates.push(`submitted_at = $${idx++}`);
    values.push(new Date());
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);

  values.push(id);
  const sql = `
    UPDATE daily_reports
    SET ${updates.join(', ')}
    WHERE id = $${idx}
    RETURNING *
  `;

  const res = await query(sql, values);
  return res.rows[0];
}

async function deleteReport(id) {
  const res = await query('DELETE FROM daily_reports WHERE id = $1 RETURNING id', [id]);
  return res.rows[0] || null;
}

async function getCalendarStatusForMonth(internId, yearMonth) {
  const sql = `
    SELECT report_date, status, id, in_time, out_time, working_minutes
    FROM daily_reports
    WHERE intern_id = $1 AND TO_CHAR(report_date, 'YYYY-MM') = $2
  `;
  const res = await query(sql, [internId, yearMonth]);
  return res.rows;
}

module.exports = {
  getReports,
  getReportById,
  getReportByInternAndDate,
  createOrUpdateReport,
  updateReport,
  deleteReport,
  getCalendarStatusForMonth,
};

