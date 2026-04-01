-- Children's Health Community Request Form — Admin Dashboard Schema

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK(status IN ('submitted','in_review','approved','denied','fulfilled')),
  submission_method TEXT NOT NULL DEFAULT 'form'
    CHECK(submission_method IN ('upload','paste','form','chat')),
  request_type TEXT NOT NULL DEFAULT 'event'
    CHECK(request_type IN ('mailing','event','both')),

  -- Contact info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  organization TEXT,
  email TEXT NOT NULL,
  phone TEXT,

  -- Additional notes
  notes TEXT,

  -- AI fields
  ai_classification TEXT, -- JSON blob
  ai_approved INTEGER DEFAULT 0,
  approved_by TEXT,
  approved_at TEXT,
  denial_reason TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS event_details (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  event_name TEXT,
  event_date TEXT,
  start_time TEXT,
  end_time TEXT,
  estimated_attendance INTEGER,
  audience_type TEXT, -- JSON array
  topics TEXT, -- JSON array
  is_virtual INTEGER DEFAULT 0,
  requester_attending INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS location (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT DEFAULT 'UT',
  zip TEXT,
  county TEXT,
  indoor_outdoor TEXT CHECK(indoor_outdoor IN ('indoor','outdoor','both')),
  parking_instructions TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS materials_requested (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  material_key TEXT NOT NULL,
  material_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  category TEXT,
  has_digital INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shipping (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT DEFAULT 'UT',
  zip TEXT,
  county TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS virtual_details (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  meeting_link TEXT,
  platform TEXT CHECK(platform IN ('zoom','teams','other')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS activity_log (
  id TEXT PRIMARY KEY,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'system',
  details TEXT, -- JSON
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS staff_members (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL,
  availability TEXT, -- JSON
  expertise TEXT, -- JSON array of topic keys
  service_area TEXT, -- JSON array of counties/zips
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_request_type ON submissions(request_type);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_event_details_submission ON event_details(submission_id);
CREATE INDEX IF NOT EXISTS idx_event_details_date ON event_details(event_date);
CREATE INDEX IF NOT EXISTS idx_materials_submission ON materials_requested(submission_id);
CREATE INDEX IF NOT EXISTS idx_location_submission ON location(submission_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_submission ON activity_log(submission_id);
