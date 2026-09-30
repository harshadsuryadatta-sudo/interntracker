const instagramModel = require('../models/instagram.model');
const instagramService = require('../services/instagram.service');
const { timeAgo } = require('../utils/time');

async function getAccounts(req, res) {
  try {
    const rawAccounts = await instagramModel.getAllAccounts();

    // Send raw data — let the frontend format dates in the user's local timezone
    const accounts = rawAccounts.map(acc => ({ ...acc }));

    let latestSync = null;
    for (const acc of rawAccounts) {
      if (acc.last_synced_at) {
        const d = new Date(acc.last_synced_at);
        if (!latestSync || d > latestSync) {
          latestSync = d;
        }
      }
    }

    return res.status(200).json({
      success: true,
      count: accounts.length,
      lastSyncedAt: latestSync ? latestSync.toISOString() : null,
      accounts,
    });
  } catch (error) {
    console.error('[GetAccounts Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to load Instagram data. Showing the last successfully synchronized data.',
    });
  }
}

async function getAccountById(req, res) {
  try {
    const { id } = req.params;
    const account = await instagramModel.getAccountById(id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Instagram account not found.',
      });
    }

    const posts = await instagramModel.getRecentPosts(id, 10);

    return res.status(200).json({
      success: true,
      account: {
        ...account,
        timeSinceLastPost: timeAgo(account.last_post_date),
      },
      posts,
    });
  } catch (error) {
    console.error('[GetAccountById Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Instagram account details.',
    });
  }
}

async function syncNow(req, res) {
  try {
    const result = await instagramService.syncAccounts(req.user.id);

    return res.status(200).json({
      success: true,
      message: `Successfully synchronized ${result.syncedCount} Instagram accounts.`,
      syncedAt: result.syncedAt,
    });
  } catch (error) {
    console.error('[SyncNow Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Instagram synchronization failed. Showing last successfully synchronized data.',
    });
  }
}

async function createAccount(req, res) {
  try {
    const { accountName, username, profileImage, followersCount, lastPostUrl } = req.body;
    if (!accountName || !username) {
      return res.status(400).json({
        success: false,
        message: 'Account name and Instagram handle/username are required.',
      });
    }

    const cleanUsername = username.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/.*$/, '').replace(/^@/, '').trim();

    const newAccount = await instagramModel.createAccount({
      accountName,
      username: cleanUsername,
      profileImage,
      followersCount: followersCount || 10000,
      lastPostUrl: lastPostUrl || `https://www.instagram.com/${cleanUsername}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Instagram account added successfully.',
      account: newAccount,
    });
  } catch (error) {
    console.error('[CreateAccount Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to add Instagram account.',
    });
  }
}

async function updateAccount(req, res) {
  try {
    const { id } = req.params;
    const {
      accountName,
      followersCount,
      totalPosts,
      lastPostDate,
      lastPostUrl,
      lastPostThumbnail,
      lastPostCaption,
      profileImage,
    } = req.body;

    const updated = await instagramModel.updateAccount(id, {
      accountName,
      followersCount: followersCount !== undefined ? parseInt(followersCount, 10) : undefined,
      totalPosts: totalPosts !== undefined ? parseInt(totalPosts, 10) : undefined,
      lastPostDate: lastPostDate ? new Date(lastPostDate) : undefined,
      lastPostUrl,
      lastPostThumbnail,
      profileImage,
    });

    if (lastPostUrl || lastPostThumbnail || lastPostCaption) {
      await instagramModel.addPost(id, {
        postId: `post_${id}_${Date.now()}`,
        postUrl: lastPostUrl || updated.last_post_url,
        thumbnailUrl: lastPostThumbnail || updated.last_post_thumbnail,
        caption: lastPostCaption || 'Latest post update',
        postedAt: lastPostDate ? new Date(lastPostDate) : new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Instagram account and latest post updated successfully.',
      account: updated,
    });
  } catch (error) {
    console.error('[UpdateAccount Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update Instagram account.',
    });
  }
}


async function deleteAccount(req, res) {
  try {
    const { id } = req.params;
    const deleted = await instagramModel.deleteAccount(id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Instagram account not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Instagram account removed successfully.',
    });
  } catch (error) {
    console.error('[DeleteAccount Controller Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete Instagram account.',
    });
  }
}

module.exports = {
  getAccounts,
  getAccountById,
  syncNow,
  createAccount,
  updateAccount,
  deleteAccount,
};


