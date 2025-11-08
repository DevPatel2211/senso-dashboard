import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.container}>
      {/* --- Hero Section --- */}
      <header className={styles.hero}>
        <h1>SensoGuard</h1>
        <p>Smart Wearable Health Companion</p>
      </header>

      {/* --- The Problem Section (from PPT) --- */}
      <section className={styles.section}>
        <h2>The Problem: Conventional Monitoring Gaps</h2>
        <ul>
          <li>
            <strong>Episodic vs. Continuous:</strong> Traditional check-ups provide snapshots, potentially missing critical events occurring between visits.
          </li>
          <li>
            <strong>Data Latency:</strong> Delays in receiving and analyzing data hinder timely intervention, especially for chronic conditions or post-operative care.
          </li>
          <li>
            <strong>Accessibility Barriers:</strong> Challenges for elderly, geographically isolated, or mobility-impaired individuals to access consistent monitoring.
          </li>
        </ul>
      </section>

      {/* --- The Solution Section (from PPT) --- */}
      <section className={styles.section}>
        <h2>The Solution: SensoGuard</h2>
        <p>
          SensoGuard shifts the focus from reaction to prediction. It's an IoT system designed for continuous, real-time collection and analysis of key physiological data, providing actionable insights through persistent data streams.
        </p>
        <br/>
        <p>
          Data is transmitted securely to a cloud backend and visualized on a web-based dashboard for easy access by patients or medical professionals.
        </p>
      </section>

      {/* --- Architecture Section (from PPT) --- */}
      <section className={styles.section}>
        <h2>System Architecture</h2>
        <div className={styles.cardContainer}>
          <div className={styles.card}>
            <h3>Physical Layer</h3>
            <p>ESP8266, MPU-6050 (Gyro), HX711 (Load Cell), LCD, Buzzer, DS18B20, MAX30102.</p>
          </div>
          <div className={styles.card}>
            <h3>Edge Processing</h3>
            <p>The ESP8266 reads sensors, handles local alerts (Buzzer/LCD), and processes data.</p>
          </div>
          <div className={styles.card}>
            <h3>Communication</h3>
            <p>Wi-Fi module connects to the router, sending data via HTTPS/REST protocol.</p>
          </div>
          <div className={styles.card}>
            <h3>Cloud Backend</h3>
            <p>Supabase receives, stores, and serves data via a Postgres Database and Realtime API.</p>
          </div>
          <div className={styles.card}>
            <h3>Frontend</h3>
            <p>A Next.js application hosted on Vercel, fetching and visualizing data for the end-user.</p>
          </div>
        </div>
      </section>
    </div>
  );
}