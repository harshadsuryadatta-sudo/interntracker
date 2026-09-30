const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const internModel = require('../models/intern.model');
const auditModel = require('../models/audit.model');
const { signToken } = require('../utils/jwt');

async function login(req, res) {
  try {
    const identifier = req.body.identifier || req.body.username || req.body.email;
    const { password } = req.body;


    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both username/email and password.',
      });
    }

    const user = await userModel.findByEmail(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    if (user.status === 'disabled') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact your administrator.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password.',
      });
    }

    const token = signToken(user);

    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role,
      status: user.status,
      department: user.department || null,
      phone: user.phone || null,
      profilePhoto: user.profile_photo || null,
      joiningDate: user.joining_date || null,
    };

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      user: userPayload,
      token,
    });
  } catch (error) {
    console.error('[Login Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login. Please try again.',
    });
  }
}

async function getMe(req, res) {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.status,
        department: user.department || null,
        phone: user.phone || null,
        profilePhoto: user.profile_photo || null,
        joiningDate: user.joining_date || null,
      },
    });
  } catch (error) {
    console.error('[GetMe Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to retrieve user session.',
    });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie('token');
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error) {
    console.error('[Logout Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to process logout.',
    });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { name, phone, profilePhoto } = req.body;

    if (name) {
      await userModel.updateUser(userId, { name });
    }

    if (phone !== undefined || profilePhoto !== undefined) {
      await internModel.updateInternProfile(userId, { phone, profilePhoto });
    }

    const updated = await userModel.findById(userId);

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        username: updated.username,
        role: updated.role,
        status: updated.status,
        department: updated.department,
        phone: updated.phone,
        profilePhoto: updated.profile_photo,
        joiningDate: updated.joining_date,
      },
    });
  } catch (error) {
    console.error('[UpdateProfile Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
}

async function changePassword(req, res) {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.',
      });
    }

    const user = await userModel.findByEmail(req.user.email);
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(userId, newHash);

    await auditModel.logAction(userId, 'PASSWORD_CHANGE', 'USER', userId, {
      description: 'User updated their password',
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
    });
  } catch (error) {
    console.error('[ChangePassword Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to change password.',
    });
  }
}

module.exports = {
  login,
  getMe,
  logout,
  updateProfile,
  changePassword,
};
