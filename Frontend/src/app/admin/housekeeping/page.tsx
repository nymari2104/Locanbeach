"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { AccommodationDTO } from "@/types/api";

export default function Housekeeping() {
  const [accommodations, setAccommodations] = useState<AccommodationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("DIRTY"); // DIRTY, CLEANING, VACANT, OCCUPIED
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const loadAccommodations = async () => {
    try {
      setLoading(true);
      const data = await apiGet<AccommodationDTO[]>("/staff/accommodations");
      setAccommodations(data);
    } catch (error) {
      console.error("Failed to load accommodations:", error);
      setMessage({ text: "Không thể kết nối đến máy chủ.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccommodations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await apiPut<AccommodationDTO>(`/staff/accommodations/${id}/operational-status`, {
        status: newStatus
      });
      setMessage({
        text: `Đã cập nhật trạng thái phòng thành công.`,
        type: "success"
      });
      // Refresh list
      loadAccommodations();
    } catch (error) {
      setMessage({
        text: getErrorMessage(error),
        type: "error"
      });
    }
  };

  // Filter accommodations based on tab
  const displayedRooms = accommodations.filter(room => room.operationalStatus === activeTab);

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case "DIRTY": return "Khách vừa đi (Cần dọn)";
      case "CLEANING": return "Đang dọn dẹp";
      case "VACANT": return "Sẵn sàng";
      case "OCCUPIED": return "Đang có khách";
      default: return tab;
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Quản Lý Tạp Vụ & Dọn Phòng</h1>
          <p className={styles.subtitle}>Theo dõi và cập nhật trạng thái dọn dẹp phòng nghỉ tại resort.</p>
        </div>
      </header>

      {message && (
        <div className={`${styles.toast} ${message.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          <span className="material-symbols-outlined">
            {message.type === "success" ? "check_circle" : "error"}
          </span>
          <span>{message.text}</span>
          <button className={styles.toastClose} onClick={() => setMessage(null)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <section className={styles.tabsSection}>
        <div className={styles.tabs}>
          {["DIRTY", "CLEANING", "VACANT", "OCCUPIED"].map((tab) => {
            const count = accommodations.filter(r => r.operationalStatus === tab).length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
              >
                <span>{getTabLabel(tab)}</span>
                <span className={styles.tabBadge}>{count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Rooms Grid */}
      <section className={styles.grid}>
        {loading ? (
          <div style={{ gridColumn: "1/-1", display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div className="spinner" style={{
              border: "4px solid rgba(0,0,0,0.1)",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              borderLeftColor: "var(--color-primary)",
              animation: "spin 1s linear infinite"
            }} />
          </div>
        ) : displayedRooms.length === 0 ? (
          <div className={styles.emptyState}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", color: "var(--color-muted-slate)" }}>
              cleaning_services
            </span>
            <p>Không có phòng nào ở trạng thái này.</p>
          </div>
        ) : (
          displayedRooms.map((room) => (
            <article key={room.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className="material-symbols-outlined" style={{ color: "var(--color-primary)" }}>
                  meeting_room
                </span>
                <h3 className={styles.roomCode}>Phòng {room.code}</h3>
              </div>
              <div className={styles.cardBody}>
                <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--color-steel-secondary)" }}>
                  Loại phòng: <strong>{room.categoryName || "Chưa phân loại"}</strong>
                </p>
                <div style={{ marginTop: "1rem" }}>
                  {room.operationalStatus === "DIRTY" && (
                    <button
                      className={`${styles.actionBtn} ${styles.btnStart}`}
                      onClick={() => handleStatusChange(room.id, "CLEANING")}
                    >
                      <span className="material-symbols-outlined">play_arrow</span>
                      Bắt đầu dọn
                    </button>
                  )}
                  {room.operationalStatus === "CLEANING" && (
                    <button
                      className={`${styles.actionBtn} ${styles.btnDone}`}
                      onClick={() => handleStatusChange(room.id, "VACANT")}
                    >
                      <span className="material-symbols-outlined">done</span>
                      Hoàn tất dọn dẹp
                    </button>
                  )}
                  {room.operationalStatus === "VACANT" && (
                    <div className={styles.statusDisplayVacant}>
                      <span className="material-symbols-outlined">check_circle</span>
                      Sẵn sàng đón khách
                    </div>
                  )}
                  {room.operationalStatus === "OCCUPIED" && (
                    <div className={styles.statusDisplayOccupied}>
                      <span className="material-symbols-outlined">person</span>
                      Khách đang lưu trú
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
