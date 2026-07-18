"use client";

import Link from "next/link";

export default function BadGateway() {
  const handleReload = () => {
    window.location.href = "/";
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span className="material-symbols-outlined" style={styles.icon}>cloud_off</span>
        </div>
        
        <h1 style={styles.title}>502</h1>
        <h2 style={styles.subtitle}>Kết nối bị gián đoạn</h2>
        <p style={styles.description}>
          Hệ thống đang tạm thời mất kết nối với máy chủ dịch vụ của Lộc An Beach. Vui lòng kiểm tra lại đường truyền mạng hoặc quay lại sau ít phút.
        </p>
        
        <div style={styles.buttonWrapper}>
          <button onClick={handleReload} style={styles.buttonPrimary}>
            <span className="material-symbols-outlined" style={styles.buttonIcon}>refresh</span>
            Thử kết nối lại
          </button>
          
          <Link href="/" style={styles.buttonSecondary}>
            Trở về Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: "#F2F3F4",
    backgroundImage: "radial-gradient(circle at 10% 20%, rgba(246, 216, 216, 0.4) 0.1%, rgba(233, 226, 226, 0.28) 90.1%)",
    fontFamily: "var(--font-be-vietnam-pro), sans-serif",
    padding: "1.5rem",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: "radial-gradient(circle at top right, rgba(239, 68, 68, 0.05), transparent 400px)",
    pointerEvents: "none",
  },
  card: {
    maxWidth: "500px",
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 20px 40px rgba(11, 37, 69, 0.06), 0 1px 3px rgba(0, 0, 0, 0.02)",
    borderRadius: "1.5rem",
    padding: "3rem 2rem",
    textAlign: "center",
    zIndex: 1,
    position: "relative",
  },
  iconContainer: {
    width: "72px",
    height: "72px",
    borderRadius: "50%",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
    color: "#EF4444",
  },
  icon: {
    fontSize: "2.5rem",
    fontVariationSettings: "'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 40",
  },
  title: {
    fontFamily: "var(--font-lora), serif",
    fontSize: "6rem",
    fontWeight: 700,
    lineHeight: 1,
    margin: "0 0 0.5rem",
    background: "linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontFamily: "var(--font-lora), serif",
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#7F1D1D",
    margin: "0 0 1rem",
  },
  description: {
    fontSize: "0.95rem",
    color: "#64748B",
    lineHeight: 1.6,
    margin: "0 0 2.5rem",
  },
  buttonWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#ba1a1a",
    color: "#ffffff",
    padding: "0.85rem 2rem",
    borderRadius: "9999px",
    fontWeight: 500,
    fontSize: "0.95rem",
    boxShadow: "0 10px 20px rgba(186, 26, 26, 0.15)",
    transition: "all 0.2s ease-in-out",
    border: "none",
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
  },
  buttonSecondary: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#475569",
    padding: "0.85rem 2rem",
    borderRadius: "9999px",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "all 0.2s ease-in-out",
    border: "1px solid #CBD5E1",
    cursor: "pointer",
    width: "100%",
  },
  buttonIcon: {
    fontSize: "1.25rem",
  }
};
