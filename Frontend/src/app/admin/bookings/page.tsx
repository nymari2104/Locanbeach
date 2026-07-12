"use client";

import { useEffect, useState, useCallback } from "react";
import { apiGet } from "@/lib/api";
import { BookingStatus, PageResponse, ConfirmBookingResponse } from "@/types/api";
import styles from "./page.module.css";

type BookingResponse = ConfirmBookingResponse; // Reusing the type since they have the same fields

type TabType = 'ALL' | 'COMING' | 'STAYING' | 'LEFT' | 'CANCELLED';

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

  // DUMMY DATA FOR UI PREVIEW
  const dummyBookings: BookingResponse[] = [
    {
      bookingId: "b1234567-89ab-cdef-0123-456789abcdef",
      accommodationId: "a1",
      accommodationCode: "108 (Phòng)",
      categoryId: "c1",
      categoryName: "Phòng Deluxe",
      guestName: "Anh Khanh",
      guestPhone: "0901234567",
      checkinDate: "2026-07-20T14:00:00",
      checkoutDate: "2026-07-22T12:00:00",
      guestsCount: 4,
      totalAmount: 3000000,
      depositAmount: 1000000,
      status: "CONFIRMED"
    },
    {
      bookingId: "b2234567-89ab-cdef-0123-456789abcdef",
      accommodationId: "a2",
      accommodationCode: "114 (Phòng)",
      categoryId: "c2",
      categoryName: "Lữ hành",
      guestName: "Ngọc Anh",
      guestPhone: "0901234568",
      checkinDate: "2026-07-20T09:05:00",
      checkoutDate: "2026-07-21T08:35:00",
      guestsCount: 2,
      totalAmount: 1500000,
      depositAmount: 500000,
      status: "CHECKED_IN"
    },
    {
      bookingId: "b3234567-89ab-cdef-0123-456789abcdef",
      accommodationId: "a3",
      accommodationCode: "112 (Phòng)",
      categoryId: "c3",
      categoryName: "Lữ hành",
      guestName: "Huyền Anh",
      guestPhone: "0901234569",
      checkinDate: "2026-07-15T14:00:00",
      checkoutDate: "2026-07-17T12:00:00",
      guestsCount: 2,
      totalAmount: 1500000,
      depositAmount: 500000,
      status: "CHECKED_OUT"
    },
    {
      bookingId: "b4234567-89ab-cdef-0123-456789abcdef",
      accommodationId: "a4",
      accommodationCode: "109 (Phòng)",
      categoryId: "c4",
      categoryName: "Trần Châm",
      guestName: "Trần Châm",
      guestPhone: "0901234570",
      checkinDate: "2026-07-25T14:00:00",
      checkoutDate: "2026-07-26T12:00:00",
      guestsCount: 2,
      totalAmount: 1000000,
      depositAmount: 0,
      status: "PENDING_DEPOSIT"
    }
  ];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      let statusParam = "";
      if (activeTab === 'COMING') statusParam = "CONFIRMED";
      else if (activeTab === 'STAYING') statusParam = "CHECKED_IN";
      else if (activeTab === 'LEFT') statusParam = "CHECKED_OUT";
      else if (activeTab === 'CANCELLED') statusParam = "CANCELLED";

      // Filter dummy data
      let filtered = dummyBookings;
      if (statusParam) {
        filtered = filtered.filter(b => b.status === statusParam);
      }
      if (searchQuery) {
        const lowerQ = searchQuery.toLowerCase();
        filtered = filtered.filter(b => 
          b.guestName.toLowerCase().includes(lowerQ) || 
          b.bookingId.toLowerCase().includes(lowerQ) ||
          (b.accommodationCode && b.accommodationCode.toLowerCase().includes(lowerQ))
        );
      }

      setBookings(filtered);
      
      /* Comment out real API call since user wants UI only for now
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: "20"
      });
      if (searchQuery) queryParams.append("search", searchQuery);
      if (statusParam) queryParams.append("status", statusParam);
      if (startDate) queryParams.append("startDate", startDate);
      if (endDate) queryParams.append("endDate", endDate);

      const res = await apiGet<PageResponse<BookingResponse>>(`/bookings?${queryParams.toString()}`);
      setBookings(res.content || []);
      */
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, startDate, endDate, page]);

  useEffect(() => {
    // Debounce search slightly
    const timeout = setTimeout(() => {
      fetchBookings();
    }, 300);
    return () => clearTimeout(timeout);
  }, [fetchBookings]);

  const tabs = [
    { id: 'ALL', label: 'Tất cả đơn đặt' },
    { id: 'COMING', label: 'Khách sẽ đến' },
    { id: 'ARRIVED', label: 'Khách đã đến' },
    { id: 'STAYING', label: 'Khách đang ở' },
    { id: 'LEAVING', label: 'Khách sẽ đi' },
    { id: 'LEFT', label: 'Khách đã đi' },
    { id: 'CANCELLED', label: 'Đã hủy' },
    { id: 'MY_BOOKINGS', label: 'Booking tạo bởi mình' },
  ] as const;

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
                    <tr key={b.bookingId}>
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
        </div>
      </div>
    </div>
  );
}
