-- V12__update_housekeeper_roles.sql
-- Thêm giá trị HOUSEKEEPER vào PostgreSQL enum type
-- NOTE: ALTER TYPE ADD VALUE cannot be used in same transaction as UPDATE using that value
-- The UPDATE is done in V13 to allow enum value to be committed first.
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'HOUSEKEEPER';
