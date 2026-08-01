-- V14__seed_sample_data.sql
-- Seed sample categories, accommodations, amenities, services, combos & high qualityUnsplash images for Lộc An Beach Resort

-- 1. AMENITIES
INSERT INTO amenities (id, name, icon) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Wifi miễn phí', 'wifi'),
  ('a1000000-0000-0000-0000-000000000002', 'Hồ bơi ngoài trời', 'pool'),
  ('a1000000-0000-0000-0000-000000000003', 'Điều hòa không khí', 'ac_unit'),
  ('a1000000-0000-0000-0000-000000000004', 'Bữa sáng miễn phí', 'free_breakfast'),
  ('a1000000-0000-0000-0000-000000000005', 'Smart TV 55 inch', 'tv'),
  ('a1000000-0000-0000-0000-000000000006', 'Tủ lạnh / Minibar', 'kitchen'),
  ('a1000000-0000-0000-0000-000000000007', 'Hướng biển', 'waves'),
  ('a1000000-0000-0000-0000-000000000008', 'Bếp nướng BBQ ngoài trời', 'flatware')
ON CONFLICT (id) DO NOTHING;

-- 2. ACCOMMODATION CATEGORIES
INSERT INTO accommodation_categories (id, name, code, type, description, base_price, max_guests, area_sqm) VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Deluxe Sea View',
    'CAT-DELUXE-SEA',
    'ROOM',
    'Phòng Deluxe hướng biển sang trọng với ban công riêng ngắm hoàng hôn biển Lộc An. Đầy đủ tiện nghi hiện đại cho cặp đôi.',
    1200000.00,
    2,
    35.00
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Family Beach Suite',
    'CAT-FAMILY-SUITE',
    'ROOM',
    'Căn hộ gia đình không gian rộng rãi gồm 2 phòng ngủ riêng biệt, phòng khách và ban công lớn nhìn ra bãi biển riêng.',
    2500000.00,
    4,
    65.00
  ),
  (
    'c1000000-0000-0000-0000-000000000003',
    'Luxury Glamping Dome',
    'CAT-GLAMPING-DOME',
    'GLAMPING',
    'Trải nghiệm cắm trại nghỉ dưỡng sang trọng trong lều vòm màng trong suốt ngắm trọn bầu trời sao đêm tại bãi biển Lộc An.',
    850000.00,
    2,
    28.00
  ),
  (
    'c1000000-0000-0000-0000-000000000004',
    'Oceanfront VIP Villa',
    'CAT-VIP-VILLA',
    'ROOM',
    'Villa nguyên căn biệt lập 3 phòng ngủ với hồ bơi vô cực riêng sát bờ biển, không gian đẳng cấp tuyệt đối riêng tư.',
    4500000.00,
    6,
    150.00
  )
ON CONFLICT (id) DO NOTHING;

-- 3. CATEGORY AMENITIES LINKING
INSERT INTO category_amenities (category_id, amenity_id) VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000007'),

  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000005'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006'),

  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008'),

  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000007'),
  ('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000008')
ON CONFLICT DO NOTHING;

-- 4. CATEGORY IMAGES (High quality Unsplash images)
INSERT INTO category_images (id, category_id, url, is_cover, sort_order) VALUES
  -- Deluxe Sea View
  ('i1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000&auto=format&fit=crop', true, 1),
  ('i1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000&auto=format&fit=crop', false, 2),
  
  -- Family Beach Suite
  ('i1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000&auto=format&fit=crop', true, 1),
  ('i1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000&auto=format&fit=crop', false, 2),

  -- Luxury Glamping Dome
  ('i1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=1000&auto=format&fit=crop', true, 1),
  ('i1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000003', 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?q=80&w=1000&auto=format&fit=crop', false, 2),

  -- Oceanfront VIP Villa
  ('i1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1000&auto=format&fit=crop', true, 1),
  ('i1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000004', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=1000&auto=format&fit=crop', false, 2)
ON CONFLICT (id) DO NOTHING;

-- 5. ACCOMMODATIONS (SPECIFIC ROOMS)
INSERT INTO accommodations (id, category_id, code, status, operational_status) VALUES
  -- Deluxe Sea View rooms
  ('r1000000-0000-0000-0000-000000000101', 'c1000000-0000-0000-0000-000000000001', 'P101', 'ACTIVE', 'VACANT'),
  ('r1000000-0000-0000-0000-000000000102', 'c1000000-0000-0000-0000-000000000001', 'P102', 'ACTIVE', 'VACANT'),
  ('r1000000-0000-0000-0000-000000000103', 'c1000000-0000-0000-0000-000000000001', 'P103', 'ACTIVE', 'VACANT'),

  -- Family Beach Suite rooms
  ('r1000000-0000-0000-0000-000000000201', 'c1000000-0000-0000-0000-000000000002', 'P201', 'ACTIVE', 'VACANT'),
  ('r1000000-0000-0000-0000-000000000202', 'c1000000-0000-0000-0000-000000000002', 'P202', 'ACTIVE', 'VACANT'),

  -- Luxury Glamping Domes
  ('r1000000-0000-0000-0000-000000000301', 'c1000000-0000-0000-0000-000000000003', 'DOME-01', 'ACTIVE', 'VACANT'),
  ('r1000000-0000-0000-0000-000000000302', 'c1000000-0000-0000-0000-000000000003', 'DOME-02', 'ACTIVE', 'VACANT'),

  -- Oceanfront VIP Villa
  ('r1000000-0000-0000-0000-000000000401', 'c1000000-0000-0000-0000-000000000004', 'VILLA-01', 'ACTIVE', 'VACANT')
ON CONFLICT (id) DO NOTHING;

-- 6. SERVICES & COMBOS
INSERT INTO services (id, name, "group", description, price, operating_hours, status) VALUES
  ('s1000000-0000-0000-0000-000000000001', 'Liệu trình Spa thư giãn 60 phút', 'SPA', 'Massage toàn thân với tinh dầu dừa tự nhiên giúp phục hồi năng lượng.', 450000.00, '08:00 - 20:00', 'ACTIVE'),
  ('s1000000-0000-0000-0000-000000000002', 'Tổ chức tiệc BBQ hải sản bãi biển', 'RESTAURANT', 'Set hải sản tươi sống Lộc An nướng tại bàn bên bờ biển.', 890000.00, '17:00 - 22:00', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO combos_events (id, name, type, description, price, start_date, end_date, status) VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Combo Lãng Mạn Honeymoon 2N1Đ', 'COMBO', 'Gồm 1 đêm phòng Deluxe Sea View + Trang trí hoa tươi & rượu vang + Spa đôi 60 phút.', 1990000.00, '2026-01-01', '2026-12-31', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;
