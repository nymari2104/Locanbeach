# Tài Liệu API Tích Hợp Frontend - The House Resort

Tài liệu này cung cấp chi tiết các API endpoints của hệ thống Backend The House Resort để phục vụ cho việc tích hợp của Frontend (Next.js).

## 📌 Thông Tin Chung
- **Môi trường phát triển (Local Base URL)**: `http://localhost:8080`
- **Định dạng dữ liệu**: `application/json`
- **Định dạng ngày giờ**: ISO-8601 (Ví dụ: `2026-07-05T14:00:00`) cho `LocalDateTime`.
- **Cấu trúc Response chuẩn**:
  ```json
  {
    "code": "SUCCESS",
    "data": null, // Chứa object hoặc array dữ liệu thực tế
    "message": "Thông báo từ hệ thống"
  }
  ```

---

## 🔑 1. API Tìm Kiếm & Đặt Phòng (Core Flow)

### 1.1 Tìm Kiếm Phòng Trống (Search Available Accommodations)
Trả về danh sách các Loại phòng kèm số lượng phòng trống tương ứng trong khoảng thời gian đã chọn, hỗ trợ lọc nâng cao.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/search/accommodations`
- **Query Parameters**:
  | Tham số | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `checkinDate` | `String (ISO DateTime)` | **Có** | Ngày giờ nhận phòng (e.g. `2026-08-10T14:00:00`) |
  | `checkoutDate` | `String (ISO DateTime)` | **Có** | Ngày giờ trả phòng (e.g. `2026-08-12T12:00:00`) |
  | `guestsCount` | `Integer` | Không | Lọc loại phòng có sức chứa tối đa >= số khách này |
  | `categoryId` | `UUID` | Không | Chỉ xem riêng một Loại phòng cụ thể |
  | `minPrice` | `Decimal` | Không | Lọc loại phòng có giá một đêm >= minPrice |
  | `maxPrice` | `Decimal` | Không | Lọc loại phòng có giá một đêm <= maxPrice |
  | `type` | `Enum (ROOM, CAMPING, GLAMPING)` | Không | Lọc theo loại hình lưu trú |
  | `amenityIds` | `List<UUID>` | Không | Danh sách các tiện ích bắt buộc phải có (ví dụ: gửi nhiều tham số `amenityIds=uuid1&amenityIds=uuid2`) |

- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": [
      {
        "categoryId": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
        "categoryName": "Phòng Deluxe Hướng Biển",
        "categoryCode": "DLX-SEA",
        "description": "Phòng tiêu chuẩn có ban công nhìn ra biển.",
        "basePrice": 1500000.00,
        "maxGuests": 2,
        "areaSqm": 35.50,
        "availableRoomsCount": 5,
        "images": [
          {
            "id": "e0b2d3c4-5678-90ab-cdef-1234567890ab",
            "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/the-house/abc-def.jpg",
            "isCover": true,
            "sortOrder": 0
          }
        ],
        "amenities": [
          {
            "id": "4a2d3e4f-5678-90ab-cdef-1234567890ab",
            "name": "Wifi Tốc độ cao",
            "icon": "wifi-icon"
          }
        ]
      }
    ],
    "message": "Tìm kiếm phòng trống thành công"
  }
  ```

---

### 1.2 Yêu Cầu Giữ Chỗ Tạm Thời (Hold Room)
Giữ chỗ trước một phòng vật lý trống thuộc loại phòng đã chọn trong vòng **10 phút** để người dùng tiến hành điền form thông tin.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/bookings/hold`
- **Request Body**:
  ```json
  {
    "categoryId": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
    "checkinDate": "2026-08-10T14:00:00",
    "checkoutDate": "2026-08-12T12:00:00"
  }
  ```
- **Response Mẫu (201 Created)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "holdId": "91c6-488c-bb82-dea2da0056d3-4bab9d12",
      "expiresAt": "2026-07-05T20:45:10.123456" // Hết hạn sau đúng 10 phút
    },
    "message": "Room held successfully for 10 minutes"
  }
  ```

---

