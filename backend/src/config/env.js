const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'dev_jwt_secret_key_intern_tracker_2026_super_secure',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev_cookie_secret_key_intern_tracker_2026',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  // Instagram Meta API configuration
  INSTAGRAM_APP_ID: process.env.INSTAGRAM_APP_ID || '',
  INSTAGRAM_APP_SECRET: process.env.INSTAGRAM_APP_SECRET || '',
  INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN || '',
  // RapidAPI Instagram Scraper
  RAPIDAPI_KEY: process.env.RAPIDAPI_KEY || '',
};


