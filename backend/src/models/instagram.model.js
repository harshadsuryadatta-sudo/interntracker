const { query } = require('../config/database');

async function getAllAccounts() {
  const sql = `
    SELECT id, account_name, username, profile_image, instagram_account_id,
           followers_count, total_posts, last_post_id, last_post_date, last_post_url,
           last_post_thumbnail, last_synced_at, status, created_at, updated_at
    FROM instagram_accounts
    ORDER BY id ASC
  `;
  const res = await query(sql);
  return res.rows;
}

async function getAccountById(id) {
  const sql = `
    SELECT * FROM instagram_accounts WHERE id = $1
  `;
  const res = await query(sql, [id]);
  return res.rows[0] || null;
}

async function updateAccount(id, {
  accountName,
  followersCount,
  totalPosts,
  lastPostId,
  lastPostDate,
  lastPostUrl,
  lastPostThumbnail,
  profileImage,
  lastSyncedAt,
}) {
  const sql = `
    UPDATE instagram_accounts
    SET account_name = COALESCE($1, account_name),
        followers_count = COALESCE($2, followers_count),
        total_posts = COALESCE($3, total_posts),
        last_post_id = COALESCE($4, last_post_id),
        last_post_date = COALESCE($5, last_post_date),
        last_post_url = COALESCE($6, last_post_url),
        last_post_thumbnail = COALESCE($7, last_post_thumbnail),
        profile_image = COALESCE($8, profile_image),
        last_synced_at = COALESCE($9, CURRENT_TIMESTAMP),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
    RETURNING *
  `;
  const res = await query(sql, [
    accountName,
    followersCount,
    totalPosts,
    lastPostId,
    lastPostDate,
    lastPostUrl,
    lastPostThumbnail,
    profileImage,
    lastSyncedAt || new Date(),
    id,
  ]);
  return res.rows[0];
}


async function addPost(accountId, { postId, postUrl, thumbnailUrl, caption, postedAt }) {
  const sql = `
    INSERT INTO instagram_posts (instagram_account_id, instagram_post_id, post_url, thumbnail_url, caption, posted_at)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;
  const res = await query(sql, [accountId, postId, postUrl, thumbnailUrl, caption, postedAt]);
  return res.rows[0];
}

async function createAccount({
  accountName,
  username,
  profileImage,
  instagramAccountId,
  followersCount = 0,
  lastPostId = null,
  lastPostDate = null,
  lastPostUrl = null,
  lastPostThumbnail = null,
}) {
  const cleanUsername = username.replace(/^@/, '').trim();
  const sql = `
    INSERT INTO instagram_accounts (
      account_name, username, profile_image, instagram_account_id,
      followers_count, last_post_id, last_post_date, last_post_url,
      last_post_thumbnail, last_synced_at, status
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, 'active')
    RETURNING *
  `;
  const res = await query(sql, [
    accountName,
    cleanUsername,
    profileImage || '/logos/suryadatta_crest.png',
    instagramAccountId || `ig_${cleanUsername}`,
    followersCount,
    lastPostId,
    lastPostDate || new Date(),
    lastPostUrl || `https://www.instagram.com/${cleanUsername}`,
    lastPostThumbnail || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=500&fit=crop',
  ]);
  return res.rows[0];
}

async function deleteAccount(id) {
  const sql = `DELETE FROM instagram_accounts WHERE id = $1 RETURNING *`;
  const res = await query(sql, [id]);
  return res.rows[0];
}

async function getRecentPosts(accountId, limit = 5) {
  const sql = `
    SELECT * FROM instagram_posts
    WHERE instagram_account_id = $1
    ORDER BY posted_at DESC
    LIMIT $2
  `;
  const res = await query(sql, [accountId, limit]);
  return res.rows;
}

module.exports = {

  getAllAccounts,
  getAccountById,
  updateAccount,
  createAccount,
  deleteAccount,
  addPost,
  getRecentPosts,
};