### 1.3 Xác Nhận Đặt Phòng (Confirm Booking)
Gọi khi người dùng hoàn tất điền form thông tin khách hàng và bấm "Xác nhận đặt phòng". Hệ thống tự động tính cọc **30%** dựa trên tổng tiền sau khi đã trừ chiết khấu Coupon (nếu có).

- **HTTP Method**: `POST`
- **Path**: `/api/v1/bookings/confirm`
- **Request Body**:
  ```json
  {
    "holdId": "91c6-488c-bb82-dea2da0056d3-4bab9d12", // Lấy từ API Hold Room ở trên
    "guestName": "Nguyễn Văn A",
    "guestPhone": "0987654321",
    "guestEmail": "nguyenvana@example.com", // Không bắt buộc
    "guestsCount": 2,
    "couponCode": "WELCOME10", // Optional: Mã giảm giá người dùng áp dụng
    "notes": "Yêu cầu phòng không hút thuốc" // Không bắt buộc
  }
  ```
- **Response Mẫu (201 Created)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "bookingId": "8f89-8d63-4b6d-a365-27a3c7b39678",
      "accommodationId": "13f34979-8620-484f-9232-243ab63440f8",
      "accommodationCode": "ROOM-101", // Số phòng vật lý được tự động xếp
      "categoryId": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
      "categoryName": "Phòng Deluxe Hướng Biển",
      "guestName": "Nguyễn Văn A",
      "guestPhone": "0987654321",
      "checkinDate": "2026-08-10T14:00:00",
      "checkoutDate": "2026-08-12T12:00:00",
      "guestsCount": 2,
      "originalPrice": 3000000.00, // Giá gốc ban đầu (1,5tr * 2 đêm)
      "discountAmount": 300000.00, // Tiền được giảm từ Coupon (10%)
      "totalAmount": 2700000.00, // Tổng tiền thực tế cần trả sau giảm giá
      "depositAmount": 810000.00, // 30% tiền đặt cọc cần thanh toán (tính trên 2,7tr)
      "couponCode": "WELCOME10",
      "status": "PENDING_DEPOSIT"
    },
    "message": "Booking confirmed successfully"
  }
---

### 1.4 Lấy Phiên Giữ Phòng Hợp Nhất Đa Tab (Get Multi-Room Hold Session)
Tự động nhận diện Cookie `locan_guest_token` của người dùng và trả về danh sách tất cả các phòng đang giữ trong cùng 1 phiên.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/bookings/hold/session`
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "guestToken": "f47ac10b-58cc-4372-a567-0e02b2c3d4e5",
      "items": [
        {
          "itemId": "91c6-488c-bb82-dea2da0056d3",
          "categoryId": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
          "categoryName": "Phòng Deluxe Hướng Biển",
          "accommodationCode": "ROOM-101",
          "checkinDate": "2026-08-10T14:00:00",
          "checkoutDate": "2026-08-12T12:00:00",
          "numNights": 2,
          "pricePerNight": 1500000.00,
          "itemTotalAmount": 3000000.00
        }
      ],
      "totalAmount": 3000000.00,
      "depositAmount": 900000.00,
      "expiresAt": "2026-07-24T18:45:00"
    },
    "message": "Lấy phiên giữ phòng thành công"
  }
  ```

---

### 1.5 Xóa Một Phòng Khỏi Phiên Giữ Phòng (Remove Item from Session)
- **HTTP Method**: `DELETE`
- **Path**: `/api/v1/bookings/hold/items/{itemId}`

---

### 1.6 Hủy Toàn Bộ Phiên Giữ Phòng (Release Full Hold Session)
- **HTTP Method**: `DELETE`
- **Path**: `/api/v1/bookings/hold`

---

## 🛏️ 2. API Quản Lý Danh Mục (CRUD Categories & Accommodations)

### 2.1 Lấy danh sách Loại phòng
- **GET** `/api/v1/categories` -> Trả về danh sách tất cả các loại phòng.

