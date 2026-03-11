-- ============================================================
-- Cflow Internal Chat System — PostgreSQL Schema
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users (mirrors Cflow user records)
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cflow_id    VARCHAR(64)  NOT NULL UNIQUE,
    name        VARCHAR(128) NOT NULL,
    email       VARCHAR(256) NOT NULL UNIQUE,
    avatar_url  VARCHAR(512),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_cflow_id ON users (cflow_id);

-- Conversations (one per workflow request)
CREATE TABLE conversations (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workflow_id VARCHAR(64)  NOT NULL UNIQUE,
    title       VARCHAR(256),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_conversations_workflow ON conversations (workflow_id);

-- Conversation participants
CREATE TABLE conversation_participants (
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (conversation_id, user_id)
);

-- Messages
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id       UUID         NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    message         TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages (conversation_id, created_at);
CREATE INDEX idx_messages_sender       ON messages (sender_id);

-- Mentions (@username references inside messages)
CREATE TABLE message_mentions (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (message_id, user_id)
);

CREATE INDEX idx_mentions_user ON message_mentions (user_id);

-- Seed data for development / demo
INSERT INTO users (id, cflow_id, name, email) VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'cflow_1001', 'Arjun Mehta',   'arjun@cflow.dev'),
    ('a1b2c3d4-0002-4000-8000-000000000002', 'cflow_1002', 'Priya Sharma',  'priya@cflow.dev'),
    ('a1b2c3d4-0003-4000-8000-000000000003', 'cflow_1003', 'Ravi Kumar',    'ravi@cflow.dev');

INSERT INTO conversations (id, workflow_id, title) VALUES
    ('b1b2c3d4-0001-4000-8000-000000000001', '1023', 'Invoice Approval — Request #1023');

INSERT INTO conversation_participants (conversation_id, user_id) VALUES
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001'),
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002'),
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003');

INSERT INTO messages (conversation_id, sender_id, message) VALUES
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Please review the attached invoice for Q2 services.'),
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0002-4000-8000-000000000002', 'Reviewed and approved. Looks good to me.'),
    ('b1b2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0003-4000-8000-000000000003', 'Uploading the signed document now.');
