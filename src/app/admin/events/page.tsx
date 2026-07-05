"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function AdminEvents() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("Sự kiện");
  const [itemStatus, setItemStatus] = useState("Hoạt động");
  const [itemDate, setItemDate] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemImage, setItemImage] = useState("");

  const [items, setItems] = useState([
    {
      id: "ev-1",
      type: "Sự kiện",
      name: "Pool Party - Welcome Summer",
      statusClass: styles.badgeVacant,
      statusLabel: "Hoạt động",
      date: "15 Thg 7, 2026",
      price: "250,000₫",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=500&auto=format"
    },
    {
      id: "cb-1",
      type: "Combo",
      name: "Combo Nghỉ dưỡng 3N2Đ",
      statusClass: styles.badgeVacant,
      statusLabel: "Hoạt động",
      date: "Hạn đến 31 Thg 12, 2026",
      price: "4,500,000₫",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format"
    },
    {
      id: "ev-2",
      type: "Sự kiện",
      name: "Lễ hội Âm nhạc Hoàng hôn",
      statusClass: styles.badgeVacant,
      statusLabel: "Hoạt động",
      date: "30 Thg 8, 2026",
      price: "500,000₫",
      image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format"
    },
    {
      id: "cb-2",
      type: "Combo",
      name: "Combo Trọn gói Lộc An Hè",
      statusClass: styles.badgeOccupied,
      statusLabel: "Tạm ngưng",
      date: "Hết hạn 30 Thg 6, 2026",
      price: "3,200,000₫",
      image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?q=80&w=500&auto=format"
    }
  ]);

  // Multi-level filter: activeTab (Type) and activeStatus (Status)
  const filteredItems = items.filter((item) => {
    const matchesType = activeTab === "Tất cả" || item.type === activeTab;
    const matchesStatus = activeStatus === "Tất cả" || item.statusLabel === activeStatus;
    return matchesType && matchesStatus;
  });

  const handleOpenModalWithPreset = (presetType: string) => {
    setItemType(presetType);
    setItemStatus("Hoạt động");
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName || !itemPrice || !itemDate) return;

    const newItem = {
      id: Date.now().toString(),
      type: itemType,
      name: itemName,
      statusClass: itemStatus === "Hoạt động" ? styles.badgeVacant : styles.badgeOccupied,
      statusLabel: itemStatus,
      date: itemDate,
      price: parseInt(itemPrice.replace(/\D/g, "")).toLocaleString("vi-VN") + "₫",
      image: itemImage || (itemType === "Sự kiện" 
        ? "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=500&auto=format"
        : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format")
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);

    // Reset form
    setItemName("");
    setItemDate("");
    setItemPrice("");
    setItemImage("");
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const activeCount = items.filter(item => item.statusLabel === "Hoạt động").length;

  return (
    <div>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Quản lý</p>
          <h1 className={styles.title}>Sự kiện & Combo</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className={styles.statsText}>
            <p className="mono-text">{activeCount} Đang hoạt động</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {(activeTab === "Tất cả" || activeTab === "Sự kiện") && (
              <button className="mono-text" onClick={() => handleOpenModalWithPreset("Sự kiện")} style={{
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
                Thêm sự kiện
              </button>
            )}
            {(activeTab === "Tất cả" || activeTab === "Combo") && (
              <button className="mono-text" onClick={() => handleOpenModalWithPreset("Combo")} style={{
                backgroundColor: "var(--color-tertiary, #924700)",
                color: "#fff",
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
        {filteredItems.map((item) => (
          <article key={item.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                className={styles.image}
                alt={item.name}
                src={item.image}
              />
              <div className={`${styles.badge} ${item.statusClass}`}>
                <span className="mono-text">{item.statusLabel}</span>
              </div>
            </div>
            <div className={styles.cardDetails}>
              <div>
                <h3 className={styles.roomName}>{item.name}</h3>
                <p className={styles.roomType}>{item.type}</p>
              </div>
              <div className={styles.actions}>
                <button className={styles.iconButton}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>edit</span>
                </button>
                <button className={`${styles.iconButton} ${styles.deleteBtn}`} onClick={() => handleDeleteItem(item.id)}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>delete</span>
                </button>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <p className={`mono-text ${styles.priceLabel}`}>{item.date}</p>
              <p className={`mono-text ${styles.priceValue}`}>{item.price}</p>
            </div>
          </article>
        ))}
      </section>

      {/* Popup Form Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Thêm {itemType.toLowerCase()} mới</h2>
              <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
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

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Thời gian / Hạn áp dụng</label>
                  <input
                    className={styles.input}
                    placeholder="VD: 15 Thg 8, 2026 hoặc Hạn đến 31/12/2026"
                    value={itemDate}
                    onChange={(e) => setItemDate(e.target.value)}
                    required
                    type="text"
                  />
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
