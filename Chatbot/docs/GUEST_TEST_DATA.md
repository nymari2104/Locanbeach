# 📋 Tổng Hợp Thông Tin Khách Hàng & Kịch Bản Hội Thoại (Test Data)

Tài liệu này tổng hợp lại toàn bộ thông tin cần thu thập từ khách hàng và các câu hỏi tình huống mẫu để bạn sử dụng cho việc kiểm tra (test) chatbot trong một cuộc hội thoại mới.

---

## 1. Thông Tin Cần Thu thập từ Khách Hàng (Booking Flow)

Khi khách hàng có nhu cầu đặt phòng hoặc lều trại, AI Chatbot được huấn luyện để thu thập các thông tin sau trước khi hướng dẫn khách liên hệ Hotline/Lễ tân:

| STT | Trường thông tin cần lấy | Mục đích | Cách gợi ý của AI |
|:---:|:------------------------|:---------|:------------------|
| 1 | **Số điện thoại (SĐT)** | Để lễ tân liên hệ xác nhận đặt phòng | *"Bạn vui lòng để lại số điện thoại nha..."* |
| 2 | **Số lượng khách** | Kiểm tra sức chứa tối đa của phòng (Người lớn + Trẻ em) | *"Đoàn mình đi tổng cộng bao nhiêu người lớn và trẻ em ạ?"* |
| 3 | **Ngày nhận/trả phòng** | Kiểm tra tình trạng phòng trống trên hệ thống | *"Bạn dự kiến check-in ngày nào và ở mấy đêm ạ?"* |
| 4 | **Hạng phòng quan tâm** | Lựa chọn phòng phù hợp (Standard, Deluxe, Family, President, Glamping) | *"Bạn đang quan tâm đến hạng phòng nghỉ hay cắm trại glamping bên mình?"* |

---

## 2. Kịch Bản & Câu Hỏi Test Mẫu (Dùng để Copy-Paste Test Chatbot)

Dưới đây là các câu hỏi thực tế từ khách hàng mà bạn đã gửi trong suốt quá trình xây dựng chatbot. Hãy copy-paste các câu này vào Messenger để kiểm tra độ chính xác của Agent.

### 🔹 Kịch bản 1: Hỏi về Chính sách Ở ghép / Share phòng (RAG & Memory Check)
* **Câu hỏi test**: `"Có thể share phòng không?"` hoặc `"Bên mình có cho ở ghép thêm người không?"`
* **Kết quả mong đợi**:
  - AI phải gọi công cụ RAG (`hotel_knowledge`).
  - Trả lời đúng chính sách: Cho phép share phòng/ở ghép với bạn bè/người thân miễn là tổng số khách không vượt quá sức chứa tối đa của phòng. Có thể kê thêm tối đa 1 giường phụ (extra bed) có phụ thu.
  - **Không** tự ý suy diễn hoặc lấy lịch sử chat cũ bị sai để trả lời.

### 🔹 Kịch bản 2: Hỏi về Vị trí & Khoảng cách (Địa chỉ chuẩn)
* **Câu hỏi test**: `"Resort địa chỉ ở đâu vậy?"` hoặc `"Cách biển bao xa?"`
* **Kết quả mong đợi**:
  - Địa chỉ chuẩn: *bãi biển Lộc An, ấp an Điền, xã Phước Hải, Bà Rịa, thành phố Hồ Chí Minh, Vietnam*
  - Khoảng cách: Chỉ cách bãi biển Lộc An 100m (khoảng 2 phút đi bộ).

### 🔹 Kịch bản 3: Hỏi về Chính sách Thú cưng (Pet Policy)
* **Câu hỏi test**: `"Mình có thể mang theo cún cưng/mèo vào phòng được không?"`
* **Kết quả mong đợi**:
  - Trả lời lịch sự nhưng dứt khoát: **The House áp dụng chính sách KHÔNG cho phép mang theo thú cưng** dưới bất kỳ hình thức nào để đảm bảo vệ sinh và an toàn.

### 🔹 Kịch bản 4: Hỏi về Khu vực Bếp chung & BBQ
* **Câu hỏi test**: `"Khu bếp chung có những gì?"` hoặc `"Mình muốn thuê bếp nướng BBQ ngoài trời?"`
* **Kết quả mong đợi**:
  - Bếp chung: Đầy đủ dụng cụ nấu nướng, hoàn toàn miễn phí.
  - Bếp nướng BBQ: Bàn nướng ngoài trời cực chill, có nhân viên chuẩn bị than hoa. Có sẵn set nướng hải sản/thịt theo yêu cầu.

### 🔹 Kịch bản 5: Hỏi về các dịch vụ chưa có thông tin (Ví dụ: Khuyến mãi/Promotions)
* **Câu hỏi test**: `"Hiện tại bên mình có khuyến mãi hay ưu đãi gì không bạn?"`
* **Kết quả mong đợi**:
  - Báo rõ ràng là hiện tại chưa có chương trình khuyến mãi nào đang diễn ra trên hệ thống.

---

## 3. Quy Tắc Vận Hành Của AI Agent (Bảo Mật & Tránh Hallucination)

* **Quy tắc 5 từ trở lên**: Khi khách chào hỏi ngắn gọn (dưới 2 từ) như `"Chào"`, `"Tư vấn"`, chatbot sẽ xuất hiện Menu Welcome dạng nút bấm. Khi khách hỏi câu dài mang tính chất truy vấn thông tin, AI Agent sẽ tiếp quản trực tiếp.
* **Luôn check công cụ**: AI bắt buộc phải gọi Database hoặc RAG trước khi trả lời mọi câu hỏi về dịch vụ/tiện ích/chính sách.
* **Fallback Hotline**: Nếu khách hỏi một câu hỏi nghiệp vụ mà hệ thống không có dữ liệu, AI sẽ không tự bịa ra câu trả lời mà sẽ lịch sự hướng dẫn khách gọi Hotline Lễ tân để được hỗ trợ trực tiếp.
