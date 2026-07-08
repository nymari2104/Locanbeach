import styles from "./page.module.css";
import Link from "next/link";

export default function AdminNewRoom() {
  return (
    <div>
      {/* Page Header */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <p className={`mono-text ${styles.preTitle}`}>Quản lý phòng &gt; Thêm mới</p>
          <h1 className={styles.title}>Thêm phòng mới</h1>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/rooms">
            <button className={`mono-text ${styles.buttonCancel}`} type="button">
              Hủy
            </button>
          </Link>
          <button className={`mono-text ${styles.buttonSubmit}`} form="add-room-form" type="submit">
            Lưu phòng
          </button>
        </div>
      </header>

      {/* Form Bento Grid */}
      <form className={styles.formGrid} id="add-room-form">
        {/* Left Column: Primary Details */}
        <div className={styles.formLeft}>
          {/* Basic Info Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Thông tin cơ bản</h3>
            <div className={styles.inputsGrid}>
              <div className={styles.formGroup}>
                <label className={`mono-text ${styles.label}`}>Tên / Số phòng</label>
                <input
                  className={styles.input}
                  placeholder="VD: P101, Villa Biển..."
                  required
                  type="text"
                />
              </div>

              <div className={styles.formGroup}>
                <label className={`mono-text ${styles.label}`}>Loại phòng</label>
                <div className={styles.selectWrapper}>
                  <select className={styles.select} required>
                    <option disabled defaultValue="" value="">
                      Chọn loại phòng
                    </option>
                    <option value="standard">Standard</option>
                    <option value="deluxe">Deluxe</option>
                    <option value="suite">Suite</option>
                    <option value="villa">Villa</option>
                  </select>
                  <span className={`material-symbols-outlined ${styles.selectArrow}`}>expand_more</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={`mono-text ${styles.label}`}>Giá mỗi đêm (VND)</label>
                <div className={styles.inputAddonWrapper}>
                  <input
                    className={styles.input}
                    placeholder="2,500,000"
                    required
                    type="number"
                  />
                  <span className={`mono-text ${styles.inputAddonRight}`}>₫</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={`mono-text ${styles.label}`}>Diện tích (m²)</label>
                <div className={styles.inputAddonWrapper}>
                  <input
                    className={styles.input}
                    placeholder="45"
                    required
                    type="number"
                  />
                  <span className={`mono-text ${styles.inputAddonRight}`}>m²</span>
                </div>
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginTop: "1.5rem" }}>
              <label className={`mono-text ${styles.label}`}>Mô tả ngắn</label>
              <textarea
                className={styles.textarea}
                placeholder="Nhập mô tả nổi bật về phòng này..."
              />
            </div>
          </div>

          {/* Amenities Card */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Tiện ích cung cấp</h3>
            <div className={styles.amenitiesGrid}>
              {/* Checkbox Item */}
              <label className={styles.checkboxLabel}>
                <div className={styles.customCheckbox}>
                  <input className={styles.checkboxInput} type="checkbox" />
                  <span className={`material-symbols-outlined ${styles.checkboxCheck}`}>check</span>
                </div>
                <span className={`mono-text ${styles.checkboxText}`}>Wifi miễn phí</span>
              </label>

              <label className={styles.checkboxLabel}>
                <div className={styles.customCheckbox}>
                  <input className={styles.checkboxInput} type="checkbox" />
                  <span className={`material-symbols-outlined ${styles.checkboxCheck}`}>check</span>
                </div>
                <span className={`mono-text ${styles.checkboxText}`}>Hồ bơi riêng</span>
              </label>

              <label className={styles.checkboxLabel}>
                <div className={styles.customCheckbox}>
                  <input className={styles.checkboxInput} type="checkbox" />
                  <span className={`material-symbols-outlined ${styles.checkboxCheck}`}>check</span>
                </div>
                <span className={`mono-text ${styles.checkboxText}`}>Bồn tắm</span>
              </label>

              <label className={styles.checkboxLabel}>
                <div className={styles.customCheckbox}>
                  <input className={styles.checkboxInput} type="checkbox" />
                  <span className={`material-symbols-outlined ${styles.checkboxCheck}`}>check</span>
                </div>
                <span className={`mono-text ${styles.checkboxText}`}>Ban công</span>
              </label>

              <label className={styles.checkboxLabel}>
                <div className={styles.customCheckbox}>
                  <input className={styles.checkboxInput} type="checkbox" />
                  <span className={`material-symbols-outlined ${styles.checkboxCheck}`}>check</span>
                </div>
                <span className={`mono-text ${styles.checkboxText}`}>Minibar</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Media */}
        <div className={styles.formRight}>
          <div className={`${styles.card} ${styles.mediaCard}`}>
            <h3 className={styles.cardTitle}>Hình ảnh</h3>
            <div className={styles.uploadArea}>
              <div className={styles.uploadIconWrapper}>
                <span className={`material-symbols-outlined ${styles.uploadIcon}`}>cloud_upload</span>
              </div>
              <p className={`mono-text ${styles.uploadTitle}`}>Nhấn để tải ảnh lên</p>
              <p className={`mono-text ${styles.uploadDesc}`}>hoặc kéo thả vào đây</p>
              <p className={`mono-text ${styles.uploadLimit}`}>Hỗ trợ: JPG, PNG (Tối đa 5MB)</p>
            </div>
            {/* Preview Area */}
            <div className={styles.previewGrid}>
              <div className={styles.previewBox}>
                <span className={`material-symbols-outlined ${styles.previewIcon}`}>image</span>
              </div>
              <div className={styles.previewBox}>
                <span className={`material-symbols-outlined ${styles.previewIcon}`}>image</span>
              </div>
              <div className={styles.previewBox}>
                <span className={`material-symbols-outlined ${styles.addPreviewIcon}`}>add</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
