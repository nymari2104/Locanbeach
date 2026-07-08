import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Left Side */}
        <div>
          <div className={`headline-lg ${styles.brandName}`}>The House</div>
          <p className={`mono-text ${styles.copyright}`}>
            © 2024 The House - Lộc An Beach. Kiến trúc bởi Studio Minimal.
          </p>
        </div>

        {/* Right Side Links */}
        <ul className={`mono-text ${styles.links}`}>
          <li><Link href="/about" className={styles.link}>Về chúng tôi</Link></li>
          <li><Link href="/privacy" className={styles.link}>Chính sách bảo mật</Link></li>
          <li><Link href="/contact" className={styles.link}>Liên hệ</Link></li>
          <li><Link href="/careers" className={styles.link}>Tuyển dụng</Link></li>
        </ul>
      </div>
    </footer>
  );
}
