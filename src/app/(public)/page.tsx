import styles from "./page.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.section}>
        <div className={styles.heroContent}>
          <div className={styles.heroTitleContainer}>
            <h1 className={`display-hero ${styles.heroTitle}`}>
              Trải nghiệm{" "}
              <span className={styles.inlineImageWrapper}>
                <img
                  alt="Biển"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFaINSSqfGjxVroSCxBZNJTtWIyPoBYe6IO26ypIkQ1nPcO9b2QNWm692y0WKhzhL9UKGiiHhq3L-wOaMNGuWHXTsDBgJ5IM9v6kNQx1RFWiemQtdu6E2MbFZoPQPucjVG3tZ9aG709wtv3ritRECDgTvPKUm97AJfGm5r30c9aFwTf7tCz4e42952A7MIBFv8sumC47K2Nkrd9jeusaKKIINXq8igj5jaYMGdjCYeFN9P-R1XX7Re"
                />
              </span>
              sự tĩnh lặng tại{" "}
              <span className={styles.inlineImageWrapper}>
                <img
                  alt="Kiến trúc"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBottP7WLvCqDwMyXEwNEUe0uGv4Ocx4FTNLhdbHGZvckcUQ93Qw9QbMDS67WIELXFpz8HxbfaevOVO88BiHSm-9iv3xe7_r0LRhPAETPbcWUXONJL8bjEJ1kJpoHCWNdeeVB1jpCsMpBGc2idLB1q0rktpJ_jXIzsbfcFKTaJ6E5th44m_3UwtQ83CwVfEl3rd4jNUvD91wOeMl6ZUpOKdq0JER0Lh13l4H7e7FahgfP87rhbIffVe"
                />
              </span>
              The House - Lộc An Beach
            </h1>
          </div>
          <div className={`mono-text ${styles.heroSubtitleContainer}`}>
            <p>Lộc An Beach, Bà Rịa - Vũng Tàu.</p>
            <p style={{ marginTop: "0.5rem" }}>Kiến trúc tối giản. Không gian mở.</p>
          </div>
        </div>
      </section>

      {/* Bento Grid Gallery */}
      <section className={styles.section}>
        <div className={styles.galleryGrid}>
          {/* Main Feature */}
          <div className={`${styles.galleryCard} ${styles.galleryMainCard}`}>
            <img
              className={styles.galleryImage}
              alt="Bento Grid 1"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCjT4JHdoPg1bdAO7fHLPj6l-lgiDOSvuQeJirUHNpjDSZ_ZqHAL2vRJyYP9uSNHX2YsWsUg0nhweQKAtXN9PgjmGRr2K84d0p065IJWR7z8k8OFzbqO_UTUb4E4vNQ_xWebxDcFVYEkZjLOvNo4G7rVEd-kSOC6GVbRyiugI-MT3b6zju8rpNAsUYZmdbsTGBcJ-4-HWPgGaMuJ7t5YyTLv-SL95vteB_utAFq9ypy_9ZOm-joKMqq"
            />
            <div className={styles.galleryMainContent}>
              <span className={`mono-text ${styles.badge}`}>Không gian</span>
              <h2 className="headline-lg" style={{ color: "var(--color-on-surface)", fontSize: "1.875rem" }}>
                Giao hòa cùng thiên nhiên
              </h2>
            </div>
          </div>

          {/* Small Feature 1 */}
          <div className={`${styles.galleryCard} ${styles.gallerySmallCard1}`}>
            <img
              className={`${styles.galleryImage} ${styles.gallerySmallCardImage}`}
              alt="Bento Grid 2"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgV7NUHLB1QsZ3N2qQTgSrRtMhbAIofx6kppgWvM7D0ENULujikfp9g-a_THuCarOqZzg0cT2arTytxBFNmrPLzmgFX6l4yVzMgAMDKPtIFJx0DhJI0XDAlk49c5WZdH40bdV36jPIEllfh6rbknATwh6GPcUuXL6j9jm20_Jr_aqF8yc_yOU7W-1TvHzcmPA8LEElEA_7aCHYRpS3kpbB-SB7snPEJUw3lFu9bgL0w2hmXgSC1Y7y"
            />
            <div className={styles.gallerySmallContent1}>
              <h3 style={{ fontWeight: "bold", marginBottom: "0.25rem" }}>Kiến trúc tối giản</h3>
              <p className="mono-text" style={{ fontSize: "0.75rem", color: "var(--color-on-surface-variant)" }}>
                Đường nét tinh tế, loại bỏ sự dư thừa.
              </p>
            </div>
          </div>

          {/* Small Feature 2 */}
          <div className={`${styles.galleryCard} ${styles.gallerySmallCard2}`}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "2.25rem", color: "var(--color-primary)" }}>
                spa
              </span>
              <span
                className="mono-text"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-on-surface-variant)",
                  border: "1px solid var(--color-whisper-border)",
                  borderRadius: "9999px",
                  padding: "0.25rem 0.5rem",
                }}
              >
                Tiện nghi
              </span>
            </div>
            <div>
              <h3 style={{ fontWeight: "bold", fontSize: "1.25rem", marginBottom: "0.5rem" }}>Tiện ích cao cấp</h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)" }}>
                Tận hưởng dịch vụ cá nhân hóa trong không gian tĩnh lặng tuyệt đối.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privileged Complementary Services (Highlights) */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={`mono-text ${styles.sectionPreTitle}`}>Đặc quyền nghỉ dưỡng</p>
          <h2 className={styles.sectionTitle}>Trải nghiệm hoàn toàn miễn phí</h2>
          <p className={styles.sectionDesc}>Những đặc quyền tiện ích nội khu được chăm chút tỉ mỉ cho kỳ nghỉ trọn vẹn.</p>
        </div>
        
        <div className={styles.highlightsGrid}>
          {/* USP 1 */}
          <div className={styles.highlightCard}>
            <span className={`material-symbols-outlined ${styles.highlightIcon}`}>bed</span>
            <h3 className={styles.highlightTitle}>Nệm lò xo cao cấp 5★</h3>
            <p className={styles.highlightDesc}>
              100% phòng nghỉ tại The House được trang bị nệm lò xo cao cấp tiêu chuẩn khách sạn 5 sao, mang lại giấc ngủ sâu êm ái.
            </p>
          </div>

          {/* USP 2 */}
          <div className={styles.highlightCard}>
            <span className={`material-symbols-outlined ${styles.highlightIcon}`}>coffee</span>
            <h3 className={styles.highlightTitle}>Bữa sáng & Cà phê</h3>
            <p className={styles.highlightDesc}>
              Thưởng thức bữa sáng lành mạnh kèm ly cà phê sáng đậm đà được phục vụ hoàn toàn miễn phí từ 06:30 - 10:00 hàng ngày.
            </p>
          </div>

          {/* USP 3 */}
          <div className={styles.highlightCard}>
            <span className={`material-symbols-outlined ${styles.highlightIcon}`}>countertops</span>
            <h3 className={styles.highlightTitle}>Khu bếp nấu chung</h3>
            <p className={styles.highlightDesc}>
              Tự do mua sắm và chế biến hải sản tươi sống địa phương với khu bếp chung trang bị đầy đủ bếp nấu, xoong nồi và gia vị.
            </p>
          </div>

          {/* USP 4 */}
          <div className={styles.highlightCard}>
            <span className={`material-symbols-outlined ${styles.highlightIcon}`}>pool</span>
            <h3 className={styles.highlightTitle}>Bể bơi & Hồ câu cá</h3>
            <p className={styles.highlightDesc}>
              Thư giãn tại bể bơi ngoài trời mát lạnh hoặc câu cá giải trí tại hồ câu tự nhiên rợp bóng mát trong khuôn viên resort.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Room Types */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={`mono-text ${styles.sectionPreTitle}`}>Không gian lưu trú</p>
          <h2 className={styles.sectionTitle}>Hạng phòng nổi bật</h2>
          <p className={styles.sectionDesc}>Kết hợp hoàn hảo giữa phòng nghỉ tối giản hiện đại và lều Glamping cao cấp sát biển.</p>
        </div>

        <div className={styles.roomsGrid}>
          {/* Room 1 */}
          <div className={styles.roomCard}>
            <div className={styles.roomCardImageWrapper}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzWvpCsujE0gUdYCAMms926CDG6fi2vNOn06xIBtxSmWZDdQ9oOeYm3sHs0M_3INXeGLZTdPLfaa8rG1zPmqZrmSO-k9Npu3H77Y98xJPMPQBq6JN6EeeTgceGCcrdV711q-OjCJRec0FLDh4CE1M4L3FSppdewyoRFORhsJSPpWC-kYdx7HGrrZ74rmPcM58idM-j6amNsPBIkwdSgH1j682rSmP_j2onCkkjBfdVRiv_9S3Uf2rm" 
                alt="Standard Sea View" 
                className={styles.roomCardImage} 
              />
              <span className={styles.roomCardBadge}>Phổ biến</span>
            </div>
            <div className={styles.roomCardBody}>
              <h3 className={styles.roomCardTitle}>Standard Sea View</h3>
              <div className={styles.roomCardSpecs}>
                <span className={styles.roomCardSpecItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>groups</span> 2 khách
                </span>
                <span className={styles.roomCardSpecItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>balcony</span> Ban công biển
                </span>
              </div>
              <p className={styles.roomCardDesc}>
                Không gian ấm cúng, thiết kế tinh tế với ban công hướng biển xanh mát, lý tưởng cho những cặp đôi tìm kiếm sự lãng mạn.
              </p>
            </div>
            <div className={styles.roomCardFooter}>
              <div className={styles.roomCardPrice}>
                <span className={styles.roomCardPriceLabel}>Chỉ từ</span>
                <span className={styles.roomCardPriceVal}>1,800,000₫ / đêm</span>
              </div>
              <Link href="/book" className={styles.roomCardButton}>
                Đặt phòng
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Room 2 */}
          <div className={styles.roomCard}>
            <div className={styles.roomCardImageWrapper}>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyR9mfIQ7tfteUMNYUvph10Uk-2Uq1mf1WkBJGTynaOB2uX5nQfLUb3TGQr046-vQegB7OOC9xlKvvJYSNhY2D7kdhT92MsAKyf_nsXVOVG5JO_JqJpqDXoRVjnDpnzJfd2DQ0NVjZCvcgdKQ5HgDo6ZB3q_bJxBzZgSpQ1mzA6jA9WlpP896GwPFgvKfrTgUm0DSAs1CU6Gfy-vGAMPWlVsDsa4fYR0H0UeIg3mYs8RhZIYN_s0_4" 
                alt="Family Suite" 
                className={styles.roomCardImage} 
              />
              <span className={styles.roomCardBadge}>Sang trọng</span>
            </div>
            <div className={styles.roomCardBody}>
              <h3 className={styles.roomCardTitle}>Family Suite</h3>
              <div className={styles.roomCardSpecs}>
                <span className={styles.roomCardSpecItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>groups</span> 5 khách
                </span>
                <span className={styles.roomCardSpecItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>meeting_room</span> 2 Phòng ngủ
                </span>
              </div>
              <p className={styles.roomCardDesc}>
                Căn hộ gia đình rộng rãi, có không gian sinh hoạt chung ấm cúng kết nối và ban công rộng mở ngắm trọn vẹn cảnh biển hoàng hôn.
              </p>
            </div>
            <div className={styles.roomCardFooter}>
              <div className={styles.roomCardPrice}>
                <span className={styles.roomCardPriceLabel}>Chỉ từ</span>
                <span className={styles.roomCardPriceVal}>4,500,000₫ / đêm</span>
              </div>
              <Link href="/book" className={styles.roomCardButton}>
                Đặt phòng
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_forward</span>
              </Link>
            </div>
          </div>

          {/* Room 3 */}
          <div className={styles.roomCard}>
            <div className={styles.roomCardImageWrapper}>
              <img 
                src="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=500&auto=format" 
                alt="Glamping Tent" 
                className={styles.roomCardImage} 
              />
              <span className={styles.roomCardBadge}>Trải nghiệm</span>
            </div>
            <div className={styles.roomCardBody}>
              <h3 className={styles.roomCardTitle}>Lều Glamping Cao Cấp</h3>
              <div className={styles.roomCardSpecs}>
                <span className={styles.roomCardSpecItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>nature_people</span> Gần gũi thiên nhiên
                </span>
                <span className={styles.roomCardSpecItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>deck</span> Sân cỏ sát biển
                </span>
              </div>
              <p className={styles.roomCardDesc}>
                Trải nghiệm cắm trại cao cấp ngoài trời trên bãi cỏ xanh mát. Lều bạt vintage chống thấm nước, trang bị đệm ngủ ấm áp và quạt máy.
              </p>
            </div>
            <div className={styles.roomCardFooter}>
              <div className={styles.roomCardPrice}>
                <span className={styles.roomCardPriceLabel}>Chỉ từ</span>
                <span className={styles.roomCardPriceVal}>800,000₫ / đêm</span>
              </div>
              <Link href="/book" className={styles.roomCardButton}>
                Đặt lều
                <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Asymmetric Layout */}
      <section className={styles.section}>
        <div className={styles.servicesFlex}>
          <div className={styles.servicesText}>
            <h2 className="headline-lg" style={{ marginBottom: "1rem" }}>
              Dịch vụ<br />Nổi bật
            </h2>
            <p style={{ color: "var(--color-on-surface-variant)", marginBottom: "2rem" }}>
              Những trải nghiệm được thiết kế riêng, mang đậm dấu ấn cá nhân tại Lộc An Beach.
            </p>
            <Link
              href="/services"
              className="mono-text"
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--color-primary)" }}
            >
              Xem tất cả dịch vụ <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>arrow_forward</span>
            </Link>
          </div>

          <div className={styles.servicesList}>
            {/* Service 1 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardLeft}`}>
              <div className={styles.serviceImageWrapper}>
                <img
                  alt="Service 1"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwJBlhW9sAXliBgNRRj-Q9pE2lJPMmk8vKnUcFKSY9L9bq5RFsZ0DqtFy7z5bEUJqLXUqtPYB6PRveqozNF7leXkzPEOkgffhXRXFNIRbBOXXVSMfnDuC3GvMnVJFsAWniIhRVikV8gfGwZZTARCaWCYKJSYNhRIq3RISyCezoaIFvBN8prD2BcEEj_czLw0YBkYf45bGBOHWcznHC9sbtRTJdxq93yTNxInh59na5w_RVQ8PSBJyZ"
                />
              </div>
              <div>
                <h3 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>Tiệc cưới bên bờ biển</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>
                  Không gian lãng mạn, tinh tế cho ngày trọng đại.
                </p>
              </div>
            </div>

            {/* Service 2 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardRight}`}>
              <div className={styles.serviceImageWrapper}>
                <img
                  alt="Service 2"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIxQBNPEniQ4lVy0qjv8s514zFEHazUiRJkYEVYu-5sofsjyWmmO5FpftA1c5KtU7IAmqH1AcBwb0JWZfiHNzUuvT7gUd2Y8j8fL_StJSycdh3z1YcO78PTlat_aRFNF7mKSySWv9CxltbScBX9VfNP4n4zXnty0aiR5Mh4r_o5xPJF0zvjXuJpxjTSPGuIp3TmXhAwdQE9wN_iFBRehmyiYdAmonacLw4fh_AzuCVOjjyQ6_ldYzR"
                />
              </div>
              <div>
                <h3 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>Team building</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>
                  Gắn kết đội ngũ trong không gian thiên nhiên khoáng đạt.
                </p>
              </div>
            </div>

            {/* Service 3 */}
            <div className={`${styles.serviceCard} ${styles.serviceCardCenter}`}>
              <div className={styles.serviceImageWrapper}>
                <span className="material-symbols-outlined" style={{ fontSize: "2.25rem", color: "var(--color-primary)" }}>
                  card_travel
                </span>
              </div>
              <div>
                <h3 style={{ fontWeight: "bold", fontSize: "1.125rem" }}>Combo nghỉ dưỡng</h3>
                <p style={{ fontSize: "0.875rem", color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}>
                  Trải nghiệm trọn vẹn với các gói dịch vụ cao cấp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resort Policies */}
      <section className={styles.section} style={{ borderTop: "1px solid var(--color-whisper-border)", paddingTop: "4rem" }}>
        <div className={styles.sectionHeader}>
          <p className={`mono-text ${styles.sectionPreTitle}`}>Nội quy & Hướng dẫn</p>
          <h2 className={styles.sectionTitle}>Quy định chung tại Resort</h2>
          <p className={styles.sectionDesc}>Hãy cùng The House chung tay gìn giữ một không gian nghỉ dưỡng an lành và tôn trọng thiên nhiên.</p>
        </div>

        <div className={styles.policiesGrid}>
          {/* Policy 1 */}
          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <span className={`material-symbols-outlined ${styles.policyIcon}`}>schedule</span>
              <h3 className={styles.policyTitle}>Nhận / Trả phòng</h3>
            </div>
            <ul className={styles.policyList}>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Giờ check-in: từ 14:00 hàng ngày.
              </li>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Giờ check-out: trước 12:00 trưa.
              </li>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Nhận sớm/trả muộn tính phụ thu 200k (tùy tình trạng phòng).
              </li>
            </ul>
          </div>

          {/* Policy 2 */}
          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <span className={`material-symbols-outlined ${styles.policyIcon}`}>child_care</span>
              <h3 className={styles.policyTitle}>Trẻ em & Giường phụ</h3>
            </div>
            <ul className={styles.policyList}>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Trẻ dưới 6 tuổi: Miễn phí (ngủ chung giường bố mẹ).
              </li>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Trẻ từ 6 - 12 tuổi: Phụ thu 200k/đêm (có giường phụ).
              </li>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Trẻ trên 12 tuổi tính phí như người lớn.
              </li>
            </ul>
          </div>

          {/* Policy 3 */}
          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <span className={`material-symbols-outlined ${styles.policyIcon}`}>pets</span>
              <h3 className={styles.policyTitle}>Thú cưng & Vật nuôi</h3>
            </div>
            <ul className={styles.policyList}>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Nghiêm cấm mang theo vật nuôi vào khuôn viên.
              </li>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Giữ gìn không gian yên tĩnh và vệ sinh chung của khu nghỉ dưỡng.
              </li>
            </ul>
          </div>

          {/* Policy 4 */}
          <div className={styles.policyCard}>
            <div className={styles.policyHeader}>
              <span className={`material-symbols-outlined ${styles.policyIcon}`}>smoke_free</span>
              <h3 className={styles.policyTitle}>Hút thuốc lá</h3>
            </div>
            <ul className={styles.policyList}>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Nghiêm cấm hút thuốc bên trong phòng nghỉ.
              </li>
              <li className={styles.policyListItem}>
                <span className={styles.policyBullet}>•</span> Quý khách vui lòng sử dụng khu vực ngoài trời được chỉ định.
              </li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
