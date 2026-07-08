"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { 
  AccommodationCategoryDTO, 
  SearchCategoryResultResponse
} from "@/types/api";

export default function Book() {
  const [categories, setCategories] = useState<AccommodationCategoryDTO[]>([]);
  const [searchResults, setSearchResults] = useState<SearchCategoryResultResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  // Form search states
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState("2");
  const [selectedCatId, setSelectedCatId] = useState("ALL");

  useEffect(() => {
    // Set default checkin/checkout dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setCheckin(today.toISOString().split("T")[0]);
    setCheckout(tomorrow.toISOString().split("T")[0]);

    async function initData() {
      try {
        const cats = await apiGet<AccommodationCategoryDTO[]>("/categories");
        setCategories(cats);
        
        // Read URL query parameters safely on mount
        const params = new URLSearchParams(window.location.search);
        const catId = params.get("categoryId");
        if (catId && cats.some(c => c.id === catId)) {
          setSelectedCatId(catId);
        }

        // Map initial categories as results
        const mappedResults: SearchCategoryResultResponse[] = cats.map(c => ({
          categoryId: c.id || "",
          categoryName: c.name,
          categoryCode: c.code,
          description: c.description,
          basePrice: c.basePrice,
          maxGuests: c.maxGuests,
          areaSqm: c.areaSqm,
          availableRoomsCount: 5, // fallback count
          images: c.images
        }));
        setSearchResults(mappedResults);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkin || !checkout) return;

    try {
      setSearching(true);
      // Format ISO Dates (checkin: 14:00, checkout: 12:00)
      const checkinDateStr = `${checkin}T14:00:00`;
      const checkoutDateStr = `${checkout}T12:00:00`;

      let url = `/search/accommodations?checkinDate=${checkinDateStr}&checkoutDate=${checkoutDateStr}&guestsCount=${guests}`;
      if (selectedCatId !== "ALL") {
        url += `&categoryId=${selectedCatId}`;
      }

      const results = await apiGet<SearchCategoryResultResponse[]>(url);
      setSearchResults(results);
    } catch (error: any) {
      alert("Lỗi khi tìm kiếm: " + error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={styles.container} style={{ paddingTop: "2rem", paddingBottom: "var(--spacing-section-gap)" }}>
      {/* Hero / Filter Section */}
      <section className={styles.heroFilterSection}>
        <div className={styles.heroText}>
          <h1 className={styles.title}>
            Tìm kiếm <br />
            <span className={styles.italic}>Không gian</span> của bạn
          </h1>
          <p className={styles.description}>
            Khám phá các lựa chọn lưu trú độc đáo tại Lộc An Beach. Từ phòng tiêu chuẩn đến villa cao cấp, chúng tôi mang đến trải nghiệm nghỉ dưỡng hoàn hảo.
          </p>
        </div>

        <div className={styles.filterCard}>
          <form className={styles.formGrid} onSubmit={handleSearch}>
            {/* Date Pickers */}
            <div className={styles.formGroup}>
              <label className={`mono-text ${styles.label}`}>Nhận phòng</label>
              <div className={styles.inputWrapper}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>calendar_today</span>
                <input 
                  className={styles.input} 
                  type="date" 
                  value={checkin}
                  onChange={(e) => setCheckin(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={`mono-text ${styles.label}`}>Trả phòng</label>
              <div className={styles.inputWrapper}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>calendar_today</span>
                <input 
                  className={styles.input} 
                  type="date" 
                  value={checkout}
                  onChange={(e) => setCheckout(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Guests */}
            <div className={styles.formGroup}>
              <label className={`mono-text ${styles.label}`}>Số lượng khách</label>
              <div className={styles.selectWrapper}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>group</span>
                <select className={styles.select} value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="1">1 Khách</option>
                  <option value="2">2 Khách</option>
                  <option value="3">3 Khách</option>
                  <option value="4">4 Khách</option>
                  <option value="6">Đoàn lớn (5+)</option>
                </select>
                <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
              </div>
            </div>

            {/* Room Type */}
            <div className={styles.formGroup}>
              <label className={`mono-text ${styles.label}`}>Loại phòng</label>
              <div className={styles.selectWrapper}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>bed</span>
                <select className={styles.select} value={selectedCatId} onChange={(e) => setSelectedCatId(e.target.value)}>
                  <option value="ALL">Tất cả các loại</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
              </div>
            </div>

            <button className={`mono-text ${styles.searchButton}`} type="submit" disabled={searching}>
              <span className="material-symbols-outlined">
                {searching ? "hourglass_empty" : "search"}
              </span>
              <span>{searching ? "Đang tìm..." : "Tìm kiếm phòng"}</span>
            </button>
          </form>
        </div>
      </section>

      {/* Room Listing */}
      <section>
        <div className={styles.resultsHeader}>
          <h2 className="headline-lg">Kết quả tìm kiếm</h2>
          <span className="mono-text" style={{ color: "var(--color-steel-secondary)" }}>
            Hiển thị {searchResults.length} kết quả
          </span>
        </div>

        <div className={styles.resultsGrid}>
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
            searchResults.map((room, idx) => {
              const isFeatured = idx === 0;
              const coverImage = room.images && room.images.length > 0
                ? room.images.find(img => img.isCover)?.url || room.images[0].url
                : "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format";

              return (
                <div key={room.categoryId} className={`${styles.roomCard} ${isFeatured ? styles.featuredCard : ""}`}>
                  <div className={styles.imageWrapper}>
                    <img
                      className={styles.roomImage}
                      alt={room.categoryName}
                      src={coverImage}
                    />
                    {isFeatured && <div className={`mono-text ${styles.featuredBadge}`}>Phổ biến nhất</div>}
                  </div>
                  <div className={styles.roomDetails}>
                    <div>
                      <h3 className={styles.roomName}>{room.categoryName}</h3>
                      <div className={`mono-text ${styles.roomSpecs}`}>
                        <span className={styles.specItem}>
                          <span className={`material-symbols-outlined ${styles.specIcon}`}>square_foot</span> {room.areaSqm}m²
                        </span>
                        <span className={styles.specItem}>
                          <span className={`material-symbols-outlined ${styles.specIcon}`}>group</span> Tối đa {room.maxGuests} khách
                        </span>
                        <span className={styles.specItem} style={{ color: room.availableRoomsCount > 0 ? "green" : "red" }}>
                          <span className={`material-symbols-outlined ${styles.specIcon}`}>bed</span> Trống: {room.availableRoomsCount} phòng
                        </span>
                      </div>
                      <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.5rem" }}>
                        {room.description}
                      </p>
                    </div>
                    <div className={styles.roomActions}>
                      <div className={styles.priceWrapper}>
                        <span className={styles.price}>{room.basePrice.toLocaleString("vi-VN")}₫</span>
                        <span className="mono-text" style={{ color: "var(--color-steel-secondary)", marginLeft: "0.25rem" }}>/ đêm</span>
                      </div>
                      
                      {room.availableRoomsCount > 0 ? (
                        <Link href={`/rooms/${room.categoryId}?checkin=${checkin}&checkout=${checkout}&guests=${guests}`}>
                          <button className={`mono-text ${styles.selectButton}`}>
                            <span>Chọn phòng</span>
                            <span className={styles.arrow}>&rarr;</span>
                          </button>
                        </Link>
                      ) : (
                        <button className={`mono-text ${styles.selectButton}`} disabled>
                          <span>Hết phòng</span>
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
