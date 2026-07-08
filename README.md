# The House - Lộc An Beach Resort (MVP)

Chào mừng bạn đến với Repository chính của dự án **The House - Lộc An Beach Resort**. Đây là một Monorepo chứa toàn bộ mã nguồn của hệ thống quản lý và vận hành khách sạn/resort, bao gồm website dành cho khách hàng, trang quản trị cho nhân viên và hệ thống Backend API mạnh mẽ.

---

## 📁 Cấu trúc thư mục (Monorepo Structure)

Dự án được chia thành hai phân hệ chính nằm ở 2 thư mục riêng biệt:

- **`/Backend`**: Chứa mã nguồn của hệ thống API được xây dựng bằng **Java Spring Boot 3**. Phân hệ này chịu trách nhiệm quản lý Database (PostgreSQL), kết nối với Cloudinary để lưu trữ ảnh, xử lý nghiệp vụ đặt phòng và cung cấp API cho Frontend và hệ thống Chatbot (n8n/Groq).
- **`/Frontend`**: Chứa mã nguồn của ứng dụng web được xây dựng bằng **Next.js (React)**. Phân hệ này cung cấp giao diện cho cả Khách hàng (đặt phòng online) và Quản trị viên/Nhân viên (Dashboard quản lý phòng, dịch vụ, hóa đơn).
- **`SRS.md`**: Tài liệu Đặc tả Yêu cầu Phần mềm (Software Requirements Specification), giải thích chi tiết các Use Cases.
- **`.env`**: (Bạn cần tự tạo) File chứa các biến môi trường cấu hình chung cho hệ thống (ví dụ: Thông tin Database, Cloudinary, API Keys...).

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy (Getting Started)

Để chạy dự án này trên máy tính cá nhân, bạn cần cài đặt **Java 17+**, **Node.js (v18+)** và **PostgreSQL**.

### 1. Cấu hình biến môi trường
Tạo một file `.env` ở thư mục gốc (root) của dự án và điền các thông tin cấu hình tương tự như sau:
```env
POSTGRES_USER=hotel_admin
POSTGRES_PASSWORD=your_password
POSTGRES_DB=hotel_chatbot
POSTGRES_PORT=5432

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
*(Backend đã được cấu hình để tự động import các biến này).*

### 2. Khởi chạy Backend (Spring Boot)
1. Mở Terminal (Command Prompt / PowerShell).
2. Di chuyển vào thư mục Backend:
   ```bash
   cd Backend
   ```
3. Chạy lệnh sau để khởi động server (Mặc định chạy ở cổng `8080`):
   ```bash
   mvn spring-boot:run
   ```
   *Lưu ý: Backend sử dụng Flyway, nên các bảng CSDL sẽ được tự động khởi tạo khi bạn chạy thành công.*

### 3. Khởi chạy Frontend (Next.js)
1. Mở một Terminal khác.
2. Di chuyển vào thư mục Frontend:
   ```bash
   cd Frontend
   ```
3. Cài đặt các gói thư viện cần thiết:
   ```bash
   npm install
   ```
4. Khởi động server phát triển (Mặc định chạy ở cổng `3000`):
   ```bash
   npm run dev
   ```
5. Truy cập `http://localhost:3000` trên trình duyệt để xem giao diện.

---

## 📚 Tài liệu tham khảo
- **Tài liệu Yêu cầu:** Vui lòng xem [SRS.md](./SRS.md).
- **API Docs / ERD:** Xem chi tiết thiết kế CSDL trong file `Backend/erd.dbml` và tài liệu API trong `Backend/api_docs.md`.

---
*Dự án đang trong giai đoạn phát triển (MVP).*
