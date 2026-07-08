"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SideNavBar.module.css";

export default function SideNavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar}>
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
        <button className={styles.ctaButton}>
          <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>add</span>
          Thêm phòng mới
        </button>
      </Link>

      {/* Main Navigation */}
      <div className={styles.navLinks}>
        <Link
          href="/admin"
          className={`${styles.navLink} ${pathname === "/admin" ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span>Bảng điều khiển</span>
        </Link>

        <Link
          href="/admin/categories"
          className={`${styles.navLink} ${pathname.startsWith("/admin/categories") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">meeting_room</span>
          <span>Quản lý hạng phòng</span>
        </Link>


        <Link
          href="/admin/rooms"
          className={`${styles.navLink} ${pathname.startsWith("/admin/rooms") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">bed</span>
          <span>Quản lý phòng</span>
        </Link>

        <Link
          href="/admin/events"
          className={`${styles.navLink} ${pathname.startsWith("/admin/events") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">event</span>
          <span>Sự kiện & Combo</span>
        </Link>

        <Link
          href="/admin/services"
          className={`${styles.navLink} ${pathname.startsWith("/admin/services") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">room_service</span>
          <span>Tiện ích & Dịch vụ</span>
        </Link>

        <Link
          href="/admin/reports"
          className={`${styles.navLink} ${pathname.startsWith("/admin/reports") ? styles.active : ""}`}
        >
          <span className="material-symbols-outlined">analytics</span>
          <span>Báo cáo</span>
        </Link>
      </div>

      {/* Footer Navigation */}
      <div className={styles.footerNav}>
        <Link href="/admin/settings" className={styles.navLinkFooter}>
          <span className="material-symbols-outlined">settings</span>
          <span>Cài đặt</span>
        </Link>
        <Link href="/" className={`${styles.navLinkFooter} ${styles.logout}`}>
          <span className="material-symbols-outlined">logout</span>
          <span>Thoát Admin</span>
        </Link>
      </div>
    </nav>
  );
}
