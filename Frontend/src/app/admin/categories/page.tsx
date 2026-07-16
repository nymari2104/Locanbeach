"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { apiGet, apiPost, apiPut, apiUploadImage, getErrorMessage } from "@/lib/api";
import { AccommodationCategoryDTO, AccommodationType, ImageDTO, AmenityDTO } from "@/types/api";

export default function AdminCategories() {
  const [categories, setCategories] = useState<AccommodationCategoryDTO[]>([]);
  const [allAmenities, setAllAmenities] = useState<AmenityDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AccommodationCategoryDTO | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState<AccommodationType>("ROOM");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [maxGuests, setMaxGuests] = useState("2");
  const [areaSqm, setAreaSqm] = useState("30");
  const [catImage, setCatImage] = useState(""); // For preview
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // For upload
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorCode, setErrorCode] = useState("");

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await apiGet<AccommodationCategoryDTO[]>("/categories");
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAmenities = async () => {
    try {
      const data = await apiGet<AmenityDTO[]>("/amenities");
      setAllAmenities(data);
    } catch (error) {
      console.error("Failed to load amenities:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchAmenities();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName("");
    setCode("");
    setType("ROOM");
    setDescription("");
    setBasePrice("");
    setMaxGuests("2");
    setAreaSqm("30");
    setCatImage("");
    setSelectedFile(null);
    setSelectedAmenityIds([]);
    setErrorMsg("");
    setErrorCode("");
    setIsModalOpen(true);
  };

  const formatNumber = (val: string | number) => {
    if (!val && val !== 0) return "";
    const num = typeof val === "number" ? val : parseInt(val.toString().replace(/\D/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString("vi-VN").replace(/,/g, ".");
  };

  const handleOpenEditModal = (cat: AccommodationCategoryDTO) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code);
    setType(cat.type);
    setDescription(cat.description);
    setBasePrice(formatNumber(cat.basePrice));
    setMaxGuests(cat.maxGuests.toString());
    setAreaSqm(cat.areaSqm.toString());
    setSelectedAmenityIds(cat.amenityIds || cat.amenities?.map(a => a.id!) || []);
    
    // Set preview to existing cover image if available
    const coverImage = cat.images && cat.images.length > 0 ? cat.images[0].url : "";
    setCatImage(coverImage);
    setSelectedFile(null);
    setErrorMsg("");
    setErrorCode("");
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCatImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code || !basePrice) return;

    setErrorMsg("");
    setErrorCode("");

    try {
      setSubmitting(true);
      const payload: AccommodationCategoryDTO = {
        name,
        code,
        type,
        description: description || name,
        basePrice: parseFloat(basePrice.toString().replace(/\D/g, "")) || 0,
        maxGuests: parseInt(maxGuests) || 2,
        areaSqm: parseFloat(areaSqm) || 30,
        amenityIds: selectedAmenityIds
      };

      let savedCategory: AccommodationCategoryDTO;

      if (editingCategory?.id) {
        // Edit mode
        savedCategory = await apiPut<AccommodationCategoryDTO>(`/categories/${editingCategory.id}`, payload);
      } else {
        // Create mode
        savedCategory = await apiPost<AccommodationCategoryDTO>("/categories", payload);
      }

      // If a new file is chosen, upload it to the category
      if (selectedFile && savedCategory.id) {
        await apiUploadImage(selectedFile, "CATEGORY", savedCategory.id, true);
      }

      await fetchCategories();
      setIsModalOpen(false);
    } catch (error: any) {
      console.error(error);
      setErrorCode(error.code || "");
      setErrorMsg(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Thiết lập</p>
          <h1 className={styles.title}>Quản lý Hạng phòng</h1>
        </div>
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
          Thêm Hạng phòng mới
        </button>
      </header>

      {/* Grid listing */}
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
        ) : categories.length === 0 ? (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "4rem 0", color: "var(--color-steel-secondary)" }}>
            <span className="material-symbols-outlined" style={{ fontSize: "3rem", marginBottom: "1rem" }}>bed</span>
            <p>Chưa có hạng phòng nào. Hãy thêm mới để quản lý.</p>
          </div>
        ) : (
          categories.map((cat) => {
            const coverImage = cat.images && cat.images.length > 0
              ? cat.images[0].url
              : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format";

            return (
              <article key={cat.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    alt={cat.name}
                    src={coverImage}
                  />
                  <div className={`${styles.badge} ${styles.badgeVacant}`}>
                    <span className="mono-text">{cat.type}</span>
                  </div>
                </div>
                <div className={styles.cardDetails}>
                  <div>
                    <h3 className={styles.roomName}>{cat.name}</h3>
                    <p className={styles.roomType}>Mã hạng: {cat.code}</p>
                  </div>
                  <div className={styles.actions}>
                    <button className={styles.iconButton} onClick={() => handleOpenEditModal(cat)}>
                      <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>edit</span>
                    </button>
                  </div>
                </div>
                <div style={{ padding: "0 1.25rem 1rem 1.25rem", fontSize: "0.825rem", color: "var(--color-on-surface-variant)" }}>
                  <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", margin: "0 0 0.25rem 0" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>square_foot</span>
                    Diện tích: {cat.areaSqm} m²
                  </p>
                  <p style={{ display: "flex", alignItems: "center", gap: "0.25rem", margin: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>group</span>
                    Sức chứa: {cat.maxGuests} khách
                  </p>
                </div>
                <div className={styles.cardFooter}>
                  <p className={`mono-text ${styles.priceLabel}`}>Giá mỗi đêm</p>
                  <p className={`mono-text ${styles.priceValue}`}>{cat.basePrice.toLocaleString("vi-VN")} VND</p>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* Modal Form Dialog */}
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
                {editingCategory ? "Chỉnh sửa Hạng phòng" : "Thêm Hạng phòng mới"}
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
                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Tên hạng phòng</label>
                  <input
                    className={styles.input}
                    placeholder="VD: Deluxe Ocean View, Family Suite..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.formGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className={`mono-text ${styles.label}`}>Mã hạng phòng (Code)</label>
                    <input
                      className={styles.input}
                      placeholder="VD: DLX-SEA"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      required
                    />
                    {errorCode === "CATEGORY_CODE_ALREADY_EXISTS" && (
                      <span style={{ color: "red", fontSize: "0.75rem", marginTop: "0.25rem", display: "block" }}>
                        Mã hạng phòng này đã tồn tại trong hệ thống.
                      </span>
                    )}
                  </div>
                  <div>
                    <label className={`mono-text ${styles.label}`}>Loại hình lưu trú</label>
                    <select
                      className={styles.select}
                      value={type}
                      onChange={(e) => setType(e.target.value as AccommodationType)}
                      required
                    >
                      <option value="ROOM">ROOM (Khách sạn / Villa)</option>
                      <option value="CAMPING">CAMPING (Cắm trại)</option>
                      <option value="GLAMPING">GLAMPING (Nghỉ dưỡng lều cao cấp)</option>
                    </select>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Giá tiền/đêm (VND)</label>
                  <div className={styles.numberInputGroup}>
                    <button 
                      type="button" 
                      className={styles.numberInputBtn}
                      onClick={() => {
                        const current = parseInt(basePrice.toString().replace(/\D/g, ""), 10) || 0;
                        const next = Math.max(0, current - 50000);
                        setBasePrice(formatNumber(next));
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>remove</span>
                    </button>
                    <input
                      type="text"
                      placeholder="VD: 2.500.000"
                      value={basePrice}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setBasePrice(formatNumber(val));
                      }}
                      required
                      style={{ textAlign: "center" }}
                    />
                    <button 
                      type="button" 
                      className={styles.numberInputBtn}
                      onClick={() => {
                        const current = parseInt(basePrice.toString().replace(/\D/g, ""), 10) || 0;
                        const next = current + 50000;
                        setBasePrice(formatNumber(next));
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>add</span>
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label className={`mono-text ${styles.label}`}>Số khách tối đa</label>
                    <div className={styles.numberInputGroup}>
                      <button 
                        type="button" 
                        className={styles.numberInputBtn}
                        onClick={() => {
                          const current = parseInt(maxGuests, 10) || 1;
                          const next = Math.max(1, current - 1);
                          setMaxGuests(next.toString());
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>remove</span>
                      </button>
                      <input
                        type="text"
                        value={maxGuests}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const parsed = parseInt(val, 10) || 1;
                          setMaxGuests(Math.max(1, parsed).toString());
                        }}
                        required
                        style={{ textAlign: "center" }}
                      />
                      <button 
                        type="button" 
                        className={styles.numberInputBtn}
                        onClick={() => {
                          const current = parseInt(maxGuests, 10) || 1;
                          const next = current + 1;
                          setMaxGuests(next.toString());
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>add</span>
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={`mono-text ${styles.label}`}>Diện tích (m²)</label>
                    <div className={styles.numberInputGroup}>
                      <button 
                        type="button" 
                        className={styles.numberInputBtn}
                        onClick={() => {
                          const current = parseInt(areaSqm, 10) || 1;
                          const next = Math.max(1, current - 5);
                          setAreaSqm(next.toString());
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>remove</span>
                      </button>
                      <input
                        type="text"
                        value={areaSqm}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const parsed = parseInt(val, 10) || 1;
                          setAreaSqm(Math.max(1, parsed).toString());
                        }}
                        required
                        style={{ textAlign: "center" }}
                      />
                      <button 
                        type="button" 
                        className={styles.numberInputBtn}
                        onClick={() => {
                          const current = parseInt(areaSqm, 10) || 1;
                          const next = current + 5;
                          setAreaSqm(next.toString());
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>add</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Mô tả chi tiết</label>
                  <textarea
                    className={styles.input}
                    style={{ height: "70px", resize: "none" }}
                    placeholder="Mô tả các tiện nghi, cảnh quan bên ngoài..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Tiện nghi đi kèm (Amenities)</label>
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.5rem",
                    padding: "0.75rem",
                    border: "1px solid var(--color-whisper-border)",
                    borderRadius: "var(--rounded-xl)",
                    maxHeight: "150px",
                    overflowY: "auto",
                    backgroundColor: "var(--color-pure-surface)"
                  }}>
                    {allAmenities.length === 0 ? (
                      <p style={{ gridColumn: "1/-1", fontSize: "0.8rem", color: "var(--color-steel-secondary)", margin: 0 }}>
                        Chưa có tiện nghi nào trong hệ thống. Hãy tạo tiện nghi trước.
                      </p>
                    ) : (
                      allAmenities.map((a) => (
                        <label key={a.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", color: "var(--color-on-surface)" }}>
                          <input
                            type="checkbox"
                            checked={selectedAmenityIds.includes(a.id!)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAmenityIds([...selectedAmenityIds, a.id!]);
                              } else {
                                setSelectedAmenityIds(selectedAmenityIds.filter(id => id !== a.id));
                              }
                            }}
                          />
                          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "var(--color-primary)" }}>{a.icon}</span>
                          <span>{a.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={`mono-text ${styles.label}`}>Ảnh bìa loại phòng</label>
                  <label className={styles.uploadArea}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                    />
                    {catImage ? (
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <img src={catImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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

                {errorMsg && errorCode !== "CATEGORY_CODE_ALREADY_EXISTS" && (
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
                  {submitting ? "Đang xử lý..." : (editingCategory ? "Lưu thay đổi" : "Tạo Hạng phòng")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
