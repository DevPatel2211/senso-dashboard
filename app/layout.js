import './globals.css';
import styles from './Navbar.module.css'; // Import navbar styles
import Link from 'next/link';

export const metadata = {
  title: 'SensoGuard Dashboard',
  description: 'Real-time IoT Health Companion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* --- Main Navigation Bar --- */}
        <nav className={styles.navbar}>
          <Link href="/" className={styles.navLink}>
            Home
          </Link>
          <Link href="/data" className={styles.navLink}>
            Data Dashboard
          </Link>
        </nav>

        {/* --- Page Content --- */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}