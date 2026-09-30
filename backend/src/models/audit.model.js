const { query } = require('../config/database');

async function logAction(userId, action, entity, entityId, metadata = {}) {
  try {
    const metaStr = typeof metadata === 'object' ? JSON.stringify(metadata) : String(metadata);
    const sql = `
      INSERT INTO audit_logs (user_id, action, entity, entity_id, metadata, timestamp)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `;
    const res = await query(sql, [userId || null, action, entity, String(entityId || ''), metaStr]);
    return res.rows[0];
  } catch (err) {
    console.error('[Audit Log Error]:', err.message);
    return null;
  }
}

async function getAuditLogs(limit = 50) {
  const sql = `
    SELECT l.id, l.user_id, l.action, l.entity, l.entity_id, l.timestamp, l.metadata,
           u.name as user_name, u.email as user_email
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.timestamp DESC
    LIMIT $1
  `;
  const res = await query(sql, [limit]);
  return res.rows;
}

module.exports = {
  logAction,
  getAuditLogs,
};

