-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL, -- PERCENTAGE, FIXED_AMOUNT, VALUE_ADD
    discount_value DECIMAL(12, 2) NOT NULL,
    min_booking_amount DECIMAL(12, 2),
    max_discount_amount DECIMAL(12, 2),
    min_length_of_stay INT DEFAULT 1,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    max_usage INT,
    current_usage INT DEFAULT 0,
    max_usage_per_user INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add coupon columns to bookings table
ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS coupon_id UUID REFERENCES coupons(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2);

-- Insert default demo coupons
INSERT INTO coupons (
    id, code, description, discount_type, discount_value, 
    min_booking_amount, max_discount_amount, min_length_of_stay, 
    start_date, end_date, max_usage, current_usage, is_active
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'WELCOME10',
    'Mã ưu đãi chào mừng - Giảm 10% tổng giá trị đơn đặt phòng',
    'PERCENTAGE',
    10.00,
    500000.00,
    500000.00,
    1,
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59',
    100,
    0,
    TRUE
), (
    'c0000000-0000-0000-0000-000000000002',
    'LOCAN200K',
    'Ưu đãi tri ân - Giảm trực tiếp 200.000đ cho đơn từ 1.000.000đ',
    'FIXED_AMOUNT',
    200000.00,
    1000000.00,
    200000.00,
    1,
    '2026-01-01 00:00:00',
    '2026-12-31 23:59:59',
    50,
    0,
    TRUE
) ON CONFLICT (code) DO NOTHING;
