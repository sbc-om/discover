-- Add additional physical test metrics
ALTER TABLE health_tests
    ADD COLUMN IF NOT EXISTS balance_score INT,
    ADD COLUMN IF NOT EXISTS reaction_score INT,
    ADD COLUMN IF NOT EXISTS coordination_score INT,
    ADD COLUMN IF NOT EXISTS flexibility_score INT;
