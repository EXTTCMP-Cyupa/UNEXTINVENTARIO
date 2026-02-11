-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable JSONB support (already available in PostgreSQL)
CREATE SCHEMA IF NOT EXISTS fixme;

GRANT ALL PRIVILEGES ON SCHEMA fixme TO fixme_admin;

-- Set search path
ALTER USER fixme_admin SET search_path TO fixme, public;
