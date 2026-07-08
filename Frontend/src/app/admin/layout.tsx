import SideNavBar from "@/components/admin/SideNavBar";
import styles from "./layout.module.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={styles.adminWrapper}>
      <SideNavBar />
      <main className={styles.adminMain}>
        {/* Mobile Header */}
        <header className={styles.mobileHeader}>
          <div className={styles.mobileBrand}>
            <div className={styles.mobileLogo}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>home_work</span>
            </div>
            <h1 className={styles.mobileBrandName}>Lộc An Beach</h1>
          </div>
          <button className={styles.mobileMenuBtn}>
            <span className="material-symbols-outlined">menu</span>
          </button>
        </header>

        <div className={styles.adminContent}>
          {children}
        </div>
      </main>
    </div>
  );
}
