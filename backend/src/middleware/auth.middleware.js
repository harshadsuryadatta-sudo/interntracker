const { verifyToken } = require('../utils/jwt');
const { query } = require('../config/database');

async function authenticate(req, res, next) {
  try {
    let token = null;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please log in.',
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please log in again.',
      });
    }

    const userRes = await query(
      `SELECT u.id, u.name, u.email, u.username, u.role, u.status,
              p.department, p.joining_date, p.phone, p.profile_photo
       FROM users u
       LEFT JOIN intern_profiles p ON u.id = p.user_id
       WHERE u.id = $1`,
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const user = userRes.rows[0];

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
}

module.exports = { authenticate };

