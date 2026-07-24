# 📢 PROMPT HƯỚNG DẪN TÍCH HỢP HỆ THỐNG GIỮ PHÒNG ĐA TAB & ĐA PHÒNG (HOLD ROOM SPEC FOR FRONTEND)

> **Mục tiêu:** Hướng dẫn đội ngũ Frontend (Next.js / React) tích hợp cơ chế Giữ Phòng Hợp Nhất (Unified Multi-Room Hold Session) sử dụng Cookie `locan_guest_token` và đồng bộ đa tab thời gian thực bằng `BroadcastChannel` API.

---

## 📌 1. BẢN CHẤT KIẾN TRÚC MỚI

1. **Định danh qua Cookie (`locan_guest_token`):**
   - Backend tự động tạo và gửi Cookie `locan_guest_token` cho trình duyệt.
   - Mỗi trình duyệt (Client) chỉ sở hữu **duy nhất 1 Phiên Giữ Phòng (Hold Session)** active tại một thời điểm.
2. **Cơ chế Gộp Phòng Tự Động (Multi-Room Accumulation):**
   - Khách mở tab mới hoặc chọn thêm bất kỳ loại phòng nào ➔ Tự động **gộp thêm phòng đó vào cùng Hold Session hiện tại**.
   - Hóa đơn trang `/checkout` liệt kê toàn bộ danh sách các phòng đã giữ, tính **Tổng chi phí** và **Tiền cọc 30% chung**.
3. **Đồng Bộ Đa Tab Thời Gian Thực (Real-Time Multi-Tab Sync):**
   - Khi bất kỳ tab nào bấm thêm phòng hoặc xóa phòng ➔ Phát tín hiệu qua `BroadcastChannel`. Tất cả các tab khác **nảy animation cập nhật lại hóa đơn trong <1ms** mà không cần F5!

---

## 🔌 2. DANH SÁCH REST API DÙNG CHO FRONTEND

| Thao tác | Method | Endpoint | Request Body / Params | Response Data chính |
| :--- | :--- | :--- | :--- | :--- |
| **Lấy phiên giữ phòng** | `GET` | `/api/v1/bookings/hold/session` | *(Tự động gửi Cookie)* | `HoldSession` (Danh sách phòng, tổng tiền, tiền cọc 30%) |
| **Thêm phòng vào phiên** | `POST` | `/api/v1/bookings/hold` | `{ categoryId, checkinDate, checkoutDate }` | `RoomHoldResponse` (`holdId`, `expiresAt`) |
| **Xóa 1 phòng lẻ** | `DELETE` | `/api/v1/bookings/hold/items/{itemId}` | URL path variable `{itemId}` | `HoldSession` đã cập nhật |
| **Hủy toàn bộ phiên** | `DELETE` | `/api/v1/bookings/hold` | *(Tự động gửi Cookie)* | `{ code: "SUCCESS" }` |
| **Xác nhận đặt phòng** | `POST` | `/api/v1/bookings/confirm` | `{ guestName, guestPhone, guestEmail, guestsCount, couponCode, notes }` | `BookingResponse` (Bao gồm `bookingId`, `depositAmount`) |

---

## 💻 3. CẤU TRÚC DỮ LIỆU (DATA TYPES)

```typescript
export interface HoldItem {
  itemId: string;              // ID phòng đang giữ trong DB
  categoryId: string;          // ID loại phòng
  categoryName: string;        // Tên loại phòng (e.g. Phòng Deluxe Hướng Biển)
  categoryCode: string;
  accommodationId: string;     // ID phòng vật lý
  accommodationCode: string;   // Số phòng (e.g. ROOM-101)
  checkinDate: string;         // ISO String (2026-08-10T14:00:00)
  checkoutDate: string;        // ISO String (2026-08-12T12:00:00)
  numNights: number;           // Số đêm nghỉ
  pricePerNight: number;       // Đơn giá / đêm
  itemTotalAmount: number;     // Thành tiền phòng này
}

export interface HoldSession {
  guestToken: string;          // Token cookie của khách
  items: HoldItem[];           // Mảng danh sách các phòng đang giữ
  totalAmount: number;         // Tổng chi phí tất cả các phòng
  depositAmount: number;       // Tiền đặt cọc 30% tổng chi phí
  expiresAt?: string;          // Thời gian hết hạn (7 phút)
  expiresAtTimestamp?: number;
}
```

