"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { BookingStatus, PageResponse, ConfirmBookingResponse } from "@/types/api";
import styles from "./page.module.css";

type BookingResponse = ConfirmBookingResponse; // Reusing the type since they have the same fields

type TabType = 'ALL' | 'COMING' | 'ARRIVED' | 'STAYING' | 'LEAVING' | 'LEFT' | 'CANCELLED' | 'MY_BOOKINGS';

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('ALL');
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [source, setSource] = useState("ALL");
  const [roomType, setRoomType] = useState("ALL");
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState<BookingResponse | null>(null);

  // Custom confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  const tabs = [
    { id: 'ALL' as TabType, label: 'Tất cả đơn đặt' },
    { id: 'COMING' as TabType, label: 'Khách sẽ đến' },
    { id: 'ARRIVED' as TabType, label: 'Khách đã đến' },
    { id: 'STAYING' as TabType, label: 'Khách đang ở' },
    { id: 'LEAVING' as TabType, label: 'Khách sẽ đi' },
    { id: 'LEFT' as TabType, label: 'Khách đã đi' },
    { id: 'CANCELLED' as TabType, label: 'Đã hủy' },
    { id: 'MY_BOOKINGS' as TabType, label: 'Booking tạo bởi mình' },
  ];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (activeTab === 'COMING') statusParam = "CONFIRMED";
      else if (activeTab === 'STAYING') statusParam = "CHECKED_IN";
      else if (activeTab === 'LEFT') statusParam = "CHECKED_OUT";
      else if (activeTab === 'CANCELLED') statusParam = "CANCELLED";

      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: "20"
      });
      if (searchQuery) queryParams.append("search", searchQuery);
      if (statusParam) queryParams.append("status", statusParam);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const res = await apiGet<PageResponse<BookingResponse>>(`/staff/bookings?${queryParams.toString()}`);
      setBookings(res.content || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, startDate, endDate, page]);

  const handleStatusChange = (id: string, newStatus: string) => {
    let confirmMsg = "Bạn có chắc chắn muốn thay đổi trạng thái đơn đặt phòng này?";
    let title = "Xác nhận thay đổi";
    let isDanger = false;
    if (newStatus === 'CONFIRMED') {
      confirmMsg = "Hành động này sẽ xác nhận khách hàng đã hoàn thành đặt cọc.";
      title = "Xác nhận đặt cọc";
    }
    if (newStatus === 'CANCELLED') {
      confirmMsg = "Hành động này sẽ hủy hoàn toàn đơn đặt phòng. Bạn có chắc chắn?";
      title = "Hủy đơn đặt phòng";
      isDanger = true;
    }

    setConfirmDialog({
      isOpen: true,
      title,
      message: confirmMsg,
      confirmText: newStatus === 'CANCELLED' ? "Hủy đơn" : "Xác nhận",
      isDanger,
      onConfirm: async () => {
        try {
          const res = await apiPut<BookingResponse>(`/staff/bookings/${id}/status`, { status: newStatus });
          setSelectedBooking(res);
          await fetchBookings();
        } catch (err: any) {
          alert("Lỗi khi thay đổi trạng thái: " + err.message);
        }
      }
    });
  };

  const handleCheckIn = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Nhận phòng (Check-in)",
      message: "Xác nhận thực hiện Check-in nhận phòng cho khách hàng này?",
      confirmText: "Check-in",
      isDanger: false,
      onConfirm: async () => {
        try {
          const res = await apiPost<BookingResponse>(`/staff/bookings/${id}/check-in`, {});
          setSelectedBooking(res);
          await fetchBookings();
        } catch (err: any) {
          alert("Lỗi khi nhận phòng: " + err.message);
        }
      }
    });
  };

  const handleCheckOut = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Trả phòng (Check-out)",
      message: "Xác nhận thực hiện Check-out trả phòng và hoàn tất hóa đơn?",
      confirmText: "Check-out",
      isDanger: false,
      onConfirm: async () => {
        try {
          const res = await apiPost<BookingResponse>(`/staff/bookings/${id}/check-out`, {});
          setSelectedBooking(res);
          await fetchBookings();
        } catch (err: any) {
          alert("Lỗi khi trả phòng: " + err.message);
        }
      }
    });
  };

  useEffect(() => {
    // Debounce search slightly
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  const translateStatus = (status: string) => {
    switch (status) {
      case 'PENDING_DEPOSIT': return 'Chờ cọc';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'CHECKED_IN': return 'Đang ở';
      case 'CHECKED_OUT': return 'Đã đi';
      case 'COMPLETED': return 'Hoàn tất';
      case 'CANCELLED': return 'Đã hủy';
      default: return status;
    }
  };

  return (
    <div className={styles.container}>
      {/* Sidebar Filters */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>Mặc định</div>

        {/* Mobile Dropdown */}
        <div className={styles.mobileTabDropdown}>
          <select
            value={activeTab}
            onChange={(e) => { setActiveTab(e.target.value as TabType); setPage(0); }}
            className={styles.mobileSelect}
          >
            {tabs.map(tab => (
              <option key={tab.id} value={tab.id}>{tab.label}</option>
            ))}
          </select>
        </div>

        {/* Desktop Tabs */}
        <div className={styles.tabList}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => { setActiveTab(tab.id); setPage(0); }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <div className={styles.topBar}>

          <div className={styles.actionRow}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-primary)' }}>
              Danh sách đặt phòng
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className={`${styles.btn} ${styles.btnOutline}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>download</span>
                Xuất Excel
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`}>
                <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add</span>
                Tạo đặt phòng
              </button>
            </div>
          </div>

          <div className={styles.filterRow}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Mã đặt phòng, tên khách, SĐT..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
            />

            <select
              className={styles.selectInput}
              value={source}
              onChange={(e) => { setSource(e.target.value); setPage(0); }}
            >
              <option value="ALL">Tất cả nguồn đặt</option>
              <option value="DIRECT">Trực tiếp</option>
              <option value="AGODA">Agoda</option>
              <option value="BOOKING">Booking.com</option>
            </select>

            <select
              className={styles.selectInput}
              value={roomType}
              onChange={(e) => { setRoomType(e.target.value); setPage(0); }}
            >
              <option value="ALL">Tất cả loại phòng</option>
              <option value="ROOM">Phòng nghỉ</option>
              <option value="CAMPING">Lều cắm trại</option>
            </select>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="date"
                className={`mono-text ${styles.dateInput}`}
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
                title="Từ ngày"
              />
              <span style={{ color: '#9ca3af' }}>&rarr;</span>
              <input
                type="date"
                className={`mono-text ${styles.dateInput}`}
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
                title="Đến ngày"
              />
            </div>

            <button
              className={`${styles.btn} ${styles.btnOutline}`}
              onClick={() => {
                setSearchQuery("");
                setStartDate("");
                setEndDate("");
                setSource("ALL");
                setRoomType("ALL");
                setPage(0);
              }}
              title="Xóa bộ lọc"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>filter_alt_off</span>
            </button>
            <button className={`${styles.btn} ${styles.btnOutline}`} style={{ borderStyle: 'dashed' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add</span>
              Thêm bộ lọc
            </button>
          </div>
        </div>

        <div className={styles.contentBody}>
          {/* Desktop Table View */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Mã Đặt</th>
                  <th>Phòng</th>
                  <th>Tên khách</th>
                  <th>Ngày đến</th>
                  <th>Ngày đi</th>
                  <th>Loại giá</th>
                  <th>NL/TE</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Không có dữ liệu</td>
                  </tr>
                ) : (
                  bookings.map(b => (
                    <tr key={b.bookingId} onClick={() => setSelectedBooking(b)} style={{ cursor: "pointer" }}>
                      <td className="mono-text" style={{ fontSize: '0.8rem' }}>{b.bookingId.split('-')[0]}</td>
                      <td className="mono-text">{b.accommodationCode || b.categoryName}</td>
                      <td style={{ fontWeight: 500 }}>{b.guestName}</td>
                      <td className="mono-text">
                        {new Date(b.checkinDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="mono-text">
                        {new Date(b.checkoutDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="mono-text">Default</td>
                      <td className="mono-text">{b.guestsCount}/0</td>
                      <td>
                        <span className={`${styles.statusBadge} ${styles['status_' + b.status]}`}>
                          {translateStatus(b.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className={styles.mobileCardList}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Đang tải dữ liệu...</div>
            ) : bookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>Không có dữ liệu</div>
            ) : (
              bookings.map(b => (
                <div key={b.bookingId} className={styles.bookingCard} onClick={() => setSelectedBooking(b)}>
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitle}>{b.guestName}</div>
                  </div>
                  <div className={styles.cardGrid}>
                    <div>
                      <div className={styles.cardLabel}>Phòng</div>
                      <div className={`mono-text ${styles.cardValue}`}>{b.accommodationCode || b.categoryName}</div>
                    </div>
                    <div>
                      <div className={styles.cardLabel}>Trạng thái</div>
                      <span className={`${styles.statusBadge} ${styles['status_' + b.status]}`}>
                        {translateStatus(b.status)}
                      </span>
                    </div>
                    <div>
                      <div className={styles.cardLabel}>Đến</div>
                      <div className={`mono-text ${styles.cardValue}`}>
                        {new Date(b.checkinDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                    <div>
                      <div className={styles.cardLabel}>Đi</div>
                      <div className={`mono-text ${styles.cardValue}`}>
                        {new Date(b.checkoutDate).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Chi tiết đặt phòng</h3>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedBooking(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Khách hàng:</span>
                <span className={styles.modalDetailValue}>{selectedBooking.guestName}</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>SĐT:</span>
                <span className="mono-text">{selectedBooking.guestPhone}</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Mã đặt:</span>
                <span className="mono-text">{selectedBooking.bookingId}</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Phòng:</span>
                <span className="mono-text">{selectedBooking.accommodationCode || selectedBooking.categoryName}</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Ngày đến:</span>
                <span className="mono-text">{new Date(selectedBooking.checkinDate).toLocaleString('vi-VN')}</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Ngày đi:</span>
                <span className="mono-text">{new Date(selectedBooking.checkoutDate).toLocaleString('vi-VN')}</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Số người:</span>
                <span className="mono-text">{selectedBooking.guestsCount} Người lớn</span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Trạng thái:</span>
                <span className={`${styles.statusBadge} ${styles['status_' + selectedBooking.status]}`}>
                  {translateStatus(selectedBooking.status)}
                </span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Tổng tiền:</span>
                <span className="mono-text" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                  {selectedBooking.totalAmount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
              <div className={styles.modalDetailRow}>
                <span className={styles.modalDetailLabel}>Đã cọc:</span>
                <span className="mono-text" style={{ color: '#059669' }}>
                  {selectedBooking.depositAmount.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>
            <div className={styles.modalFooter} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={() => setSelectedBooking(null)}>Đóng</button>
              
              {selectedBooking.status === 'PENDING_DEPOSIT' && (
                <>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleStatusChange(selectedBooking.bookingId, 'CONFIRMED')}>
                    Xác nhận cọc
                  </button>
                  <button className={`${styles.btn}`} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none' }} onClick={() => handleStatusChange(selectedBooking.bookingId, 'CANCELLED')}>
                    Hủy đơn
                  </button>
                </>
              )}

              {selectedBooking.status === 'CONFIRMED' && (
                <>
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleCheckIn(selectedBooking.bookingId)}>
                    Check-in
                  </button>
                  <button className={`${styles.btn}`} style={{ backgroundColor: '#ef4444', color: '#fff', border: 'none' }} onClick={() => handleStatusChange(selectedBooking.bookingId, 'CANCELLED')}>
                    Hủy đơn
                  </button>
                </>
              )}

              {selectedBooking.status === 'CHECKED_IN' && (
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => handleCheckOut(selectedBooking.bookingId)}>
                  Check-out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (Stitch Spec) */}
      {confirmDialog.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
          <div className={styles.modalContent} style={{ maxWidth: '400px', borderRadius: '16px' }} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader} style={{ padding: '1rem 1.25rem' }}>
              <h3 className={styles.modalTitle} style={{ fontSize: '1.1rem', fontWeight: 600 }}>{confirmDialog.title}</h3>
              <button className={styles.modalCloseBtn} onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className={styles.modalBody} style={{ padding: '1.25rem', fontSize: '0.9rem', color: 'var(--color-steel-secondary)' }}>
              <p>{confirmDialog.message}</p>
            </div>
            <div className={styles.modalFooter} style={{ padding: '1rem 1.25rem', borderTop: '1px solid #e5e7eb' }}>
              <button 
                className={`${styles.btn} ${styles.btnOutline}`} 
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                {confirmDialog.cancelText || "Hủy"}
              </button>
              <button 
                className={`${styles.btn}`} 
                style={{ 
                  backgroundColor: confirmDialog.isDanger ? '#ef4444' : 'var(--color-primary)', 
                  color: '#fff',
                  border: 'none'
                }} 
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                }}
              >
                {confirmDialog.confirmText || "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