### 2.2 Tạo Loại phòng mới
- **POST** `/api/v1/categories`
- **Body**:
  ```json
  {
    "name": "Phòng Deluxe Hướng Biển",
    "code": "DLX-SEA",
    "type": "ROOM", // Hoặc CAMPING, GLAMPING
    "description": "Mô tả phòng...",
    "basePrice": 1500000,
    "maxGuests": 2,
    "areaSqm": 35.5,
    "amenityIds": ["4a2d3e4f-5678-90ab-cdef-1234567890ab"] // Đính kèm danh sách ID tiện ích (Không bắt buộc)
  }
  ```

### 2.3 Tạo Phòng vật lý
- **POST** `/api/v1/accommodations`
- **Body**:
  ```json
  {
    "categoryId": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
    "code": "101" // Số phòng
  }
  ```

---

### 2.4 Cập nhật trạng thái dọn dẹp & Phân công (Update Operational Status & Assign Housekeeper)
Cập nhật trạng thái dọn dẹp phòng và phân công nhân viên dọn dẹp.

- **HTTP Method**: `PUT`
- **Path**: `/api/v1/staff/accommodations/{id}/operational-status`
- **Headers**:
  - `Authorization: Bearer <staffToken>`
- **Request Body**:
  ```json
  {
    "status": "CLEANING", // Hoặc VACANT, DIRTY, OCCUPIED
    "lastCleanedById": "3fa85f64-5717-4562-b3fc-2c963f66afa6" // Optional: ID nhân viên dọn dẹp (Nếu trống, tự động gán cho người thực hiện)
  }
  ```
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "id": "e0b2d3c4-5678-90ab-cdef-1234567890ab",
      "categoryId": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
      "categoryName": "Phòng Deluxe Hướng Biển",
      "code": "101",
      "status": "ACTIVE",
      "operationalStatus": "CLEANING",
      "lastCleanedById": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "lastCleanedByName": "Nguyễn Văn A"
    },
    "message": "Changed operational status successfully"
  }
  ```

---

### 2.5 Lấy danh sách nhân viên dọn phòng (Get Housekeepers list)
Lấy danh sách tài khoản thuộc vai trò `STAFF` đang hoạt động để phục vụ phân công công việc.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/staff/accommodations/users`
- **Headers**:
  - `Authorization: Bearer <staffToken>`
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "username": "housekeeper1",
        "fullName": "Nguyễn Văn A"
      }
    ],
    "message": "Fetched housekeepers successfully"
  }
  ```

---


## 🎪 3. Các API Tiện Ích, Dịch Vụ và Combo (CRUD)

### 3.1 Dịch Vụ Đi Kèm (Services)
- **GET** `/api/v1/services` -> Lấy tất cả dịch vụ (Spa, Nhà hàng, Giải trí...).
- **POST** `/api/v1/services`
  ```json
  {
    "name": "Spa Toàn Thân",
    "group": "SPA", // Hoặc RESTAURANT, ENTERTAINMENT, UTILITY
    "description": "Massage 60 phút",
    "price": 500000,
    "operatingHours": "09:00 - 22:00",
    "status": "ACTIVE"
  }
  ```

### 3.2 Gói Combo & Sự Kiện (Combos)
- **GET** `/api/v1/combos` -> Lấy danh sách Combo ưu đãi hoặc sự kiện.
- **POST** `/api/v1/combos`
  ```json
  {
    "name": "Combo Trăng Mật Ngọt Ngào",
    "type": "COMBO", // Hoặc EVENT
    "description": "Bao gồm 2 đêm phòng và 1 liệu trình Spa",
    "price": 2500000,
    "startDate": "2026-08-01",
    "endDate": "2026-08-31",
    "status": "ACTIVE"
  }
  ```

### 3.3 Tiện Ích Phòng (Amenities)
- **GET** `/api/v1/amenities` -> Lấy danh sách tiện ích.
- **POST** `/api/v1/amenities`
  ```json
  {
    "name": "Máy pha cà phê",
    "icon": "coffee-icon"
  }
  ```

---

## 🖼️ 4. API Upload & Quản Lý Hình Ảnh

### 4.1 Upload Ảnh lên Cloudinary
API này sử dụng phương thức `multipart/form-data` để upload ảnh lên Cloudinary và tự động lưu vào các bảng ảnh tương ứng (`category_images`, `service_images`, `combo_images`) dựa trên `targetType`.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/images/upload`
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  | Key | Kiểu dữ liệu | Bắt buộc | Mô tả |
  | :--- | :--- | :--- | :--- |
  | `file` | `File` | **Có** | File ảnh cần tải lên |
  | `targetType` | `String` | **Có** | Loại đối tượng gắn ảnh: `CATEGORY`, `SERVICE`, `COMBO` |
  | `targetId` | `UUID` | **Có** | ID của đối tượng tương ứng |
  | `isCover` | `Boolean` | Không | Đánh dấu là ảnh bìa (mặc định: `false`) |
  | `sortOrder` | `Integer` | Không | Thứ tự hiển thị của ảnh (mặc định: `0`) |

