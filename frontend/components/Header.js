// components/Header.js
import Image from "next/image";
import styles from "../styles/Header.module.css";

const Header = ({ version }) => {
  return (
    <header className={styles.header}>
      <div className={styles.logoContainer}>
        <Image src="/elastic-logo.png" alt="Elastic Logo" width={40} height={40} />
        <h1 className={styles.title}>
          Elastic Agent Diagnostic Analyzer
          <span className={styles.version}>v{version}</span>
        </h1>
      </div>
    </header>
  );
};

export default Header;
