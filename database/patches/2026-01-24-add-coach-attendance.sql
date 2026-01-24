-- Add program attendance and scoring for coaches
CREATE TABLE IF NOT EXISTS program_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
    age_group_id UUID REFERENCES program_age_groups(id) ON DELETE SET NULL,
    attendance_date DATE NOT NULL,
    present BOOLEAN DEFAULT false,
    score INT CHECK (score >= 0 AND score <= 10),
    notes TEXT,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, program_id, attendance_date)
);

CREATE INDEX IF NOT EXISTS idx_program_attendance_user_date ON program_attendance(user_id, attendance_date);
CREATE INDEX IF NOT EXISTS idx_program_attendance_program_date ON program_attendance(program_id, attendance_date);
