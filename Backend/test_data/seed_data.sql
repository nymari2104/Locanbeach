-- =============================================================================
-- SQL Seed Script for The House - Lộc An Beach Resort
-- This script populates sample data for:
-- 1. Users (Admin/Staff)
-- 2. Amenities (Tiện ích phòng)
-- 3. Accommodation Categories (Hạng phòng/Lều)
-- 4. Category-Amenity relationships
-- 5. Physical Accommodations (Số phòng thực tế)
-- 6. Services (Dịch vụ spa, ăn uống,...)
-- 7. Combos / Events (Combo ưu đãi, sự kiện)
-- =============================================================================

-- Clear existing sample data to prevent duplicate key errors (optional, run with caution)
-- TRUNCATE category_amenities, category_images, service_images, combo_images, booking_services, booking_combos, bookings, accommodations, accommodation_categories, amenities, services, combos_events, users CASCADE;

-- 1. Seed Users (Password is 'admin123' hashed with BCrypt)
INSERT INTO users (id, username, password_hash, full_name, email, role, is_active)
VALUES 
('d1a11111-2222-3333-4444-555555555551', 'admin', '$2a$10$Hl4mPshn25.i12hQO/3q5eeD134R839y2pYn5L/n90b6H1vS91kE2', 'Quản Trị Viên', 'admin@locanbeach.com', 'ADMIN', true),
('d1a11111-2222-3333-4444-555555555552', 'staff_reception', '$2a$10$Hl4mPshn25.i12hQO/3q5eeD134R839y2pYn5L/n90b6H1vS91kE2', 'Lễ Tân A', 'letan@locanbeach.com', 'STAFF', true);

-- 2. Seed Amenities
INSERT INTO amenities (id, name, icon)
VALUES
('a1111111-2222-3333-4444-555555555501', 'Wifi Tốc độ cao', 'wifi'),
('a1111111-2222-3333-4444-555555555502', 'Điều hòa nhiệt độ', 'ac_unit'),
('a1111111-2222-3333-4444-555555555503', 'Tivi thông minh', 'tv'),
('a1111111-2222-3333-4444-555555555504', 'Tủ lạnh mini', 'kitchen'),
('a1111111-2222-3333-4444-555555555505', 'Bể bơi riêng', 'pool'),
('a1111111-2222-3333-4444-555555555506', 'Ban công hướng biển', 'beach_access'),
('a1111111-2222-3333-4444-555555555507', 'Bếp nướng ngoài trời', 'outdoor_grill');

-- 3. Seed Accommodation Categories (Hạng phòng/Lều)
INSERT INTO accommodation_categories (id, name, code, type, description, base_price, max_guests, area_sqm)
VALUES
-- Hạng phòng khách sạn
('c1111111-2222-3333-4444-555555555511', 'Phòng Deluxe Hướng Biển', 'DLX-SEA', 'ROOM', 'Phòng ngủ cao cấp view trọn biển Lộc An, rộng rãi thoải mái cho cặp đôi.', 1800000.00, 2, 45.00),
('c1111111-2222-3333-4444-555555555512', 'Phòng Superior Hướng Vườn', 'SUP-GRD', 'ROOM', 'Không gian yên bình giữa khu vườn nhiệt đới xanh mát.', 1200000.00, 2, 35.00),
-- Hạng lều Glamping
('c1111111-2222-3333-4444-555555555513', 'Lều Glamping Cao Cấp', 'GLAMP-VIP', 'GLAMPING', 'Trải nghiệm cắm trại sang chảnh đầy đủ tiện nghi, đệm êm, điều hoà riêng.', 900000.00, 4, 25.00),
-- Khu cắm trại tự túc
('c1111111-2222-3333-4444-555555555514', 'Bãi Cắm Trại Tự Túc', 'CAMP-SITE', 'CAMPING', 'Vị trí bãi cỏ ven bờ biển cực chill dành cho khách tự mang lều.', 250000.00, 10, 50.00);

-- 4. Map Amenities to Categories
INSERT INTO category_amenities (category_id, amenity_id)
VALUES
-- Deluxe Sea View (Wifi, AC, TV, Mini-Fridge, Pool, Ocean Balcony)
('c1111111-2222-3333-4444-555555555511', 'a1111111-2222-3333-4444-555555555501'),
('c1111111-2222-3333-4444-555555555511', 'a1111111-2222-3333-4444-555555555502'),
('c1111111-2222-3333-4444-555555555511', 'a1111111-2222-3333-4444-555555555503'),
('c1111111-2222-3333-4444-555555555511', 'a1111111-2222-3333-4444-555555555504'),
('c1111111-2222-3333-4444-555555555511', 'a1111111-2222-3333-4444-555555555505'),
('c1111111-2222-3333-4444-555555555511', 'a1111111-2222-3333-4444-555555555506'),

