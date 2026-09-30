const bcrypt = require('bcryptjs');
const userModel = require('../models/user.model');
const internModel = require('../models/intern.model');
const auditModel = require('../models/audit.model');

async function getInterns(req, res) {
  try {
    const { search, department, status } = req.query;
    const interns = await internModel.getAllInterns({ search, department, status });

    return res.status(200).json({
      success: true,
      interns,
    });
  } catch (error) {
    console.error('[GetInterns Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve interns list.',
    });
  }
}

async function getInternById(req, res) {
  try {
    const { id } = req.params;
    const intern = await internModel.getInternById(id);

    if (!intern) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found.',
      });
    }

    return res.status(200).json({
      success: true,
      intern,
    });
  } catch (error) {
    console.error('[GetInternById Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve intern details.',
    });
  }
}

async function createIntern(req, res) {
  try {
    const { name, email, username, password, department, phone, joiningDate, profilePhoto } = req.body;

    if (!name || (!email && !username) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Full Name, Username/Email, and Password are required.',
      });
    }

    const finalEmail = email ? email.trim().toLowerCase() : `${username.trim().toLowerCase()}@intern.tracker`;
    const finalUsername = username ? username.trim().toLowerCase() : name.trim().toLowerCase().replace(/\s+/g, '.');

    const existing = await userModel.findByEmail(finalEmail);
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An intern with this username or email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userModel.createUser({
      name,
      email: finalEmail,
      username: finalUsername,
      passwordHash,
      role: 'intern',
      status: 'active',
    });

    await internModel.createInternProfile({
      userId: user.id,
      department: department || 'Social Media',
      joiningDate: joiningDate || new Date().toISOString().split('T')[0],
      phone: phone || '',
      profilePhoto: profilePhoto || '',
    });

    await auditModel.logAction(req.user.id, 'CREATE_INTERN', 'USER', user.id, {
      name,
      email: finalEmail,
      department,
    });

    const fullIntern = await internModel.getInternById(user.id);

    return res.status(201).json({
      success: true,
      message: 'Intern account created successfully.',
      intern: fullIntern,
    });
  } catch (error) {
    console.error('[CreateIntern Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create intern account.',
    });
  }
}

async function updateIntern(req, res) {
  try {
    const { id } = req.params;
    const { name, email, username, department, phone, joiningDate, profilePhoto, status } = req.body;

    const existing = await internModel.getInternById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found.',
      });
    }

    await userModel.updateUser(id, { name, email, username, status });
    await internModel.updateInternProfile(id, { department, phone, joiningDate, profilePhoto });

    if (req.body.password && req.body.password.trim().length >= 6) {
      const passwordHash = await bcrypt.hash(req.body.password.trim(), 10);
      await userModel.updatePassword(id, passwordHash);
    }

    await auditModel.logAction(req.user.id, 'UPDATE_INTERN', 'USER', id, {
      name,
      department,
      status,
      passwordUpdated: Boolean(req.body.password),
    });

    const updated = await internModel.getInternById(id);

    return res.status(200).json({
      success: true,
      message: 'Intern details updated successfully.',
      intern: updated,
    });
  } catch (error) {
    console.error('[UpdateIntern Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update intern.',
    });
  }
}

async function deleteIntern(req, res) {
  try {
    const { id } = req.params;
    const existing = await internModel.getInternById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found.',
      });
    }

    await userModel.deleteUser(id);

    await auditModel.logAction(req.user.id, 'DELETE_INTERN', 'USER', id, {
      name: existing.name,
      email: existing.email,
    });

    return res.status(200).json({
      success: true,
      message: `Intern "${existing.name}" was successfully removed.`,
    });
  } catch (error) {
    console.error('[DeleteIntern Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete intern.',
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const existing = await internModel.getInternById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Intern not found.',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await userModel.updatePassword(id, passwordHash);

    await auditModel.logAction(req.user.id, 'RESET_PASSWORD', 'USER', id, {
      internEmail: existing.email,
    });

    return res.status(200).json({
      success: true,
      message: `Password reset successfully for ${existing.name}.`,
    });
  } catch (error) {
    console.error('[ResetPassword Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset intern password.',
    });
  }
}

module.exports = {
  getInterns,
  getInternById,
  createIntern,
  updateIntern,
  deleteIntern,
  resetPassword,
};

