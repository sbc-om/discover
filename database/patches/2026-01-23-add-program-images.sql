-- Add image URLs for programs and program levels

ALTER TABLE programs
  ADD COLUMN IF NOT EXISTS image_url TEXT;

ALTER TABLE program_levels
  ADD COLUMN IF NOT EXISTS image_url TEXT;
