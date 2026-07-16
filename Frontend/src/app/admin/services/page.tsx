"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { apiGet, apiPost, apiPut, apiDelete, apiUploadImage, getErrorMessage } from "@/lib/api";
import { ServiceDTO, ServiceGroup, ServiceStatus, AmenityDTO } from "@/types/api";

const POPULAR_ICONS = [
  { name: "Wi-Fi", value: "wifi" },
  { name: "Tivi", value: "tv" },
  { name: "Điều hòa", value: "ac_unit" },
  { name: "Bồn tắm", value: "bathtub" },
  { name: "Cà phê", value: "coffee" },
  { name: "Mini bar", value: "kitchen" },
  { name: "Ban công", value: "balcony" },
  { name: "View biển", value: "waves" },
  { name: "Hồ bơi", value: "pool" },
  { name: "Két sắt", value: "safe" }
];

export default function AdminServices() {
  const [activeTab, setActiveTab] = useState("Tất cả");
  const [activeStatus, setActiveStatus] = useState("Tất cả");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");
  
  // Data states
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [amenities, setAmenities] = useState<AmenityDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states - Service
  const [editingService, setEditingService] = useState<ServiceDTO | null>(null);
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("Spa & Trị liệu");
  const [serviceHours, setServiceHours] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceStatus, setServiceStatus] = useState("Hoạt động");
  const [serviceImage, setServiceImage] = useState(""); // Preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // Upload

  // Form states - Amenity
  const [editingAmenity, setEditingAmenity] = useState<AmenityDTO | null>(null);
  const [amenityName, setAmenityName] = useState("");
  const [amenityIcon, setAmenityIcon] = useState("wifi");
  const [submitting, setSubmitting] = useState(false);

  const formatNumber = (val: string | number) => {
    if (!val && val !== 0) return "";
    const num = typeof val === "number" ? val : parseInt(val.toString().replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN").replace(/,/g, ".");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const servicesData = await apiGet<ServiceDTO[]>("/services");
      const amenitiesData = await apiGet<AmenityDTO[]>("/amenities");
      setServices(servicesData);
      setAmenities(amenitiesData);
    } catch (error) {
      console.error("Failed to fetch services/amenities data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getGroupFromType = (type: string): ServiceGroup => {
    switch (type) {
      case "Spa & Trị liệu": return "SPA";
      case "Nhà hàng": return "RESTAURANT";
      case "Giải trí": return "ENTERTAINMENT";
      default: return "UTILITY";
    }
  };

  const getTypeFromGroup = (group: ServiceGroup): string => {
    switch (group) {
      case "SPA": return "Spa & Trị liệu";
      case "RESTAURANT": return "Nhà hàng";
      case "ENTERTAINMENT": return "Giải trí";
      default: return "Tiện ích";
    }
  };

  // Multi-level filter for services
  const filteredServices = services.filter((item) => {
    let matchesType = true;
    if (activeTab === "Spa") matchesType = item.group === "SPA";
    else if (activeTab === "Nhà hàng") matchesType = item.group === "RESTAURANT";
    else if (activeTab === "Giải trí") matchesType = item.group === "ENTERTAINMENT";
    else if (activeTab === "Dịch vụ khác") matchesType = item.group === "UTILITY";

    const matchesStatus = activeStatus === "Tất cả" 
      ? true 
      : (activeStatus === "Hoạt động" ? item.status === "ACTIVE" : item.status === "INACTIVE");
    
    return matchesType && matchesStatus;
  });

  const handleOpenAddModal = () => {
    setErrorMsg("");
    setErrorCode("");
    if (activeTab === "Tiện nghi phòng") {
      setEditingAmenity(null);
      setAmenityName("");
      setAmenityIcon("wifi");
    } else {
      setEditingService(null);
      setServiceName("");
      let presetType = "Spa & Trị liệu";
      if (activeTab === "Spa") presetType = "Spa & Trị liệu";
      if (activeTab === "Nhà hàng") presetType = "Nhà hàng";
      if (activeTab === "Giải trí") presetType = "Giải trí";
      if (activeTab === "Dịch vụ khác") presetType = "Tiện ích";
      setServiceType(presetType);
      setServiceHours("");
      setServicePrice("");
      setServiceStatus("Hoạt động");
      setServiceImage("");
      setSelectedFile(null);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditService = (service: ServiceDTO) => {
    setErrorMsg("");
    setErrorCode("");
    setEditingService(service);
    setServiceName(service.name);
    setServiceType(getTypeFromGroup(service.group));
    setServiceHours(service.operatingHours);
    setServicePrice(formatNumber(service.price));
    setServiceStatus(service.status === "ACTIVE" ? "Hoạt động" : "Tạm ngưng");
    
    const coverImage = service.images && service.images.length > 0 ? service.images[0].url : "";
    setServiceImage(coverImage);
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleOpenEditAmenity = (amenity: AmenityDTO) => {
    setErrorMsg("");
    setErrorCode("");
    setEditingAmenity(amenity);
    setAmenityName(amenity.name);
    setAmenityIcon(amenity.icon);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setServiceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setErrorCode("");

    try {
      setSubmitting(true);
      if (activeTab === "Tiện nghi phòng") {
        if (!amenityName || !amenityIcon) return;
        const payload = { name: amenityName, icon: amenityIcon };
        if (editingAmenity?.id) {
          await apiPut(`/amenities/${editingAmenity.id}`, payload);
        } else {
          await apiPost("/amenities", payload);
        }
        await fetchData();
        setIsModalOpen(false);
      } else {
        if (!serviceName || !serviceHours || !servicePrice) return;
        const groupValue = getGroupFromType(serviceType);
        const statusValue: ServiceStatus = serviceStatus === "Hoạt động" ? "ACTIVE" : "INACTIVE";
        const numericPrice = parseFloat(servicePrice.replace(/\D/g, "")) || 0;

        const payload = {
          name: serviceName,
          group: groupValue,
          description: serviceName + " - " + serviceHours,
          price: numericPrice,
          operatingHours: serviceHours,
          status: statusValue
        };

        let savedService: ServiceDTO;
        if (editingService?.id) {
          savedService = await apiPut<ServiceDTO>(`/services/${editingService.id}`, payload);
        } else {
          savedService = await apiPost<ServiceDTO>("/services", payload);
        }

        if (selectedFile && savedService.id) {
          await apiUploadImage(selectedFile, "SERVICE", savedService.id, true);
        }

        await fetchData();
        setIsModalOpen(false);
      }
    } catch (error: any) {
      console.error(error);
      setErrorCode(error.code || "");
      setErrorMsg(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa dịch vụ này không?")) {
      try {
        await apiDelete(`/services/${id}`);
        setServices(services.filter(item => item.id !== id));
      } catch (error: any) {
        alert("Lỗi khi xóa dịch vụ: " + getErrorMessage(error));
      }
    }
  };

  const handleDeleteAmenity = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa tiện nghi này? Tiện nghi này sẽ bị gỡ khỏi tất cả hạng phòng.")) {
      try {
        await apiDelete(`/amenities/${id}`);
        setAmenities(amenities.filter(a => a.id !== id));
      } catch (error: any) {
        alert("Lỗi khi xóa tiện nghi: " + getErrorMessage(error));
      }
    }
  };

  const getAddButtonText = () => {
    if (activeTab === "Tiện nghi phòng") return "Thêm Tiện nghi phòng";
    if (activeTab === "Spa") return "Thêm liệu trình Spa";
    if (activeTab === "Nhà hàng") return "Thêm món ăn / menu";
    if (activeTab === "Giải trí") return "Thêm hoạt động giải trí";
    return "Thêm dịch vụ tiện ích";
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
          <button className="mono-text" onClick={handleOpenAddModal} style={{
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
          {["Tất cả", "Spa", "Nhà hàng", "Giải trí", "Dịch vụ khác", "Tiện nghi phòng"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mono-text ${styles.tab} ${activeTab === tab ? styles.activeTab : ""}`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab !== "Tiện nghi phòng" && (
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
        )}
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
        ) : activeTab === "Tiện nghi phòng" ? (
          // Rendering Amenities Grid
          amenities.map((item) => (
            <article key={item.id} className={styles.card} style={{ padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexDirection: "row" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)", width: "3rem", height: "3rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.5rem" }}>{item.icon}</span>
                </div>
                <div>
                  <h3 className={styles.roomName} style={{ fontSize: "1.1rem" }}>{item.name}</h3>
                  <p className={styles.roomType} style={{ fontSize: "0.75rem" }}>Icon: {item.icon}</p>
                </div>
              </div>
              <div className={styles.actions}>
                <button className={styles.iconButton} onClick={() => handleOpenEditAmenity(item)} style={{ marginRight: "0.5rem" }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>edit</span>
                </button>
                <button className={`${styles.iconButton} ${styles.deleteBtn}`} onClick={() => handleDeleteAmenity(item.id!)}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>delete</span>
                </button>
              </div>
            </article>
          ))
        ) : (
          // Rendering Services Grid
          filteredServices.map((item) => {
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
                    <p className={styles.roomType}>{getTypeFromGroup(item.group)}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.iconButton} onClick={() => handleOpenEditService(item)}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>edit</span>
                    </button>
                    <button className={`${styles.iconButton} ${styles.deleteBtn}`} onClick={() => handleDeleteService(item.id!)}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>delete</span>
                    </button>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <p className={`mono-text ${styles.priceLabel}`}>{item.operatingHours}</p>
                  <p className={`mono-text ${styles.priceValue}`}>{item.price > 0 ? `${item.price.toLocaleString("vi-VN")}₫` : "Theo thực đơn"}</p>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Popup Form Modal */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => !submitting && setIsModalOpen(false)}>
          <div className={styles.modalContainer} style={{ position: "relative" }} onClick={(e) => e.stopPropagation()}>
            {/* Loading Overlay */}
            {submitting && (
              <div style={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(2px)",
                zIndex: 10,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem"
              }}>
                <div className="spinner" style={{
                  border: "4px solid rgba(0,0,0,0.1)",
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  borderLeftColor: "var(--color-primary)",
                  animation: "spin 1s linear infinite"
                }} />
                <p className="mono-text" style={{ fontWeight: "bold", color: "var(--color-primary)", fontSize: "0.9rem" }}>
                  Đang tải ảnh và cập nhật dữ liệu...
                </p>
                <style jsx>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            )}
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                {activeTab === "Tiện nghi phòng" 
                  ? (editingAmenity ? "Chỉnh sửa tiện nghi" : "Thêm tiện nghi mới")
                  : (editingService ? "Chỉnh sửa dịch vụ" : "Thêm dịch vụ tiện ích mới")}
              </h2>
              <button 
                className={styles.modalCloseBtn} 
                onClick={() => !submitting && setIsModalOpen(false)}
                disabled={submitting}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                {activeTab === "Tiện nghi phòng" ? (
                  // Amenity Form Content
                  <>
                    <div className={styles.formGroup}>
                      <label className={`mono-text ${styles.label}`}>Tên tiện nghi</label>
                      <input
                        className={styles.input}
                        placeholder="VD: Wifi Tốc độ cao, Bồn tắm nằm..."
                        value={amenityName}
                        onChange={(e) => setAmenityName(e.target.value)}
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={`mono-text ${styles.label}`}>Chọn Icon đại diện</label>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        {POPULAR_ICONS.map((ico) => (
                          <button
                            key={ico.value}
                            type="button"
                            onClick={() => setAmenityIcon(ico.value)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              padding: "0.5rem 0.25rem",
                              border: `1px solid ${amenityIcon === ico.value ? "var(--color-primary)" : "var(--color-whisper-border)"}`,
                              backgroundColor: amenityIcon === ico.value ? "var(--color-surface-dim)" : "transparent",
                              borderRadius: "var(--rounded-lg)",
                              cursor: "pointer",
                              color: amenityIcon === ico.value ? "var(--color-primary)" : "inherit"
                            }}
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>{ico.value}</span>
                            <span style={{ fontSize: "0.6rem", marginTop: "0.25rem" }}>{ico.name}</span>
                          </button>
                        ))}
                      </div>
                      <label className={`mono-text ${styles.label}`}>Hoặc nhập mã Material Icon tùy chỉnh</label>
                      <input
                        className={styles.input}
                        placeholder="VD: local_laundry_service"
                        value={amenityIcon}
                        onChange={(e) => setAmenityIcon(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  // Service Form Content
                  <>
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
                      <label className={`mono-text ${styles.label}`}>Mức giá / Chi phí (VND)</label>
                      <div className={styles.numberInputGroup}>
                        <button 
                          type="button" 
                          className={styles.numberInputBtn}
                          onClick={() => {
                            const current = parseInt(servicePrice.toString().replace(/\D/g, ""), 10) || 0;
                            const next = Math.max(0, current - 50000);
                            setServicePrice(formatNumber(next));
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>remove</span>
                        </button>
                        <input
                          type="text"
                          placeholder="VD: 500.000"
                          value={servicePrice}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setServicePrice(formatNumber(val));
                          }}
                          required
                          style={{ textAlign: "center" }}
                        />
                        <button 
                          type="button" 
                          className={styles.numberInputBtn}
                          onClick={() => {
                            const current = parseInt(servicePrice.toString().replace(/\D/g, ""), 10) || 0;
                            const next = current + 50000;
                            setServicePrice(formatNumber(next));
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>add</span>
                        </button>
                      </div>
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
                  </>
                )}

                {errorMsg && (
                  <div style={{ color: "red", fontSize: "0.85rem", marginTop: "1rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button 
                  type="button" 
                  className={`mono-text ${styles.btnCancel}`} 
                  onClick={() => !submitting && setIsModalOpen(false)}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className={`mono-text ${styles.btnSubmit}`}
                  disabled={submitting}
                >
                  {submitting ? "Đang xử lý..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
