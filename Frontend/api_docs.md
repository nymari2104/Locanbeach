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
Gọi khi người dùng hoàn tất điền form thông tin khách hàng và bấm "Xác nhận đặt phòng". Hệ thống tự động tính cọc **30%**.

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
      "totalAmount": 3000000.00, // Giá loại phòng * số đêm (1,5tr * 2 đêm)
      "depositAmount": 900000.00, // 30% tiền đặt cọc cần thanh toán
      "status": "PENDING_DEPOSIT"
    },
    "message": "Booking confirmed successfully"
  }
  ```

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

## ⚠️ 5. Xử Lý Lỗi & Danh Sách Error Codes (Error Handling for Frontend)

Hệ thống sử dụng cấu trúc phản hồi lỗi chuẩn khi xảy ra lỗi (HTTP Status code khác `2xx`). Frontend nên dựa vào thuộc tính `code` để thực hiện dịch ngôn ngữ hoặc hiển thị thông báo thân thiện cho người dùng.

### 5.1 Cấu Trúc Response Lỗi Chuẩn
Khi có lỗi xảy ra, API sẽ trả về cấu trúc như sau:
```json
{
  "code": "ERROR_CODE_STRING",
  "data": null,
  "message": "Chi tiết lỗi bằng Tiếng Anh (hoặc mô tả kỹ thuật)"
}
```

### 5.2 Danh Sách Error Codes Theo Nhóm

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

#### 📂 3. Nhóm Danh Mục & Loại Phòng (Categories & Accommodations)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `CATEGORY_NOT_FOUND` | Không tìm thấy loại phòng yêu cầu. | Sai ID loại phòng |
| **404** | `ACCOMMODATION_NOT_FOUND` | Không tìm thấy phòng vật lý yêu cầu. | Sai ID phòng vật lý |
| **409** | `CATEGORY_CODE_ALREADY_EXISTS` | Mã loại phòng này đã tồn tại trong hệ thống. | Tạo loại phòng trùng code |
| **409** | `ACCOMMODATION_CODE_ALREADY_EXISTS` | Số phòng này đã tồn tại trong hệ thống. | Tạo phòng trùng code/số phòng |

#### 💆 4. Nhóm Dịch Vụ, Combo & Tiện Ích (Services, Combos & Amenities)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `SERVICE_NOT_FOUND` | Không tìm thấy dịch vụ yêu cầu. | Sai ID dịch vụ |
| **404** | `COMBO_NOT_FOUND` | Gói combo ưu đãi không tồn tại hoặc đã hết hạn. | Sai ID combo |
| **404** | `AMENITY_NOT_FOUND` | Không tìm thấy tiện ích phòng yêu cầu. | Sai ID tiện ích |
| **409** | `SERVICE_NAME_ALREADY_EXISTS` | Tên dịch vụ này đã tồn tại. | Tạo dịch vụ trùng tên |

#### 🖼️ 5. Nhóm Hình Ảnh & Cloudinary
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **404** | `IMAGE_NOT_FOUND` | Không tìm thấy hình ảnh yêu cầu. | Sai ID ảnh |
| **500** | `CLOUDINARY_UPLOAD_FAILED` | Tải ảnh lên dịch vụ Cloudinary thất bại. | Lỗi khi upload file |
| **500** | `CLOUDINARY_DELETE_FAILED` | Xóa ảnh trên dịch vụ Cloudinary thất bại. | Lỗi khi destroy file |

#### ⚙️ 6. Các Lỗi Hệ Thống Chung (General/System Error)
| HTTP Status | `code` | Thông báo hiển thị gợi ý cho người dùng | Mô tả / Ngữ cảnh |
| :--- | :--- | :--- | :--- |
| **400** | `INVALID_INPUT` | Dữ liệu gửi lên không đúng định dạng. Vui lòng kiểm tra lại. | Lỗi parse JSON hoặc thiếu tham số |
| **400** | `VALIDATION_ERROR` | Thông tin nhập vào không hợp lệ. | Lỗi Bean Validation (ví dụ: email sai định dạng, giá trị âm,...) |
| **400** | `DATA_INTEGRITY_VIOLATION` | Thao tác thất bại do xung đột dữ liệu liên kết. | Lỗi khóa ngoại DB (ví dụ: xóa tiện ích đang được gán cho phòng) |
| **500** | `INTERNAL_SERVER_ERROR` | Hệ thống đang gặp sự cố. Vui lòng quay lại sau. | Lỗi hệ thống không xác định |
| **500** | `UNCATEGORIZED_EXCEPTION` | Đã xảy ra lỗi không xác định. | Lỗi Runtime chưa được phân nhóm cụ thể |

### 5.3 Cách Xử Lý Lợi Ý Cho Frontend
1. **Kiểm tra Response status**: Nếu `status !== 200` và `status !== 201`, hãy đọc `response.data`.
2. **Dựa vào `code`**: Sử dụng một dictionary mapper ở Frontend để map `code` sang Tiếng Việt.
   ```javascript
   const ErrorMessages = {
     "INVALID_CREDENTIALS": "Tên đăng nhập hoặc mật khẩu không chính xác.",
     "HOLD_EXPIRED": "Phiên giữ phòng của bạn đã hết hạn. Vui lòng chọn lại phòng.",
     // ... các mã khác
   };
   
   const getErrorMessage = (backendCode) => {
     return ErrorMessages[backendCode] || "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.";
   };
   ```
3. **Hiển thị thông báo**: Sử dụng Toast (ví dụ `react-hot-toast`, `react-toastify`) hoặc alert banner để hiển thị nội dung thân thiện cho khách hàng dựa vào hàm `getErrorMessage`.


