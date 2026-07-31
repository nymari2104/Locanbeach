"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { apiGet, apiPut, getErrorMessage } from "@/lib/api";
import { AccommodationDTO } from "@/types/api";

interface Housekeeper {
  id: string;
  username: string;
  fullName: string;
}

export default function Housekeeping() {
  const [accommodations, setAccommodations] = useState<AccommodationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("DIRTY"); // DIRTY, CLEANING, VACANT, OCCUPIED
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [housekeepers, setHousekeepers] = useState<Housekeeper[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    roomId: string;
    roomCode: string;
    newStatus: string;
    actionText: string;
    lastCleanedById?: string;
  } | null>(null);

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

  const loadHousekeepers = async () => {
    try {
      const data = await apiGet<Housekeeper[]>("/staff/accommodations/users");
      setHousekeepers(data);
    } catch (error) {
      console.error("Failed to load housekeepers:", error);
    }
  };

  useEffect(() => {
    loadAccommodations();
    const role = typeof window !== "undefined" ? localStorage.getItem("userRole") : null;
    if (role === "ADMIN") {
      setIsAdmin(true);
      loadHousekeepers();
    }
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleStatusChange = async (id: string, newStatus: string, lastCleanedById?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (lastCleanedById !== undefined) {
        payload.lastCleanedById = lastCleanedById || null;
      }
      
      await apiPut<AccommodationDTO>(`/staff/accommodations/${id}/operational-status`, payload);
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

  const promptConfirm = (id: string, code: string, newStatus: string, actionText: string, lastCleanedById?: string) => {
    setConfirmModal({
      show: true,
      roomId: id,
      roomCode: code,
      newStatus,
      actionText,
      lastCleanedById
    });
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
                {room.lastCleanedByName && (
                  <p style={{ margin: "0.35rem 0 0 0", fontSize: "0.825rem", color: "#4f46e5", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>person</span>
                    <span>Người dọn: <strong>{room.lastCleanedByName}</strong></span>
                  </p>
                )}
                
                <div style={{ marginTop: "1.25rem" }}>
                  {room.operationalStatus === "DIRTY" && (
                    <>
                      {isAdmin && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-steel-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>
                            Phân công nhân viên:
                          </label>
                          <select
                            className={styles.assignSelect}
                            value={room.lastCleanedById || ""}
                            onChange={(e) => {
                              const housekeeperId = e.target.value;
                              if (room.id) {
                                const hkName = housekeepers.find(h => h.id === housekeeperId)?.fullName || "bỏ phân công";
                                promptConfirm(room.id, room.code, "DIRTY", `phân công dọn phòng cho ${hkName}`, housekeeperId);
                              }
                            }}
                          >
                            <option value="">-- Chưa phân công --</option>
                            {housekeepers.map(h => (
                              <option key={h.id} value={h.id}>{h.fullName}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button
                        className={`${styles.actionBtn} ${styles.btnStart}`}
                        onClick={() => room.id && promptConfirm(room.id, room.code, "CLEANING", "bắt đầu dọn dẹp")}
                      >
                        <span className="material-symbols-outlined">play_arrow</span>
                        Bắt đầu dọn
                      </button>
                    </>
                  )}
                  {room.operationalStatus === "CLEANING" && (
                    <>
                      {isAdmin && (
                        <div style={{ marginBottom: "0.75rem" }}>
                          <label style={{ display: "block", fontSize: "0.75rem", color: "var(--color-steel-secondary)", marginBottom: "0.25rem", fontWeight: "600" }}>
                            Đổi người dọn:
                          </label>
                          <select
                            className={styles.assignSelect}
                            value={room.lastCleanedById || ""}
                            onChange={(e) => {
                              const housekeeperId = e.target.value;
                              if (room.id) {
                                const hkName = housekeepers.find(h => h.id === housekeeperId)?.fullName || "bỏ phân công";
                                promptConfirm(room.id, room.code, "CLEANING", `phân công dọn phòng cho ${hkName}`, housekeeperId);
                              }
                            }}
                          >
                            <option value="">-- Chưa phân công --</option>
                            {housekeepers.map(h => (
                              <option key={h.id} value={h.id}>{h.fullName}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <button
                        className={`${styles.actionBtn} ${styles.btnDone}`}
                        onClick={() => room.id && promptConfirm(room.id, room.code, "VACANT", "hoàn tất dọn dẹp")}
                      >
                        <span className="material-symbols-outlined">done</span>
                        Hoàn tất dọn dẹp
                      </button>
                    </>
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

      {/* Confirmation Modal */}
      {confirmModal && confirmModal.show && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <span className="material-symbols-outlined" style={{ color: "var(--color-primary)", fontSize: "2rem" }}>
                help_outline
              </span>
              <h3 className={styles.modalTitle}>Xác nhận hành động</h3>
            </div>
            <div className={styles.modalBody}>
              <p className={styles.modalText}>
                Bạn có chắc chắn muốn <strong>{confirmModal.actionText}</strong> cho phòng <strong>{confirmModal.roomCode}</strong>?
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => setConfirmModal(null)}
              >
                Hủy bỏ
              </button>
              <button 
                className={styles.confirmBtn} 
                onClick={() => {
                  handleStatusChange(confirmModal.roomId, confirmModal.newStatus, confirmModal.lastCleanedById);
                  setConfirmModal(null);
                }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
