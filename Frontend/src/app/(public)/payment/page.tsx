"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost, getErrorMessage } from "@/lib/api";
import { PaymentQrResponse } from "@/types/api";
import styles from "./page.module.css";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [qrData, setQrData] = useState<PaymentQrResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(600); // Default 10 mins
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setLoading(false);
      return;
    }

    async function loadQrData() {
      try {
        const res = await apiPost<PaymentQrResponse>("/payments/create-qr", { bookingId });
        setQrData(res);
        if (res.status === "CONFIRMED" || res.status === "COMPLETED") {
          setIsConfirmed(true);
        }

        if (res.expiresAt) {
          const expTime = new Date(res.expiresAt).getTime();
          const secs = Math.floor((expTime - Date.now()) / 1000);
          setTimeLeft(secs > 0 ? secs : 0);
        }
      } catch (err) {
        console.error("Failed to load VietQR data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQrData();
  }, [bookingId]);

  // Timer countdown interval
  useEffect(() => {
    if (timeLeft <= 0 || isConfirmed || !qrData) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isConfirmed, qrData]);

  // Polling payment status every 3 seconds
  useEffect(() => {
    if (!bookingId || isConfirmed || timeLeft <= 0) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiGet<PaymentQrResponse>(`/payments/booking/${bookingId}/status`);
        if (res.status === "CONFIRMED" || res.status === "COMPLETED") {
          setIsConfirmed(true);
        } else if (res.status === "CANCELLED") {
          setTimeLeft(0);
        }
      } catch (err) {
        console.error("Error polling payment status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId, isConfirmed, timeLeft]);

  const handleRenewHold = async () => {
    if (!bookingId || renewing) return;
    setRenewing(true);
    setRenewError(null);
    try {
      const res = await apiPost<any>(`/bookings/${bookingId}/renew-hold`, {});
      if (res.expiresAt) {
        const expTime = new Date(res.expiresAt).getTime();
        const secs = Math.floor((expTime - Date.now()) / 1000);
        setTimeLeft(secs > 0 ? secs : 600);
      } else {
        setTimeLeft(600);
      }
      setQrData((prev) => prev ? { ...prev, expiresAt: res.expiresAt, renewCount: res.renewCount, status: res.status } : null);
    } catch (err: any) {
      console.error("Failed to renew hold:", err);
      setRenewError(getErrorMessage(err));
    } finally {
      setRenewing(false);
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
          <div className={styles.spinner} style={{ width: 48, height: 48 }} />
        </div>
      </div>
    );
  }

  if (isConfirmed) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h1 className={styles.title} style={{ color: "#16a34a", fontSize: "2rem" }}>Thanh Toán Thành Công!</h1>
          <p className={styles.subtitle} style={{ fontSize: "1.05rem", margin: "1rem 0" }}>
            Hệ thống đã nhận được số tiền đặt cọc và tự động xác nhận đơn đặt phòng của quý khách.
          </p>
          <div className={styles.infoRow} style={{ justifyContent: "center", gap: "1rem" }}>
            <span>Mã đơn đặt phòng:</span>
            <strong style={{ color: "#0284c7", fontSize: "1.2rem" }}>{qrData?.bookingCode}</strong>
          </div>
          <button className={styles.homeBtn} onClick={() => router.push("/")}>
            Quay Về Trang Chủ
          </button>
        </div>
      </div>
    );
  }

  if (!qrData) {
    return (
      <div className={styles.container}>
        <p style={{ textAlign: "center", color: "#ef4444", padding: "5rem 0" }}>Không tìm thấy thông tin thanh toán cho đơn đặt phòng này.</p>
      </div>
    );
  }

  const isExpired = timeLeft <= 0 || qrData.status === "CANCELLED";
  const isBlurWarning = !isExpired && timeLeft > 0 && timeLeft <= 120; // Under 2 minutes
  const renewCount = qrData.renewCount || 0;
  const canRenew = renewCount < 3 && !isExpired;

  if (isExpired) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard} style={{ borderColor: "#fca5a5", background: "#fff5f5" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "3.5rem", color: "#ef4444" }}>cancel</span>
          <h1 className={styles.title} style={{ color: "#dc2626", fontSize: "1.8rem", marginTop: "0.5rem" }}>
            Đơn Hàng Đã Bị Hủy
          </h1>
          <p className={styles.subtitle} style={{ color: "#792828", fontSize: "1rem", margin: "1rem 0" }}>
            Phiên làm việc quá thời gian thanh toán đặt cọc (10 phút). Đơn đặt phòng <strong>#{qrData.bookingCode}</strong> đã bị hệ thống tự động hủy để trả vị trí phòng trống cho khách hàng khác.
          </p>
          <button
            className={styles.homeBtn}
            style={{ background: "#0b57d0" }}
            onClick={() => router.push("/book")}
          >
            Quay Lại Đặt Phòng Mới
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isBlurWarning && (
        <div style={{
          maxWidth: "1000px",
          margin: "0 auto 1.5rem auto",
          background: "#fffbeb",
          border: "2px solid #f59e0b",
          borderRadius: "16px",
          padding: "1rem 1.25rem",
          color: "#92400e",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
          boxShadow: "0 4px 12px rgba(245, 158, 11, 0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#d97706" }}>warning</span>
            <div>
              <strong style={{ fontSize: "1rem", display: "block" }}>CẢNH BÁO AN TOÀN THANH TOÁN (Còn {formatTime(timeLeft)})</strong>
              <span style={{ fontSize: "0.85rem", color: "#b45309" }}>
                Thời gian giữ phòng sắp hết (còn dưới 2 phút). Vui lòng gia hạn để làm mới mã QR và đảm bảo không bị hết phòng khi đang chuyển khoản.
              </span>
            </div>
          </div>
          {canRenew ? (
            <button
              type="button"
              onClick={handleRenewHold}
              disabled={renewing}
              style={{
                background: "linear-gradient(135deg, #d97706, #b45309)",
                color: "#ffffff",
                border: "none",
                padding: "0.65rem 1.25rem",
                borderRadius: "10px",
                fontWeight: "bold",
                fontSize: "0.9rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                boxShadow: "0 2px 8px rgba(180, 83, 9, 0.3)"
              }}
            >
              {renewing ? "Đang gia hạn..." : `🔄 Gia hạn mã thanh toán (Còn ${3 - renewCount}/3 lần)`}
            </button>
          ) : (
            <span style={{ fontSize: "0.85rem", color: "#dc2626", fontWeight: "bold" }}>Đã hết lượt gia hạn (3/3)</span>
          )}
        </div>
      )}

      {renewError && (
        <div style={{ maxWidth: "1000px", margin: "0 auto 1rem auto", background: "#fee2e2", border: "1px solid #fca5a5", color: "#b91c1c", padding: "0.75rem 1rem", borderRadius: "10px", fontSize: "0.9rem" }}>
          {renewError}
        </div>
      )}

      <div className={styles.card}>
        {/* QR Section */}
        <div className={styles.qrSection} style={isBlurWarning ? { position: "relative" } : {}}>
          <div className={styles.timerBadge} style={isBlurWarning ? { background: "#fee2e2", color: "#dc2626" } : {}}>
            ⏱️ Hạn thanh toán: <strong>{formatTime(timeLeft)}</strong>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.75rem 0 0.5rem 0" }}>
            Quét mã QR bằng App Ngân hàng để thanh toán tự động
          </p>

          <div style={isBlurWarning ? { filter: "blur(7px)", opacity: 0.5, pointerEvents: "none", userSelect: "none" } : {}}>
            <img src={qrData.qrImageUrl} alt="VietQR Payment" className={styles.qrImage} />
          </div>

          {isBlurWarning && (
            <div style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(255, 255, 255, 0.95)",
              padding: "1rem 1.5rem",
              borderRadius: "16px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
              textAlign: "center",
              zIndex: 10,
              width: "85%"
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#d97706" }}>lock_clock</span>
              <p style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#1e293b", margin: "0.5rem 0" }}>
                Mã QR đã tạm ẩn để bảo vệ thời gian chuyển khoản
              </p>
              {canRenew ? (
                <button
                  type="button"
                  onClick={handleRenewHold}
                  disabled={renewing}
                  style={{
                    background: "#0b57d0",
                    color: "#fff",
                    border: "none",
                    padding: "0.55rem 1rem",
                    borderRadius: "8px",
                    fontWeight: "bold",
                    fontSize: "0.85rem",
                    cursor: "pointer"
                  }}
                >
                  {renewing ? "Đang mở khóa..." : "Bấm vào đây để làm mới +10 phút"}
                </button>
              ) : (
                <span style={{ fontSize: "0.8rem", color: "#dc2626" }}>Đã dùng hết 3 lượt gia hạn</span>
              )}
            </div>
          )}

          <div className={styles.statusIndicator}>
            <div className={styles.spinner} />
            Đang chờ ngân hàng xác nhận giao dịch...
          </div>
        </div>

        {/* Details Section */}
        <div className={styles.detailsSection} style={isBlurWarning ? { filter: "blur(6px)", opacity: 0.6, pointerEvents: "none" } : {}}>
          <h1 className={styles.title}>Thanh Toán Đặt Cọc (30%)</h1>
          <p className={styles.subtitle}>
            Vui lòng quét mã QR hoặc chuyển khoản đúng nội dung bên dưới:
          </p>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Ngân hàng:</span>
            <span className={styles.infoValue}>{qrData.bankName}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Số tài khoản:</span>
            <span className={styles.infoValue}>
              {qrData.bankAccountNo}
              <button className={styles.copyBtn} onClick={() => copyToClipboard(qrData.bankAccountNo, "account")}>
                {copiedField === "account" ? "Đã chép!" : "Chép"}
              </button>
            </span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Chủ tài khoản:</span>
            <span className={styles.infoValue}>{qrData.bankAccountName}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Số tiền cọc (30%):</span>
            <span className={styles.infoValue} style={{ color: "#d97706", fontSize: "1.15rem" }}>
              {qrData.depositAmount.toLocaleString("vi-VN")}₫
            </span>
          </div>

          <div className={styles.infoRow} style={{ background: "#fef3c7", border: "1px solid #fde68a" }}>
            <span className={styles.infoLabel} style={{ color: "#92400e" }}>Nội dung chuyển khoản:</span>
            <span className={styles.infoValue} style={{ color: "#0284c7" }}>
              {qrData.transferContent}
              <button className={styles.copyBtn} onClick={() => copyToClipboard(qrData.transferContent, "content")}>
                {copiedField === "content" ? "Đã chép!" : "Chép"}
              </button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div style={{ display: "flex", justifyContent: "center", padding: "10rem 0" }}>
          <div className={styles.spinner} style={{ width: 48, height: 48 }} />
        </div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
