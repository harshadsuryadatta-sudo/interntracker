const { query } = require('../config/database');

async function getAllInterns({ search = '', department = '', status = '' } = {}) {
  let sql = `
    SELECT u.id, u.name, u.email, u.username, u.role, u.status, u.created_at,
           p.department, p.joining_date, p.phone, p.profile_photo,
           (SELECT COUNT(*) FROM daily_reports r WHERE r.intern_id = u.id AND r.status = 'submitted') as submitted_reports_count,
           (SELECT COALESCE(SUM(a.working_minutes), 0) FROM attendance a WHERE a.intern_id = u.id) as total_working_minutes
    FROM users u
    LEFT JOIN intern_profiles p ON u.id = p.user_id
    WHERE u.role = 'intern'
  `;
  const params = [];
  let index = 1;

  if (search) {
    sql += ` AND (LOWER(u.name) LIKE $${index} OR LOWER(u.email) LIKE $${index} OR LOWER(COALESCE(u.username, '')) LIKE $${index} OR LOWER(p.department) LIKE $${index})`;
    params.push(`%${search.trim().toLowerCase()}%`);
    index++;
  }

  if (department) {
    sql += ` AND p.department = $${index}`;
    params.push(department);
    index++;
  }

  if (status) {
    sql += ` AND u.status = $${index}`;
    params.push(status);
    index++;
  }

  sql += ` ORDER BY u.id ASC`;

  const res = await query(sql, params);
  return res.rows;
}

async function getInternById(id) {
  const sql = `
    SELECT u.id, u.name, u.email, u.username, u.role, u.status, u.created_at, u.updated_at,
           p.department, p.joining_date, p.phone, p.profile_photo
    FROM users u
    LEFT JOIN intern_profiles p ON u.id = p.user_id
    WHERE u.id = $1 AND u.role = 'intern'
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function createInternProfile({ userId, department, joiningDate, phone, profilePhoto }) {
  const sql = `
    INSERT INTO intern_profiles (user_id, department, joining_date, phone, profile_photo)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (user_id) DO UPDATE
    SET department = EXCLUDED.department,
        joining_date = EXCLUDED.joining_date,
        phone = EXCLUDED.phone,
        profile_photo = EXCLUDED.profile_photo,
        updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `;
  const res = await query(sql, [userId, department, joiningDate || null, phone || null, profilePhoto || null]);
  return res.rows[0];
}

async function updateInternProfile(userId, { department, joiningDate, phone, profilePhoto }) {
  const existing = await query('SELECT id FROM intern_profiles WHERE user_id = $1', [userId]);
  if (existing.rows.length === 0) {
    return createInternProfile({
      userId,
      department: department || 'General',
      joiningDate: joiningDate || '2026-09-01',
      phone: phone || '',
      profilePhoto: profilePhoto || '',
    });
  }

  const updates = [];
  const values = [];
  let index = 1;


  if (department !== undefined) {
    updates.push(`department = $${index++}`);
    values.push(department);
  }
  if (joiningDate !== undefined) {
    updates.push(`joining_date = $${index++}`);
    values.push(joiningDate);
  }
  if (phone !== undefined) {
    updates.push(`phone = $${index++}`);
    values.push(phone);
  }
  if (profilePhoto !== undefined) {
    updates.push(`profile_photo = $${index++}`);
    values.push(profilePhoto);
  }

  if (updates.length === 0) return null;

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(userId);

  const sql = `
    UPDATE intern_profiles
    SET ${updates.join(', ')}
    WHERE user_id = $${index}
    RETURNING *
  `;
  const res = await query(sql, values);
  return res.rows[0] || null;
}

module.exports = {
  getAllInterns,
  getInternById,
  createInternProfile,
  updateInternProfile,
};

