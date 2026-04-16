-- whatdotheymake.com — D1 Schema
-- No users table. No ad-tech tracking. Just salaries.

CREATE TABLE IF NOT EXISTS salaries (
  id TEXT PRIMARY KEY,
  job_title TEXT NOT NULL,
  salary INTEGER NOT NULL,
  pay_type TEXT DEFAULT 'salary',
  bonus_percent INTEGER,
  company TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  currency_code TEXT DEFAULT 'USD',
  years_experience INTEGER,
  level TEXT,
  work_mode TEXT,
  equity_value INTEGER,
  education TEXT,
  is_dropout INTEGER DEFAULT 0,
  education_debt INTEGER,
  car TEXT,
  report_count INTEGER DEFAULT 0,
  is_anonymized INTEGER DEFAULT 0,
  -- For new rows this stores a SHA-256 hash of the management token.
  -- Legacy rows may still contain plaintext tokens.
  delete_token TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for search and sort
CREATE INDEX IF NOT EXISTS idx_salaries_job_title ON salaries(job_title COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_salaries_company ON salaries(company COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS idx_salaries_salary ON salaries(salary);
CREATE INDEX IF NOT EXISTS idx_salaries_created_at ON salaries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_salaries_is_dropout ON salaries(is_dropout);
CREATE INDEX IF NOT EXISTS idx_salaries_country_currency ON salaries(country, currency_code);
CREATE INDEX IF NOT EXISTS idx_salaries_report_count ON salaries(report_count);

-- Salary history / promotions timeline
CREATE TABLE IF NOT EXISTS salary_history (
  id TEXT PRIMARY KEY,
  salary_id TEXT NOT NULL,
  year INTEGER NOT NULL,
  job_title TEXT NOT NULL,
  salary INTEGER NOT NULL,
  company TEXT,
  sort_order INTEGER DEFAULT 0,
  FOREIGN KEY (salary_id) REFERENCES salaries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_salary_history_salary_id ON salary_history(salary_id);

-- Submission management audit trail
CREATE TABLE IF NOT EXISTS submission_audit (
  id TEXT PRIMARY KEY,
  salary_id TEXT NOT NULL,
  event_type TEXT NOT NULL, -- created | edited
  summary TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (salary_id) REFERENCES salaries(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submission_audit_salary_id ON submission_audit(salary_id, created_at DESC);

-- Poll votes — shared across all users
CREATE TABLE IF NOT EXISTS poll_votes (
  poll_id TEXT NOT NULL,
  option_index INTEGER NOT NULL,
  vote_count INTEGER DEFAULT 0,
  PRIMARY KEY (poll_id, option_index)
);


-- Product feedback submissions
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
