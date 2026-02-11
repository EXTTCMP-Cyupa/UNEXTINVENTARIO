-- Create role
CREATE ROLE fixme_admin LOGIN PASSWORD 'fixme_secure_pass_change_me';
ALTER ROLE fixme_admin CREATEDB;

-- Create database
CREATE DATABASE fixme_ecosystem OWNER fixme_admin;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fixme_ecosystem TO fixme_admin;

-- Connect to the database and setup
\c fixme_ecosystem fixme_admin

-- Create schema
CREATE SCHEMA fixme AUTHORIZATION fixme_admin;

-- Create extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set search path
ALTER USER fixme_admin SET search_path TO fixme, public;
