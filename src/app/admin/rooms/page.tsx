"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { apiGet, apiPost, apiDelete, apiUploadImage } from "@/lib/api";
import { AccommodationDTO, AccommodationCategoryDTO, AccommodationType, AccommodationStatus } from "@/types/api";

export default function AdminRooms() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accommodations, setAccommodations] = useState<AccommodationDTO[]>([]);
  const [categories, setCategories] = useState<AccommodationCategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [roomCode, setRoomCode] = useState(""); // Physical room code, e.g. "101"
  const [selectedCategoryId, setSelectedCategoryId] = useState(""); // Selected Category ID
  const [roomStatus, setRoomStatus] = useState("Hoạt động");

  // New Category Form States (shown if selectedCategoryId === "NEW")
  const [newCatName, setNewCatName] = useState("");
  const [newCatCode, setNewCatCode] = useState("");
  const [newCatType, setNewCatType] = useState<AccommodationType>("ROOM");
  const [newCatPrice, setNewCatPrice] = useState("");
  const [newCatGuests, setNewCatGuests] = useState("2");
  const [newCatArea, setNewCatArea] = useState("30");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [roomImage, setRoomImage] = useState(""); // Preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // File to upload

  const loadData = async () => {
    try {
      setLoading(true);
      const cats = await apiGet<AccommodationCategoryDTO[]>("/categories");
      const accs = await apiGet<AccommodationDTO[]>("/accommodations");
      setCategories(cats);
      setAccommodations(accs);

      // Pre-select first category if available
      if (cats.length > 0) {
        setSelectedCategoryId(cats[0].id || "");
      } else {
        setSelectedCategoryId("NEW"); // default to new category form if none exist
      }
    } catch (error) {
      console.error("Failed to load rooms data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered rooms
  const filteredRooms = activeTab === "Tất cả"
    ? accommodations
    : accommodations.filter(room => {
        const isStatusActive = room.status === "ACTIVE";
        return activeTab === "Hoạt động" ? isStatusActive : !isStatusActive;
      });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setRoomImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode) return;

    try {
      let finalCategoryId = selectedCategoryId;

      // 1. If user chose to create a new category first
      if (selectedCategoryId === "NEW") {
        if (!newCatName || !newCatCode || !newCatPrice) {
          alert("Vui lòng nhập đầy đủ thông tin loại phòng mới!");
          return;
        }

        const createdCategory = await apiPost<AccommodationCategoryDTO>("/categories", {
          name: newCatName,
          code: newCatCode,
          type: newCatType,
          description: newCatDesc || newCatName,
          basePrice: parseFloat(newCatPrice) || 0,
          maxGuests: parseInt(newCatGuests) || 2,
          areaSqm: parseFloat(newCatArea) || 30
        });

        finalCategoryId = createdCategory.id || "";

        // Upload category image if selected
        if (selectedFile && createdCategory.id) {
          await apiUploadImage(selectedFile, "CATEGORY", createdCategory.id, true);
        }
      }

      // 2. Create the physical room (Accommodation)
      const statusValue: AccommodationStatus = roomStatus === "Hoạt động" ? "ACTIVE" : "INACTIVE";
      await apiPost<AccommodationDTO>("/accommodations", {
        categoryId: finalCategoryId,
        code: roomCode,
        status: statusValue,
        operationalStatus: "VACANT"
      });

      await loadData();
      setIsModalOpen(false);

      // Reset form fields
      setRoomCode("");
      setNewCatName("");
      setNewCatCode("");
      setNewCatPrice("");
      setNewCatDesc("");
      setRoomImage("");
      setSelectedFile(null);
    } catch (error: any) {
      alert("Lỗi khi thêm phòng: " + error.message);
    }
  };

  const getCategoryDetails = (catId: string) => {
    return categories.find(c => c.id === catId);
  };

  const activeCount = accommodations.filter(r => r.status === "ACTIVE").length;

  return (
    <div>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Tổng quan</p>
          <h1 className={styles.title}>Danh sách phòng</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className={styles.statsText}>
            <p className="mono-text">{activeCount}/{accommodations.length} Hoạt động</p>
          </div>
          <button className="mono-text" onClick={() => setIsModalOpen(true)} style={{
            backgroundColor: "var(--color-primary)",
            color: "var(--color-on-primary)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--rounded-lg)",
            border: "none",
            fontSize: "0.875rem",
            fontWeight: "bold",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.25rem"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.125rem" }}>add</span>
            Thêm phòng mới
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filterTabs}>
          {["Tất cả", "Hoạt động", "Tạm ngưng"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mono-text ${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </section>

      {/* Room Grid (Bento Layout) */}
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
        ) : (
          filteredRooms.map((room) => {
            const cat = getCategoryDetails(room.categoryId);
            const coverImage = cat && cat.images && cat.images.length > 0
              ? cat.images[0].url
              : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format";

            return (
              <article key={room.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    alt={`Phòng ${room.code}`}
                    src={coverImage}
                  />
                  <div className={`${styles.badge} ${room.status === "ACTIVE" ? styles.badgeVacant : styles.badgeOccupied}`}>
                    <span className="mono-text">{room.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}</span>
                  </div>
                </div>
                <div className={styles.cardDetails}>
                  <div>
                    <h3 className={styles.roomName}>Phòng {room.code}</h3>
                    <p className={styles.roomType}>{room.categoryName || cat?.name || "Loại phòng"}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.iconButton}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>edit</span>
                    </button>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <p className={`mono-text ${styles.priceLabel}`}>Giá mỗi đêm</p>
                  <p className={`mono-text ${styles.priceValue}`}>
                    {cat?.basePrice ? `${cat.basePrice.toLocaleString("vi-VN")} VND` : "Chưa cập nhật"}
                  </p>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Popup Form Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Thêm phòng mới</h2>
              <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddRoom}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Số phòng / Mã phòng</label>
                  <input
                    className={styles.input}
                    placeholder="VD: 105, 302, VILLA-A..."
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    required
                    type="text"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Loại phòng / Hạng mục</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={selectedCategoryId}
                      onChange={(e) => setSelectedCategoryId(e.target.value)}
                      required
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
                      ))}
                      <option value="NEW">+ Tạo loại phòng mới...</option>
                    </select>
                    <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
                  </div>
                </div>

                {/* Additional form fields if creating a new category */}
                {selectedCategoryId === "NEW" ? (
                  <div style={{ border: "1px solid var(--color-whisper-border)", padding: "1rem", borderRadius: "var(--rounded-lg)", backgroundColor: "var(--color-surface)", display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "1rem" }}>
                    <p className="mono-text" style={{ fontSize: "0.8rem", fontWeight: "bold", color: "var(--color-primary)" }}>
                      THIẾT LẬP LOẠI PHÒNG MỚI
                    </p>
                    <div className={styles.formGroup}>
                      <label className={`mono-text ${styles.label}`}>Tên loại phòng</label>
                      <input
                        className={styles.input}
                        placeholder="VD: Deluxe Ocean View, Standard Garden..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        required={selectedCategoryId === "NEW"}
                      />
                    </div>
                    <div className={styles.formGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label className={`mono-text ${styles.label}`}>Mã loại phòng (Code)</label>
                        <input
                          className={styles.input}
                          placeholder="VD: DLX-SEA"
                          value={newCatCode}
                          onChange={(e) => setNewCatCode(e.target.value)}
                          required={selectedCategoryId === "NEW"}
                        />
                      </div>
                      <div>
                        <label className={`mono-text ${styles.label}`}>Loại hình lưu trú</label>
                        <select
                          className={styles.select}
                          value={newCatType}
                          onChange={(e) => setNewCatType(e.target.value as AccommodationType)}
                          required={selectedCategoryId === "NEW"}
                        >
                          <option value="ROOM">ROOM (Khách sạn / Villa)</option>
                          <option value="CAMPING">CAMPING (Cắm trại)</option>
                          <option value="GLAMPING">GLAMPING (Nghỉ dưỡng lều cao cấp)</option>
                        </select>
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={`mono-text ${styles.label}`}>Giá mỗi đêm (VND)</label>
                      <input
                        className={styles.input}
                        type="number"
                        min="0"
                        placeholder="VD: 2500000"
                        value={newCatPrice}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setNewCatPrice(val >= 0 ? e.target.value : "0");
                        }}
                        required={selectedCategoryId === "NEW"}
                      />
                    </div>
                    <div className={styles.formGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label className={`mono-text ${styles.label}`}>Khách tối đa</label>
                        <input
                          className={styles.input}
                          type="number"
                          min="1"
                          value={newCatGuests}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setNewCatGuests(val >= 1 ? e.target.value : "1");
                          }}
                          required={selectedCategoryId === "NEW"}
                        />
                      </div>
                      <div>
                        <label className={`mono-text ${styles.label}`}>Diện tích (m²)</label>
                        <input
                          className={styles.input}
                          type="number"
                          min="1"
                          value={newCatArea}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            setNewCatArea(val >= 1 ? e.target.value : "1");
                          }}
                          required={selectedCategoryId === "NEW"}
                        />
                      </div>
                    </div>
                    <div className={styles.formGroup}>
                      <label className={`mono-text ${styles.label}`}>Mô tả phòng</label>
                      <textarea
                        className={styles.input}
                        style={{ height: "60px", resize: "none" }}
                        placeholder="Mô tả các tiện nghi, hướng nhìn..."
                        value={newCatDesc}
                        onChange={(e) => setNewCatDesc(e.target.value)}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={`mono-text ${styles.label}`}>Hình ảnh loại phòng</label>
                      <label className={styles.uploadArea} style={{ height: "100px" }}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ display: "none" }}
                        />
                        {roomImage ? (
                          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <img src={roomImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>cloud_upload</span>
                            <span style={{ fontSize: "0.75rem" }}>Tải ảnh loại phòng</span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                ) : (
                  // Read-only category details if existing category is selected
                  selectedCategoryId && (
                    <div style={{ border: "1px solid var(--color-whisper-border)", padding: "0.75rem 1rem", borderRadius: "var(--rounded-lg)", backgroundColor: "var(--color-surface-dim, #f9fafb)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div>
                        <p style={{ fontSize: "0.75rem", color: "var(--color-steel-secondary)", textTransform: "uppercase" }}>Thông tin Loại phòng</p>
                        <p style={{ fontWeight: "bold", fontSize: "0.95rem" }}>
                          Giá: {getCategoryDetails(selectedCategoryId)?.basePrice?.toLocaleString("vi-VN")} VND / đêm
                        </p>
                      </div>
                      {getCategoryDetails(selectedCategoryId)?.images?.[0]?.url && (
                        <img 
                          src={getCategoryDetails(selectedCategoryId)?.images?.[0]?.url} 
                          alt="Category preview" 
                          style={{ width: "60px", height: "45px", borderRadius: "4px", objectFit: "cover" }} 
                        />
                      )}
                    </div>
                  )
                )}

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Trạng thái phòng</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={roomStatus}
                      onChange={(e) => setRoomStatus(e.target.value)}
                      required
                    >
                      <option value="Hoạt động">Hoạt động (Active)</option>
                      <option value="Tạm ngưng">Tạm ngưng (Inactive)</option>
                    </select>
                    <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`mono-text ${styles.btnCancel}`} onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className={`mono-text ${styles.btnSubmit}`}>
                  Lưu phòng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
