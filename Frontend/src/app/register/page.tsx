"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiPost, getErrorMessage } from "@/lib/api";
import styles from "./page.module.css";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // If already logged in, redirect to admin
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !username || !password || !confirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ các trường.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Register request
      await apiPost("/auth/register", {
        fullName,
        username,
        password
      });
      
      setSuccessMsg("Đăng ký tài khoản thành công! Đang chuyển hướng đăng nhập...");
      
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
            <img 
              alt="Lộc An Beach Logo" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC63fPEZhWhvU55JIkbViURS55j5q5kDcPbpZR_bwqR71tLJFxzIyWh9r4Q5vHFgGK_GOZteySv_qliX84iBS-yYz2dPlDP612DCrUiqnY85dv1SlVIgsZWHUbRpDlwVinqjxU5It6KoNcqZqbk3tjUd6MdRoc3Mdv56xmvr6DcYL4OIzDoJB7Ttk4yuoVPsmLkVO428zazuLQpng8HCorpThOwHyaDAtM8qiCjabmHTynCP7iX_5J7TC0f7O8AlrBigg"
              className={styles.logo}
            />
            <h1 className={styles.title}>Đăng ký</h1>
            <p className={styles.subtitle}>Tạo tài khoản quản trị viên mới</p>
          </div>

          {successMsg ? (
            <div className={styles.successWrapper} style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "3.5rem", color: "#10b981", marginBottom: "1rem" }}>check_circle</span>
              <p style={{ color: "#18181B", fontWeight: 500, fontSize: "0.95rem", lineHeight: 1.6 }}>{successMsg}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName" className={`mono-text ${styles.label}`}>Họ và tên</label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined styles.inputIcon" style={{ position: "absolute", left: "1rem", color: "#A1A1AA", pointerEvents: "none", fontSize: "1.25rem" }}>badge</span>
                  <input 
                    id="fullName"
                    type="text" 
                    className={styles.input} 
                    placeholder="Nguyễn Văn A"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="username" className={`mono-text ${styles.label}`}>Tên đăng nhập</label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined styles.inputIcon" style={{ position: "absolute", left: "1rem", color: "#A1A1AA", pointerEvents: "none", fontSize: "1.25rem" }}>person</span>
                  <input 
                    id="username"
                    type="text" 
                    className={styles.input} 
                    placeholder="Nhập tên đăng nhập"
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
                    type="password" 
                    className={styles.input} 
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword" className={`mono-text ${styles.label}`}>Xác nhận mật khẩu</label>
                <div className={styles.inputWrapper}>
                  <span className="material-symbols-outlined styles.inputIcon" style={{ position: "absolute", left: "1rem", color: "#A1A1AA", pointerEvents: "none", fontSize: "1.25rem" }}>lock_reset</span>
                  <input 
                    id="confirmPassword"
                    type="password" 
                    className={styles.input} 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    required
                  />
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
                  "Đăng ký tài khoản"
                )}
              </button>
            </form>
          )}

          <div className={styles.footer}>
            <p>Đã có tài khoản? <Link href="/login" className={styles.link}>Đăng nhập</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