- **Response Mẫu (201 Created)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "id": "e0b2d3c4-5678-90ab-cdef-1234567890ab",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/the-house/abc-def.jpg",
      "isCover": true,
      "sortOrder": 0
    },
    "message": "Upload image successfully"
  }
  ```

---

### 4.2 Cập nhật thông tin Ảnh (Update Metadata)
Cập nhật cờ ảnh bìa hoặc thứ tự sắp xếp của ảnh.

- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/images/{targetType}/{imageId}`
  - `targetType`: `CATEGORY`, `SERVICE`, `COMBO`
  - `imageId`: UUID của ảnh cần cập nhật
- **Request Body**:
  ```json
  {
    "isCover": true,
    "sortOrder": 2
  }
  ```
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "id": "e0b2d3c4-5678-90ab-cdef-1234567890ab",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/the-house/abc-def.jpg",
      "isCover": true,
      "sortOrder": 2
    },
    "message": "Update image metadata successfully"
  }
  ```

---

### 4.3 Xóa Ảnh (Delete Image)
Xóa ảnh trong database và đồng thời gọi Cloudinary API để xóa vĩnh viễn file trên Cloud.

- **HTTP Method**: `DELETE`
- **Path**: `/api/v1/images/{targetType}/{imageId}`
  - `targetType`: `CATEGORY`, `SERVICE`, `COMBO`
  - `imageId`: UUID của ảnh cần xóa
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": null,
    "message": "Delete image successfully"
  }
  ```

---

### 💡 Lưu ý về các API GET liên quan
Khi bạn gọi các API GET lấy thông tin danh mục, dịch vụ, hoặc combo ưu đãi như:
- `GET /api/v1/categories` hoặc `GET /api/v1/categories/{id}`
- `GET /api/v1/services` hoặc `GET /api/v1/services/{id}`
- `GET /api/v1/combos` hoặc `GET /api/v1/combos/{id}`

Dữ liệu trả về bây giờ sẽ tự động đính kèm thêm mảng `images` chứa danh sách ảnh đã được map thành công. Đối với riêng Loại phòng (Category), dữ liệu trả về sẽ kèm theo cả danh sách tiện ích (`amenities`) và danh sách ID của tiện ích (`amenityIds`).

Ví dụ trong phần `data` của Category sẽ có cấu trúc như sau:
```json
{
  "id": "2da291c6-bb82-4bab-91c6-dea2da0056d3",
  "name": "Phòng Deluxe Hướng Biển",
  ...
  "images": [
    {
      "id": "e0b2d3c4-5678-90ab-cdef-1234567890ab",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234567890/the-house/abc-def.jpg",
      "isCover": true,
      "sortOrder": 0
    }
  ],
  "amenityIds": [
    "4a2d3e4f-5678-90ab-cdef-1234567890ab"
  ],
  "amenities": [
    {
      "id": "4a2d3e4f-5678-90ab-cdef-1234567890ab",
      "name": "Wifi Tốc độ cao",
      "icon": "wifi-icon"
    }
  ]
}
```

---

## 🎁 5. API Mã Giảm Giá & Ưu Đãi (Coupons & Promotions)