---

## ⚡ 4. CODE MẪU REACT HOOK ĐỒNG BỘ ĐA TAB (`useHoldSession.ts`)

```typescript
import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

const CHANNEL_NAME = "locan_hold_session_channel";

export function useHoldSession() {
  const [session, setSession] = useState<HoldSession | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Hàm tải phiên giữ phòng hiện tại
  const fetchSession = useCallback(async () => {
    try {
      const res = await apiGet<HoldSession>("/bookings/hold/session");
      setSession(res);
    } catch (err) {
      console.error("Lỗi lấy phiên giữ phòng:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Tín hiệu phát tin nhắn sang các Tab khác
  const notifyOtherTabs = useCallback(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const bc = new BroadcastChannel(CHANNEL_NAME);
        bc.postMessage({ type: "HOLD_SESSION_UPDATED", timestamp: Date.now() });
        bc.close();
      } catch (e) {
        console.error("Lỗi BroadcastChannel:", e);
      }
    }
  }, []);

  // 3. Thêm phòng mới vào phiên
  const addHoldRoom = async (categoryId: string, checkinDate: string, checkoutDate: string) => {
    try {
      setLoading(true);
      await apiPost("/bookings/hold", { categoryId, checkinDate, checkoutDate });
      await fetchSession();
      notifyOtherTabs();
    } finally {
      setLoading(false);
    }
  };

  // 4. Xóa 1 phòng lẻ khỏi phiên
  const removeHoldItem = async (itemId: string) => {
    try {
      setLoading(true);
      const updated = await apiDelete<HoldSession>(`/bookings/hold/items/${itemId}`);
      setSession(updated);
      notifyOtherTabs();
    } finally {
      setLoading(false);
    }
  };

  // 5. Lắng nghe sự kiện đa Tab & Chuyển Tab
  useEffect(() => {
    fetchSession();

    // Lắng nghe BroadcastChannel từ tab khác
    let bc: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bc = new BroadcastChannel(CHANNEL_NAME);
      bc.onmessage = (event) => {
        if (event.data?.type === "HOLD_SESSION_UPDATED") {
          fetchSession();
        }
      };
    }

    // Tự động kiểm tra lại khi người dùng click quay lại Tab này
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchSession();
      }
    };
    window.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchSession]);

  return { session, loading, fetchSession, addHoldRoom, removeHoldItem };
}
```

---

## 🎨 5. HIỂN THỊ HÓA ĐƠN TRÊN TRANG CHECKOUT (`/checkout`)

1. **Hiển thị danh sách các phòng đã giữ:**
   ```tsx
   <div className={styles.summaryCard}>
     <h2>Chuyến đi của bạn ({session?.items?.length || 1} phòng)</h2>
     
     {session?.items?.map((item) => (
       <div key={item.itemId} className={styles.roomItemRow}>
         <div>
           <strong>{item.categoryName}</strong> (Phòng {item.accommodationCode})
           <div>{item.numNights} đêm × {item.pricePerNight.toLocaleString("vi-VN")}₫</div>
         </div>
         <div>
           <strong>{item.itemTotalAmount.toLocaleString("vi-VN")}₫</strong>
           {session.items.length > 1 && (
             <button onClick={() => removeHoldItem(item.itemId)}>(x) Xóa</button>
           )}
         </div>
       </div>
     ))}

     {/* Tổng tiền & Tiền cọc 30% */}
     <div className={styles.totalRow}>
       <span>Tổng cộng:</span>
       <strong>{session?.totalAmount?.toLocaleString("vi-VN")}₫</strong>
     </div>
     <div className={styles.depositRow}>
       <span>Đặt cọc 30%:</span>
       <strong>{session?.depositAmount?.toLocaleString("vi-VN")}₫</strong>
     </div>
   </div>
   ```

2. **Xác nhận đặt phòng & Chuyển sang thanh toán VietQR:**
   - Sau khi gọi `POST /bookings/confirm` thành công ➔ Nhận về `confirmRes.data.bookingId`.
   - Điều hướng người dùng sang trang thanh toán VietQR:
     ```typescript
     router.push(`/payment?bookingId=${confirmRes.data.bookingId}`);
     ```
