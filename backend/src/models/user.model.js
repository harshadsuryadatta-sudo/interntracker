const { query } = require('../config/database');

async function findByEmail(identifier) {
  const clean = identifier.trim().toLowerCase();
  const res = await query(
    `SELECT u.id, u.name, u.email, u.username, u.password_hash, u.role, u.status,
            p.department, p.joining_date, p.phone, p.profile_photo
     FROM users u
     LEFT JOIN intern_profiles p ON u.id = p.user_id
     WHERE LOWER(u.email) = $1 OR LOWER(u.username) = $1`,
    [clean]
  );
  return res.rows[0] || null;
}

async function findById(id) {
  const res = await query(
    `SELECT u.id, u.name, u.email, u.username, u.role, u.status, u.created_at, u.updated_at,
            p.department, p.joining_date, p.phone, p.profile_photo
     FROM users u
     LEFT JOIN intern_profiles p ON u.id = p.user_id
     WHERE u.id = $1`,
    [id]
  );
  return res.rows[0] || null;
}

async function createUser({ name, email, username, passwordHash, role = 'intern', status = 'active' }) {
  const res = await query(
    `INSERT INTO users (name, email, username, password_hash, role, status)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, email, username, role, status, created_at`,
    [name.trim(), email.trim().toLowerCase(), username ? username.trim().toLowerCase() : null, passwordHash, role, status]
  );
  return res.rows[0];
}

async function updateUser(id, { name, email, username, status }) {
  const updates = [];
  const values = [];
  let index = 1;

  if (name !== undefined) {
    updates.push(`name = $${index++}`);
    values.push(name.trim());
  }
  if (email !== undefined) {
    updates.push(`email = $${index++}`);
    values.push(email.trim().toLowerCase());
  }
  if (username !== undefined) {
    updates.push(`username = $${index++}`);
    values.push(username.trim().toLowerCase());
  }
  if (status !== undefined) {
    updates.push(`status = $${index++}`);
    values.push(status);
  }

  updates.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(id);

  const res = await query(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = $${index}
     RETURNING id, name, email, username, role, status, updated_at`,
    values
  );
  return res.rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  const res = await query(
    `UPDATE users
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING id`,
    [passwordHash, id]
  );
  return res.rows[0] || null;
}

async function deleteUser(id) {
  const res = await query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return res.rows[0] || null;
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser,
  updatePassword,
  deleteUser,
};

