-- Drop all tables first
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS user_quiz_progress CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Drop all types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS quiz_difficulty CASCADE;
DROP TYPE IF EXISTS quiz_status CASCADE;

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Create quiz difficulty enum
CREATE TYPE quiz_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');

-- Create quiz status enum
CREATE TYPE quiz_status AS ENUM ('draft', 'published', 'archived');

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL,
    CONSTRAINT sessions_token_key UNIQUE (token)
);

-- Create quizzes table
CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL UNIQUE,
    description TEXT,
    difficulty quiz_difficulty DEFAULT 'beginner',
    topics TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    status quiz_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options TEXT[] NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    difficulty quiz_difficulty DEFAULT 'beginner',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(quiz_id, question)
);

-- Create user quiz progress table
CREATE TABLE user_quiz_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, quiz_id)
);

-- Create indexes
CREATE INDEX sessions_token_idx ON sessions(token);
CREATE INDEX sessions_user_id_idx ON sessions(user_id);
CREATE INDEX sessions_expires_at_idx ON sessions(expires_at);
CREATE INDEX quizzes_created_by_idx ON quizzes(created_by);
CREATE INDEX questions_quiz_id_idx ON questions(quiz_id);
CREATE INDEX user_quiz_progress_user_id_idx ON user_quiz_progress(user_id);
CREATE INDEX user_quiz_progress_quiz_id_idx ON user_quiz_progress(quiz_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON quizzes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_progress ENABLE ROW LEVEL SECURITY;

-- Create application roles
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quiz_anonymous') THEN
        CREATE ROLE quiz_anonymous;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quiz_authenticated') THEN
        CREATE ROLE quiz_authenticated;
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'quiz_admin') THEN
        CREATE ROLE quiz_admin;
    END IF;
END
$$;

-- Grant permissions to roles
GRANT USAGE ON SCHEMA public TO quiz_anonymous, quiz_authenticated, quiz_admin;

-- Anonymous permissions
GRANT SELECT ON quizzes TO quiz_anonymous;
GRANT SELECT ON questions TO quiz_anonymous;

-- Authenticated user permissions
GRANT SELECT ON ALL TABLES IN SCHEMA public TO quiz_authenticated;
GRANT INSERT, UPDATE, DELETE ON user_quiz_progress TO quiz_authenticated;
GRANT INSERT ON sessions TO quiz_authenticated;
GRANT DELETE ON sessions TO quiz_authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO quiz_authenticated;

-- Admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO quiz_admin;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO quiz_admin;

-- Create policies
-- Users policies
CREATE POLICY users_select ON users
    FOR SELECT TO quiz_authenticated, quiz_admin
    USING (true);

CREATE POLICY users_insert ON users
    FOR INSERT TO quiz_admin
    WITH CHECK (true);

CREATE POLICY users_update ON users
    FOR UPDATE TO quiz_authenticated
    USING (id = current_user_id())
    WITH CHECK (id = current_user_id() OR current_user_role() = 'admin');

-- Sessions policies
CREATE POLICY sessions_select ON sessions
    FOR SELECT TO quiz_authenticated
    USING (user_id = current_user_id());

CREATE POLICY sessions_insert ON sessions
    FOR INSERT TO quiz_authenticated
    WITH CHECK (user_id = current_user_id());

CREATE POLICY sessions_delete ON sessions
    FOR DELETE TO quiz_authenticated
    USING (user_id = current_user_id());

-- Quizzes policies
CREATE POLICY quizzes_select ON quizzes
    FOR SELECT
    USING (status = 'published' OR created_by = current_user_id() OR current_user_role() = 'admin');

CREATE POLICY quizzes_insert ON quizzes
    FOR INSERT TO quiz_authenticated
    WITH CHECK (true);

CREATE POLICY quizzes_update ON quizzes
    FOR UPDATE TO quiz_authenticated
    USING (created_by = current_user_id() OR current_user_role() = 'admin')
    WITH CHECK (created_by = current_user_id() OR current_user_role() = 'admin');

-- Questions policies
CREATE POLICY questions_select ON questions
    FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM quizzes q
        WHERE q.id = quiz_id
        AND (q.status = 'published' OR q.created_by = current_user_id() OR current_user_role() = 'admin')
    ));

CREATE POLICY questions_insert ON questions
    FOR INSERT TO quiz_authenticated
    WITH CHECK (EXISTS (
        SELECT 1 FROM quizzes q
        WHERE q.id = quiz_id
        AND (q.created_by = current_user_id() OR current_user_role() = 'admin')
    ));

CREATE POLICY questions_update ON questions
    FOR UPDATE TO quiz_authenticated
    USING (EXISTS (
        SELECT 1 FROM quizzes q
        WHERE q.id = quiz_id
        AND (q.created_by = current_user_id() OR current_user_role() = 'admin')
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM quizzes q
        WHERE q.id = quiz_id
        AND (q.created_by = current_user_id() OR current_user_role() = 'admin')
    ));

-- User quiz progress policies
CREATE POLICY progress_select ON user_quiz_progress
    FOR SELECT TO quiz_authenticated
    USING (user_id = current_user_id() OR current_user_role() = 'admin');

CREATE POLICY progress_insert ON user_quiz_progress
    FOR INSERT TO quiz_authenticated
    WITH CHECK (user_id = current_user_id());

CREATE POLICY progress_update ON user_quiz_progress
    FOR UPDATE TO quiz_authenticated
    USING (user_id = current_user_id())
    WITH CHECK (user_id = current_user_id());

-- Helper functions for policies
CREATE OR REPLACE FUNCTION current_user_id() RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM users WHERE email = current_user);
END;
$$ language plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_role() RETURNS user_role AS $$
BEGIN
    RETURN (SELECT role FROM users WHERE email = current_user);
END;
$$ language plpgsql SECURITY DEFINER;
