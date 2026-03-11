-- ============================================================
-- Cflow Internal Chat — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users (synced from Cflow — treated as read-only reference)
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cflow_id    VARCHAR(128) UNIQUE NOT NULL,   -- ID from Cflow
    name        VARCHAR(255) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    avatar_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_cflow_id ON users (cflow_id);

-- 2. Conversations (one per workflow request)
CREATE TABLE conversations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(128) UNIQUE NOT NULL,   -- Cflow workflow request ID
    title       VARCHAR(512),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_workflow ON conversations (workflow_id);

-- 3. Conversation