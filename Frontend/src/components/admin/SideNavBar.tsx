"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SideNavBar.module.css";

export default function SideNavBar({ 
  isCollapsed = false, 
  onToggle,
  isMobileOpen = false,
  onMobileClose
}: { 
  isCollapsed?: boolean, 
  onToggle?: () => void,
  isMobileOpen?: boolean,
  onMobileClose?: () => void
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("userRole");
    router.push("/login");
  };

  return (
    <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''} ${isMobileOpen ? styles.mobileOpen : ''}`}>
      {/* Toggle Button for Desktop */}
      <button className={styles.toggleBtn} onClick={onToggle}>
        <span className="material-symbols-outlined">
          {isCollapsed ? 'chevron_right' : 'chevron_left'}
        </span>
      </button>

      {/* Header Profile */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <img
            alt="Admin Avatar"
            className={styles.avatar}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuu9e6nZF2wnVRC5JBbJd2TqQlI9fOa3JrCObUN4Kk2H1KFG0UhgJBGHEOj4YuP1o0v4-z2WVr6cBHroO8W7Be8sl48hK6wPZiyFAxSHryNNSS8Yx7qSJYHVXUbbSbP5dIgsRMEjYndbZGKiHJ0a5ZoiJRblG4_dW4wTCA88CFRplK4gnW1snfWxzuyHhEcJR2SbZkkscbW-8740AZqib2I1afN00TcAyASkUOpFyt_ihmrDhZiMQM"
          />
        </div>
        <div>
          <h2 className={styles.adminTitle}>Quản trị viên</h2>
          <p className="mono-text" style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)" }}>
            Lộc An Beach
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <Link href="/admin/rooms/new" style={{ width: "100%" }}>
        <button className={styles.ctaButton} title="Thêm phòng mới">
          <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>add</span>
          {!isCollapsed && <span>Thêm phòng mới</span>}
        </button>
      </Link>

      {/* Main Navigation */}
      <div className={styles.navLinks}>
        <Link
          href="/admin"
          title="Bảng điều khiển"
          className={`${styles.navLink} ${pathname === "/admin" ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          {!isCollapsed && <span>Bảng điều khiển</span>}
        </Link>

        <Link
          href="/admin/bookings"
          title="Quản lý đặt phòng"
          className={`${styles.navLink} ${pathname.startsWith("/admin/bookings") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">book_online</span>
          {!isCollapsed && <span>Quản lý đặt phòng</span>}
        </Link>

        <Link
          href="/admin/categories"
          title="Quản lý hạng phòng"
          className={`${styles.navLink} ${pathname.startsWith("/admin/categories") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">meeting_room</span>
          {!isCollapsed && <span>Quản lý hạng phòng</span>}
        </Link>


        <Link
          href="/admin/rooms"
          title="Quản lý phòng"
          className={`${styles.navLink} ${pathname.startsWith("/admin/rooms") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">bed</span>
          {!isCollapsed && <span>Quản lý phòng</span>}
        </Link>

        <Link
          href="/admin/housekeeping"
          title="Dọn phòng & Tạp vụ"
          className={`${styles.navLink} ${pathname.startsWith("/admin/housekeeping") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">cleaning_services</span>
          {!isCollapsed && <span>Dọn phòng & Tạp vụ</span>}
        </Link>

        <Link
          href="/admin/events"
          title="Sự kiện & Combo"
          className={`${styles.navLink} ${pathname.startsWith("/admin/events") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">event</span>
          {!isCollapsed && <span>Sự kiện & Combo</span>}
        </Link>

        <Link
          href="/admin/services"
          title="Tiện ích & Dịch vụ"
          className={`${styles.navLink} ${pathname.startsWith("/admin/services") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">room_service</span>
          {!isCollapsed && <span>Tiện ích & Dịch vụ</span>}
        </Link>

        <Link
          href="/admin/reports"
          title="Báo cáo"
          className={`${styles.navLink} ${pathname.startsWith("/admin/reports") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">analytics</span>
          {!isCollapsed && <span>Báo cáo</span>}
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className={styles.footerNav}>
        <Link href="/admin/settings" title="Cài đặt" className={styles.navLinkFooter}>
          <span className="material-symbols-outlined">settings</span>
          {!isCollapsed && <span>Cài đặt</span>}
        </Link>
        <button onClick={handleLogout} title="Đăng xuất" className={`${styles.navLinkFooter} ${styles.logout}`} style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem' }}>
          <span className="material-symbols-outlined">logout</span>
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </nav>
  );
}