-- Superior Garden View (Wifi, AC, TV, Mini-Fridge)
('c1111111-2222-3333-4444-555555555512', 'a1111111-2222-3333-4444-555555555501'),
('c1111111-2222-3333-4444-555555555512', 'a1111111-2222-3333-4444-555555555502'),
('c1111111-2222-3333-4444-555555555512', 'a1111111-2222-3333-4444-555555555503'),
('c1111111-2222-3333-4444-555555555512', 'a1111111-2222-3333-4444-555555555504'),

-- Glamping VIP (Wifi, AC, Outdoor Grill)
('c1111111-2222-3333-4444-555555555513', 'a1111111-2222-3333-4444-555555555501'),
('c1111111-2222-3333-4444-555555555513', 'a1111111-2222-3333-4444-555555555502'),
('c1111111-2222-3333-4444-555555555513', 'a1111111-2222-3333-4444-555555555507'),

-- Camping Site (Outdoor Grill)
('c1111111-2222-3333-4444-555555555514', 'a1111111-2222-3333-4444-555555555507');

-- 5. Seed Physical Accommodations (Phòng vật lý thực tế)
INSERT INTO accommodations (id, category_id, code, status, operational_status)
VALUES
-- Hạng phòng Deluxe (Phòng 101 -> 103)
('e1111111-2222-3333-4444-555555555521', 'c1111111-2222-3333-4444-555555555511', '101', 'ACTIVE', 'VACANT'),
('e1111111-2222-3333-4444-555555555522', 'c1111111-2222-3333-4444-555555555511', '102', 'ACTIVE', 'VACANT'),
('e1111111-2222-3333-4444-555555555523', 'c1111111-2222-3333-4444-555555555511', '103', 'ACTIVE', 'VACANT'),

-- Hạng phòng Superior (Phòng 201 -> 203)
('e1111111-2222-3333-4444-555555555531', 'c1111111-2222-3333-4444-555555555512', '201', 'ACTIVE', 'VACANT'),
('e1111111-2222-3333-4444-555555555532', 'c1111111-2222-3333-4444-555555555512', '202', 'ACTIVE', 'VACANT'),
('e1111111-2222-3333-4444-555555555533', 'c1111111-2222-3333-4444-555555555512', '203', 'ACTIVE', 'VACANT'),

-- Glamping VIP (Lều G01, G02)
('e1111111-2222-3333-4444-555555555541', 'c1111111-2222-3333-4444-555555555513', 'G01', 'ACTIVE', 'VACANT'),
('e1111111-2222-3333-4444-555555555542', 'c1111111-2222-3333-4444-555555555513', 'G02', 'ACTIVE', 'VACANT'),

-- Bãi cắm trại (Khu đất C01, C02)
('e1111111-2222-3333-4444-555555555551', 'c1111111-2222-3333-4444-555555555514', 'C01', 'ACTIVE', 'VACANT'),
('e1111111-2222-3333-4444-555555555552', 'c1111111-2222-3333-4444-555555555514', 'C02', 'ACTIVE', 'VACANT');

-- 6. Seed Services (Dịch vụ)
INSERT INTO services (id, name, "group", description, price, operating_hours, status)
VALUES
('f1111111-2222-3333-4444-555555555561', 'Liệu trình Massage Thảo dược', 'SPA', 'Massage toàn thân 60 phút với tinh dầu và đá nóng thảo mộc.', 450000.00, '09:00 - 21:00', 'ACTIVE'),
('f1111111-2222-3333-4444-555555555562', 'Buffet hải sản tối Thứ Bảy', 'RESTAURANT', 'Bữa tối nướng hải sản tươi sống đánh bắt trong ngày tại nhà hàng hướng biển.', 599000.00, '18:00 - 22:00', 'ACTIVE'),
('f1111111-2222-3333-4444-555555555563', 'Thuê Xe Máy Tự Lái', 'UTILITY', 'Xe ga đời mới, đã đổ đầy xăng để du khách tự khám phá Lộc An - Vũng Tàu.', 150000.00, '24 giờ', 'ACTIVE');

-- 7. Seed Combos / Events
INSERT INTO combos_events (id, name, type, description, price, start_date, end_date, status)
VALUES
('b1111111-2222-3333-4444-555555555571', 'Combo Trốn Nóng Ngày Hè 3N2Đ', 'COMBO', 'Trọn gói 2 đêm phòng Deluxe, miễn phí ăn sáng, tặng 1 liệu trình massage và buffet tối.', 3200000.00, '2026-06-01', '2026-08-31', 'ACTIVE'),
('b1111111-2222-3333-4444-555555555572', 'Đêm Nhạc Acoustic "Sóng Biển Rì Rào"', 'EVENT', 'Liveshow âm nhạc nhẹ nhàng ngoài bờ biển với đồ uống miễn phí đi kèm.', 300000.00, '2026-07-20', '2026-07-20', 'ACTIVE');
