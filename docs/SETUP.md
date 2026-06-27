# 🚀 Hướng Dẫn Cài Đặt & Triển Khai MVP (Local)

## Yêu Cầu Hệ Thống
- **Docker Desktop** đã cài đặt ([Tải tại đây](https://www.docker.com/products/docker-desktop/))
- **Google AI API Key** (miễn phí) ([Lấy tại đây](https://aistudio.google.com/apikey))
- RAM tối thiểu: 4GB (khuyến nghị 8GB)

---

## Bước 1: Cài Đặt Docker Desktop

1. Tải Docker Desktop từ [docker.com](https://www.docker.com/products/docker-desktop/)
2. Cài đặt và khởi động lại máy
3. Mở Docker Desktop, đợi nó chạy xong (icon Docker ở system tray chuyển sang xanh)
4. Verify:
```powershell
docker --version
docker compose version
```

## Bước 2: Lấy Google AI API Key

1. Truy cập [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Đăng nhập tài khoản Google
3. Click **"Create API Key"**
4. Copy API Key

## Bước 3: Cấu Hình Environment

1. Mở file `.env` trong thư mục dự án
2. Thay `your_gemini_api_key_here` bằng API Key vừa lấy:
```env
GOOGLE_AI_API_KEY=AIzaSy...your_actual_key...
```

## Bước 4: Khởi Động Hệ Thống

Mở terminal tại thư mục dự án và chạy:

```powershell
cd "d:\Own project\Chatbot"
docker compose up -d
```

Đợi khoảng 1-2 phút để tải images và khởi động. Kiểm tra trạng thái:

```powershell
docker compose ps
```

Kết quả mong đợi:
```
NAME                 STATUS
hotel-chatbot-db     running (healthy)
hotel-chatbot-n8n    running
```

## Bước 5: Truy Cập n8n

1. Mở trình duyệt: **http://localhost:5678**
2. Tạo tài khoản admin (lần đầu):
   - Email: admin@example.com (hoặc email của bạn)
   - First Name: Admin
   - Last Name: Hotel
   - Password: (tự chọn, ghi nhớ)
3. Bạn sẽ thấy n8n Dashboard

## Bước 6: Thêm Credentials trong n8n

### 6.1 Google Gemini API
1. Vào **Settings** (gear icon) → **Credentials**
2. Click **Add Credential** → Tìm **"Google Gemini (PaLM) Api"** hoặc **"Google AI"**
3. Nhập API Key từ `.env`
4. Save

### 6.2 PostgreSQL
1. **Add Credential** → Tìm **"Postgres"**
2. Điền:
   - **Host**: `postgres` (tên container, KHÔNG phải localhost)
   - **Database**: `hotel_chatbot`
   - **User**: `hotel_admin`
   - **Password**: `YOUR_PASSWORD`
   - **Port**: `5432`
3. Click **Test** → Phải hiện "Connection successful"
4. Save

---

## Bước 7: Tạo Workflow 1 - Dynamic Knowledge Ingestion

> Workflow này tự động quét tất cả các file tài liệu trong thư mục `knowledge/` trên máy của bạn, giải nén text, tạo vector và nạp vào database. Bất cứ khi nào bạn chỉnh sửa file `.md` trong thư mục này, chỉ cần chạy lại workflow này để cập nhật tri thức.

### Tạo workflow mới:
1. Đặt tên: **"Hotel Knowledge Ingestion (Dynamic)"**
2. Thêm các node theo thứ tự:
   ```
   [Manual Trigger] 
    → [Postgres: Reset Tri Thức] (Xóa dữ liệu cũ trước khi nạp mới)
    → [Read Directory] (Đọc danh sách file trong thư mục)
    → [Read Write File from Disk] (Đọc nội dung từng file)
    → [Postgres PGVector Store (Insert)] (Lưu trữ Vector mới)
```

### Chi tiết cấu hình từng node:

#### Node 1: Manual Trigger
- Mặc định, không cần cấu hình gì.

#### Node 2: Postgres (Reset Tri Thức)
- **Operation**: `Execute a SQL Query`
- **Query**: `TRUNCATE TABLE knowledge_documents;`
- **Credentials**: Chọn Postgres credential đã tạo ở Bước 6.

#### Node 3: Read Directory (Đọc thư mục)
- **Path**: `/home/node/knowledge`
- **Options**: Bật **`Detailed Output`** thành `True` (nếu cần). Node này sẽ tìm thấy các file như `faq.md`, `hotel-info.md`, v.v.

#### Node 4: Read Write File from Disk (Đọc file)
- **Operation**: `Read File`
- **File Path**: `/home/node/knowledge/{{ $json.name }}`
- **Output Binary Field**: `data`

#### Node 5: Postgres PGVector Store (Insert Documents)
- **Table Name**: `knowledge_documents`
- **Vector Column Name**: `embedding`
- **Content Column Name**: `content`
- **Metadata Column Name**: `metadata`
- **Embedding Batch Size**: `1`
- **Sub-node: Default Data Loader** (Gắn vào ô *Document*):
  - **Type of Data**: `JSON`
  - **Mode**: `Load All Input Data`
  - **Text Splitting**: `Simple` (hoặc Custom)
  - **Options**: Click **Add Option** -> **Page Content Property** -> Điền: `pageContent`
- **Sub-node: Embeddings Google Gemini** (Gắn vào ô *Embedding*):
  - **Model**: `models/gemini-embedding-001`
  - **Credentials**: Google Gemini credential đã tạo
- **Sub-node: Recursive Character Text Splitter** (Gắn vào bên cạnh Data Loader):
  - **Chunk Size**: `1000`
  - **Chunk Overlap**: `200`

### ⚡ Chạy nạp tri thức:
1. Click **`Execute workflow`**.
2. Khi hoàn thành, tất cả các file markdown sẽ được nạp sạch sẽ vào Postgres dưới dạng vector 3072 dimensions.

---

## Bước 8: Tạo Workflow 2 - AI Chat Agent (Có RAG + Database Tool)

> Workflow này là bộ não của Chatbot Marina. Marina sẽ vừa truy vấn tài liệu tĩnh (RAG) vừa có công cụ kết nối trực tiếp vào Database thực tế để kiểm tra phòng trống hoặc coupon khi khách hàng yêu cầu.

### Tạo workflow mới: **"Hotel Chatbot Agent"**

```
[Chat Trigger] → [AI Agent]
                      ↑
                [Google Gemini Chat Model] (sub-node)
                      ↑
                [Vector Store Question Answer Tool] (sub-node) → [Postgres PGVector Store (Retrieve)]
                                                                        ↑ [Embeddings Google Gemini]
                      ↑
                [PostgreSQL Tool] (sub-node) (Công cụ truy vấn cơ sở dữ liệu động)
                      ↑
                [Simple Memory] (sub-node)
```

### Cấu hình chi tiết:

#### Node 1: Chat Trigger
- Trọng tâm giao diện trò chuyện của n8n. Không cần chỉnh gì thêm.

#### Node 2: AI Agent
- **Agent Type**: Tools Agent
- **System Message** (copy toàn bộ nội dung tiếng Anh dưới đây):
```
You are Marina, the smart, warm, and professional AI concierge for Ocean Breeze Resort - a luxury 4-star beachfront resort.

## Role & Mission
- Assist guests with inquiries regarding room types, rates, amenities, services, policies, and local recommendations.
- Retrieve accurate information from the provided knowledge base to answer questions.
- Maintain a welcoming hospitality tone.

## Strict Rules
1. LANGUAGE DETECTION: Always respond in the language used by the user. If the guest messages in Vietnamese, reply in Vietnamese. If in English, reply in English.
2. TRUTHFULNESS: Base your answers ONLY on the retrieved knowledge base. Do NOT make up information.
3. OFF-TOPIC HANDLER: If the user asks about general knowledge, software, logic, or topics completely unrelated to Ocean Breeze Resort, travel in the area, or hotel services (e.g., gaming, programming, cooking recipes, general news, downloading Minecraft), politely refuse to answer. Explain that you can only assist with inquiries related to the resort, and guide them back by suggesting topics like room types, spa, dining, or promotions.
   - Vietnamese example: "Dạ, Marina chỉ có thể hỗ trợ anh/chị các thông tin liên quan đến dịch vụ phòng nghỉ, nhà hàng và hoạt động tại Ocean Breeze Resort thôi ạ. Anh/chị có muốn tham khảo bảng giá phòng hoặc các chương trình ưu đãi hiện có của resort không?"
   - English example: "I can only assist you with information regarding Ocean Breeze Resort services, rooms, dining, or activities. Would you like to check our room rates or current promotions instead?"
4. NO INFORMATION HANDLING (Within scope): If the question is hotel-related but you cannot find the answer in the database or via your database tool, respond with:
   - Vietnamese: "Dạ, Marina xin phép kiểm tra lại thông tin này và phản hồi cho anh/chị sau nhé. Anh/chị có thể liên hệ trực tiếp hotline 0901 234 567 để được hỗ trợ nhanh nhất ạ!"
   - English: "Let me double-check that for you and get back to you shortly. In the meantime, you can reach our front desk directly at +84 901 234 567 for immediate assistance!"
5. CURRENCY FORMATTING: Format Vietnamese Dong with dot separators: e.g., 1.500.000đ.
6. PERSONALITY: Use appropriate emojis (🏖️ 🏨 ✨ 📞 🌊 💆 🍽️) to sound warm and engaging.
7. CONTINUOUS ENGAGEMENT: Always end your response with an open-ended question or suggestion to keep the conversation going.
8. PRONOUNS (Vietnamese): Address yourself as "Marina" or "em" and the guest as "anh/chị". (English: I / You).
9. ESCALATION: For booking requests or urgent issues, direct the guest to call the hotline: 0901 234 567.

## Resort Details
- Name: Ocean Breeze Resort
- Address: 123 Bien Xanh Street, Bien Xanh City
- Hotline: 0901 234 567 / +84 901 234 567
- Email: info@oceanbreezeresort.vn
- Website: www.oceanbreezeresort.vn
```

#### Sub-node 1: Google Gemini Chat Model
- **Model**: `gemini-2.0-flash`
- **Temperature**: `0.3`

#### Sub-node 2: Vector Store Question Answer Tool (RAG Tool)
- **Node Name** (góc trái trên cùng): Đổi thành `hotel_knowledge`
- **Description of Data**: `Use this tool to search for information about Ocean Breeze Resort, including room types, pricing, amenities, services, policies, promotions, nearby locations, and frequently asked questions (FAQs).`
- **Vector Store**: Postgres PGVector Store (Retrieve mode, Table: `knowledge_documents`, Top K: `5`)
- **Embeddings**: Embeddings Google Gemini (`models/gemini-embedding-001`)

#### Sub-node 3: PostgreSQL Tool (Live DB Tool - Cực kỳ quan trọng 🌟)
- Gắn một node **`PostgreSQL`** vào phần **Tools** của AI Agent.
- **Node Name**: Đổi thành `query_hotel_database`
- **Description**:
  `Use this tool to run read-only SQL SELECT queries on the hotel database to check live room pricing, room availability, services details, or policies.
  
  Available tables:
  1. room_types:
     - id (int)
     - name (varchar)
     - name_vi (varchar) - Vietnamese name
     - description_vi (text) - Detailed description
     - max_guests (int) - Max guests allowed
     - size_sqm (int) - Room size in square meters
     - base_price (decimal) - Nightly rate in VND
     - weekend_price (decimal)
     - holiday_price (decimal)
     - amenities (jsonb) - List of room amenities
  2. hotel_services:
     - name (varchar)
     - name_vi (varchar)
     - category (varchar)
     - description_vi (text)
     - price (decimal)
     - operating_hours (varchar)
  3. hotel_policies:
     - policy_type (varchar) - 'checkin', 'checkout', 'cancellation', etc.
     - title_vi (varchar)
     - content_vi (text)

  Rules:
  - ONLY execute SELECT queries. Never update or delete.
  - If a guest asks for recommendations, choose based on max_guests or price.
  - Return the results clearly.`
- **Credentials**: Chọn PostgreSQL credential đã tạo ở Bước 6.

#### Sub-node 4: Simple Memory
- Chọn **Window Buffer Memory** (Session Window: `10`, Key: `sessionId`).

---

## Bước 9: Test Chatbot! 🎉

### Test Knowledge Ingestion:
1. Mở workflow **"Hotel Knowledge Ingestion"**
2. Click **"Test workflow"** (nút play)
3. Đợi chạy xong → Check tất cả nodes đều xanh (success)
4. Verify dữ liệu:
   - Mở n8n Node **Postgres** để query: `SELECT count(*) FROM knowledge_documents`
   - Kết quả: ~23 documents

### Test Chat Agent:
1. Mở workflow **"Hotel Chatbot Agent"**
2. Click **"Chat"** (nút chat ở góc dưới phải)
3. Thử hỏi:
   - "Cho mình hỏi giá phòng"
   - "What rooms do you have?"
   - "Có hồ bơi không?"
   - "Chính sách hủy phòng như nào?"
   - "Do you have airport transfer?"
   - "Có khuyến mãi gì không?"

---

## 🛑 Xử Lý Sự Cố / Troubleshooting

### Docker không start được
```powershell
# Kiểm tra Docker đang chạy
docker info

# Restart tất cả
docker compose down
docker compose up -d

# Xem logs
docker compose logs postgres
docker compose logs n8n
```

### n8n không kết nối được PostgreSQL
- Đảm bảo sử dụng hostname `postgres` (KHÔNG PHẢI `localhost`)
- Kiểm tra postgres đã healthy: `docker compose ps`

### Embedding lỗi
- Kiểm tra Google AI API Key đã đúng
- Verify quota tại: https://aistudio.google.com/apikey
- Gemini free tier: 15 requests/minute, 1500 requests/day (đủ cho MVP)

### Reset hoàn toàn
```powershell
docker compose down -v   # Xóa cả volumes (mất hết data!)
docker compose up -d     # Tạo mới từ đầu
```

---

## 📊 Kiểm Tra Database

Bạn có thể kết nối trực tiếp vào PostgreSQL:

```powershell
docker exec -it hotel-chatbot-db psql -U hotel_admin -d hotel_chatbot
```

Các câu lệnh kiểm tra:
```sql
-- Kiểm tra data
SELECT count(*) FROM room_types;           -- Expected: 4
SELECT count(*) FROM hotel_services;       -- Expected: 13
SELECT count(*) FROM hotel_policies;       -- Expected: 8
SELECT count(*) FROM knowledge_documents;  -- Expected: ~23 (after ingestion)

-- Xem phòng
SELECT name_vi, base_price FROM room_types;

-- Xem knowledge documents
SELECT LEFT(content, 80) AS preview, category FROM knowledge_documents LIMIT 10;

-- Thoát
\q
```

---

## 📊 Quản Lý Database Bằng Giao Diện Web (Adminer)

Hệ thống đã được tích hợp sẵn công cụ **Adminer** để bạn dễ dàng quản lý, xem và sửa dữ liệu của phòng nghỉ, dịch vụ, khuyến mãi qua giao diện Web trực quan.

### 1. Truy cập:
Mở trình duyệt và truy cập: **`http://localhost:8080`** (hoặc `http://127.0.0.1:8080`)

### 2. Thông tin đăng nhập:
Điền chính xác các thông tin sau để kết nối vào Database:

| Trường nhập | Giá trị điền | Giải thích |
|---|---|---|
| **System** | `PostgreSQL` | Chọn từ dropdown menu |
| **Server** | `postgres` | Tên container PostgreSQL trong mạng Docker Compose |
| **Username** | `hotel_admin` | Tên người dùng quản trị đã cấu hình |
| **Password** | Mật khẩu của bạn | Điền mật khẩu bạn đã cấu hình trong file `.env` |
| **Database** | `hotel_chatbot` | Tên cơ sở dữ liệu của dự án |

### 3. Các thao tác cơ bản trên Adminer:
- **Xem dữ liệu phòng nghỉ**: Click vào bảng **`room_types`** ở cột trái -> Click **`Select data`** ở trên cùng. Bạn có thể bấm nút **`Edit`** trực tiếp ở từng dòng để đổi giá phòng hoặc mô tả.
- **Thêm dịch vụ mới**: Click vào bảng **`hotel_services`** -> Click **`New item`** -> Nhập tên dịch vụ tiếng Việt, tiếng Anh và giá cả -> Click **`Save`**.
- **Chạy lệnh SQL**: Click vào mục **`SQL command`** ở trên cùng bên trái để tự viết và chạy các câu lệnh SQL tùy ý.
