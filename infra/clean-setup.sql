-- Drop existing DB and role
DROP DATABASE IF EXISTS fixme_ecosystem;
DROP ROLE IF EXISTS fixme_admin;

-- Create role
CREATE ROLE fixme_admin LOGIN PASSWORD 'fixme_secure_pass_change_me';
ALTER ROLE fixme_admin CREATEDB;

-- Create database
CREATE DATABASE fixme_ecosystem OWNER fixme_admin;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE fixme_ecosystem TO fixme_admin;
