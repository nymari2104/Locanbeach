"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import Link from "next/link";
import { apiGet, getMaterialIconName } from "@/lib/api";
import { 
  AccommodationCategoryDTO, 
  SearchCategoryResultResponse,
  AmenityDTO
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

  // Advanced Filters
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allAmenities, setAllAmenities] = useState<AmenityDTO[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(5000000);

  useEffect(() => {
    // Set default checkin/checkout dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setCheckin(today.toISOString().split("T")[0]);
    setCheckout(tomorrow.toISOString().split("T")[0]);

    async function initData() {
      try {
        let cats: AccommodationCategoryDTO[] = [];
        try {
          cats = await apiGet<AccommodationCategoryDTO[]>("/categories");
          console.log("Categories fetched:", cats);
          setCategories(cats);
        } catch (catErr) {
          console.error("Failed to fetch categories:", catErr);
        }

        try {
          const amenitiesData = await apiGet<AmenityDTO[]>("/amenities");
          console.log("Amenities fetched:", amenitiesData);
          setAllAmenities(amenitiesData);
        } catch (amErr) {
          console.error("Failed to fetch amenities:", amErr);
        }
        
        // Read URL query parameters safely on mount
        const params = new URLSearchParams(window.location.search);
        const catId = params.get("categoryId") || "ALL";
        if (catId !== "ALL" && cats.some(c => c.id === catId)) {
          setSelectedCatId(catId);
        }

        // Fetch actual available room counts from backend API
        try {
          const checkinDateStr = `${today.toISOString().split("T")[0]}T14:00:00`;
          const checkoutDateStr = `${tomorrow.toISOString().split("T")[0]}T12:00:00`;
          let searchUrl = `/search/accommodations?checkinDate=${checkinDateStr}&checkoutDate=${checkoutDateStr}&guestsCount=2`;
          if (catId !== "ALL") {
            searchUrl += `&categoryId=${catId}`;
          }
          const realResults = await apiGet<SearchCategoryResultResponse[]>(searchUrl);
          setSearchResults(realResults);
        } catch (searchErr) {
          console.error("Failed initial available rooms search:", searchErr);
          const fallbackResults: SearchCategoryResultResponse[] = cats.map(c => ({
            categoryId: c.id || "",
            categoryName: c.name,
            categoryCode: c.code,
            description: c.description,
            basePrice: c.basePrice,
            maxGuests: c.maxGuests,
            areaSqm: c.areaSqm,
            availableRoomsCount: 0,
            images: c.images,
            amenities: c.amenities
          }));
          setSearchResults(fallbackResults);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setLoading(false);
      }
    }
    initData();
  }, []);

  const resetFilters = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    setCheckin(today.toISOString().split("T")[0]);
    setCheckout(tomorrow.toISOString().split("T")[0]);
    setGuests("2");
    setSelectedCatId("ALL");
    setMinPrice(0);
    setMaxPrice(5000000);
    setSelectedAmenities([]);
    
    // Optionally auto-submit search after resetting, or just let user click search again.
    // For now, just resetting the form fields is enough.
  };

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
      if (minPrice > 0) {
        url += `&minPrice=${minPrice}`;
      }
      if (maxPrice > 0 && maxPrice < 10000000) {
        url += `&maxPrice=${maxPrice}`;
      }
      selectedAmenities.forEach(amId => {
        url += `&amenityIds=${amId}`;
      });

      const results = await apiGet<SearchCategoryResultResponse[]>(url);
      setSearchResults(results);
    } catch (error: any) {
      alert("Lỗi khi tìm kiếm: " + error.message);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className={styles.container}>
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

          {/* Advanced Filters Toggle & Reset */}
          <div className={styles.advancedToggleWrapper}>
            <button 
              type="button" 
              className={`mono-text ${styles.advancedToggleBtn}`}
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <span className="material-symbols-outlined">tune</span>
              {showAdvanced ? "Ẩn bộ lọc nâng cao" : "Bộ lọc nâng cao"}
            </button>
            <button 
              type="button" 
              className={`mono-text ${styles.resetFilterBtn}`}
              onClick={resetFilters}
            >
              <span className="material-symbols-outlined">refresh</span>
              Đặt lại
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {showAdvanced && (
            <div className={styles.advancedPanel}>
              <div className={styles.advancedGrid}>
                {/* Price Range Filter */}
                <div className={styles.filterSection}>
                  <label className={`mono-text ${styles.filterTitle}`}>Khoảng giá (VND / đêm)</label>
                  
                  <div className={styles.priceInputsRow}>
                    <div className={styles.inputWrapper}>
                      <input 
                        type="number" 
                        className={styles.input} 
                        style={{ paddingLeft: "1rem" }}
                        value={minPrice} 
                        onChange={(e) => setMinPrice(Number(e.target.value))}
                        min="0"
                        step="50000"
                        placeholder="Từ..."
                      />
                    </div>
                    <span className={styles.priceSeparator}>-</span>
                    <div className={styles.inputWrapper}>
                      <input 
                        type="number" 
                        className={styles.input} 
                        style={{ paddingLeft: "1rem" }}
                        value={maxPrice} 
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        min="0"
                        step="50000"
                        placeholder="Đến..."
                      />
                    </div>
                  </div>

                  <div className={styles.priceSliders}>
                    <input 
                      type="range" 
                      className={styles.slider} 
                      min="0" 
                      max="10000000" 
                      step="100000" 
                      value={minPrice} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val <= maxPrice) setMinPrice(val);
                      }}
                    />
                    <input 
                      type="range" 
                      className={styles.slider} 
                      min="0" 
                      max="10000000" 
                      step="100000" 
                      value={maxPrice} 
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (val >= minPrice) setMaxPrice(val);
                      }}
                    />
                  </div>
                </div>

                {/* Amenities Filter */}
                <div className={styles.filterSection}>
                  <label className={`mono-text ${styles.filterTitle}`}>Tiện ích phòng</label>
                  <div className={styles.amenitiesGrid}>
                    {allAmenities.map(amenity => (
                      <label key={amenity.id} className={styles.amenityCheckbox}>
                        <input 
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity.id!)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAmenities([...selectedAmenities, amenity.id!]);
                            } else {
                              setSelectedAmenities(selectedAmenities.filter(id => id !== amenity.id));
                            }
                          }}
                        />
                        <span className={styles.checkmark}></span>
                        <span className={`material-symbols-outlined ${styles.amenityIcon}`}>{getMaterialIconName(amenity.icon, amenity.name)}</span>
                        <span className={styles.amenityName}>{amenity.name}</span>
                      </label>
                    ))}
                    {allAmenities.length === 0 && (
                      <span className="mono-text" style={{ fontSize: "0.85rem", color: "var(--color-muted-slate)" }}>Không có tiện ích nào.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
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
          {loading || searching ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`${styles.roomCard} ${styles.skeletonCard}`}>
                  <div className={`${styles.imageWrapper} ${styles.skeletonShimmer}`} style={{ height: '240px', minHeight: '240px' }}></div>
                  <div className={styles.roomDetails} style={{ gap: '1rem' }}>
                    <div>
                      <div className={`${styles.skeletonShimmer}`} style={{ height: '24px', width: '60%', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div className={`${styles.skeletonShimmer}`} style={{ height: '16px', width: '80px', borderRadius: '4px' }}></div>
                        <div className={`${styles.skeletonShimmer}`} style={{ height: '16px', width: '100px', borderRadius: '4px' }}></div>
                        <div className={`${styles.skeletonShimmer}`} style={{ height: '16px', width: '70px', borderRadius: '4px' }}></div>
                      </div>
                      <div className={`${styles.skeletonShimmer}`} style={{ height: '60px', width: '100%', borderRadius: '4px' }}></div>
                    </div>
                    <div className={styles.roomActions} style={{ borderTop: 'none', paddingTop: 0 }}>
                      <div className={`${styles.skeletonShimmer}`} style={{ height: '24px', width: '120px', borderRadius: '4px' }}></div>
                      <div className={`${styles.skeletonShimmer}`} style={{ height: '40px', width: '100px', borderRadius: '8px' }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </>
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
                      <p className={styles.roomDescription} title={room.description}>
                        {room.description}
                      </p>
                      
                      {room.amenities && room.amenities.length > 0 && (
                        <div className={styles.amenities} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
                          {room.amenities.map(a => (
                            <div key={a.id} title={a.name} style={{ display: 'flex', alignItems: 'center', color: 'var(--color-steel-secondary)' }}>
                              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>{getMaterialIconName(a.icon, a.name)}</span>
                            </div>
                          ))}
                        </div>
                      )}
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
