-- V4__add_default_users.sql
-- Tạo tài khoản Admin và Staff mặc định
-- Password admin: admin123  (đổi ngay sau khi deploy lần đầu!)
-- Password staff: staff123  (đổi ngay sau khi deploy lần đầu!)

INSERT INTO users (id, username, password_hash, full_name, email, role, is_active)
VALUES
    (
        gen_random_uuid(),
        'admin',
        '$2a$10$dPD1rrHSOKs.RyOv6kDV1.05LBsaeFWmOxBtzrHsvU03abQWXUk0.',
        'Administrator',
        'admin@locanbeach.com',
        'ADMIN',
        true
    ),
    (
        gen_random_uuid(),
        'staff01',
        '$2a$10$PjwlXiAWvaA7obhIk9381e1ahpy7e3Zq1/9MnZXhIdwv6s.UQT0Z.',
        'Nhân Viên Lễ Tân',
        'staff01@locanbeach.com',
        'STAFF',
        true
    )
ON CONFLICT (username) DO NOTHING;
