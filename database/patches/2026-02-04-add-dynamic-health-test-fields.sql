-- Dynamic Health Test Fields System for Programs
-- This allows each program to define its own custom health test metrics/fields

-- Table to define health test field types for each program
CREATE TABLE IF NOT EXISTS program_health_test_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    field_key VARCHAR(100) NOT NULL, -- unique key for the field (e.g., 'speed_test', 'agility_score')
    field_name VARCHAR(255) NOT NULL, -- English name
    field_name_ar VARCHAR(255), -- Arabic name
    field_type VARCHAR(50) NOT NULL DEFAULT 'number', -- number, text, select, boolean, date, range
    field_unit VARCHAR(50), -- e.g., 'seconds', 'cm', 'kg', 'bpm'
    field_unit_ar VARCHAR(50), -- Arabic unit
    field_options JSONB, -- For 'select' type: [{value: 'good', label: 'Good', label_ar: 'جيد'}, ...]
    min_value DECIMAL(10,2), -- For 'number' or 'range' type
    max_value DECIMAL(10,2), -- For 'number' or 'range' type
    is_required BOOLEAN DEFAULT false,
    display_order INT DEFAULT 0,
    description TEXT,
    description_ar TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(program_id, field_key)
);

-- Table to store player health test results with dynamic fields
CREATE TABLE IF NOT EXISTS player_health_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    health_test_id UUID NOT NULL REFERENCES health_tests(id) ON DELETE CASCADE,
    field_id UUID NOT NULL REFERENCES program_health_test_fields(id) ON DELETE CASCADE,
    value_text TEXT, -- For text/select fields
    value_number DECIMAL(15,4), -- For number/range fields
    value_boolean BOOLEAN, -- For boolean fields
    value_date DATE, -- For date fields
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(health_test_id, field_id)
);

-- Add program_id to health_tests for linking tests to specific programs
ALTER TABLE health_tests ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES programs(id) ON DELETE SET NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_program_health_test_fields_program_id ON program_health_test_fields(program_id);
CREATE INDEX IF NOT EXISTS idx_program_health_test_fields_display_order ON program_health_test_fields(program_id, display_order);
CREATE INDEX IF NOT EXISTS idx_player_health_test_results_health_test_id ON player_health_test_results(health_test_id);
CREATE INDEX IF NOT EXISTS idx_player_health_test_results_field_id ON player_health_test_results(field_id);
CREATE INDEX IF NOT EXISTS idx_health_tests_program_id ON health_tests(program_id);

-- Comments for documentation
COMMENT ON TABLE program_health_test_fields IS 'Defines custom health test fields/metrics for each program';
COMMENT ON TABLE player_health_test_results IS 'Stores dynamic health test results for players based on program-specific fields';
COMMENT ON COLUMN program_health_test_fields.field_type IS 'Field type: number, text, select, boolean, date, range';
COMMENT ON COLUMN program_health_test_fields.field_options IS 'JSON array of options for select type fields';
COMMENT ON COLUMN health_tests.program_id IS 'Links health test to a specific program for dynamic field validation';
