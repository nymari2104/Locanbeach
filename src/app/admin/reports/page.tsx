import styles from "./page.module.css";

export default function AdminReports() {
  return (
    <div>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Phân tích số liệu</p>
          <h1 className={styles.title}>Báo cáo doanh thu</h1>
        </div>
        <div className={styles.actions}>
          <button className={`mono-text ${styles.buttonPrimary}`}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>download</span>
            Xuất file Excel
          </button>
        </div>
      </div>

      <div className={styles.bentoGrid}>
        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.primaryIcon}`}>
              <span className="material-symbols-outlined">trending_up</span>
            </div>
          </div>
          <div>
            <p className={`mono-text ${styles.statLabel}`}>Doanh thu thực tế</p>
            <h3 className={styles.statValue}>1.2B₫</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.tertiaryIcon}`}>
              <span className="material-symbols-outlined">receipt_long</span>
            </div>
          </div>
          <div>
            <p className={`mono-text ${styles.statLabel}`}>Tổng số hóa đơn</p>
            <h3 className={styles.statValue}>248</h3>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statHeader}>
            <div className={`${styles.iconWrapper} ${styles.accentIconWrapper}`} style={{ backgroundColor: "#f59e0b", color: "#fff" }}>
              <span className="material-symbols-outlined">conversion_path</span>
            </div>
          </div>
          <div>
            <p className={`mono-text ${styles.statLabel}`}>Tỷ lệ hoàn thành phòng</p>
            <h3 className={styles.statValue}>98.2%</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