### 5.1 Kiểm tra & Áp dụng Mã Giảm Giá (Validate Coupon - Public Endpoint)
Khách hàng vãng lai trên trang Checkout nhập mã khuyến mãi (ví dụ `WELCOME10`, `LOCAN200K`) và bấm "Áp dụng". API này **không yêu cầu đăng nhập**.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/coupons/validate`
- **Request Body**:
  ```json
  {
    "code": "WELCOME10",
    "totalAmount": 1800000, // Tổng tiền đơn phòng trước giảm giá
    "checkinDate": "2026-08-01T14:00:00", // Optional: Kiểm tra thời gian lưu trú
    "checkoutDate": "2026-08-02T12:00:00"  // Optional: Kiểm tra thời gian lưu trú
  }
  ```
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "id": "c0000000-0000-0000-0000-000000000001",
      "code": "WELCOME10",
      "description": "Mã ưu đãi chào mừng - Giảm 10% tổng giá trị đơn đặt phòng",
      "discountType": "PERCENTAGE", // "PERCENTAGE" hoặc "FIXED_AMOUNT"
      "discountValue": 10.00,
      "originalAmount": 1800000.00, // Tổng tiền ban đầu
      "discountAmount": 180000.00, // Tiền chiết khấu được giảm
      "finalAmount": 1620000.00, // Tổng tiền thực tế còn lại
      "minBookingAmount": 500000.00,
      "maxDiscountAmount": 500000.00
    },
    "message": "Áp dụng mã giảm giá thành công"
  }
  ```

---

### 5.2 Lấy danh sách tất cả Mã Giảm Giá (Admin Only)
- **HTTP Method**: `GET`
- **Path**: `/api/v1/coupons`
- **Headers**: `Authorization: Bearer <adminToken>`
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": [
      {
        "id": "c0000000-0000-0000-0000-000000000001",
        "code": "WELCOME10",
        "description": "Mã ưu đãi chào mừng - Giảm 10% tổng giá trị đơn đặt phòng",
        "discountType": "PERCENTAGE",
        "discountValue": 10.00,
        "minBookingAmount": 500000.00,
        "maxDiscountAmount": 500000.00,
        "minLengthOfStay": 1,
        "startDate": "2026-01-01T00:00:00",
        "endDate": "2026-12-31T23:59:59",
        "maxUsage": 100,
        "currentUsage": 12,
        "isActive": true
      }
    ],
    "message": "Lấy danh sách mã giảm giá thành công"
  }
  ```

---

### 5.3 Tạo Mã Giảm Giá mới (Admin Only)
- **HTTP Method**: `POST`
- **Path**: `/api/v1/coupons`
- **Headers**: `Authorization: Bearer <adminToken>`
- **Request Body**:
  ```json
  {
    "code": "SUMMER2026",
    "description": "Ưu đãi mùa hè 2026 - Giảm 15%",
    "discountType": "PERCENTAGE", // HOẶC "FIXED_AMOUNT"
    "discountValue": 15.00,
    "minBookingAmount": 1000000.00,
    "maxDiscountAmount": 300000.00,
    "minLengthOfStay": 1,
    "startDate": "2026-06-01T00:00:00",
    "endDate": "2026-09-30T23:59:59",
    "maxUsage": 50,
    "isActive": true
  }
  ```

---

### 5.4 Bật / Tắt trạng thái Mã Giảm Giá (Toggle Status - Admin Only)
- **HTTP Method**: `PATCH`
- **Path**: `/api/v1/coupons/{id}/toggle`
- **Headers**: `Authorization: Bearer <adminToken>`

---

---

## 💳 6. API Thanh Toán VietQR & Webhook Tự Động (Payment & Auto-Confirmation)

### 6.1 Tạo mã VietQR Động cho Đơn Đặt Phòng (Create VietQR - Public Endpoint)
Khởi tạo dữ liệu mã VietQR tĩnh/động cho đơn đặt phòng vừa được confirm.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/payments/create-qr`
- **Request Body**:
  ```json
  {
    "bookingId": "8f89-8d63-4b6d-a365-27a3c7b39678"
  }
  ```
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "bookingId": "8f89-8d63-4b6d-a365-27a3c7b39678",
      "bookingCode": "8F898D63",
      "depositAmount": 810000.00, // Số tiền cọc 30%
      "totalAmount": 2700000.00,
      "bankName": "MBBank",
      "bankAccountNo": "0987654321",
      "bankAccountName": "THE HOUSE LOC AN BEACH",
      "transferContent": "LOCAN 8F898D63", // Nội dung chuyển khoản bắt buộc
      "qrImageUrl": "https://img.vietqr.io/image/mb-0987654321-compact2.png?amount=810000&addInfo=LOCAN+8F898D63&accountName=THE+HOUSE+LOC+AN+BEACH",
      "status": "PENDING_DEPOSIT"
    },
    "message": "Tạo mã VietQR thanh toán thành công"
  }
  ```

---

### 6.2 Nạp dữ liệu Webhook Ngân hàng / PayOS / Casso (Bank Webhook Callback)
Endpoint tiếp nhận thông báo tự động từ Ngân hàng / PayOS / Casso khi tiền về tài khoản Resort. Backend tự động đối soát nội dung `LOCAN <Code>` và chuyển trạng thái đơn sang `CONFIRMED`.

- **HTTP Method**: `POST`
- **Path**: `/api/v1/payments/webhook`
- **Request Body**:
  ```json
  {
    "transactionId": "FT26205891234", // Mã giao dịch ngân hàng
    "amount": 810000.00,
    "content": "Chuyen tien coc phong LOCAN 8F898D63",
    "gateway": "VIETQR"
  }
  ```
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "id": "e0b2d3c4-5678-90ab-cdef-1234567890ab",
      "bookingId": "8f89-8d63-4b6d-a365-27a3c7b39678",
      "transactionId": "FT26205891234",
      "amount": 810000.00,
      "paymentMethod": "VIETQR",
      "transferContent": "Chuyen tien coc phong LOCAN 8F898D63",
      "status": "SUCCESS",
      "paidAt": "2026-07-23T21:05:00"
    },
    "message": "Xử lý webhook thanh toán thành công"
  }
  ```

