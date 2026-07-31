"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HoldSession, HoldItem } from "@/hooks/useHoldSession";
import styles from "./FloatingHoldBar.module.css";

interface FloatingHoldBarProps {
  session: HoldSession | null;
  onRemoveItem: (itemId: string) => Promise<void>;
}

export default function FloatingHoldBar({ session, onRemoveItem }: FloatingHoldBarProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [timeLeftStr, setTimeLeftStr] = useState<string>("07:00");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const items = session?.items || [];
  const itemCount = items.length;

  useEffect(() => {
    if (!session || !session.expiresAtTimestamp) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diffMs = session.expiresAtTimestamp - now;

      if (diffMs <= 0) {
        setTimeLeftStr("Hết hạn");
        clearInterval(interval);
      } else {
        const totalSec = Math.floor(diffMs / 1000);
        const m = Math.floor(totalSec / 60);
        const s = totalSec % 60;
        setTimeLeftStr(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [session]);

  if (!session || itemCount === 0) {
    return null;
  }

  const formatPrice = (val?: number) => {
    if (!val) return "0₫";
    return new Intl.NumberFormat("vi-VN").format(val) + "₫";
  };

  const formatDateShort = (isoString?: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const handleDeleteItem = async (itemId: string) => {
    setDeletingId(itemId);
    try {
      await onRemoveItem(itemId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <aside className={styles.floatingBarContainer} aria-label="Danh sách phòng đang chọn">
      <div className={styles.floatingCard}>
        {/* Main Floating Summary Bar */}
        <div className={styles.mainBar}>
          <div className={styles.cartInfoGroup}>
            <div className={styles.cartBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                meeting_room
              </span>
              <span>{itemCount} phòng đang chọn</span>
            </div>

            <div className={styles.timerBox} title="Thời gian giữ phòng còn lại">
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                timer
              </span>
              <span>Giữ chỗ: {timeLeftStr}</span>
            </div>
          </div>

          <div className={styles.priceGroup}>
            <span className={styles.totalLabel}>Tạm tính tổng tiền</span>
            <span className={styles.totalPrice}>{formatPrice(session.totalAmount)}</span>
          </div>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={styles.toggleDrawerBtn}
              onClick={() => setExpanded(!expanded)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                {expanded ? "expand_more" : "list"}
              </span>
              <span>{expanded ? "Thu gọn" : "Danh sách phòng"}</span>
            </button>

            <button
              type="button"
              className={styles.checkoutBtn}
              onClick={() => router.push("/checkout")}
            >
              <span>Tiến hành thanh toán</span>
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                arrow_forward
              </span>
            </button>
          </div>
        </div>

        {/* Expanded Drawer Content */}
        {expanded && (
          <div className={styles.drawerContent}>
            <div className={styles.drawerTitle}>
              <span>DANH SÁCH PHÒNG ĐANG CHỌN ({itemCount})</span>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8", fontWeight: "normal" }}>
                Tự động giải phóng khi hết hạn timer 7 phút
              </span>
            </div>

            <div className={styles.itemsList}>
              {items.map((item: HoldItem) => (
                <div key={item.itemId} className={styles.itemCard}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemName}>
                      {item.categoryName} ({item.accommodationCode || item.categoryCode})
                    </div>
                    <div className={styles.itemMeta}>
                      <span>
                        {formatDateShort(item.checkinDate)} ➔ {formatDateShort(item.checkoutDate)}
                      </span>
                      <span>• {item.numNights} đêm</span>
                      <span>• {formatPrice(item.pricePerNight)}/đêm</span>
                    </div>
                  </div>

                  <div className={styles.itemPriceGroup}>
                    <span className={styles.itemPrice}>{formatPrice(item.itemTotalAmount)}</span>
                    <button
                      type="button"
                      className={styles.deleteItemBtn}
                      title="Xóa phòng này khỏi đơn"
                      disabled={deletingId === item.itemId}
                      onClick={() => handleDeleteItem(item.itemId)}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                type="button"
                className={styles.addMoreBtn}
                onClick={() => setExpanded(false)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                  add
                </span>
                <span>Chọn thêm phòng khác</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
