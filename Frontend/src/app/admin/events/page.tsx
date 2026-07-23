"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { apiGet, apiPost, apiPut, apiDelete, apiUploadImage, getErrorMessage } from "@/lib/api";
import { ComboEventDTO, ComboEventType, ServiceStatus } from "@/types/api";

export default function AdminEvents() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [combos, setCombos] = useState<ComboEventDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [editingItem, setEditingItem] = useState<ComboEventDTO | null>(null);

  // Form states
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("Sự kiện");
  const [itemStatus, setItemStatus] = useState("Hoạt động");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState(""); // Preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Upload

  const fetchCombos = async () => {
    try {
      setLoading(true);
      const data = await apiGet<ComboEventDTO[]>("/combos");
      setCombos(data);
    } catch (error) {
      console.error("Failed to fetch combos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCombos();
  }, []);

  useEffect(() => {
    if (!isModalOpen) {
      setErrorMsg("");
      setErrorCode("");
    }
  }, [isModalOpen]);

  const getTypeFromLabel = (label: string): ComboEventType => {
    return label === "Sự kiện" ? "EVENT" : "COMBO";
  };

  const getLabelFromType = (type: ComboEventType): string => {
    return type === "EVENT" ? "Sự kiện" : "Combo";
  };

  // Multi-level filter: activeTab (Type) and activeStatus (Status)
  const filteredItems = combos.filter((item) => {
    const matchesType = activeTab === "Tất cả" 
      ? true 
      : (activeTab === "Sự kiện" ? item.type === "EVENT" : item.type === "COMBO");

    const matchesStatus = activeStatus === "Tất cả" 
      ? true 
      : (activeStatus === "Hoạt động" ? item.status === "ACTIVE" : item.status === "INACTIVE");
    
    return matchesType && matchesStatus;
  });

  const handleOpenModalWithPreset = (presetType: string) => {
    setEditingItem(null);
    setItemName("");
    setStartDate("");
    setEndDate("");
    setItemPrice("");
    setItemImage("");
    setSelectedFile(null);
    setItemType(presetType);
    setItemStatus("Hoạt động");
    setErrorMsg("");
    setErrorCode("");
    setIsModalOpen(true);
  };

  const handleEditClick = (item: ComboEventDTO) => {
    setEditingItem(item);
    setItemName(item.name);
    setItemType(getLabelFromType(item.type));
    setItemStatus(item.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng");
    setStartDate(item.startDate);
    setEndDate(item.endDate);
    setItemPrice(String(item.price));
    setItemImage(item.images?.[0]?.url || "");
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !startDate || !endDate) return;

    setErrorMsg("");
    setErrorCode("");

    try {
      const typeValue = getTypeFromLabel(itemType);
      const statusValue: ServiceStatus = itemStatus === "Hoạt động" ? "ACTIVE" : "INACTIVE";
      const numericPrice = parseFloat(itemPrice.replace(/\D/g, "")) || 0;

      if (editingItem) {
        // Update combo/event entity
        await apiPut<ComboEventDTO>(`/combos/${editingItem.id}`, {
          name: itemName,
          type: typeValue,
          description: itemName,
          price: numericPrice,
          startDate: startDate,
          endDate: endDate,
          status: statusValue
        });

        // Upload image if selected
        if (selectedFile && editingItem.id) {
          await apiUploadImage(selectedFile, "COMBO", editingItem.id, true);
        }
      } else {
        // Create combo/event entity
        const newCombo = await apiPost<ComboEventDTO>("/combos", {
          name: itemName,
          type: typeValue,
          description: itemName,
          price: numericPrice,
          startDate: startDate,
          endDate: endDate,
          status: statusValue
        });

        // Upload image if selected
        if (selectedFile && newCombo.id) {
          await apiUploadImage(selectedFile, "COMBO", newCombo.id, true);
        }
      }

      await fetchCombos();
      setIsModalOpen(false);
      setEditingItem(null);

      // Reset form
      setItemName("");
      setStartDate("");
      setEndDate("");
      setItemPrice("");
      setItemImage("");
      setSelectedFile(null);
    } catch (error: any) {
      console.error(error);
      setErrorCode(error.code || "");
      setErrorMsg(getErrorMessage(error));
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mục này không?")) {
      try {
        await apiDelete(`/combos/${id}`);
        setCombos(combos.filter(item => item.id !== id));
      } catch (error: any) {
        alert("Lỗi khi xóa: " + getErrorMessage(error));
      }
    }
  };

  const activeCount = combos.filter(item => item.status === "ACTIVE").length;

  const formatDateLabel = (item: ComboEventDTO) => {
    if (item.type === "EVENT") {
      return `Ngày: ${new Date(item.startDate).toLocaleDateString("vi-VN")}`;
    }
    return `Hạn: ${new Date(item.endDate).toLocaleDateString("vi-VN")}`;
  };

  return (
    <div>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Quản lý</p>
          <h1 className={styles.title}>Sự kiện & Combo</h1>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.statsText}>
            <p className="mono-text">{activeCount} Đang hoạt động</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {(activeTab === "Tất cả" || activeTab === "Sự kiện") && (
              <button className="admin-btn admin-btn-primary mono-text" onClick={() => handleOpenModalWithPreset("Sự kiện")}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>add</span>
                Thêm sự kiện
              </button>
            )}
            {(activeTab === "Tất cả" || activeTab === "Combo") && (
              <button className="admin-btn admin-btn-tertiary mono-text" onClick={() => handleOpenModalWithPreset("Combo")}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>add</span>
                Thêm combo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filterTabs}>
          {["Tất cả", "Sự kiện", "Combo"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mono-text ${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span className="material-symbols-outlined" style={{ color: "var(--color-steel-secondary)" }}>filter_list</span>
          <div className={styles.selectWrapper}>
            <select className={styles.select} onChange={(e) => setActiveStatus(e.target.value)} value={activeStatus}>
              <option value="Tất cả">Trạng thái: Tất cả</option>
              <option value="Hoạt động">Hoạt động</option>
              <option value="Tạm ngưng">Tạm ngưng</option>
            </select>
            <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
          </div>
        </div>
      </section>

      {/* Grid of items */}
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
          filteredItems.map((item) => {
            const coverImage = item.images && item.images.length > 0
              ? item.images[0].url
              : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format";

            return (
              <article key={item.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    alt={item.name}
                    src={coverImage}
                  />
                  <div className={`${styles.badge} ${item.status === "ACTIVE" ? styles.badgeVacant : styles.badgeOccupied}`}>
                    <span className="mono-text">{item.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng"}</span>
                  </div>
                </div>
                <div className={styles.cardDetails}>
                  <div>
                    <h3 className={styles.roomName}>{item.name}</h3>
                    <p className={styles.roomType}>{getLabelFromType(item.type)}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.iconButton} onClick={() => handleEditClick(item)}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>edit</span>
                    </button>
                    <button className={`${styles.iconButton} ${styles.deleteBtn}`} onClick={() => handleDeleteItem(item.id!)}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>delete</span>
                    </button>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <p className={`mono-text ${styles.priceLabel}`}>{formatDateLabel(item)}</p>
                  <p className={`mono-text ${styles.priceValue}`}>{item.price > 0 ? `${item.price.toLocaleString("vi-VN")}₫` : "Liên hệ"}</p>
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
              <h2 className={styles.modalTitle}>{editingItem ? `Cập nhật ${itemType.toLowerCase()}` : `Thêm ${itemType.toLowerCase()} mới`}</h2>
              <button className={styles.modalCloseBtn} onClick={() => { setIsModalOpen(false); setEditingItem(null); }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddItem}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Tên {itemType.toLowerCase()}</label>
                  <input
                    className={styles.input}
                    placeholder={`VD: ${itemType === "Sự kiện" ? "Pool Party Chào Hè" : "Combo Nghỉ Dưỡng Gia Đình"}`}
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                    type="text"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Loại</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      required
                    >
                      <option value="Sự kiện">Sự kiện</option>
                      <option value="Combo">Combo</option>
                    </select>
                    <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Giá tiền (VND)</label>
                  <input
                    className={styles.input}
                    placeholder="VD: 450000"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    required
                    type="number"
                  />
                </div>

                <div className={styles.formGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className={`mono-text ${styles.label}`}>Ngày bắt đầu</label>
                    <input
                      className={styles.input}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                      type="date"
                    />
                  </div>
                  <div>
                    <label className={`mono-text ${styles.label}`}>Ngày kết thúc</label>
                    <input
                      className={styles.input}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                      type="date"
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Trạng thái</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={itemStatus}
                      onChange={(e) => setItemStatus(e.target.value)}
                      required
                    >
                      <option value="Hoạt động">Hoạt động (Active)</option>
                      <option value="Tạm ngưng">Tạm ngưng (Inactive)</option>
                    </select>
                    <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Hình ảnh hiển thị</label>
                  <label className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                    {itemImage ? (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={itemImage} alt="Uploaded preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{
                          position: "absolute",
                          inset: 0,
                          backgroundColor: "rgba(0, 0, 0, 0.4)",
                          color: "#fff",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          opacity: 0,
                          transition: "opacity 0.2s"
                        }}
                        className="hoverOverlay"
                        >
                          <span className="material-symbols-outlined" style={{ marginRight: "0.25rem" }}>photo_camera</span>
                          Thay đổi ảnh
                        </div>
                        <style jsx>{`
                          .hoverOverlay:hover {
                            opacity: 1 !important;
                          }
                        `}</style>
                      </div>
                    ) : (
                      <>
                        <div className={styles.uploadIconWrapper}>
                          <span className={`material-symbols-outlined ${styles.uploadIcon}`}>cloud_upload</span>
                        </div>
                        <p className={styles.uploadTitle}>Chọn ảnh tải lên</p>
                        <p className={styles.uploadLimit}>Hỗ trợ JPG, PNG (Tối đa 5MB)</p>
                      </>
                    )}
                  </label>
                </div>
                {errorMsg && (
                  <div style={{ color: "red", fontSize: "0.85rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={`mono-text ${styles.btnCancel}`} onClick={() => setIsModalOpen(false)}>
                  Hủy
                </button>
                <button type="submit" className={`mono-text ${styles.btnSubmit}`}>
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
