"use client";

import { useState, useEffect, useCallback } from "react";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { StaffCategoryAvailability, StaffRoomAvailability } from "@/types/api";
import styles from "./page.module.css";

export default function StaffAvailabilityPage() {
  const getTodayString = () => new Date().toISOString().split("T")[0];
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  };

  const [checkin, setCheckin] = useState(getTodayString());
  const [checkout, setCheckout] = useState(getTomorrowString());
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("ALL");

  const [categories, setCategories] = useState<StaffCategoryAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");

  // Modal State for Quick Booking
  const [selectedRoomModal, setSelectedRoomModal] = useState<{
    show: boolean;
    roomId?: string;
    roomCode: string;
    categoryId: string;
    categoryName: string;
    basePrice: number;
    checkinDate: string;
    checkoutDate: string;
    nights: number;
  } | null>(null);

  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // Compute number of nights
  const calculateNights = (cin: string, cout: string) => {
    if (!cin || !cout) return 1;
    const d1 = new Date(cin);
    const d2 = new Date(cout);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights(checkin, checkout);

  const fetchAvailability = useCallback(async () => {
    if (!checkin || !checkout) return;
    if (new Date(checkout) <= new Date(checkin)) {
      setErrorMsg("Ngày Check-out phải sau ngày Check-in.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const checkinISO = `${checkin}T14:00:00`;
      const checkoutISO = `${checkout}T12:00:00`;
      const data = await apiGet<StaffCategoryAvailability[]>(
        `/staff/accommodations/availability?checkinDate=${encodeURIComponent(checkinISO)}&checkoutDate=${encodeURIComponent(checkoutISO)}`
      );
      setCategories(data);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [checkin, checkout]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  // Overall totals across categories
  const totalAvailable = categories.reduce((sum, cat) => sum + (cat.availableCount || 0), 0);
  const totalHeld = categories.reduce((sum, cat) => sum + (cat.heldCount || 0), 0);
  const totalBooked = categories.reduce((sum, cat) => sum + (cat.bookedCount || 0), 0);

  // Quick Booking Submission
  const handleConfirmQuickBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomModal) return;
    if (!guestName.trim() || !guestPhone.trim()) {
      setErrorMsg("Vui lòng điền Tên và Số điện thoại của khách.");
      return;
    }

    setSubmittingBooking(true);
    setErrorMsg("");

    try {
      const checkinISO = `${selectedRoomModal.checkinDate}T14:00:00`;
      const checkoutISO = `${selectedRoomModal.checkoutDate}T12:00:00`;

      // 1. Hold room
      await apiPost("/bookings/hold", {
        categoryId: selectedRoomModal.categoryId,
        checkinDate: checkinISO,
        checkoutDate: checkoutISO,
      });

      // 2. Confirm booking
      await apiPost("/bookings/confirm", {
        guestName: guestName.trim(),
        guestPhone: guestPhone.trim(),
        guestEmail: guestEmail.trim() || undefined,
        guestsCount: guestsCount,
        notes: bookingNotes.trim() ? `[Tạo từ Lễ Tân] ${bookingNotes.trim()}` : "[Tạo trực tiếp từ Lễ Tân]",
      });

      setSuccessMsg(`Tạo đơn đặt phòng thành công cho khách ${guestName.trim()} (${selectedRoomModal.roomCode})!`);
      setSelectedRoomModal(null);
      setGuestName("");
      setGuestPhone("");
      setGuestEmail("");
      setBookingNotes("");
      
      // Refresh list
      fetchAvailability();
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSubmittingBooking(false);
    }
  };

  const formatPrice = (val: number) => new Intl.NumberFormat("vi-VN").format(val) + "₫";

  const formatTime = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Tra Cứu Phòng Trống</h1>
          <p className={styles.subtitle}>
            Kiểm tra trạng thái phòng theo khoảng ngày và hỗ trợ khách tạo đơn đặt phòng trực tiếp tại quầy.
          </p>
        </div>
      </header>

      {/* Toast Messages */}
      {successMsg && (
        <div className={`${styles.toast} ${styles.toastSuccess}`}>
          <span className="material-symbols-outlined">check_circle</span>
          <span>{successMsg}</span>
          <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setSuccessMsg("")}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {errorMsg && (
        <div className={`${styles.toast} ${styles.toastError}`}>
          <span className="material-symbols-outlined">error</span>
          <span>{errorMsg}</span>
          <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }} onClick={() => setErrorMsg("")}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Date Filter Card */}
      <section className={styles.filterCard}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchAvailability();
          }}
          className={styles.filterForm}
        >
          <div className={styles.filterGroup}>
            <label className={styles.label}>
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>calendar_month</span>
              Ngày nhận phòng (Check-in)
            </label>
            <input
              type="date"
              className={styles.input}
              min={getTodayString()}
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              required
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>event_busy</span>
              Ngày trả phòng (Check-out)
            </label>
            <input
              type="date"
              className={styles.input}
              min={checkin}
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              required
            />
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.label}>
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>meeting_room</span>
              Loại phòng
            </label>
            <select
              className={styles.input}
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            >
              <option value="ALL">Tất cả loại phòng</option>
              {categories.map((cat) => (
                <option key={cat.categoryId} value={cat.categoryId}>
                  {cat.categoryName} ({cat.categoryCode})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup} style={{ maxWidth: "140px" }}>
            <label className={styles.label}>
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>groups</span>
              Số lượng khách
            </label>
            <input
              type="number"
              min="1"
              max="20"
              className={styles.input}
              value={guestsCount}
              onChange={(e) => setGuestsCount(parseInt(e.target.value) || 1)}
            />
          </div>

          <div className={styles.nightsBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>night_shelter</span>
            <span>{nights} đêm</span>
          </div>

          <button type="submit" className={styles.searchBtn} disabled={loading}>
            <span className="material-symbols-outlined">search</span>
            <span>{loading ? "Đang tra cứu..." : "Tra cứu phòng"}</span>
          </button>
        </form>
      </section>

      {/* Summary Statistics Bar */}
      <section className={styles.summaryBar}>
        <div className={styles.summaryItem}>
          <div className={`${styles.summaryIcon} ${styles.iconAvailable}`}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <div>
            <div className={styles.summaryVal}>{totalAvailable}</div>
            <div className={styles.summaryLabel}>Hoàn toàn trống</div>
          </div>
        </div>

        <div className={styles.summaryItem}>
          <div className={`${styles.summaryIcon} ${styles.iconHeld}`}>
            <span className="material-symbols-outlined">timer</span>
          </div>
          <div>
            <div className={styles.summaryVal}>{totalHeld}</div>
            <div className={styles.summaryLabel}>Đang giữ chỗ 7 phút</div>
          </div>
        </div>

        <div className={styles.summaryItem}>
          <div className={`${styles.summaryIcon} ${styles.iconBooked}`}>
            <span className="material-symbols-outlined">meeting_room</span>
          </div>
          <div>
            <div className={styles.summaryVal}>{totalBooked}</div>
            <div className={styles.summaryLabel}>Đã được đặt</div>
          </div>
        </div>
      </section>

      {/* Category Results & Room Grids */}
      <section className={styles.categoriesContainer}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div
              className="spinner"
              style={{
                border: "4px solid rgba(0,0,0,0.1)",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                borderLeftColor: "var(--color-primary)",
                animation: "spin 1s linear infinite",
              }}
            />
          </div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "1rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#94a3b8" }}>
              info
            </span>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Không tìm thấy thông tin loại phòng nào.</p>
          </div>
        ) : categories.filter((cat) => selectedCategoryFilter === "ALL" || cat.categoryId === selectedCategoryFilter).length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", backgroundColor: "#fff", borderRadius: "1rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "#94a3b8" }}>
              filter_alt_off
            </span>
            <p style={{ color: "#64748b", marginTop: "0.5rem" }}>Không có loại phòng nào phù hợp với bộ lọc đã chọn.</p>
          </div>
        ) : (
          categories
            .filter((cat) => selectedCategoryFilter === "ALL" || cat.categoryId === selectedCategoryFilter)
            .map((cat) => (
            <article key={cat.categoryId} className={styles.categoryCard}>
              {/* Category Header Bar */}
              <div className={styles.categoryHeader}>
                <div className={styles.categoryTitleGroup}>
                  <h2 className={styles.categoryTitle}>{cat.categoryName}</h2>
                  <span className="mono-text" style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    ({cat.categoryCode})
                  </span>
                  <div className={styles.categoryBadges}>
                    <span className={`${styles.badge} ${styles.badgeAvail}`}>
                      <span className="material-symbols-outlined" style={{ fontSize: "0.85rem" }}>check</span>
                      {cat.availableCount} trống
                    </span>
                    {cat.heldCount > 0 && (
                      <span className={`${styles.badge} ${styles.badgeHeld}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "0.85rem" }}>timer</span>
                        {cat.heldCount} giữ chỗ
                      </span>
                    )}
                    {cat.bookedCount > 0 && (
                      <span className={`${styles.badge} ${styles.badgeBooked}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: "0.85rem" }}>block</span>
                        {cat.bookedCount} đã đặt
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.categoryMeta}>
                  <span>Max: <strong>{cat.maxGuests} khách</strong></span>
                  <span className={styles.priceHighlight}>
                    {formatPrice(cat.basePrice)} <span style={{ fontSize: "0.8rem", fontWeight: "normal", color: "#64748b" }}>/ đêm</span>
                  </span>
                  {nights > 1 && (
                    <span style={{ fontSize: "0.85rem", color: "#475569" }}>
                      (Tổng {nights} đêm: <strong>{formatPrice(cat.basePrice * nights)}</strong>)
                    </span>
                  )}
                </div>
              </div>

              {/* Physical Rooms Grid */}
              <div className={styles.roomsGrid}>
                {cat.rooms && cat.rooms.map((room) => {
                  const isAvailable = room.status === "AVAILABLE";
                  const isHeld = room.status === "HELD";
                  const isBooked = room.status === "BOOKED";
                  const isDirty = room.status === "DIRTY";

                  return (
                    <div
                      key={room.id}
                      className={`${styles.roomBox} ${
                        isAvailable
                          ? styles.roomBoxAvailable
                          : isHeld
                          ? styles.roomBoxHeld
                          : isBooked
                          ? styles.roomBoxBooked
                          : styles.roomBoxDirty
                      }`}
                    >
                      <div className={styles.roomBoxHeader}>
                        <span className={styles.roomCode}>{room.code}</span>
                        <span
                          className={`${styles.statusTag} ${
                            isAvailable
                              ? styles.statusTagAvailable
                              : isHeld
                              ? styles.statusTagHeld
                              : isBooked
                              ? styles.statusTagBooked
                              : styles.statusTagDirty
                          }`}
                        >
                          {isAvailable && "Hoàn toàn trống"}
                          {isHeld && "Đang giữ chỗ 7p"}
                          {isBooked && "Đã được đặt"}
                          {isDirty && "Cần dọn dẹp"}
                        </span>
                      </div>

                      <div className={styles.roomInfo}>
                        {isHeld && (
                          <div style={{ color: "#b45309", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "0.9rem" }}>timer</span>
                            Hết hạn giữ chỗ lúc: {formatTime(room.holdExpiresAt)}
                          </div>
                        )}

                        {isBooked && (
                          <div style={{ color: "#b91c1c" }}>
                            Khách đặt: <strong>{room.guestName || "Đã xác nhận"}</strong>
                          </div>
                        )}

                        {isAvailable && (
                          <div style={{ color: "#047857" }}>Sẵn sàng nhận khách ngay</div>
                        )}
                      </div>

                      {isAvailable && (
                        <button
                          className={styles.bookQuickBtn}
                          onClick={() => {
                            setSelectedRoomModal({
                              show: true,
                              roomId: room.id,
                              roomCode: room.code,
                              categoryId: cat.categoryId,
                              categoryName: cat.categoryName,
                              basePrice: cat.basePrice,
                              checkinDate: checkin,
                              checkoutDate: checkout,
                              nights: nights,
                            });
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>add_circle</span>
                          Tạo đặt phòng
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))
        )}
      </section>

      {/* Quick Booking Modal */}
      {selectedRoomModal && selectedRoomModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Tạo Đặt Phòng Cho Khách</h3>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedRoomModal(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className={styles.modalSummaryBox}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Phòng được chọn:</span>
                <strong>{selectedRoomModal.roomCode} ({selectedRoomModal.categoryName})</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Thời gian ở:</span>
                <strong>{selectedRoomModal.checkinDate} ➔ {selectedRoomModal.checkoutDate} ({selectedRoomModal.nights} đêm)</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-primary)", fontWeight: 700 }}>
                <span>Tổng tiền dự kiến:</span>
                <span>{formatPrice(selectedRoomModal.basePrice * selectedRoomModal.nights)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmQuickBooking} className={styles.modalForm}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                  Họ và tên khách hàng <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  disabled={submittingBooking}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>
                  Số điện thoại liên hệ <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="Ví dụ: 0901234567"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  disabled={submittingBooking}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Email (Không bắt buộc)</label>
                <input
                  type="email"
                  className={styles.input}
                  placeholder="nguyenvana@gmail.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  disabled={submittingBooking}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#475569" }}>Ghi chú / Yêu cầu thêm</label>
                <textarea
                  className={styles.input}
                  rows={2}
                  placeholder="Khách nhận phòng muộn, kê giường phụ..."
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  disabled={submittingBooking}
                />
              </div>

              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setSelectedRoomModal(null)}
                  disabled={submittingBooking}
                >
                  Hủy bỏ
                </button>
                <button type="submit" className={styles.confirmBtn} disabled={submittingBooking}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>check_circle</span>
                  <span>{submittingBooking ? "Đang xử lý..." : "Xác nhận tạo đơn"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
