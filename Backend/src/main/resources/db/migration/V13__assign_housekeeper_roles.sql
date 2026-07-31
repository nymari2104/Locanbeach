-- V13__assign_housekeeper_roles.sql
-- Đổi role của tài khoản tạp vụ từ STAFF sang HOUSEKEEPER
-- (Phải tách khỏi V12 vì PostgreSQL không cho phép dùng enum value mới trong cùng transaction với ALTER TYPE)
UPDATE users SET role = 'HOUSEKEEPER' WHERE username IN ('housekeeper01', 'housekeeper02');
