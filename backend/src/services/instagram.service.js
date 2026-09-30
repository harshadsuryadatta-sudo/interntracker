const env = require('../config/env');
const instagramModel = require('../models/instagram.model');
const auditModel = require('../models/audit.model');

/**
 * Service to sync Instagram account metrics and latest posts
 * Priority: 1) Meta Graph API  2) RapidAPI scraper  3) Fallback to existing data
 */
class InstagramService {
  async syncAccounts(userId = null) {
    console.log('[Instagram Sync] Starting synchronization...');
    const accounts = await instagramModel.getAllAccounts();
    const syncTime = new Date();
    const results = [];

    for (const acc of accounts) {
      try {
        let updatedData = {};

        if (env.INSTAGRAM_ACCESS_TOKEN) {
          // Priority 1: Official Meta Graph API
          updatedData = await this.fetchFromMetaApi(acc);
          console.log(`[Instagram Sync] Meta API data for @${acc.username}`);
        } else if (env.RAPIDAPI_KEY) {
          // Priority 2: RapidAPI Instagram Scraper
          const rapidData = await this.fetchFromRapidApi(acc.username);
          if (rapidData) {
            updatedData = {
              followersCount: rapidData.followersCount ?? acc.followers_count,
              totalPosts: rapidData.totalPosts ?? acc.total_posts,
              profileImage: rapidData.profileImage || acc.profile_image,
              accountName: rapidData.fullName || acc.account_name,
              lastPostId: rapidData.lastPostId || acc.last_post_id,
              lastPostDate: rapidData.lastPostDate || acc.last_post_date,
              lastPostUrl: rapidData.lastPostUrl || acc.last_post_url,
              lastPostThumbnail: rapidData.lastPostThumbnail || acc.last_post_thumbnail,
              lastPostCaption: rapidData.lastPostCaption || null,
            };
            console.log(`[Instagram Sync] RapidAPI: @${acc.username} → ${rapidData.followersCount} followers`);
          } else {
            console.log(`[Instagram Sync] RapidAPI returned empty for @${acc.username}, keeping existing data`);
            updatedData = this.keepExistingData(acc);
          }
        } else {
          // Priority 3: No API configured — keep existing data
          console.log(`[Instagram Sync] No API key configured, keeping existing data for @${acc.username}`);
          updatedData = this.keepExistingData(acc);
        }

        const updated = await instagramModel.updateAccount(acc.id, {
          ...updatedData,
          lastSyncedAt: syncTime,
        });

        // If a new post was found, store it in the posts table
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
        console.error(`[Instagram Sync] Failed for @${acc.username}:`, err.message);
        results.push(acc);
      }
    }

    await auditModel.logAction(
      userId,
      'SYNC_INSTAGRAM',
      'INSTAGRAM',
      accounts.length.toString(),
      { accountsSynced: results.length, syncedAt: syncTime }
    );

    console.log(`[Instagram Sync] Done. Synced ${results.length} accounts.`);
    return { syncedCount: results.length, syncedAt: syncTime, accounts: results };
  }

  keepExistingData(acc) {
    return {
      followersCount: acc.followers_count,
      totalPosts: acc.total_posts,
      profileImage: acc.profile_image,
      accountName: acc.account_name,
      lastPostId: acc.last_post_id,
      lastPostDate: acc.last_post_date,
      lastPostUrl: acc.last_post_url,
      lastPostThumbnail: acc.last_post_thumbnail,
    };
  }

  /**
   * Fetch Instagram profile data using RapidAPI Instagram Scraper
   * Uses the "Instagram Scraper API2" by social-data on RapidAPI
   */
  async fetchFromRapidApi(username) {
    try {
      // Fetch profile info
      const profileRes = await fetch(
        `https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`,
        {
          method: 'GET',
          headers: {
            'x-rapidapi-key': env.RAPIDAPI_KEY,
            'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
          },
        }
      );

      if (!profileRes.ok) {
        console.warn(`[RapidAPI] Profile fetch failed for @${username}: ${profileRes.status}`);
        return null;
      }

      const profileData = await profileRes.json();
      const user = profileData?.data;

      if (!user) {
        console.warn(`[RapidAPI] No user data for @${username}`);
        return null;
      }

      const followersCount = user.follower_count ?? user.edge_followed_by?.count ?? null;
      const totalPosts = user.media_count ?? user.edge_owner_to_timeline_media?.count ?? null;
      const profileImage = user.profile_pic_url_hd || user.profile_pic_url || null;
      const fullName = user.full_name || null;

      // Fetch latest post
      let lastPostId = null, lastPostDate = null, lastPostUrl = null,
          lastPostThumbnail = null, lastPostCaption = null;

      try {
        const postsRes = await fetch(
          `https://instagram-scraper-api2.p.rapidapi.com/v1/posts?username_or_id_or_url=${username}&count=1`,
          {
            method: 'GET',
            headers: {
              'x-rapidapi-key': env.RAPIDAPI_KEY,
              'x-rapidapi-host': 'instagram-scraper-api2.p.rapidapi.com',
            },
          }
        );

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          const latestPost = postsData?.data?.items?.[0];

          if (latestPost) {
            lastPostId = latestPost.id || latestPost.pk || null;
            lastPostDate = latestPost.taken_at
              ? new Date(latestPost.taken_at * 1000)
              : null;
            lastPostUrl = latestPost.code
              ? `https://www.instagram.com/p/${latestPost.code}/`
              : `https://www.instagram.com/${username}/`;
            lastPostThumbnail =
              latestPost.image_versions2?.candidates?.[0]?.url ||
              latestPost.thumbnail_url ||
              latestPost.display_url ||
              null;
            lastPostCaption = latestPost.caption?.text || null;
          }
        }
      } catch (postErr) {
        console.warn(`[RapidAPI] Posts fetch failed for @${username}:`, postErr.message);
      }

      return {
        followersCount,
        totalPosts,
        profileImage,
        fullName,
        lastPostId,
        lastPostDate,
        lastPostUrl,
        lastPostThumbnail,
        lastPostCaption,
      };
    } catch (err) {
      console.error(`[RapidAPI] Error for @${username}:`, err.message);
      return null;
    }
  }

  /**
   * Fetch using official Meta Graph API
   */
  async fetchFromMetaApi(acc) {
    const url = `https://graph.facebook.com/v19.0/${acc.instagram_account_id}?fields=followers_count,media.limit(1){id,caption,media_type,media_url,permalink,timestamp}&access_token=${env.INSTAGRAM_ACCESS_TOKEN}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Meta API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    const latestMedia = data.media?.data?.[0];

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
