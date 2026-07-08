# Tài Liệu Đặc Tả Yêu Cầu Phần Mềm (Software Requirements Specification - SRS)
**Dự Án: Hệ Thống Quản Lý & Vận Hành The House - Lộc An Beach Resort (Kèm Chatbot MVP)**

---

## 1. GIỚI THIỆU CHUNG (INTRODUCTION)

### 1.1 Mục Đích (Purpose)
Tài liệu SRS này mô tả các yêu cầu chức năng (Functional Requirements) và phi chức năng (Non-Functional Requirements) cho dự án phần mềm quản lý The House - Lộc An Beach. Hệ thống bao gồm website đặt phòng dành cho khách hàng, trang quản trị dành cho nhân viên/admin, hệ thống API backend và một Chatbot AI tư vấn đặt phòng tự động.

### 1.2 Phạm Vi Ứng Dụng (Scope)
Hệ thống giải quyết bài toán vận hành của resort bao gồm:
- **Khách hàng (Public):** Xem thông tin phòng, tiện ích, dịch vụ, combo ưu đãi và thực hiện đặt phòng trực tuyến.
- **Quản trị (Admin/Staff):** Quản lý danh mục phòng, dịch vụ, booking, kiểm soát tình trạng vận hành thực tế của phòng.
- **Chatbot AI:** Tư vấn tự động cho khách hàng qua Facebook Messenger dựa trên dữ liệu thời gian thực từ hệ thống.

---

## 2. MÔ TẢ TỔNG QUAN (OVERALL DESCRIPTION)

### 2.1 Môi Trường Hoạt Động & Công Nghệ (Technology Stack)
- **Frontend Web:** Next.js, React, TypeScript, CSS Modules.
- **Backend API:** Java Spring Boot 3, Hibernate/JPA, RESTful APIs.
- **Cơ Sở Dữ Liệu:** PostgreSQL (Quản lý schema bằng Flyway).
- **Lưu Trữ Media:** Cloudinary.
- **Chatbot & Automation:** n8n, Zernio/Groq (LLM), Google Gemini.

### 2.2 Các Nhóm Người Dùng (User Classes & Roles)
1. **Khách Hàng (Customer - Không cần đăng nhập):** Xem thông tin, đặt phòng, trò chuyện với Chatbot.
2. **Nhân Viên (Staff):** Quản lý trạng thái dọn dẹp, xử lý check-in/check-out cho khách, quản lý các dịch vụ/combo của booking.
3. **Quản Trị Viên (Admin):** Toàn quyền cấu hình danh mục phòng, giá cả, dịch vụ, khuyến mãi, quản lý tài khoản nhân viên.

---

## 3. YÊU CẦU CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

### 3.1 Phân Hệ Khách Hàng (Public Facing)
- **FR1.1 - Tìm Kiếm & Xem Phòng:** Khách có thể xem danh sách phòng (Room, Camping, Glamping) kèm ảnh, tiện nghi, mô tả. Tìm kiếm phòng trống theo ngày Check-in/Check-out và số lượng khách.
- **FR1.2 - Đặt Phòng (Booking):** Đăng ký thông tin cá nhân và đặt phòng. Đơn hàng chuyển sang trạng thái "Chờ đặt cọc".
- **FR1.3 - Xem Dịch Vụ & Combo:** Xem thông tin các dịch vụ (Spa, Nhà hàng, Giải trí) và Combo sự kiện hiện có.
- **FR1.4 - Thanh Toán Đặt Cọc:** Hỗ trợ xử lý webhook/callback khi khách thanh toán thành công để cập nhật trạng thái đặt phòng.

### 3.2 Phân Hệ Quản Trị (Admin Dashboard)
- **FR2.1 - Quản Lý Hạng Phòng (Accommodation Categories):** Thêm, sửa, xóa các hạng phòng. Thiết lập giá cơ bản, số khách tối đa, diện tích và gán tiện ích (Amenities).
- **FR2.2 - Quản Lý Phòng Vật Lý (Accommodations):** Tạo các phòng thực tế dựa trên hạng phòng (VD: Phòng 101, 102 thuộc hạng Deluxe). Thiết lập trạng thái hoạt động (Active/Maintenance).
- **FR2.3 - Quản Lý Media (Upload Ảnh):** Tải ảnh lên Cloudinary cho phòng, dịch vụ, combo. Thiết lập ảnh cover và thứ tự hiển thị.
- **FR2.4 - Quản Lý Dịch Vụ & Combo:** Tạo mới và thiết lập giá cho các dịch vụ nội khu hoặc combo ưu đãi trọn gói.

### 3.3 Phân Hệ Vận Hành (Staff Dashboard)
- **FR3.1 - Quản Lý Booking:** Xem danh sách đơn đặt phòng. Cập nhật trạng thái (Confirmed, Checked-In, Checked-Out, Cancelled).
- **FR3.2 - Quản Lý Trạng Thái Buồng Phòng (Operational Status):** Nhân viên dọn phòng có thể cập nhật trạng thái thực tế của từng phòng: Trống (Vacant), Đang ở (Occupied), Đang dọn (Cleaning).
- **FR3.3 - Quản Lý Room Holds:** Giữ chỗ tạm thời (Temporary Lock) cho phòng khi khách đang trong quá trình thanh toán hoặc chờ xác nhận.

### 3.4 Phân Hệ Chatbot (AI Integration)
- **FR4.1 - Tư Vấn Tự Động:** Chatbot đọc dữ liệu phòng, dịch vụ từ API backend để tư vấn trực tiếp cho khách qua Facebook Messenger.
- **FR4.2 - Gợi Ý Đặt Phòng:** Hướng dẫn khách hàng luồng đặt phòng và cung cấp link dẫn tới hệ thống booking.

