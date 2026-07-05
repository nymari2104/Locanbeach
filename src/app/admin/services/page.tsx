"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("Spa & Trị liệu");
  const [serviceHours, setServiceHours] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceStatus, setServiceStatus] = useState("Hoạt động");
  const [serviceImage, setServiceImage] = useState("");

  const [items, setItems] = useState([
    {
      id: "srv-1",
      type: "Spa & Trị liệu",
      name: "Liệu trình Massage Thảo dược",
      statusClass: styles.badgeVacant,
      statusLabel: "Hoạt động",
      hours: "09:00 - 21:00",
      price: "450,000₫",
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format"
    },
    {
      id: "srv-2",
      type: "Nhà hàng",
      name: "Nhà hàng Hải sản Sunset",
      statusClass: styles.badgeVacant,
      statusLabel: "Hoạt động",
      hours: "06:00 - 22:00",
      price: "Theo thực đơn",
      image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=500&auto=format"
    },
    {
      id: "srv-3",
      type: "Giải trí",
      name: "Cho thuê Jet Ski (Mô tô nước)",
      statusClass: styles.badgeOccupied,
      statusLabel: "Tạm ngưng",
      hours: "08:00 - 18:00",
      price: "800,000₫ / 30p",
      image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=500&auto=format"
    },
    {
      id: "srv-4",
      type: "Tiện ích",
      name: "Đưa đón Sân bay cao cấp",
      statusClass: styles.badgeVacant,
      statusLabel: "Hoạt động",
      hours: "24/7",
      price: "1,200,000₫ / lượt",
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=500&auto=format"
    }
  ]);

  // Multi-level filter: type (activeTab) and status (activeStatus)
  const filteredItems = items.filter((item) => {
    let matchesType = true;
    if (activeTab === "Spa") matchesType = item.type === "Spa & Trị liệu";
    else if (activeTab === "Nhà hàng") matchesType = item.type === "Nhà hàng";
    else if (activeTab === "Giải trí") matchesType = item.type === "Giải trí";
    else if (activeTab === "Dịch vụ khác") matchesType = item.type === "Tiện ích";

    const matchesStatus = activeStatus === "Tất cả" || item.statusLabel === activeStatus;
    
    return matchesType && matchesStatus;
  });

  const handleOpenModalWithPreset = () => {
    let presetType = "Spa & Trị liệu";
    if (activeTab === "Spa") presetType = "Spa & Trị liệu";
    if (activeTab === "Nhà hàng") presetType = "Nhà hàng";
    if (activeTab === "Giải trí") presetType = "Giải trí";
    if (activeTab === "Dịch vụ khác") presetType = "Tiện ích";
    setServiceType(presetType);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !serviceHours || !servicePrice) return;

    const newService = {
      id: Date.now().toString(),
      type: serviceType,
      name: serviceName,
      statusClass: serviceStatus === "Hoạt động" ? styles.badgeVacant : styles.badgeOccupied,
      statusLabel: serviceStatus,
      hours: serviceHours,
      price: isNaN(Number(servicePrice)) ? servicePrice : parseInt(servicePrice.replace(/\D/g, "")).toLocaleString("vi-VN") + "₫",
      image: serviceImage || (serviceType === "Spa & Trị liệu" 
        ? "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format"
        : "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?q=80&w=500&auto=format")
    };

    setItems([newService, ...items]);
    setIsModalOpen(false);

    // Reset form
    setServiceName("");
    setServiceHours("");
    setServicePrice("");
    setServiceImage("");
    setServiceStatus("Hoạt động");
  };

  const handleDeleteService = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case "Spa": return "Thêm liệu trình Spa";
      case "Nhà hàng": return "Thêm nhà hàng / menu";
      case "Giải trí": return "Thêm hoạt động giải trí";
      case "Dịch vụ khác": return "Thêm tiện ích khác";
      default: return "Thêm dịch vụ mới";
    }
  };

  return (
    <div>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Quản lý</p>
          <h1 className={styles.title}>Tiện ích & Dịch vụ</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div className={styles.statsText}>
            <p className="mono-text">{filteredItems.length} Dịch vụ hiển thị</p>
          </div>
          <button className="mono-text" onClick={handleOpenModalWithPreset} style={{
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
            {getAddButtonText()}
          </button>
        </div>
      </header>

      {/* Filters Section */}
      <section className={styles.filtersSection}>
        <div className={styles.filterTabs}>
          {["Tất cả", "Spa", "Nhà hàng", "Giải trí", "Dịch vụ khác"].map((tab) => (
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
                <button className={`${styles.iconButton} ${styles.deleteBtn}`} onClick={() => handleDeleteService(item.id)}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>delete</span>
                </button>
              </div>
            </div>
            <div className={styles.cardFooter}>
              <p className={`mono-text ${styles.priceLabel}`}>{item.hours}</p>
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
              <h2 className={styles.modalTitle}>Thêm dịch vụ mới</h2>
              <button className={styles.modalCloseBtn} onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleAddService}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Tên dịch vụ / tiện ích</label>
                  <input
                    className={styles.input}
                    placeholder="VD: Massage Đá Nóng, Buffet Sáng hải sản..."
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    required
                    type="text"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Nhóm dịch vụ</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={serviceType}
                      onChange={(e) => setServiceType(e.target.value)}
                      required
                    >
                      <option value="Spa & Trị liệu">Spa & Trị liệu</option>
                      <option value="Nhà hàng">Nhà hàng & Quán ăn</option>
                      <option value="Giải trí">Giải trí & Hoạt động</option>
                      <option value="Tiện ích">Tiện ích khác</option>
                    </select>
                    <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Mức giá / Chi phí</label>
                  <input
                    className={styles.input}
                    placeholder="VD: 500000 hoặc Theo thực đơn"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    required
                    type="text"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Giờ phục vụ</label>
                  <input
                    className={styles.input}
                    placeholder="VD: 09:00 - 21:00 hoặc 24/7"
                    value={serviceHours}
                    onChange={(e) => setServiceHours(e.target.value)}
                    required
                    type="text"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Trạng thái</label>
                  <div className={styles.selectWrapper}>
                    <select
                      className={styles.select}
                      value={serviceStatus}
                      onChange={(e) => setServiceStatus(e.target.value)}
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
                    {serviceImage ? (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={serviceImage} alt="Uploaded preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                  Lưu dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
