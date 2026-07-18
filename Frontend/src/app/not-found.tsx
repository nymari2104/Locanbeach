import Link from "next/link";

export default function NotFound() {
  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <span className="material-symbols-outlined" style={styles.icon}>explore_off</span>
        </div>
        
        <h1 style={styles.title}>404</h1>
        <h2 style={styles.subtitle}>Lạc lối giữa biển khơi</h2>
        <p style={styles.description}>
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển sang một hành trình khác tại Lộc An Beach.
        </p>
        
        <div style={styles.buttonWrapper}>
          <Link href="/" style={styles.buttonPrimary}>
            <span className="material-symbols-outlined" style={styles.buttonIcon}>home</span>
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
    backgroundImage: "radial-gradient(circle at 10% 20%, rgba(216, 241, 230, 0.46) 0.1%, rgba(233, 226, 226, 0.28) 90.1%)",
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
    backgroundImage: "radial-gradient(circle at top right, rgba(59, 130, 246, 0.05), transparent 400px)",
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
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 1.5rem",
    color: "#3B82F6",
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
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.03em",
  },
  subtitle: {
    fontFamily: "var(--font-lora), serif",
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1E293B",
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
    justifyContent: "center",
  },
  buttonPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    backgroundColor: "#0058be",
    color: "#ffffff",
    padding: "0.85rem 2rem",
    borderRadius: "9999px",
    fontWeight: 500,
    fontSize: "0.95rem",
    boxShadow: "0 10px 20px rgba(0, 88, 190, 0.15)",
    transition: "all 0.2s ease-in-out",
    border: "none",
    cursor: "pointer",
  },
  buttonIcon: {
    fontSize: "1.25rem",
  }
};
