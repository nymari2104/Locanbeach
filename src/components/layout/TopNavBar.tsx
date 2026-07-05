"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './TopNavBar.module.css';

export default function TopNavBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brand}>
          <img 
            alt="The House Logo" 
            className={styles.logo} 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC63fPEZhWhvU55JIkbViURS55j5q5kDcPbpZR_bwqR71tLJFxzIyWh9r4Q5vHFgGK_GOZteySv_qliX84iBS-yYz2dPlDP612DCrUiqnY85dv1SlVIgsZWHUbRpDlwVinqjxU5It6KoNcqZqbk3tjUd6MdRoc3Mdv56xmvr6DcYL4OIzDoJB7Ttk4yuoVPsmLkVO428zazuLQpng8HCorpThOwHyaDAtM8qiCjabmHTynCP7iX_5J7TC0f7O8AlrBigg" 
          />
          <div className={styles.logoTextWrapper}>
            <span className={styles.brandName}>The House</span>
            <span className={styles.brandSubname}>Lộc An Beach</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <ul className={`mono-text ${styles.navLinks}`}>
          <li>
            <Link href="/" className={`${styles.navLink} ${pathname === '/' ? styles.active : ''}`}>
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href="/book" className={`${styles.navLink} ${pathname === '/book' ? styles.active : ''}`}>
              Đặt phòng
            </Link>
          </li>
          <li>
            <Link href="/services" className={`${styles.navLink} ${pathname === '/services' ? styles.active : ''}`}>
              Dịch vụ
            </Link>
          </li>
          <li>
            <Link href="/combos" className={`${styles.navLink} ${pathname === '/combos' ? styles.active : ''}`}>
              Combo
            </Link>
          </li>
        </ul>

        {/* Trailing Actions */}
        <div className={styles.actions}>
          <div className={styles.icons}>
            {/* Using text fallback since Material Symbols font isn't explicitly downloaded yet, but we'll add it to layout */}
            <span className="material-symbols-outlined" style={{cursor: 'pointer'}}>language</span>
            <span className="material-symbols-outlined" style={{cursor: 'pointer'}}>account_circle</span>
          </div>
          <button className={`mono-text ${styles.primaryButton}`}>
            Đặt ngay
          </button>
        </div>
      </div>
    </nav>
  );
}
