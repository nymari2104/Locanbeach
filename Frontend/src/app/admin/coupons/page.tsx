"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPatch, apiDelete, getErrorMessage } from "@/lib/api";
import { CouponDTO } from "@/types/api";
import styles from "./page.module.css";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minBookingAmount, setMinBookingAmount] = useState("");
  const [maxDiscountAmount, setMaxDiscountAmount] = useState("");
  const [minLengthOfStay, setMinLengthOfStay] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxUsage, setMaxUsage] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await apiGet<CouponDTO[]>("/coupons");
      setCoupons(res || []);
    } catch (err: any) {
      console.error("Lỗi lấy danh sách coupon:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();

    // Default dates for form
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    setStartDate(today.toISOString().split("T")[0] + "T00:00:00");
    setEndDate(nextYear.toISOString().split("T")[0] + "T23:59:59");
  }, []);

  const handleToggleStatus = async (id: string) => {
    try {
      await apiPatch(`/coupons/${id}/toggle`, {});
      fetchCoupons();
    } catch (err: any) {
      alert("Lỗi đổi trạng thái: " + getErrorMessage(err));
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá "${code}" không?`)) return;
    try {
      await apiDelete(`/coupons/${id}`);
      fetchCoupons();
    } catch (err: any) {
      alert("Lỗi xóa mã giảm giá: " + getErrorMessage(err));
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !discountValue) return;

    setSaving(true);
    try {
      await apiPost("/coupons", {
        code: code.trim().toUpperCase(),
        description,
        discountType,
        discountValue: parseFloat(discountValue),
        minBookingAmount: minBookingAmount ? parseFloat(minBookingAmount) : undefined,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : undefined,
        minLengthOfStay: parseInt(minLengthOfStay) || 1,
        startDate: startDate.includes("T") ? startDate : `${startDate}T00:00:00`,
        endDate: endDate.includes("T") ? endDate : `${endDate}T23:59:59`,
        maxUsage: maxUsage ? parseInt(maxUsage) : undefined,
        isActive: true
      });

      setIsModalOpen(false);
      // Reset form
      setCode("");
      setDescription("");
      setDiscountValue("");
      setMinBookingAmount("");
      setMaxDiscountAmount("");
      fetchCoupons();
    } catch (err: any) {
      alert("Lỗi tạo mã: " + getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>Quản lý Mã giảm giá (Coupons)</h1>
          <p className={styles.subtitle}>Tạo mã ưu đãi, đặt hạn mức lượt dùng và điều kiện khuyến mãi</p>
        </div>
        <button className={styles.btnPrimary} onClick={() => setIsModalOpen(true)}>
          <span className="material-symbols-outlined">add</span>
          Tạo mã giảm giá mới
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>Đang tải danh sách coupon...</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>Chưa có mã giảm giá nào được tạo.</div>
      ) : (
        <div className={styles.cardGrid}>
          {coupons.map((item) => (
            <div key={item.id} className={styles.couponCard}>
              <div>
                <div className={styles.cardHeader}>
                  <span className={styles.codeBadge}>{item.code}</span>
                  <span className={item.isActive ? styles.statusActive : styles.statusInactive}>
                    {item.isActive ? "Hoạt động" : "Đã khóa"}
                  </span>
                </div>
                <div className={styles.couponDesc}>{item.description || "Ưu đãi đặt phòng trực tuyến."}</div>
                <div className={styles.detailsList}>
                  <div className={styles.detailRow}>
                    <span>Mức giảm:</span>
                    <strong style={{ color: "#0284c7" }}>
                      {item.discountType === "PERCENTAGE" 
                        ? `${item.discountValue}% ${item.maxDiscountAmount ? `(Tối đa ${item.maxDiscountAmount.toLocaleString("vi-VN")}₫)` : ""}`
                        : `${item.discountValue.toLocaleString("vi-VN")}₫`}
                    </strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Số đêm tối thiểu:</span>
                    <strong>{item.minLengthOfStay} đêm</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Đơn tối thiểu:</span>
                    <strong>{item.minBookingAmount ? `${item.minBookingAmount.toLocaleString("vi-VN")}₫` : "Không yêu cầu"}</strong>
                  </div>
                  <div className={styles.detailRow}>
                    <span>Lượt sử dụng:</span>
                    <strong>{item.currentUsage} / {item.maxUsage || "∞"}</strong>
                  </div>
                </div>
              </div>

              <div className={styles.cardFooter}>
                <button
                  className={styles.btnOutline}
                  onClick={() => item.id && handleToggleStatus(item.id)}
                  style={{ fontSize: "0.8rem" }}
                >
                  {item.isActive ? "Tắt kích hoạt" : "Bật kích hoạt"}
                </button>
                {item.id && (
                  <button
                    className={styles.btnOutline}
                    onClick={() => handleDeleteCoupon(item.id!, item.code)}
                    style={{ fontSize: "0.8rem", color: "#dc2626", borderColor: "#fecaca" }}
                  >
                    Xóa mã
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Tạo Coupon Mới */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Tạo Mã Giảm Giá Mới</h3>
              <button style={{ background: "none", border: "none", cursor: "pointer" }} onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateCoupon}>
              <div className={styles.formGrid}>
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Mã giảm giá (Code)*</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: WELCOME10, LOCAN200K..."
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label className={styles.label}>Mô tả chương trình</label>
                  <input
                    type="text"
                    className={styles.input}
                    placeholder="VD: Giảm 10% cho khách đặt trực tiếp..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Loại ưu đãi</label>
                  <select
                    className={styles.select}
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                  >
                    <option value="PERCENTAGE">Theo Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (VND)</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá trị giảm*</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder={discountType === "PERCENTAGE" ? "VD: 10 (%)" : "VD: 200000 (VND)"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Giá trị đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="VD: 500000"
                    value={minBookingAmount}
                    onChange={(e) => setMinBookingAmount(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Mức giảm tối đa (VND)</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="VD: 500000 (cho loại %)"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Số đêm ở tối thiểu</label>
                  <input
                    type="number"
                    className={styles.input}
                    value={minLengthOfStay}
                    onChange={(e) => setMinLengthOfStay(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>Tổng số lượt dùng tối đa</label>
                  <input
                    type="number"
                    className={styles.input}
                    placeholder="Để trống = Không giới hạn"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1.5rem" }}>
                <button type="button" className={styles.btnOutline} onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? "Đang tạo..." : "Xác nhận tạo mã"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
