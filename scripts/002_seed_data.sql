-- Seed NGOs and Helplines
INSERT INTO ngos (name, phone, areas, type) VALUES
  ('People For Animals (PFA)', '011-23719293', ARRAY['All India'], 'ngo'),
  ('Blue Cross of India', '044-22354959', ARRAY['Chennai', 'Tamil Nadu'], 'ngo'),
  ('Animal Aid Unlimited', '0294-2420024', ARRAY['Udaipur', 'Rajasthan'], 'ngo'),
  ('Friendicoes SECA', '011-24314787', ARRAY['Delhi NCR'], 'ngo'),
  ('Wildlife SOS', '1800-599-3030', ARRAY['All India'], 'helpline'),
  ('SPCA India', '022-26854756', ARRAY['Mumbai', 'Maharashtra'], 'ngo'),
  ('Animal Welfare Board', '044-22300072', ARRAY['All India'], 'helpline');

-- Seed sample animal reports
INSERT INTO animal_reports (animal_type, location, area, status, reporter_name, reporter_contact, notes, lat, lng, reported_at) VALUES
  ('dog', 'Near Lajpat Nagar Metro Station', 'South Delhi', 'pending', 'Rahul Kumar', '9876543210', 'Injured leg, needs immediate help', 28.5699, 77.2393, NOW() - INTERVAL '2 hours'),
  ('cat', 'Hauz Khas Village', 'South Delhi', 'notified', 'Priya Sharma', '9876543211', 'Stuck in tree, meowing loudly', 28.5494, 77.2001, NOW() - INTERVAL '5 hours'),
  ('cow', 'Main Road, Connaught Place', 'Central Delhi', 'rescued', 'Amit Singh', '9876543212', 'Was blocking traffic, safely relocated', 28.6315, 77.2167, NOW() - INTERVAL '1 day'),
  ('dog', 'Sarojini Nagar Market', 'South Delhi', 'pending', 'Neha Gupta', '9876543213', 'Puppy alone, seems lost', 28.5785, 77.2056, NOW() - INTERVAL '30 minutes'),
  ('bird', 'Lodhi Garden', 'Central Delhi', 'notified', 'Vikram Rao', '9876543214', 'Injured peacock near main entrance', 28.5915, 77.2193, NOW() - INTERVAL '3 hours');
