-- Add unique constraint for push_subscriptions to support ON CONFLICT
-- This allows users to have multiple subscriptions from different devices/browsers
-- but prevents duplicate subscriptions for the same endpoint

-- Drop existing records with duplicate (user_id, endpoint) combinations
-- Keep only the most recent one
DELETE FROM push_subscriptions a
USING push_subscriptions b
WHERE a.id < b.id
  AND a.user_id = b.user_id
  AND a.endpoint = b.endpoint;

-- Add unique constraint
ALTER TABLE push_subscriptions
  DROP CONSTRAINT IF EXISTS push_subscriptions_user_endpoint_key;

ALTER TABLE push_subscriptions
  ADD CONSTRAINT push_subscriptions_user_endpoint_key UNIQUE (user_id, endpoint);
