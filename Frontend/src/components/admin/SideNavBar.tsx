"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SideNavBar.module.css";

type UserRole = 'ADMIN' | 'STAFF' | 'HOUSEKEEPER' | 'GUEST';

interface NavItem {
  href: string;
  title: string;
  icon: string;
  label: string;
  matchPrefix?: boolean;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", title: "Bảng điều khiển", icon: "dashboard", label: "Bảng điều khiển", matchPrefix: false, roles: ["ADMIN"] },
  { href: "/admin/bookings", title: "Quản lý đặt phòng", icon: "book_online", label: "Quản lý đặt phòng", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/categories", title: "Quản lý hạng phòng", icon: "meeting_room", label: "Quản lý hạng phòng", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/rooms", title: "Quản lý phòng", icon: "bed", label: "Quản lý phòng", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/housekeeping", title: "Dọn phòng & Tạp vụ", icon: "cleaning_services", label: "Dọn phòng & Tạp vụ", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/events", title: "Sự kiện & Combo", icon: "event", label: "Sự kiện & Combo", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/coupons", title: "Mã giảm giá", icon: "local_offer", label: "Mã giảm giá", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/services", title: "Tiện ích & Dịch vụ", icon: "room_service", label: "Tiện ích & Dịch vụ", matchPrefix: true, roles: ["ADMIN"] },
  { href: "/admin/reports", title: "Báo cáo", icon: "analytics", label: "Báo cáo", matchPrefix: true, roles: ["ADMIN"] },
  // Staff & Admin availability lookup route
  { href: "/staff/availability", title: "Tra cứu phòng trống", icon: "event_available", label: "Tra cứu phòng trống", matchPrefix: true, roles: ["STAFF", "ADMIN"] },
  // Staff routes
  { href: "/staff/bookings", title: "Quản lý đặt phòng", icon: "book_online", label: "Quản lý đặt phòng", matchPrefix: true, roles: ["STAFF"] },
  // Housekeeper routes
  { href: "/housekeeping/tasks", title: "Dọn phòng & Tạp vụ", icon: "cleaning_services", label: "Dọn phòng & Tạp vụ", matchPrefix: true, roles: ["HOUSEKEEPER"] },
];

const ROLE_TITLES: Record<string, string> = {
  ADMIN: "Quản trị viên",
  STAFF: "Nhân viên lễ tân",
  HOUSEKEEPER: "Nhân viên tạp vụ",
};

const ROLE_LOGOUT_PATH: Record<string, string> = {
  ADMIN: "/login",
  STAFF: "/login",
  HOUSEKEEPER: "/login",
};

export default function SideNavBar({
  isCollapsed = false,
  onToggle,
  isMobileOpen = false,
  onMobileClose,
  role = "ADMIN",
}: {
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  role?: string;
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

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role as UserRole));
  const roleTitle = ROLE_TITLES[role] || "Nhân viên";
  const fullName = typeof window !== "undefined" ? localStorage.getItem("fullName") || "" : "";

  // Only show "Thêm phòng mới" CTA for ADMIN
  const showCta = role === "ADMIN";

  return (
    <nav className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ""} ${isMobileOpen ? styles.mobileOpen : ""}`}>
      {/* Toggle Button for Desktop */}
      <button className={styles.toggleBtn} onClick={onToggle}>
        <span className="material-symbols-outlined">
          {isCollapsed ? "chevron_right" : "chevron_left"}
        </span>
      </button>

      {/* Header Profile */}
      <div className={styles.header}>
        <div className={styles.avatarWrapper}>
          <img
            alt="Avatar"
            className={styles.avatar}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDuu9e6nZF2wnVRC5JBbJd2TqQlI9fOa3JrCObUN4Kk2H1KFG0UhgJBGHEOj4YuP1o0v4-z2WVr6cBHroO8W7Be8sl48hK6wPZiyFAxSHryNNSS8Yx7qSJYHVXUbbSbP5dIgsRMEjYndbZGKiHJ0a5ZoiJRblG4_dW4wTCA88CFRplK4gnW1snfWxzuyHhEcJR2SbZkkscbW-8740AZqib2I1afN00TcAyASkUOpFyt_ihmrDhZiMQM"
          />
        </div>
        <div>
          <h2 className={styles.adminTitle}>{roleTitle}</h2>
          {fullName && (
            <p className="mono-text" style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)" }}>
              {fullName}
            </p>
          )}
          {!fullName && (
            <p className="mono-text" style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)" }}>
              Lộc An Beach
            </p>
          )}
        </div>
      </div>

      {/* CTA Button — Admin only */}
      {showCta && (
        <Link href="/admin/rooms/new" style={{ width: "100%" }}>
          <button className={styles.ctaButton} title="Thêm phòng mới">
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>add</span>
            {!isCollapsed && <span>Thêm phòng mới</span>}
          </button>
        </Link>
      )}

      {/* Main Navigation */}
      <div className={styles.navLinks}>
        {visibleItems.map((item) => {
          const isActive = item.matchPrefix === false
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.title}
              className={`${styles.navLink} ${isActive ? styles.active : ""}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>

      {/* Footer Navigation */}
      <div className={styles.footerNav}>
        {role === "ADMIN" && (
          <Link href="/admin/settings" title="Cài đặt" className={styles.navLinkFooter}>
            <span className="material-symbols-outlined">settings</span>
            {!isCollapsed && <span>Cài đặt</span>}
          </Link>
        )}
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className={`${styles.navLinkFooter} ${styles.logout}`}
          style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "1rem", padding: "0.75rem 1rem" }}
        >
          <span className="material-symbols-outlined">logout</span>
          {!isCollapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </nav>
  );
}
