-- Add new fields to animal_reports table for NGO management and tracking

-- Add NGO assigned name field
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS assigned_ngo_name TEXT;

-- Add NGO contact number field
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS assigned_ngo_contact TEXT;

-- Add decline count field (tracks how many NGOs declined)
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS declined_count INTEGER DEFAULT 0;

-- Add rescue photo URL field
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS rescue_photo TEXT;

-- Add rescue completion time
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS rescued_at TIMESTAMPTZ;

-- Add last updated timestamp (already exists in schema, but ensuring it's there)
-- ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add notification tracking fields
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS last_ngo_notified_at TIMESTAMPTZ;
ALTER TABLE animal_reports ADD COLUMN IF NOT EXISTS last_ngo_notified_id UUID;

-- Create index for faster queries on status and area
CREATE INDEX IF NOT EXISTS idx_animal_reports_status_area ON animal_reports(status, area);
CREATE INDEX IF NOT EXISTS idx_animal_reports_updated_at ON animal_reports(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_animal_reports_last_notified ON animal_reports(last_ngo_notified_at);
