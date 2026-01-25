-- Add site_settings table for admin configuration
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES users(id)
);

-- Insert default settings
INSERT INTO site_settings (setting_key, setting_value) VALUES
  ('font_arabic', 'IBM Plex Sans Arabic'),
  ('font_english', 'Inter'),
  ('font_size_base', '16'),
  ('font_size_heading_1', '48'),
  ('font_size_heading_2', '36'),
  ('font_size_heading_3', '24'),
  ('font_size_heading_4', '20')
ON CONFLICT (setting_key) DO NOTHING;

-- Grant permissions
GRANT SELECT ON site_settings TO academy_manager, coach, player;
GRANT ALL ON site_settings TO admin;
GRANT USAGE, SELECT ON SEQUENCE site_settings_id_seq TO admin;
