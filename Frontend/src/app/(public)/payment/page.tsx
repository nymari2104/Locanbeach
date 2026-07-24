"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import styles from "./page.module.css";

interface PaymentQrResponse {
  bookingId: string;
  bookingCode: string;
  depositAmount: number;
  totalAmount: number;
  bankName: string;
  bankAccountNo: string;
  bankAccountName: string;
  transferContent: string;
  qrImageUrl: string;
  status: string;
}

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");

  const [qrData, setQrData] = useState<PaymentQrResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes timer
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    async function loadQrData() {
      try {
        const res = await apiPost<PaymentQrResponse>("/payments/create-qr", { bookingId });
        setQrData(res);
        if (res.status === "CONFIRMED" || res.status === "COMPLETED") {
          setIsConfirmed(true);
        }
      } catch (err) {
        console.error("Failed to load VietQR data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadQrData();
  }, [bookingId]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0 || isConfirmed) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isConfirmed]);

  // Polling payment status every 3 seconds
  useEffect(() => {
    if (!bookingId || isConfirmed) return;

    const interval = setInterval(async () => {
      try {
        const res = await apiGet<PaymentQrResponse>(`/payments/booking/${bookingId}/status`);
        if (res.status === "CONFIRMED" || res.status === "COMPLETED") {
          setIsConfirmed(true);
        }
      } catch (err) {
        console.error("Error polling payment status:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [bookingId, isConfirmed]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
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
        <p style={{ textAlign: "center", color: "#ef4444" }}>Không tìm thấy thông tin thanh toán cho đơn đặt phòng này.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.qrSection}>
          <div className={styles.timerBadge}>
            ⏱️ Hạn thanh toán: <strong>{formatTime(timeLeft)}</strong>
          </div>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.75rem 0 0.5rem 0" }}>
            Quét mã QR bằng App Ngân hàng để thanh toán tự động
          </p>
          <img src={qrData.qrImageUrl} alt="VietQR Payment" className={styles.qrImage} />
          <div className={styles.statusIndicator}>
            <div className={styles.spinner} />
            Đang chờ ngân hàng xác nhận giao dịch...
          </div>
        </div>

        <div className={styles.detailsSection}>
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
