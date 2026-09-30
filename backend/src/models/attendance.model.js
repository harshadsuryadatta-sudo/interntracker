const { query } = require('../config/database');
const { calculateWorkingMinutes } = require('../utils/time');

async function getTodayAttendance(internId, todayDate) {
  const sql = `
    SELECT id, intern_id, attendance_date, in_time, out_time, working_minutes, status, created_at, updated_at
    FROM attendance
    WHERE intern_id = $1 AND attendance_date = $2
  `;
  const res = await query(sql, [internId, todayDate]);
  return res.rows[0] || null;
}

async function checkIn(internId, todayDate, formattedTime) {
  const existing = await getTodayAttendance(internId, todayDate);
  if (existing && existing.in_time) {
    throw new Error('You have already checked in today.');
  }

  const sql = `
    INSERT INTO attendance (intern_id, attendance_date, in_time, out_time, working_minutes, status)
    VALUES ($1, $2, $3, NULL, 0, 'present')
    ON CONFLICT (intern_id, attendance_date) DO UPDATE
    SET in_time = EXCLUDED.in_time,
        status = 'present',
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const res = await query(sql, [internId, todayDate, formattedTime]);
  return res.rows[0];
}

async function checkOut(internId, todayDate, formattedTime) {
  const existing = await getTodayAttendance(internId, todayDate);
  if (!existing || !existing.in_time) {
    throw new Error('Please check in before checking out.');
  }
  if (existing.out_time) {
    throw new Error('You have already checked out today.');
  }

  const workingMinutes = calculateWorkingMinutes(existing.in_time, formattedTime);

  const sql = `
    UPDATE attendance
    SET out_time = $1,
        working_minutes = $2,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING *
  `;
  const res = await query(sql, [formattedTime, workingMinutes, existing.id]);
  return res.rows[0];
}

async function getAttendanceRecords({
  internId = null,
  date = null,
  month = null,
  status = null,
  limit = 50,
  offset = 0,
} = {}) {
  let sql = `
    SELECT a.id, a.intern_id, a.attendance_date, a.in_time, a.out_time,
           a.working_minutes, a.status, a.created_at, a.updated_at,
           u.name as intern_name, u.email as intern_email, u.username as intern_username,
           p.department as intern_department, p.profile_photo as intern_photo
    FROM attendance a
    JOIN users u ON a.intern_id = u.id
    LEFT JOIN intern_profiles p ON u.id = p.user_id
    WHERE 1=1
  `;
  const params = [];
  let index = 1;

  if (internId) {
    sql += ` AND a.intern_id = $${index++}`;
    params.push(internId);
  }

  if (date) {
    sql += ` AND a.attendance_date = $${index++}`;
    params.push(date);
  } else if (month) {
    sql += ` AND TO_CHAR(a.attendance_date, 'YYYY-MM') = $${index++}`;
    params.push(month);
  }

  if (status && status !== 'all') {
    sql += ` AND a.status = $${index++}`;
    params.push(status);
  }

  const countSql = `SELECT COUNT(*) as total FROM (${sql}) sub`;
  const countRes = await query(countSql, params);
  const totalCount = parseInt(countRes.rows[0].total, 10);

  sql += ` ORDER BY a.attendance_date DESC, a.id DESC LIMIT $${index++} OFFSET $${index++}`;
  params.push(limit, offset);

  const res = await query(sql, params);
  return {
    records: res.rows,
    total: totalCount,
    limit,
    offset,
  };
}

async function updateAttendance(id, { inTime, outTime, status }) {
  const currentRes = await query('SELECT * FROM attendance WHERE id = $1', [id]);
  if (currentRes.rows.length === 0) return null;
  const current = currentRes.rows[0];

  const newInTime = inTime !== undefined ? inTime : current.in_time;
  const newOutTime = outTime !== undefined ? outTime : current.out_time;
  const workingMinutes = calculateWorkingMinutes(newInTime, newOutTime);
  const newStatus = status || current.status;

  const sql = `
    UPDATE attendance
    SET in_time = $1,
        out_time = $2,
        working_minutes = $3,
        status = $4,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *
  `;
  const res = await query(sql, [newInTime, newOutTime, workingMinutes, newStatus, id]);
  return res.rows[0];
}

module.exports = {
  getTodayAttendance,
  checkIn,
  checkOut,
  getAttendanceRecords,
  updateAttendance,
};