---

## 4. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### 4.1 Bảo Mật (Security)
- Xác thực API qua JWT (JSON Web Token) cho các route Admin/Staff.
- Mã hóa mật khẩu người dùng bằng Bcrypt.
- Upload file an toàn, chỉ chấp nhận định dạng ảnh hợp lệ (jpg, png, webp) và giới hạn dung lượng < 5MB qua API Cloudinary.

### 4.2 Hiệu Năng & Khả Năng Mở Rộng (Performance & Scalability)
- API tìm kiếm phòng trống phải phản hồi nhanh (< 500ms) bằng cách tối ưu SQL Queries và Index trên bảng `bookings` và `room_holds`.
- Hệ thống backend Spring Boot có khả năng scale up thông qua Docker containers.

### 4.3 Tính Toàn Vẹn Dữ Liệu (Data Integrity)
- Không cho phép xóa vĩnh viễn (Hard Delete) các phòng hoặc dịch vụ đã có lịch sử đặt phòng (Sử dụng Enum Status: INACTIVE).
- Quản lý transaction chặt chẽ trong quá trình thanh toán và cập nhật trạng thái buồng phòng.

---

## 5. MÔ HÌNH DỮ LIỆU TỔNG QUAN (DATA MODEL OVERVIEW)

Hệ thống dựa trên cấu trúc CSDL Relational (PostgreSQL) bao gồm các thực thể cốt lõi:
1. **Users:** Quản lý tài khoản Admin/Staff.
2. **Accommodation_Categories & Accommodations:** Mô hình phân cấp 2 lớp. Hạng phòng (thông tin chung, giá) -> Phòng vật lý (số phòng thực tế, trạng thái dọn dẹp).
3. **Amenities:** Tiện nghi (Wifi, TV...) có quan hệ N-N với hạng phòng.
4. **Images:** Quan hệ 1-N (Category_Images, Service_Images, Combo_Images) quản lý ảnh lưu trên Cloud.
5. **Bookings & Room_Holds:** Quản lý vòng đời đơn đặt phòng và giữ chỗ tạm thời, ngăn chặn việc overbooking.
6. **Services & Combos:** Quản lý các dịch vụ đi kèm.
7. **Booking_Services & Booking_Combos:** Lưu trữ dịch vụ khách chọn thêm vào hóa đơn đặt phòng.

---

## 6. CHI TIẾT CÁC USE CASE (DETAILED USE CASES)

### 6.1 Phân Hệ Khách Hàng (Public User Flow)
- **UC1.1 - Xem danh sách phòng:** Khách truy cập xem danh sách tất cả các hạng phòng đang hoạt động (Active).
- **UC1.2 - Lọc tìm phòng trống (Booking Search):** Khách nhập ngày Check-in, Check-out và số lượng khách để hệ thống truy xuất các phòng còn trống và phù hợp sức chứa.
- **UC1.3 - Xem chi tiết phòng:** Khách click vào một phòng để xem chi tiết, ảnh (ảnh bìa, ảnh stack) và tiện ích đi kèm.
- **UC1.4 - Tạo đơn đặt phòng mới (Create Booking):** Khách điền thông tin cá nhân, chọn phòng và xác nhận. Đơn hàng chuyển sang trạng thái "Chờ đặt cọc".
- **UC1.5 - Xem chi tiết hóa đơn/đơn hàng:** Khách/hệ thống truy xuất lại chi tiết đặt phòng sau khi hoàn tất.
- **UC1.6 - Xử lý thanh toán đặt cọc (Callback):** Nhận callback từ cổng thanh toán để chuyển đơn hàng từ "Chờ đặt cọc" sang "Đã xác nhận".
- **UC1.7 - Xem danh sách dịch vụ & combo:** Khách xem các dịch vụ nội khu và combo ưu đãi trọn gói.

### 6.2 Phân Hệ Quản Trị (Admin Dashboard Flow)
- **UC2.1 - Quản lý hạng phòng:** Admin tạo mới/sửa/xóa thông tin hạng phòng (tên, mô tả, sức chứa, giá tiền, tiện ích).
- **UC2.2 - Quản lý phòng vật lý:** Admin tạo các phòng cụ thể thuộc hạng phòng (vd: Phòng 101, 102), gán mã code, cấu hình metadata và trạng thái hoạt động.
- **UC2.3 - Tải ảnh (Upload Media):** Upload ảnh, cập nhật ảnh bìa (isCover), thay đổi thứ tự (sortOrder) cho hạng phòng, dịch vụ, sự kiện.
- **UC2.4 - Quản lý sự kiện & Combo:** Admin tạo và thiết lập thời gian áp dụng, giá cả cho các combo ưu đãi.
- **UC2.5 - Quản lý dịch vụ tiện ích:** Admin thêm/sửa/xóa thông tin các dịch vụ (Spa, Nhà hàng, Giải trí, v.v.).

### 6.3 Phân Hệ Vận Hành (Staff Operational Flow)
- **UC3.1 - Quản lý trạng thái buồng phòng (Operational Status):** Nhân viên buồng phòng/lễ tân thay đổi trạng thái thực tế của phòng: Trống (Vacant), Đang ở (Occupied), Đang dọn dẹp (Cleaning), Bảo trì (Maintenance).
- **UC3.2 - Check-in / Check-out:** Lễ tân tiếp nhận khách, đổi trạng thái booking từ "Confirmed" sang "Checked-In", và sau cùng là "Checked-Out".
- **UC3.3 - Xử lý Hủy phòng (Cancel Booking):** Hủy đơn đặt phòng và ghi nhận lý do hủy.

---
*Phiên bản tài liệu: 1.0 | Cập nhật lần cuối: Tháng 7/2026*
