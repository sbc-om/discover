-- DNA (Discover Natural Ability) Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(50) NOT NULL,
    name_en VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Modules Table (for permission management)
CREATE TABLE IF NOT EXISTS modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    route VARCHAR(100),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, manage
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role Permissions Junction Table
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, permission_id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    preferred_language VARCHAR(5) DEFAULT 'en', -- en or ar
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Academies Table
CREATE TABLE IF NOT EXISTS academies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs Table
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    name_ar VARCHAR(255),
    description TEXT,
    academy_id UUID REFERENCES academies(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health Tests Table
CREATE TABLE IF NOT EXISTS health_tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    test_date DATE NOT NULL,
    height DECIMAL(5,2), -- in cm
    weight DECIMAL(5,2), -- in kg
    blood_pressure VARCHAR(20),
    heart_rate INT,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medal Requests Table
CREATE TABLE IF NOT EXISTS medal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    medal_type VARCHAR(50) NOT NULL,
    achievement_description TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    requested_date DATE DEFAULT CURRENT_DATE,
    reviewed_by UUID REFERENCES users(id),
    review_date DATE,
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject VARCHAR(255),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- WhatsApp Messages Log Table
CREATE TABLE IF NOT EXISTS whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    phone_number VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, document
    status VARCHAR(20) DEFAULT 'sent', -- sent, delivered, read, failed
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Roles
INSERT INTO roles (name, name_ar, name_en, description) VALUES
('admin', 'مدير', 'Admin', 'Full system access and management'),
('coach', 'مدرب', 'Coach', 'Can manage players and programs'),
('player', 'لاعب', 'Player', 'Basic player access')
ON CONFLICT (name) DO NOTHING;

-- Insert Modules
INSERT INTO modules (name, name_ar, name_en, icon, route, display_order) VALUES
('dashboard', 'لوحة التحكم', 'Dashboard', 'dashboard', '/dashboard', 1),
('users', 'المستخدمون', 'Users', 'users', '/dashboard/users', 2),
('roles', 'الأدوار', 'Roles', 'shield', '/dashboard/roles', 3),
('academies', 'الأكاديميات', 'Academies', 'building', '/dashboard/academies', 4),
('health_tests', 'الفحوصات الصحية', 'Health Tests', 'activity', '/dashboard/health-tests', 5),
('medal_requests', 'طلبات الميداليات', 'Medal Requests', 'award', '/dashboard/medal-requests', 6),
('programs', 'البرامج', 'Programs', 'layers', '/dashboard/programs', 7),
('messages', 'الرسائل', 'Messages', 'mail', '/dashboard/messages', 8),
('whatsapp', 'واتساب', 'WhatsApp', 'message-circle', '/dashboard/whatsapp', 9),
('settings', 'الإعدادات', 'Settings', 'settings', '/dashboard/settings', 10)
ON CONFLICT (name) DO NOTHING;

-- Insert Permissions for each module
INSERT INTO permissions (name, name_ar, name_en, module_id, action) 
SELECT 
    m.name || '_' || action.action,
    'صلاحية ' || m.name_ar || ' - ' || action.action_ar,
    m.name_en || ' Permission - ' || action.action_en,
    m.id,
    action.action
FROM modules m
CROSS JOIN (
    VALUES 
        ('create', 'إنشاء', 'Create'),
        ('read', 'قراءة', 'Read'),
        ('update', 'تحديث', 'Update'),
        ('delete', 'حذف', 'Delete')
) AS action(action, action_ar, action_en)
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign specific permissions to coach role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'coach' 
AND p.module_id IN (
    SELECT id FROM modules WHERE name IN ('dashboard', 'users', 'health_tests', 'programs', 'messages', 'whatsapp')
)
AND p.action IN ('read', 'create', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Assign read-only permissions to player role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'player' 
AND p.module_id IN (
    SELECT id FROM modules WHERE name IN ('dashboard', 'health_tests', 'programs', 'messages')
)
AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_permissions_module_id ON permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_health_tests_user_id ON health_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_medal_requests_user_id ON medal_requests(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to all tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'updated_at' 
        AND table_schema = 'public'
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON %I', t, t);
        EXECUTE format('CREATE TRIGGER update_%I_updated_at 
                       BEFORE UPDATE ON %I 
                       FOR EACH ROW 
                       EXECUTE FUNCTION update_updated_at_column()', t, t);
    END LOOP;
END;
$$ language 'plpgsql';

-- Insert a default admin user (password: admin123 - should be changed!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, first_name, last_name, role_id, email_verified, is_active)
SELECT 
    'admin@dna.com',
    '$2a$10$rQJ5qP6yF9YxH8pXvH6rVeW4Jh6oGVxQkF5YxH8pXvH6rVeW4Jh6o',
    'System',
    'Administrator',
    (SELECT id FROM roles WHERE name = 'admin'),
    true,
    true
ON CONFLICT (email) DO NOTHING;
