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
              The House
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
    </>
  );
}
