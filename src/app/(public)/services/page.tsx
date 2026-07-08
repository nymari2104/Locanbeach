"use client";

import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { apiGet } from "@/lib/api";
import { ServiceDTO } from "@/types/api";

const FALLBACK_SERVICES = [
  {
    id: "fb-1",
    name: "Tiệc cưới bên bờ biển",
    description: "Không gian lãng mạn, tinh tế cho ngày trọng đại dưới ánh hoàng hôn thơ mộng của Lộc An Beach.",
    group: "ENTERTAINMENT",
    price: 0,
    operatingHours: "Theo yêu cầu",
    images: [{ url: "https://lh3.googleusercontent.com/aida-public/AB6AXuDwJBlhW9sAXliBgNRRj-Q9pE2lJPMmk8vKnUcFKSY9L9bq5RFsZ0DqtFy7z5bEUJqLXUqtPYB6PRveqozNF7leXkzPEOkgffhXRXFNIRbBOXXVSMfnDuC3GvMnVJFsAWniIhRVikV8gfGwZZTARCaWCYKJSYNhRIq3RISyCezoaIFvBN8prD2BcEEj_czLw0YBkYf45bGBOHWcznHC9sbtRTJdxq93yTNxInh59na5w_RVQ8PSBJyZ" }]
  },
  {
    id: "fb-2",
    name: "Team Building & Sự kiện doanh nghiệp",
    description: "Gắn kết đội ngũ trong không gian thiên nhiên khoáng đạt với các hoạt động ngoài trời hấp dẫn.",
    group: "ENTERTAINMENT",
    price: 0,
    operatingHours: "Theo yêu cầu",
    images: [{ url: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIxQBNPEniQ4lVy0qjv8s514zFEHazUiRJkYEVYu-5sofsjyWmmO5FpftA1c5KtU7IAmqH1AcBwb0JWZfiHNzUuvT7gUd2Y8j8fL_StJSycdh3z1YcO78PTlat_aRFNF7mKSySWv9CxltbScBX9VfNP4n4zXnty0aiR5Mh4r_o5xPJF0zvjXuJpxjTSPGuIp3TmXhAwdQE9wN_iFBRehmyiYdAmonacLw4fh_AzuCVOjjyQ6_ldYzR" }]
  },
  {
    id: "fb-3",
    name: "Spa & Trị liệu sức khỏe",
    description: "Tận hưởng dịch vụ trị liệu cá nhân hóa, giúp phục hồi năng lượng trong không gian tĩnh lặng tuyệt đối.",
    group: "SPA",
    price: 450000,
    operatingHours: "09:00 - 21:00",
    images: [{ url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgV7NUHLB1QsZ3N2qQTgSrRtMhbAIofx6kppgWvM7D0ENULujikfp9g-a_THuCarOqZzg0cT2arTytxBFNmrPLzmgFX6l4yVzMgAMDKPtIFJx0DhJI0XDAlk49c5WZdH40bdV36jPIEllfh6rbknATwh6GPcUuXL6j9jm20_Jr_aqF8yc_yOU7W-1TvHzcmPA8LEElEA_7aCHYRpS3kpbB-SB7snPEJUw3lFu9bgL0w2hmXgSC1Y7y" }]
  },
  {
    id: "fb-4",
    name: "Ẩm thực & Nhà hàng Ocean",
    description: "Khám phá bản đồ ẩm thực đặc sắc kết hợp tinh hoa địa phương và quốc tế bên tiếng sóng rì rào.",
    group: "RESTAURANT",
    price: 0,
    operatingHours: "06:00 - 22:00",
    images: [{ url: "https://lh3.googleusercontent.com/aida-public/AB6AXuCjT4JHdoPg1bdAO7fHLPj6l-lgiDOSvuQeJirUHNpjDSZ_ZqHAL2vRJyYP9uSNHX2YsWsUg0nhweQKAtXN9PgjmGRr2K84d0p065IJWR7z8k8OFzbqO_UTUb4E4vNQ_xWebxDcFVYEkZjLOvNo4G7rVEd-kSOC6GVbRyiugI-MT3b6zju8rpNAsUYZmdbsTGBcJ-4-HWPgGaMuJ7t5YyTLv-SL95vteB_utAFq9ypy_9ZOm-joKMqq" }]
  }
];

export default function Services() {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await apiGet<ServiceDTO[]>("/services");
        const activeServices = data.filter(s => s.status === "ACTIVE");
        setServices(activeServices.length > 0 ? activeServices : (FALLBACK_SERVICES as any[]));
      } catch (error) {
        console.error("Failed to load services from API:", error);
        setServices(FALLBACK_SERVICES as any[]);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const getGroupName = (group: string) => {
    switch (group) {
      case "SPA": return "Spa & Trị liệu";
      case "RESTAURANT": return "Nhà hàng & Ẩm thực";
      case "ENTERTAINMENT": return "Giải trí & Hoạt động";
      case "UTILITY": return "Tiện ích & Dịch vụ";
      default: return "Dịch vụ đi kèm";
    }
  };

  const getButtonText = (group: string) => {
    switch (group) {
      case "SPA": return "Đặt lịch ngay";
      case "RESTAURANT": return "Xem thực đơn";
      case "ENTERTAINMENT": return "Liên hệ đặt dịch vụ";
      default: return "Yêu cầu dịch vụ";
    }
  };

  return (
    <div className={styles.container} style={{ paddingTop: "2rem", paddingBottom: "var(--spacing-section-gap)" }}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>Dịch vụ tại The House</h1>
        <p className={styles.subtitle}>
          Chúng tôi mang đến những dịch vụ cao cấp, được thiết kế riêng nhằm tạo ra những khoảnh khắc đáng nhớ trong kỳ nghỉ của bạn.
        </p>
      </section>

      {/* Services Grid */}
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
            <style jsx>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : (
          services.map((service) => {
            const coverImage = service.images && service.images.length > 0
              ? service.images.find(img => img.isCover)?.url || service.images[0].url
              : "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=500&auto=format";

            return (
              <div key={service.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <img
                    className={styles.image}
                    alt={service.name}
                    src={coverImage}
                  />
                </div>
                <div className={styles.content}>
                  <div>
                    <span className="mono-text" style={{ 
                      fontSize: "0.75rem", 
                      color: "var(--color-primary)", 
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}>
                      {getGroupName(service.group)}
                    </span>
                    <h2 className={styles.cardTitle} style={{ marginTop: "0.25rem" }}>{service.name}</h2>
                    <p className={styles.cardDesc}>
                      {service.description || "Chưa có mô tả chi tiết cho dịch vụ này."}
                    </p>
                    <ul className={styles.detailsList}>
                      <li className={styles.detailItem}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>schedule</span>
                        Phục vụ: {service.operatingHours || "24/7"}
                      </li>
                      <li className={styles.detailItem}>
                        <span className={`material-symbols-outlined ${styles.icon}`}>payments</span>
                        Chi phí: {service.price > 0 ? `${service.price.toLocaleString("vi-VN")} ₫` : "Liên hệ / Theo thực đơn"}
                      </li>
                    </ul>
                  </div>
                  <button className={`mono-text ${styles.button}`}>
                    {getButtonText(service.group)}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