---

### 6.3 Kiểm Tra Trạng Thái Thanh Toán (Polling Payment Status)
Frontend màn hình `/payment` gọi định kỳ mỗi 3 giây để biết khi nào ngân hàng xác nhận tiền cọc thành công.

- **HTTP Method**: `GET`
- **Path**: `/api/v1/payments/booking/{bookingId}/status`
- **Response Mẫu (200 OK)**:
  ```json
  {
    "code": "SUCCESS",
    "data": {
      "bookingId": "8f89-8d63-4b6d-a365-27a3c7b39678",
      "bookingCode": "8F898D63",
      "depositAmount": 810000.00,
      "totalAmount": 2700000.00,
      "status": "CONFIRMED" // Chuyển sang CONFIRMED sau khi Webhook nhận tiền!
    },
    "message": "Lấy trạng thái thanh toán thành công"
  }
  ```

---

## ⚠️ 7. Xử Lý Lỗi & Danh Sách Error Codes (Error Handling for Frontend)

Hệ thống sử dụng cấu trúc phản hồi lỗi chuẩn khi xảy ra lỗi (HTTP Status code khác `2xx`). Frontend nên dựa vào thuộc tính `code` để thực hiện dịch ngôn ngữ hoặc hiển thị thông báo thân thiện cho người dùng.

### 6.1 Cấu Trúc Response Lỗi Chuẩn
Khi có lỗi xảy ra, API sẽ trả về cấu trúc như sau:
```json
{
  "code": "ERROR_CODE_STRING",
  "data": null,
  "message": "Chi tiết lỗi bằng Tiếng Anh (hoặc mô tả kỹ thuật)"
}
```

### 6.2 Danh Sách Error Codes Theo Nhóm

