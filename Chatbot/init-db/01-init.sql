-- ============================================
-- OCEAN BREEZE RESORT - DATABASE INITIALIZATION
-- Hotel Chatbot MVP - Mock Data
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create separate schema for n8n internal data
CREATE SCHEMA IF NOT EXISTS n8n;

-- ══════════════════════════════════════════════
-- 1. KNOWLEDGE BASE (Vector Store for RAG)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    -- Gemini text-embedding-004 outputs 768 dimensions
    embedding vector(768),
    category VARCHAR(100),
    source VARCHAR(255),
    language VARCHAR(10) DEFAULT 'vi', -- 'vi' or 'en'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HNSW index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_embedding
ON knowledge_documents
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_knowledge_category
ON knowledge_documents(category);

CREATE INDEX IF NOT EXISTS idx_knowledge_language
ON knowledge_documents(language);

-- ══════════════════════════════════════════════
-- 2. CHAT MEMORY (Conversation History)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform VARCHAR(50) NOT NULL DEFAULT 'n8n_chat',
    platform_user_id VARCHAR(255) NOT NULL,
    user_name VARCHAR(255),
    language VARCHAR(10) DEFAULT 'vi',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_session
ON chat_messages(session_id, created_at DESC);

-- ══════════════════════════════════════════════
-- 3. HOTEL DATA (Structured Data)
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS room_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    description TEXT,
    description_vi TEXT,
    max_guests INT DEFAULT 2,
    size_sqm INT,
    base_price DECIMAL(12,0) NOT NULL,
    weekend_price DECIMAL(12,0),
    holiday_price DECIMAL(12,0),
    amenities JSONB DEFAULT '[]',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hotel_services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    name_vi VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description TEXT,
    description_vi TEXT,
    price DECIMAL(12,0),
    operating_hours VARCHAR(100),
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS hotel_policies (
    id SERIAL PRIMARY KEY,
    policy_type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_vi VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    content_vi TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ══════════════════════════════════════════════
-- 4. SIMILARITY SEARCH FUNCTION
-- ══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION search_knowledge(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.65,
    match_count INT DEFAULT 5,
    filter_category VARCHAR DEFAULT NULL,
    filter_language VARCHAR DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    metadata JSONB,
    category VARCHAR,
    language VARCHAR,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        kd.id,
        kd.content,
        kd.metadata,
        kd.category,
        kd.language,
        (1 - (kd.embedding <=> query_embedding))::FLOAT AS similarity
    FROM knowledge_documents kd
    WHERE
        (1 - (kd.embedding <=> query_embedding)) > match_threshold
        AND (filter_category IS NULL OR kd.category = filter_category)
        AND (filter_language IS NULL OR kd.language = filter_language)
    ORDER BY kd.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ══════════════════════════════════════════════
-- 5. MOCK DATA - THE HOUSE - LỘC AN BEACH
-- ══════════════════════════════════════════════

-- Truncate existing tables to avoid duplicate entries
TRUNCATE TABLE room_types, hotel_services, hotel_policies RESTART IDENTITY CASCADE;

-- Room Types
INSERT INTO room_types (name, name_vi, description, description_vi, max_guests, size_sqm, base_price, weekend_price, holiday_price, amenities) VALUES
(
    'Standard Sea View',
    'Phòng Tiêu Chuẩn Hướng Biển',
    'Cozy standard room with stunning sea view, private balcony, and king-size bed equipped with a 5-star standard spring mattress. Just 100m from Loc An beach. Free breakfast and coffee included.',
    'Phòng tiêu chuẩn ấm cúng hướng biển, ban công riêng, giường king-size trang bị nệm lò xo cao cấp tiêu chuẩn 5 sao mang lại giấc ngủ êm ái nhất. Cách biển Lộc An 100m. Giá phòng đã bao gồm ăn sáng và cafe sáng miễn phí.',
    2, 28,
    800000, 1000000, 1200000,
    '["WiFi miễn phí/Free WiFi", "Nệm lò xo 5 sao/5-star mattress", "Điều hòa/AC", "Tivi 43 inch", "Minibar", "Ban công hướng biển/Balcony", "Máy sấy tóc/Hair dryer", "Ăn sáng & Cafe sáng miễn phí/Free breakfast & coffee"]'
),
(
    'Deluxe Ocean Front',
    'Phòng Deluxe Hướng Biển',
    'Spacious deluxe room directly facing the ocean with a 5-star standard spring mattress, large bathtub, and separate living area. Just 100m from Loc An beach. Free breakfast and coffee included.',
    'Phòng deluxe rộng rãi hướng biển, giường king-size hoặc 2 giường đơn trang bị nệm lò xo cao cấp tiêu chuẩn 5 sao, bồn tắm lớn và phòng khách riêng biệt. Cách biển Lộc An 100m. Miễn phí ăn sáng và cafe sáng.',
    3, 42,
    1500000, 1800000, 2200000,
    '["WiFi miễn phí/Free WiFi", "Nệm lò xo 5 sao/5-star mattress", "Điều hòa/AC", "Smart TV 55 inch", "Minibar đầy đủ/Full minibar", "Bồn tắm/Bathtub", "Phòng khách riêng/Separate living area", "Dịch vụ phòng/Room service", "Ăn sáng & Cafe sáng miễn phí/Free breakfast & coffee"]'
),
(
    'Family Suite',
    'Suite Gia Đình',
    'Spacious family suite with 2 bedrooms, kitchenette for guest cooking, kids play corner, and ocean-view terrace. Beds equipped with 5-star standard spring mattresses. Just 100m from Loc An beach. Free breakfast and coffee included.',
    'Suite rộng rãi dành cho gia đình với 2 phòng ngủ riêng biệt, bếp nhỏ tự chế biến nấu ăn, nệm lò xo cao cấp tiêu chuẩn 5 sao, góc vui chơi cho trẻ nhỏ và sân thượng rộng rãi nhìn ra biển. Cách biển Lộc An 100m. Miễn phí ăn sáng và cafe sáng.',
    5, 65,
    2500000, 3000000, 3500000,
    '["WiFi miễn phí/Free WiFi", "Nệm lò xo 5 sao/5-star mattress", "2 phòng ngủ/2 bedrooms", "Bếp nhỏ tự nấu/Kitchenette", "2 Smart TV", "Máy giặt/Washing machine", "Sân thượng riêng/Private terrace", "Ăn sáng & Cafe sáng miễn phí/Free breakfast & coffee"]'
),
(
    'Presidential Suite',
    'Suite Tổng Thống',
    'The most luxurious suite with panoramic ocean views, private jacuzzi on the balcony, grand living room, 5-star standard spring mattress, and dedicated butler service. Free breakfast and coffee included.',
    'Suite sang trọng nhất với tầm nhìn biển 180 độ toàn cảnh, jacuzzi riêng trên ban công cực chill, phòng khách lớn, nệm lò xo cao cấp tiêu chuẩn 5 sao và dịch vụ butler riêng. Cách biển Lộc An 100m. Miễn phí ăn sáng và cafe sáng.',
    4, 95,
    5000000, 6000000, 7500000,
    '["WiFi miễn phí/Free WiFi", "Nệm lò xo 5 sao/5-star mattress", "Jacuzzi riêng/Private jacuzzi", "Smart TV 75 inch", "Phòng khách lớn/Grand living room", "Butler service", "Minibar cao cấp/Premium minibar", "Ban công panorama/Panoramic balcony", "Hệ thống âm thanh Bose/Bose sound system", "Ăn sáng & Cafe sáng miễn phí/Free breakfast & coffee"]'
);

-- Hotel Services
INSERT INTO hotel_services (name, name_vi, category, description, description_vi, price, operating_hours, is_active) VALUES
('Breakfast & Coffee', 'Bữa Sáng & Cà Phê', 'dining', 'Complimentary breakfast and morning coffee for all staying guests', 'Bữa ăn sáng và cà phê sáng thơm ngon hoàn toàn miễn phí cho tất cả khách lưu trú tại The House', 0, '06:30 - 10:00', true),
('Shared Kitchen', 'Khu Bếp Chung', 'dining', 'Free shared kitchen equipped with cooking and preparation tools', 'Khu vực bếp nấu ăn chung đầy đủ dụng cụ nấu nướng hoàn toàn miễn phí cho khách lưu trú', 0, '06:00 - 22:00', true),
('Garden BBQ Rental', 'Thuê Bếp Nướng BBQ', 'dining', 'Garden BBQ table and grill rental, staff prepares charcoal. Prepared BBQ food sets available.', 'Dịch vụ thuê bếp nướng và bàn nướng BBQ sân vườn ngoài trời cực chill, có nhân viên hỗ trợ chuẩn bị than hoa. Có sẵn set nướng BBQ đầy đủ hải sản, thịt nướng theo yêu cầu.', 0, '16:00 - 22:00', true),
('Glamping Tent', 'Cắm Trại Glamping', 'other', 'Premium outdoor glamping setup or self-camping pitch on the lawn', 'Dịch vụ thuê lều trại dựng sẵn cao cấp (Glamping) hoặc tự dựng lều cá nhân tại bãi cỏ rộng rãi của resort', 0, '24/7', true),
('Swimming Pool', 'Hồ Bơi', 'facility', 'Outdoor pool with areas for both adults and children, free for guests', 'Bể bơi ngoài trời mát lạnh hoàn toàn miễn phí cho khách lưu trú, có khu vực dành riêng cho người lớn và trẻ em', 0, '06:00 - 21:00', true),
('Recreational Fishing', 'Hồ Câu Cá Giải Trí', 'facility', 'Natural fishing pond within the resort, rods available at reception', 'Hồ câu cá giải trí tự nhiên rộng rãi rợp bóng mát trong khuôn viên, mở cửa tự do và miễn phí cho khách lưu trú', 0, '06:00 - 18:00', true),
('Campfire', 'Đốt Lửa Trại', 'facility', 'Outdoor group campfire gathering at night', 'Khu vực đốt lửa trại tập thể ngoài trời vào buổi tối cực vui cho các nhóm bạn, gia đình quây quần bên nhau', 0, '19:30 - 22:00', true),
('Event Organization', 'Tổ Chức Sự Kiện', 'other', 'Full event management for birthdays, beach weddings, and team building', 'Dịch vụ lên kịch bản, thiết kế và tổ chức trọn gói tiệc sinh nhật (birthday), đám cưới (wedding), team building bãi biển', 0, 'Flexible', true),
('Motorbike Rental', 'Thuê Xe Máy', 'transport', 'Motorbike rental for local exploration, helmet included', 'Dịch vụ cho thuê xe máy đi lại tự do khám phá xung quanh, bao gồm mũ bảo hiểm', 150000, '07:00 - 20:00', true),
('Laundry Service', 'Dịch Vụ Giặt Ủi', 'other', 'Laundry and ironing service, delivered to your room', 'Giặt ủi quần áo sạch sẽ giao nhận tận phòng', 50000, '07:00 - 19:00', true),
('Airport Transfer', 'Đưa Đón Sân Bay', 'transport', 'Shuttle service is currently not available. We assist guests with limousine booking information and routes from HCMC to Loc An.', 'Hiện tại The House chưa có dịch vụ xe đưa đón riêng của resort. Bên mình hỗ trợ hướng dẫn thông tin đặt xe limousine chất lượng cao đón trả tận nơi tuyến TP.HCM - Lộc An.', 0, 'None', false);

-- Hotel Policies
INSERT INTO hotel_policies (policy_type, title, title_vi, content, content_vi) VALUES
('checkin', 'Check-in Policy', 'Chính sách nhận phòng',
 'Check-in from 14:00. Early check-in from 12:00 available for 200,000 VND surcharge (subject to room availability). Please present valid ID/passport upon check-in.',
 'Nhận phòng từ 14:00. Nhận phòng sớm từ 12:00 phụ thu 200.000đ (tùy thuộc vào tình trạng phòng trống thực tế). Vui lòng xuất trình bản gốc CCCD/hộ chiếu khi nhận phòng.'),

('checkout', 'Check-out Policy', 'Chính sách trả phòng',
 'Check-out before 12:00 (noon). Late check-out until 14:00 available for 200,000 VND surcharge. After 14:00, an additional night will be charged.',
 'Trả phòng trước 12:00 trưa. Trả phòng muộn đến 14:00 phụ thu 200.000đ. Trả phòng muộn sau 14:00 tính tiền bằng 1 đêm phòng.'),

('cancellation', 'Cancellation Policy', 'Chính sách hủy phòng',
 'Cancel 48+ hours before check-in: 100% refund. Cancel 24-48 hours before: 50% refund. Cancel less than 24 hours: no refund.',
 'Hủy trước 48h so với giờ check-in: hoàn cọc 100%. Hủy trước 24h-48h: hoàn cọc 50%. Hủy trong vòng 24h hoặc không đến (no-show): không hoàn lại tiền cọc.'),

('pet', 'Pet Policy', 'Chính sách thú cưng',
 'To ensure a clean and quiet environment for all guests, pets are strictly prohibited inside the resort rooms and common areas.',
 'Nhằm đảm bảo không gian yên tĩnh, vệ sinh và an toàn tuyệt đối cho tất cả khách lưu trú, The House áp dụng chính sách KHÔNG cho phép mang theo thú cưng (chó, mèo...) vào khu nghỉ dưỡng dưới mọi hình thức.'),

('smoking', 'Smoking Policy', 'Chính sách hút thuốc',
 'Smoking is strictly prohibited in all rooms. Designated smoking areas are located outdoors in the garden. Violation may result in a 500,000 VND cleaning fee.',
 'Nghiêm cấm hút thuốc bên trong phòng nghỉ để bảo đảm an toàn phòng cháy chữa cháy và tránh bám mùi. Bạn vui lòng sử dụng các khu vực hút thuốc ngoài trời được bố trí riêng tại sân vườn của The House. Vi phạm chính sách có thể bị phụ thu phí vệ sinh phòng 500.000đ.'),

('payment', 'Payment Methods', 'Phương thức thanh toán',
 'We accept Cash (VND), Bank Transfer, Visa/Mastercard, MoMo, ZaloPay. A 50% deposit is required for online bookings. Full payment is due upon check-in.',
 'Chấp nhận các hình thức thanh toán: Tiền mặt (VND), Chuyển khoản ngân hàng trực tiếp, thẻ Visa/Mastercard, hoặc các ví điện tử MoMo, ZaloPay. Cần đặt cọc trước 50% tổng tiền phòng để giữ phòng trên hệ thống. 50% còn lại thanh toán khi check-in.'),

('children', 'Children Policy', 'Chính sách trẻ em',
 'Children under 6: free (sharing parents bed). Children 6-12: 200,000 VND/night with extra bed. Children above 12: charged as adult.',
 'Trẻ em dưới 6 tuổi: miễn phí hoàn toàn khi ngủ chung giường với bố mẹ. Trẻ em từ 6 đến 12 tuổi: phụ thu 200.000đ/đêm (đã bao gồm ăn sáng và kê thêm giường phụ). Trên 12 tuổi: tính phí như người lớn.'),

('wifi', 'WiFi', 'WiFi',
 'Complimentary high-speed WiFi is available throughout the resort. Network: TheHouse_Guest. Password is provided at check-in.',
 'WiFi tốc độ cao được phủ sóng toàn bộ khuôn viên resort miễn phí. Tên mạng (SSID): TheHouse_Guest. Mật khẩu được lễ tân cung cấp trực tiếp khi làm thủ tục check-in.'),

('sharing', 'Room Sharing Policy', 'Chính sách ở ghép và chia phòng',
 'Room sharing is permitted as long as total guests do not exceed room capacity. Extra beds can be requested with surcharge.',
 'Bạn hoàn toàn có thể share phòng hoặc ở ghép chung với bạn bè, người thân, miễn là tổng số khách lưu trú trong phòng không vượt quá giới hạn sức chứa tối đa quy định của từng hạng phòng. Kê thêm giường phụ (extra bed) sẽ có phụ thu.');

-- ══════════════════════════════════════════════
-- VERIFICATION
-- ══════════════════════════════════════════════
-- You can run these queries to verify:
-- SELECT count(*) FROM room_types;        -- Should return 4
-- SELECT count(*) FROM hotel_services;    -- Should return 11
-- SELECT count(*) FROM hotel_policies;    -- Should return 9
