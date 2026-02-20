"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMenu, FiX } from "react-icons/fi";
import { usePathname } from "next/navigation";
import styles from "@/styles/navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Keep behavior: show only on home.
  if (pathname !== "/") return null;

  const links = [
    { name: "Case Studies / Solutions", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <header className={styles.header}>
      <nav
        className={`${styles.navbar} max-w-7xl mx-auto px-6 py-4 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-10">
          <Link href="/" className={styles.logoWrapper}>
            <Image
              src="/logo.svg"
              alt="Klickshare Logo"
              width={80}
              height={70}
              className={styles.logoImage}
            />
          </Link>

          <div className={`${styles.navLinks} hidden md:flex`}>
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.navLink} ${
                  pathname === link.href ? styles.activeLink : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>

        <div className={`${styles.authSection} relative`}>
          <Link href="/auth" className={styles.tryNow}>
            <Image
              src="/try-now.svg"
              alt="icon"
              width={20}
              height={20}
              className="inline mr-2"
            />
            Try Now
          </Link>

          <button
            className={`${styles.menuToggle} md:hidden ml-4`}
            onClick={() => setMenuOpen(true)}
          >
            <FiMenu size={26} />
          </button>
        </div>
      </nav>

      <div className={`${styles.mobileMenu} ${menuOpen ? styles.active : ""}`}>
        <button
          className={styles.closeButton}
          onClick={() => setMenuOpen(false)}
        >
          <FiX size={26} />
        </button>

        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            {link.name}
          </Link>
        ))}

        <div className="mt-4">
          <Link
            href="/auth"
            className={styles.mobileLink}
            onClick={() => setMenuOpen(false)}
          >
            Login / Sign Up
          </Link>
        </div>
      </div>

      {menuOpen && (
        <div
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
}