#### 🔐 1. Nhóm Xác Thực & Phân Quyền (Authentication & Authorization)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **401** | `INVALID_CREDENTIALS` | Tên đăng nhập hoặc mật khẩu không chính xác. | Sai thông tin khi đăng nhập |
| **401** | `TOKEN_INVALID` | Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại. | JWT Token không hợp lệ hoặc hết hạn |
| **401** | `UNAUTHORIZED` | Vui lòng đăng nhập để thực hiện chức năng này. | Chưa cung cấp token |
| **403** | `USER_DISABLED` | Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên. | Tài khoản bị disable |
| **403** | `ACCESS_DENIED` | Bạn không có quyền thực hiện hành động này. | Token hợp lệ nhưng không đủ quyền |
| **404** | `USER_NOT_FOUND` | Không tìm thấy thông tin tài khoản. | Không tồn tại username |

#### 📅 2. Nhóm Đặt Phòng & Giữ Chỗ (Booking Flow)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **400** | `INVALID_CHECKIN_STATUS` | Ngày nhận phòng hoặc ngày trả phòng không hợp lệ. | Ngày trả phòng trước ngày nhận phòng |
| **400** | `INVALID_CHECKOUT_STATUS` | Phòng chưa được check-in nên không thể thực hiện check-out. | Check-out khi trạng thái đặt phòng không phải CHECKED_IN |
| **404** | `HOLD_NOT_FOUND` | Phiên giữ chỗ không hợp lệ hoặc đã bị hủy. | Không tìm thấy Hold ID |
| **404** | `BOOKING_NOT_FOUND` | Không tìm thấy thông tin đơn đặt phòng này. | Không tìm thấy Booking ID |
| **409** | `NO_AVAILABLE_ROOM` | Đã hết phòng trống cho loại phòng và thời gian bạn đã chọn. | Không còn phòng vật lý trống |
| **410** | `HOLD_EXPIRED` | Phiên giữ phòng của bạn đã hết hạn (quá 10 phút). Vui lòng thử lại. | Đặt chỗ tạm thời đã hết hạn |

#### 🎁 3. Nhóm Mã Giảm Giá & Ưu Đãi (Coupons & Promotions)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `COUPON_NOT_FOUND` | Mã giảm giá không tồn tại. | Sai mã coupon |
| **400** | `COUPON_INACTIVE` | Mã giảm giá hiện đang bị khóa hoặc ngưng áp dụng. | Mã bị Admin ngưng kích hoạt |
| **400** | `COUPON_NOT_STARTED` | Mã giảm giá chưa đến thời gian áp dụng. | Chưa đến startDate |
| **400** | `COUPON_EXPIRED` | Mã giảm giá đã hết hạn sử dụng. | Quá endDate |
| **400** | `COUPON_USAGE_LIMIT_EXCEEDED` | Mã giảm giá đã hết lượt sử dụng. | currentUsage >= maxUsage |
| **400** | `MIN_BOOKING_AMOUNT_NOT_MET` | Tổng đơn giá chưa đạt giá trị tối thiểu để áp dụng mã giảm giá. | Đơn giá < minBookingAmount |
| **400** | `MIN_LENGTH_OF_STAY_NOT_MET` | Số đêm lưu trú chưa đủ điều kiện áp dụng mã giảm giá này. | Số đêm < minLengthOfStay |
| **400** | `COUPON_CODE_ALREADY_EXISTS` | Mã giảm giá này đã tồn tại trong hệ thống. | Tạo mã trùng code |

#### 📂 4. Nhóm Danh Mục & Loại Phòng (Categories & Accommodations)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `CATEGORY_NOT_FOUND` | Không tìm thấy loại phòng yêu cầu. | Sai ID loại phòng |
| **404** | `ACCOMMODATION_NOT_FOUND` | Không tìm thấy phòng vật lý yêu cầu. | Sai ID phòng vật lý |
| **409** | `CATEGORY_CODE_ALREADY_EXISTS` | Mã loại phòng này đã tồn tại trong hệ thống. | Tạo loại phòng trùng code |
| **409** | `ACCOMMODATION_CODE_ALREADY_EXISTS` | Số phòng này đã tồn tại trong hệ thống. | Tạo phòng trùng code/số phòng |

