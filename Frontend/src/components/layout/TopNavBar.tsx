"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './TopNavBar.module.css';

export default function TopNavBar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const hideBookButton = pathname === '/book' || pathname.startsWith('/rooms/');

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen]);

  const navItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/book', label: 'Đặt phòng' },
    { href: '/services', label: 'Dịch vụ' },
    { href: '/combos', label: 'Combo' },
  ];

  return (
    <>
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
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={`${styles.navLink} ${pathname === item.href ? styles.active : ''}`}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Trailing Actions */}
          <div className={styles.actions}>
            <div className={styles.icons}>
              <span className="material-symbols-outlined" style={{cursor: 'pointer'}}>language</span>
              <Link href="/login" title="Đăng nhập hệ thống" style={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <span className="material-symbols-outlined" style={{cursor: 'pointer'}}>account_circle</span>
              </Link>
            </div>
            {!hideBookButton && (
              <Link href="/book" className={`mono-text ${styles.primaryButton}`}>
                Đặt ngay
              </Link>
            )}

            {/* Hamburger Button (Mobile only) */}
            <button
              className={styles.hamburger}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Mở menu"
            >
              <span className="material-symbols-outlined">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div className={styles.overlay} onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <div className={`${styles.drawer} ${isMenuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <Link href="/" className={styles.brand} onClick={() => setIsMenuOpen(false)}>
            <img 
              alt="The House Logo" 
              className={styles.logo} 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC63fPEZhWhvU55JIkbViURS55j5q5kDcPbpZR_bwqR71tLJFxzIyWh9r4Q5vHFgGK_GOZteySv_qliX84iBS-yYz2dPlDP612DCrUiqnY85dv1SlVIgsZWHUbRpDlwVinqjxU5It6KoNcqZqbk3tjUd6MdRoc3Mdv56xmvr6DcYL4OIzDoJB7Ttk4yuoVPsmLkVO428zazuLQpng8HCorpThOwHyaDAtM8qiCjabmHTynCP7iX_5J7TC0f7O8AlrBigg" 
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className={styles.brandName}>The House</span>
              <span className={styles.brandSubname}>Lộc An Beach</span>
            </div>
          </Link>
          <button className={styles.drawerClose} onClick={() => setIsMenuOpen(false)}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <ul className={styles.drawerNavLinks}>
          {navItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`${styles.drawerNavLink} ${pathname === item.href ? styles.drawerNavLinkActive : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
                <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', opacity: 0.5 }}>
                  chevron_right
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {!hideBookButton && (
          <div className={styles.drawerFooter}>
            <Link href="/book" className={`mono-text ${styles.drawerBookButton}`} onClick={() => setIsMenuOpen(false)}>
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>hotel</span>
              Đặt phòng ngay
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
