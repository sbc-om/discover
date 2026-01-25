-- Update medal_requests status to support more statuses
-- Status flow: pending -> approved/rejected -> preparing -> shipped -> delivered

-- Update status column to support new values
COMMENT ON COLUMN medal_requests.status IS 'Status: pending, approved, rejected, preparing, shipped, delivered';

-- Add shipping_date column
ALTER TABLE medal_requests
ADD COLUMN IF NOT EXISTS shipping_date DATE;

-- Add tracking_number column for physical shipping
ALTER TABLE medal_requests
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100);

-- Add delivered_at column
ALTER TABLE medal_requests
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP;
