-- Schema for Intern Report Tracker
-- PostgreSQL Production Database

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'intern', -- 'admin', 'intern'
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'disabled'
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS intern_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  department VARCHAR(100),
  joining_date DATE,
  phone VARCHAR(50),
  profile_photo TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_reports (
  id SERIAL PRIMARY KEY,
  intern_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,
  in_time VARCHAR(20),
  out_time VARCHAR(20),
  working_minutes INTEGER DEFAULT 0,
  work_completed TEXT,
  tasks_completed TEXT,
  pending_work TEXT,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'submitted'
  attachments TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  submitted_at TIMESTAMPTZ,
  updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT uq_intern_report_date UNIQUE (intern_id, report_date)
);

CREATE TABLE IF NOT EXISTS attendance (
  id SERIAL PRIMARY KEY,
  intern_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  attendance_date DATE NOT NULL,
  in_time VARCHAR(20),
  out_time VARCHAR(20),
  working_minutes INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'present', -- 'present', 'absent', 'half_day'
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_intern_attendance_date UNIQUE (intern_id, attendance_date)
);

CREATE TABLE IF NOT EXISTS instagram_accounts (
  id SERIAL PRIMARY KEY,
  account_name VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL UNIQUE,
  profile_image TEXT,
  instagram_account_id VARCHAR(100),
  followers_count INTEGER DEFAULT 0,
  total_posts INTEGER DEFAULT 0,
  last_post_id VARCHAR(100),
  last_post_date TIMESTAMPTZ,
  last_post_url TEXT,
  last_post_thumbnail TEXT,
  last_synced_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS instagram_posts (
  id SERIAL PRIMARY KEY,
  instagram_account_id INTEGER NOT NULL REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  instagram_post_id VARCHAR(100),
  post_url TEXT,
  thumbnail_url TEXT,
  caption TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id VARCHAR(100),
  timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_reports_intern_date ON daily_reports(intern_id, report_date);
CREATE INDEX IF NOT EXISTS idx_attendance_intern_date ON attendance(intern_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_instagram_accounts_username ON instagram_accounts(username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
