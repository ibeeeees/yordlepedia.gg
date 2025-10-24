// db.js - Database models and queries
const pool = require("./db-pool");

const db = {
  // User operations
  async createUser(cognitoId, riotPuuid, gameName, tagLine, profilePicUrl) {
    try {
      const result = await pool.query(
        `INSERT INTO users (cognito_id, riot_puuid, username, gameName, tagLine, profile_pic_url)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [cognitoId, riotPuuid, `${gameName}#${tagLine}`, gameName, tagLine, profilePicUrl]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  },

  async getUserByCognitoId(cognitoId) {
    try {
      const result = await pool.query(
        `SELECT * FROM users WHERE cognito_id = $1`,
        [cognitoId]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Get user by cognito ID error:", error);
      throw error;
    }
  },

  async getUserByUsername(username) {
    try {
      const result = await pool.query(
        `SELECT * FROM users WHERE username = $1`,
        [username]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Get user by username error:", error);
      throw error;
    }
  },

  async updateUserProfile(userId, { bio, bannerVideoUrl, profilePicUrl }) {
    try {
      const updates = [];
      const params = [userId];
      let paramCount = 2;

      if (bio !== undefined) {
        updates.push(`bio = $${paramCount++}`);
        params.push(bio);
      }
      if (bannerVideoUrl !== undefined) {
        updates.push(`banner_video_url = $${paramCount++}`);
        params.push(bannerVideoUrl);
      }
      if (profilePicUrl !== undefined) {
        updates.push(`profile_pic_url = $${paramCount++}`);
        params.push(profilePicUrl);
      }

      if (updates.length === 0) return null;

      updates.push(`updated_at = CURRENT_TIMESTAMP`);

      const result = await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $1 RETURNING *`,
        params
      );
      return result.rows[0];
    } catch (error) {
      console.error("Update user profile error:", error);
      throw error;
    }
  },

  // Post operations
  async createPost(userId, { clipUrl, caption, videoDuration }) {
    try {
      const result = await pool.query(
        `INSERT INTO posts (user_id, clip_url, caption, video_duration)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, clipUrl, caption, videoDuration]
      );
      return result.rows[0];
    } catch (error) {
      console.error("Create post error:", error);
      throw error;
    }
  },

  async getPostsByUserId(userId, limit = 20, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT p.*, u.username, u.profile_pic_url FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Get posts by user ID error:", error);
      throw error;
    }
  },

  async getFeed(userId, limit = 20, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT p.*, u.username, u.profile_pic_url,
                CASE WHEN l.id IS NOT NULL THEN true ELSE false END as liked_by_user
         FROM posts p
         JOIN users u ON p.user_id = u.id
         LEFT JOIN follows f ON f.follower_id = $1 AND f.following_id = p.user_id
         LEFT JOIN likes l ON l.user_id = $1 AND l.post_id = p.id
         WHERE f.id IS NOT NULL OR p.user_id = $1
         ORDER BY p.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Get feed error:", error);
      throw error;
    }
  },

  // Follow operations
  async followUser(followerId, followingId) {
    try {
      const result = await pool.query(
        `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [followerId, followingId]
      );

      if (result.rows.length > 0) {
        await pool.query(
          `UPDATE users SET following_count = following_count + 1 WHERE id = $1`,
          [followerId]
        );
        await pool.query(
          `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`,
          [followingId]
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error("Follow user error:", error);
      throw error;
    }
  },

  async unfollowUser(followerId, followingId) {
    try {
      const result = await pool.query(
        `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId]
      );

      if (result.rowCount > 0) {
        await pool.query(
          `UPDATE users SET following_count = following_count - 1 WHERE id = $1`,
          [followerId]
        );
        await pool.query(
          `UPDATE users SET follower_count = follower_count - 1 WHERE id = $1`,
          [followingId]
        );
      }

      return result.rowCount > 0;
    } catch (error) {
      console.error("Unfollow user error:", error);
      throw error;
    }
  },

  async isFollowing(followerId, followingId) {
    try {
      const result = await pool.query(
        `SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2`,
        [followerId, followingId]
      );
      return result.rows.length > 0;
    } catch (error) {
      console.error("Is following error:", error);
      throw error;
    }
  },

  async getFollowers(userId, limit = 20, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT u.* FROM users u
         JOIN follows f ON f.follower_id = u.id
         WHERE f.following_id = $1
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Get followers error:", error);
      throw error;
    }
  },

  async getFollowing(userId, limit = 20, offset = 0) {
    try {
      const result = await pool.query(
        `SELECT u.* FROM users u
         JOIN follows f ON f.following_id = u.id
         WHERE f.follower_id = $1
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows;
    } catch (error) {
      console.error("Get following error:", error);
      throw error;
    }
  },

  // Like operations
  async likePost(userId, postId) {
    try {
      const result = await pool.query(
        `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING
         RETURNING *`,
        [userId, postId]
      );

      if (result.rows.length > 0) {
        await pool.query(
          `UPDATE posts SET likes_count = likes_count + 1 WHERE id = $1`,
          [postId]
        );
      }

      return result.rows[0];
    } catch (error) {
      console.error("Like post error:", error);
      throw error;
    }
  },

  async unlikePost(userId, postId) {
    try {
      const result = await pool.query(
        `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`,
        [userId, postId]
      );

      if (result.rowCount > 0) {
        await pool.query(
          `UPDATE posts SET likes_count = likes_count - 1 WHERE id = $1`,
          [postId]
        );
      }

      return result.rowCount > 0;
    } catch (error) {
      console.error("Unlike post error:", error);
      throw error;
    }
  }
};

module.exports = db;
