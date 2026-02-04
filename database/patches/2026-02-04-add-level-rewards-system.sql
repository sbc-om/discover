-- Level Rewards System
-- Allows defining automatic rewards (virtual/physical medals) for completing level requirements

-- Create level_rewards table to store reward configurations for each level
CREATE TABLE IF NOT EXISTS level_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    
    -- Reward type: 'virtual' (automatic badge/achievement) or 'physical' (creates medal request)
    reward_type VARCHAR(20) NOT NULL CHECK (reward_type IN ('virtual', 'physical')),
    
    -- What triggers this reward
    trigger_type VARCHAR(30) NOT NULL CHECK (trigger_type IN ('sessions_completed', 'points_earned', 'level_completed')),
    trigger_value INTEGER, -- e.g., 10 sessions, 100 points (NULL for level_completed)
    
    -- Reward details
    title VARCHAR(200) NOT NULL,
    title_ar VARCHAR(200),
    description TEXT,
    description_ar TEXT,
    badge_icon_url TEXT, -- Icon/image for the badge/medal
    
    -- For physical medals
    medal_type VARCHAR(50), -- e.g., 'gold', 'silver', 'bronze', 'participation'
    
    -- For virtual rewards - link to existing achievement (optional)
    achievement_id UUID REFERENCES achievements(id) ON DELETE SET NULL,
    
    -- Notification settings
    notify_player BOOLEAN DEFAULT true,
    notify_coach BOOLEAN DEFAULT true,
    notify_parent BOOLEAN DEFAULT false,
    
    -- Display settings
    display_order INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create player_level_progress table to track player progress in levels
CREATE TABLE IF NOT EXISTS player_level_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    
    -- Progress tracking
    sessions_completed INTEGER DEFAULT 0,
    points_earned INTEGER DEFAULT 0,
    
    -- Level completion status
    level_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP,
    
    -- Timestamps
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, level_id)
);

-- Create player_rewards table to track awarded rewards
CREATE TABLE IF NOT EXISTS player_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level_reward_id UUID NOT NULL REFERENCES level_rewards(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES program_levels(id) ON DELETE CASCADE,
    
    -- Award status
    status VARCHAR(30) NOT NULL DEFAULT 'awarded' CHECK (status IN ('awarded', 'pending_delivery', 'delivered', 'cancelled')),
    
    -- For physical medals - links to medal_requests
    medal_request_id UUID REFERENCES medal_requests(id) ON DELETE SET NULL,
    
    -- For virtual medals - links to player_achievements
    player_achievement_id UUID REFERENCES player_achievements(id) ON DELETE SET NULL,
    
    -- Award details
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    awarded_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL means auto-awarded
    note TEXT,
    
    -- Notification tracking
    player_notified BOOLEAN DEFAULT false,
    coach_notified BOOLEAN DEFAULT false,
    parent_notified BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, level_reward_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_level_rewards_level_id ON level_rewards(level_id);
CREATE INDEX IF NOT EXISTS idx_level_rewards_trigger_type ON level_rewards(trigger_type);
CREATE INDEX IF NOT EXISTS idx_player_level_progress_user_id ON player_level_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_player_level_progress_level_id ON player_level_progress(level_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_user_id ON player_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_level_reward_id ON player_rewards(level_reward_id);
CREATE INDEX IF NOT EXISTS idx_player_rewards_status ON player_rewards(status);

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_level_rewards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_level_rewards_updated_at ON level_rewards;
CREATE TRIGGER update_level_rewards_updated_at
    BEFORE UPDATE ON level_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_level_rewards_updated_at();

DROP TRIGGER IF EXISTS update_player_level_progress_updated_at ON player_level_progress;
CREATE TRIGGER update_player_level_progress_updated_at
    BEFORE UPDATE ON player_level_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_level_rewards_updated_at();

DROP TRIGGER IF EXISTS update_player_rewards_updated_at ON player_rewards;
CREATE TRIGGER update_player_rewards_updated_at
    BEFORE UPDATE ON player_rewards
    FOR EACH ROW
    EXECUTE FUNCTION update_level_rewards_updated_at();

-- Grant permissions for the new tables
-- Admin gets all permissions
INSERT INTO permissions (name, name_ar, name_en, module_id, action)
SELECT 'programs_manage_rewards', 'إدارة المكافآت', 'Manage Rewards', id, 'manage_rewards'
FROM modules WHERE name = 'programs';

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin' AND p.name = 'programs_manage_rewards';
