import styles from "./page.module.css";

export default function AdminSettings() {
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Cấu hình hệ thống</p>
          <h1 className={styles.title}>Cài đặt hệ thống</h1>
        </div>
      </div>

      <div className={styles.bentoGrid}>
        <div className={styles.statCard} style={{ gridColumn: "span 2" }}>
          <div>
            <h3 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "1rem" }}>Thông tin tài khoản</h3>
            <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem" }}>
              Email quản trị: admin@locanbeach.com
            </p>
            <p style={{ color: "var(--color-on-surface-variant)", fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Quyền hạn: Toàn quyền quản trị hệ thống
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
