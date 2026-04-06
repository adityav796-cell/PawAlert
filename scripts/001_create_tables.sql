-- Create enum types
CREATE TYPE animal_type AS ENUM ('dog', 'cat', 'cow', 'bird', 'other');
CREATE TYPE rescue_status AS ENUM ('pending', 'notified', 'rescued');
CREATE TYPE org_type AS ENUM ('ngo', 'helpline');

-- Create NGOs/Helplines table
CREATE TABLE IF NOT EXISTS ngos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  areas TEXT[] NOT NULL DEFAULT '{}',
  type org_type NOT NULL DEFAULT 'ngo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create Animal Reports table
CREATE TABLE IF NOT EXISTS animal_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_type animal_type NOT NULL,
  location TEXT NOT NULL,
  area TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status rescue_status NOT NULL DEFAULT 'pending',
  photo TEXT,
  reporter_name TEXT NOT NULL,
  reporter_contact TEXT NOT NULL,
  assigned_ngo UUID REFERENCES ngos(id),
  assigned_volunteer TEXT,
  notes TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE animal_reports ENABLE ROW LEVEL SECURITY;

-- NGOs: Allow public read access (everyone can see helplines)
CREATE POLICY "ngos_public_read" ON ngos FOR SELECT USING (true);

-- Animal Reports: Allow public read access (everyone can see reports)
CREATE POLICY "animal_reports_public_read" ON animal_reports FOR SELECT USING (true);

-- Animal Reports: Allow public insert (anyone can report an animal)
CREATE POLICY "animal_reports_public_insert" ON animal_reports FOR INSERT WITH CHECK (true);

-- Animal Reports: Allow public update (for status updates - in production, restrict this)
CREATE POLICY "animal_reports_public_update" ON animal_reports FOR UPDATE USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_animal_reports_status ON animal_reports(status);
CREATE INDEX idx_animal_reports_area ON animal_reports(area);
CREATE INDEX idx_animal_reports_reported_at ON animal_reports(reported_at DESC);
CREATE INDEX idx_ngos_type ON ngos(type);
