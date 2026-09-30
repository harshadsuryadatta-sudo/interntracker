const env = require('../config/env');
const instagramModel = require('../models/instagram.model');
const auditModel = require('../models/audit.model');

/**
 * Service to sync Instagram account metrics and latest posts
 */
class InstagramService {
  async syncAccounts(userId = null) {
    console.log('[Instagram Sync] Starting synchronization process for Instagram accounts...');
    const accounts = await instagramModel.getAllAccounts();
    const syncTime = new Date();
    const results = [];

    const hasMetaApiCredentials = Boolean(env.INSTAGRAM_ACCESS_TOKEN);

    for (const acc of accounts) {
      try {
        let updatedData = {};

        if (hasMetaApiCredentials) {
          // Real Meta Graph API integration
          updatedData = await this.fetchFromMetaApi(acc);
        } else {
          // Live public scraper for exact live metrics
          const liveData = await this.fetchLivePublicMetrics(acc.username);
          if (liveData && liveData.followersCount !== null) {
            updatedData = {
              followersCount: liveData.followersCount,
              totalPosts: liveData.totalPosts || acc.total_posts,
              profileImage: liveData.profileImage || acc.profile_image,
              accountName: liveData.title || acc.account_name,
              lastPostId: acc.last_post_id,
              lastPostDate: acc.last_post_date,
              lastPostUrl: acc.last_post_url,
              lastPostThumbnail: acc.last_post_thumbnail,
            };
            console.log(`[Instagram Sync] Live data fetched for @${acc.username}: ${liveData.followersCount} followers, ${liveData.totalPosts} posts.`);
          } else {
            console.log(`[Instagram Sync] Keeping existing data for @${acc.username}`);
            updatedData = {
              followersCount: acc.followers_count,
              totalPosts: acc.total_posts,
              lastPostId: acc.last_post_id,
              lastPostDate: acc.last_post_date,
              lastPostUrl: acc.last_post_url,
              lastPostThumbnail: acc.last_post_thumbnail,
            };
          }
        }

        const updated = await instagramModel.updateAccount(acc.id, {
          ...updatedData,
          lastSyncedAt: syncTime,
        });

        // If new post found or updated
        if (updatedData.lastPostId && updatedData.lastPostId !== acc.last_post_id) {
          await instagramModel.addPost(acc.id, {
            postId: updatedData.lastPostId,
            postUrl: updatedData.lastPostUrl,
            thumbnailUrl: updatedData.lastPostThumbnail,
            caption: updatedData.lastPostCaption || 'Latest update from Instagram',
            postedAt: updatedData.lastPostDate,
          });
        }

        results.push(updated);
      } catch (err) {
        console.error(`[Instagram Sync] Failed to sync account @${acc.username}:`, err.message);
      }
    }

    // Log to audit trail
    await auditModel.logAction(
      userId,
      'SYNC_INSTAGRAM',
      'INSTAGRAM',
      accounts.length.toString(),
      { accountsSynced: results.length, syncedAt: syncTime }
    );

    console.log(`[Instagram Sync] Completed. Synchronized ${results.length} accounts.`);
    return {
      syncedCount: results.length,
      syncedAt: syncTime,
      accounts: results,
    };
  }

  async fetchLivePublicMetrics(username) {
    try {
      const url = `https://www.instagram.com/${username}/`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        }
      });
      if (res.ok) {
        const html = await res.text();
        const ogDesc = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description)["']\s+content=["']([^"']+)["']/i);
        const ogImage = html.match(/<meta\s+(?:property|name)=["'](?:og:image|image)["']\s+content=["']([^"']+)["']/i);
        const ogTitle = html.match(/<meta\s+(?:property|name)=["'](?:og:title|title)["']\s+content=["']([^"']+)["']/i);

        let followersCount = null;
        let totalPosts = null;

        if (ogDesc) {
          const parts = ogDesc[1].match(/([0-9.,KMBkmb]+)\s+Followers,\s+([0-9.,KMBkmb]+)\s+Following,\s+([0-9.,KMBkmb]+)\s+Posts/i);
          if (parts) {
            let rawF = parts[1].replace(/,/g, '');
            if (rawF.toLowerCase().endsWith('k')) {
              followersCount = Math.round(parseFloat(rawF) * 1000);
            } else if (rawF.toLowerCase().endsWith('m')) {
              followersCount = Math.round(parseFloat(rawF) * 1000000);
            } else {
              followersCount = parseInt(rawF, 10);
            }

            let rawP = parts[3].replace(/,/g, '');
            totalPosts = parseInt(rawP, 10);
          }
        }

        let cleanImage = null;
        if (ogImage) {
          cleanImage = ogImage[1].replace(/&amp;/g, '&');
        }

        let cleanTitle = null;
        if (ogTitle) {
          cleanTitle = ogTitle[1]
            .replace(/&#064;/g, '@')
            .replace(/&#x2022;/g, '•')
            .replace(/\s*•\s*Instagram.*$/i, '')
            .trim();
        }

        return {
          followersCount,
          totalPosts,
          profileImage: cleanImage,
          title: cleanTitle,
        };
      }
    } catch (err) {
      console.warn(`[Instagram Sync] Live fetch failed for @${username}:`, err.message);
    }
    return null;
  }

  async fetchFromMetaApi(acc) {
    const url = `https://graph.facebook.com/v19.0/${acc.instagram_account_id}?fields=followers_count,media.limit(1){id,caption,media_type,media_url,permalink,timestamp}&access_token=${env.INSTAGRAM_ACCESS_TOKEN}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const latestMedia = data.media && data.media.data && data.media.data[0];

    return {
      followersCount: data.followers_count || acc.followers_count,
      lastPostId: latestMedia ? latestMedia.id : acc.last_post_id,
      lastPostDate: latestMedia ? new Date(latestMedia.timestamp) : acc.last_post_date,
      lastPostUrl: latestMedia ? latestMedia.permalink : acc.last_post_url,
      lastPostThumbnail: latestMedia ? latestMedia.media_url : acc.last_post_thumbnail,
      lastPostCaption: latestMedia ? latestMedia.caption : null,
    };
  }
}

module.exports = new InstagramService();

