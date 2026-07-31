"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, getErrorMessage } from "@/lib/api";
import { LoginResponse } from "@/types/api";
import styles from "./page.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect based on role
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");
    if (token) {
      if (role === 'STAFF') router.push('/staff');
      else if (role === 'HOUSEKEEPER') router.push('/housekeeping');
      else router.push('/admin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setErrorMsg("Vui lòng điền đầy đủ thông tin.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const res = await apiPost<LoginResponse>("/auth/login", {
        username,
        password
      });

      // Save token & user details
      localStorage.setItem("accessToken", res.accessToken);
      localStorage.setItem("username", res.username);
      localStorage.setItem("fullName", res.fullName);
      localStorage.setItem("userRole", res.role);

      // Redirect based on role
      if (res.role === 'STAFF') router.push('/staff');
      else if (res.role === 'HOUSEKEEPER') router.push('/housekeeping');
      else router.push('/admin');
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Left side: Premium Image Banner */}
      <div className={styles.imageSection}>
        <div className={styles.imageOverlay} />
        <img 
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format" 
          alt="Lộc An Beach Resort" 
          className={styles.bannerImage}
        />
        <div className={styles.brandOverlay}>
          <p className={`mono-text ${styles.brandPreTitle}`}>Welcome to</p>
          <h2 className={styles.brandTitle}>The House</h2>
          <p className={styles.brandDesc}>Hệ thống quản lý vận hành Resort Lộc An Beach cao cấp, trực quan và thông minh.</p>
        </div>
      </div>

      {/* Right side: Modern Form Section */}
      <div className={styles.formSection}>
        <div className={styles.formCard}>
          <div className={styles.header}>
            <Link href="/" title="Quay về trang chủ">
              <img 
                alt="Lộc An Beach Logo" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC63fPEZhWhvU55JIkbViURS55j5q5kDcPbpZR_bwqR71tLJFxzIyWh9r4Q5vHFgGK_GOZteySv_qliX84iBS-yYz2dPlDP612DCrUiqnY85dv1SlVIgsZWHUbRpDlwVinqjxU5It6KoNcqZqbk3tjUd6MdRoc3Mdv56xmvr6DcYL4OIzDoJB7Ttk4yuoVPsmLkVO428zazuLQpng8HCorpThOwHyaDAtM8qiCjabmHTynCP7iX_5J7TC0f7O8AlrBigg"
                className={styles.logo}
              />
            </Link>
            <h1 className={styles.title}>Đăng nhập</h1>
            <p className={styles.subtitle}>Nhập thông tin quản trị viên hoặc nhân viên</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username" className={`mono-text ${styles.label}`}>Tên đăng nhập</label>
              <div className={styles.inputWrapper}>
                <span className="material-symbols-outlined styles.inputIcon" style={{ position: "absolute", left: "1rem", color: "#A1A1AA", pointerEvents: "none", fontSize: "1.25rem" }}>person</span>
                <input 
                  id="username"
                  type="text" 
                  className={styles.input} 
                  placeholder="admin / staff01..."
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={`mono-text ${styles.label}`}>Mật khẩu</label>
              <div className={styles.inputWrapper}>
                <span className="material-symbols-outlined styles.inputIcon" style={{ position: "absolute", left: "1rem", color: "#A1A1AA", pointerEvents: "none", fontSize: "1.25rem" }}>lock</span>
                <input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  className={styles.input} 
                  style={{ paddingRight: "2.75rem" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.85rem",
                    background: "none",
                    border: "none",
                    color: "#A1A1AA",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0.25rem",
                    borderRadius: "0.375rem"
                  }}
                  tabIndex={-1}
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className={styles.errorAlert}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>error</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <button 
              type="submit" 
              className={`mono-text ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.spinner}></span>
              ) : (
                "Đăng nhập hệ thống"
              )}
            </button>
          </form>

          <div className={styles.footer}>
            <p style={{ margin: 0 }}>Chưa có tài khoản? <Link href="/register" className={styles.link}>Đăng ký ngay</Link></p>
            <p style={{ marginTop: "0.75rem", marginBottom: 0 }}>
              <Link href="/" className={styles.homeLink}>
                <span className="material-symbols-outlined" style={{ fontSize: "1rem", verticalAlign: "middle", marginRight: "0.25rem" }}>arrow_back</span>
                Quay về trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