#### 💆 5. Nhóm Dịch Vụ, Combo & Tiện Ích (Services, Combos & Amenities)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `SERVICE_NOT_FOUND` | Không tìm thấy dịch vụ yêu cầu. | Sai ID dịch vụ |
| **404** | `COMBO_NOT_FOUND` | Gói combo ưu đãi không tồn tại hoặc đã hết hạn. | Sai ID combo |
| **404** | `AMENITY_NOT_FOUND` | Không tìm thấy tiện ích phòng yêu cầu. | Sai ID tiện ích |
| **409** | `SERVICE_NAME_ALREADY_EXISTS` | Tên dịch vụ này đã tồn tại. | Tạo dịch vụ trùng tên |

#### 🖼️ 6. Nhóm Hình Ảnh & Cloudinary
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `IMAGE_NOT_FOUND` | Không tìm thấy hình ảnh yêu cầu. | Sai ID ảnh |
| **500** | `CLOUDINARY_UPLOAD_FAILED` | Tải ảnh lên dịch vụ Cloudinary thất bại. | Lỗi khi upload file |
| **500** | `CLOUDINARY_DELETE_FAILED` | Xóa ảnh trên dịch vụ Cloudinary thất bại. | Lỗi khi destroy file |

#### ⚙️ 7. Các Lỗi Hệ Thống Chung (General/System Error)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **400** | `INVALID_INPUT` | Dữ liệu gửi lên không đúng định dạng. Vui lòng kiểm tra lại. | Lỗi parse JSON hoặc thiếu tham số |
| **400** | `VALIDATION_ERROR` | Thông tin nhập vào không hợp lệ. | Lỗi Bean Validation |
| **400** | `DATA_INTEGRITY_VIOLATION` | Thao tác thất bại do xung đột dữ liệu liên kết. | Lỗi khóa ngoại DB |
| **500** | `INTERNAL_SERVER_ERROR` | Hệ thống đang gặp sự cố. Vui lòng quay lại sau. | Lỗi hệ thống không xác định |
| **500** | `UNCATEGORIZED_EXCEPTION` | Đã xảy ra lỗi không xác định. | Lỗi Runtime chưa được phân nhóm cụ thể |

---

### 6.3 Hướng Dẫn Tích Hợp Cho Frontend (Next.js Integration Guide)

#### 🛒 1. Màn hình Checkout Người dùng (`/checkout`):
1. **Thiết kế UI ô nhập Promo Code:** Thêm ô input nhập mã kèm nút **"Áp dụng"**.
2. **Gọi API Validate:** Khi khách bấm nút Áp dụng:
   - Gửi `POST /api/v1/coupons/validate` với `{ code, totalAmount, checkinDate, checkoutDate }`.
   - Nếu trả về `SUCCESS` (Status 200): Lấy `data.discountAmount` và `data.finalAmount` từ response để cập nhật UI tiền giảm và tổng tiền thực tế.
   - Nếu trả về lỗi (Status 400/404): Hiển thị Toast thông báo lỗi dựa trên `code` (ví dụ `MIN_BOOKING_AMOUNT_NOT_MET` ➔ *"Tổng đơn giá chưa đạt giá trị tối thiểu"*).
3. **Gửi đơn vị Đặt phòng:** Khi khách bấm "Xác nhận đặt phòng", đính kèm `couponCode` vào body `POST /api/v1/bookings/confirm`.

#### 🛠️ 2. Màn hình Quản trị Admin (`/admin/coupons`):
1. **Danh sách Coupon:** Gọi `GET /api/v1/coupons` hiển thị dạng Bảng hoặc Card Grid kèm trạng thái Bật/Tắt (`isActive`), số lượt dùng (`currentUsage / maxUsage`).
2. **Công tắc Toggle:** Bấm nút Bật/Tắt kích hoạt gọi `PATCH /api/v1/coupons/{id}/toggle`.
3. **Tạo mới Mã:** Form Modal gọi `POST /api/v1/coupons`.
4. **Xóa Mã:** Nút Xóa gọi `DELETE /api/v1/coupons/{id}`.


