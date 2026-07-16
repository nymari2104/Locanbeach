"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { apiGet } from "@/lib/api";
import { ComboEventDTO } from "@/types/api";

const FALLBACK_COMBOS = [
  {
    id: "fb-cb-1",
    name: "Gói Trăng Mật Đại Dương",
    description: "Trải nghiệm 3 ngày 2 đêm tại phòng Suite Hướng Biển + Bữa tối lãng mạn dưới ánh nến tại bãi biển + Massage cặp đôi 60 phút tại Spa.",
    type: "COMBO",
    price: 5500000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    images: [{ url: "https://lh3.googleusercontent.com/aVI-d-XuOm9s9pVuf9PTim01PDWXa8jKn5tyX2VVdLre7_glyiJkTv8FF3QCFTTGMbDu0WEHd4gBkucYykfq3oEitq57nmz_GfNiDWAsqBGhZ16sZjiAjT93sF7N67haghhYYkSAdsValRzYFxjlkj2hkrVJ79_hdeIyts6WQcgg10hCt-umy7BA5nHQeyfpW-NWNbBYiL8eiCmaBOVSgNXhdqGTUbHKobseMU9USyYKhGtwBaEiRh" }]
  },
  {
    id: "fb-cb-2",
    name: "Gói Năng Lượng Đội Nhóm",
    description: "Dành cho đoàn từ 20 người. Bao gồm setup bãi cỏ chơi team building + Hệ thống âm thanh ánh sáng cơ bản + Tiệc nướng BBQ hải sản ngoài trời.",
    type: "COMBO",
    price: 12000000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    images: [{ url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAK6V4s8DGuvriwSZjS2nGm1qbgRDnNn0Ig_mTyUTKpTZsMV5u7nWc90_dB9IKw4VJzGzfg5VkIgSdtNLSYBiOwvkYZ36jetPCx8UZ9JjAeNa3ChGeIt9klofEA98nVKfTjQrn0Bp-cEDJU4p-0q5tkBd5bsPI1azqValtSG6OlzR69ZuXdE3cmwqTQpp5Z0PP7OEGohuDKAmZt3WZ0Vx7bASngUWFb1Hd3_4csvrAu0q2fOXZYOAEF" }]
  },
  {
    id: "fb-cb-3",
    name: "Gói Cuối Tuần Tĩnh Lặng",
    description: "Dành cho người bận rộn cần nghỉ ngơi. Gồm 2 đêm nghỉ tại phòng Garden Deluxe + Lớp học Yoga đón bình minh + Set trà chiều ngắm biển.",
    type: "COMBO",
    price: 3200000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    images: [{ url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjT4JHdoPg1bdAO7fHLPj6l-lgiDOSvuQeJirUHNpjDSZ_ZqHAL2vRJyYP9uSNHX2YsWsUg0nhweQKAtXN9PgjmGRr2K84d0p065IJWR7z8k8OFzbqO_UTUb4E4vNQ_xWebxDcFVYEkZjLOvNo4G7rVEd-kSOC6GVbRyiugI-MT3b6zju8rpNAsUYZmdbsTGBcJ-4-HWPgGaMuJ7t5YyTLv-SL95vteB_utAFq9ypy_9ZOm-joKMqq" }]
  }
];

export default function Combos() {
  const [combos, setCombos] = useState<ComboEventDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCombos() {
      try {
        const data = await apiGet<ComboEventDTO[]>("/combos");
        const activeCombos = data.filter(c => c.status === "ACTIVE");
        setCombos(activeCombos.length > 0 ? activeCombos : (FALLBACK_COMBOS as any[]));
      } catch (error) {
        console.error("Failed to load combos from API:", error);
        setCombos(FALLBACK_COMBOS as any[]);
      } finally {
        setLoading(false);
      }
    }
    loadCombos();
  }, []);

  return (
    <div className={styles.container} style={{ paddingTop: "2rem", paddingBottom: "var(--spacing-section-gap)" }}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>Combo Nghỉ Dưỡng</h1>
        <p className={styles.subtitle}>
          Kết hợp hoàn hảo giữa lưu trú đẳng cấp, ẩm thực tinh tế và dịch vụ chăm sóc sức khỏe với mức giá ưu đãi nhất.
        </p>
      </section>

      {/* Combos Grid */}
      <section className={styles.grid}>
        {loading ? (
          <>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
                <div className={`${styles.imageWrapper} ${styles.skeletonShimmer}`} style={{ height: '240px' }}></div>
                <div className={styles.content} style={{ gap: '1rem' }}>
                  <div>
                    <div className={styles.skeletonShimmer} style={{ height: '24px', width: '70%', borderRadius: '4px', marginBottom: '0.75rem' }}></div>
                    <div className={styles.skeletonShimmer} style={{ height: '60px', width: '100%', borderRadius: '4px' }}></div>
                  </div>
                  <div className={styles.footer} style={{ borderTop: 'none', paddingTop: 0 }}>
                    <div className={styles.skeletonShimmer} style={{ height: '24px', width: '100px', borderRadius: '4px' }}></div>
                    <div className={styles.skeletonShimmer} style={{ height: '36px', width: '90px', borderRadius: '8px' }}></div>
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          combos.map((combo) => {
            const coverImage = combo.images && combo.images.length > 0
              ? combo.images.find(img => img.isCover)?.url || combo.images[0].url
              : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format";

            return (
              <div key={combo.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    alt={combo.name}
                    src={coverImage}
                  />
                  {combo.type === "EVENT" && <span className={styles.badge} style={{ backgroundColor: "var(--color-tertiary, #924700)" }}>Sự kiện</span>}
                  {combo.type === "COMBO" && <span className={styles.badge}>Ưu đãi</span>}
                </div>
                <div className={styles.content}>
                  <div>
                    <h2 className={styles.cardTitle}>{combo.name}</h2>
                    <p className={styles.cardDesc}>
                      {combo.description || "Chưa có mô tả chi tiết cho combo này."}
                    </p>
                  </div>
                  <div className={styles.footer}>
                    <span className={styles.price}>
                      {combo.price > 0 ? `${combo.price.toLocaleString("vi-VN")} ₫` : "Liên hệ báo giá"}
                    </span>
                    <button className={`mono-text ${styles.button}`}>Đặt ngay</button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
