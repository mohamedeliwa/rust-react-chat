-- Your SQL goes here
CREATE TABLE users (
  id UUID NOT NULL PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(150) NOT NULL,
  phone VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);