import styles from "../styles/CommonStyles.module.css";

export default function VersionInfo({ buildTime, commit, snapshot, version }) {
  return (
    <div className={`${styles.container} w-full`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Version Information</h3>
      </div>
      <div className={styles.content}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <dt className={styles.label}>Build Time</dt>
            <dd className={styles.value}>{buildTime}</dd>
          </div>
          <div>
            <dt className={styles.label}>Version</dt>
            <dd className={styles.value}>{version}</dd>
          </div>
          <div>
            <dt className={styles.label}>Snapshot</dt>
            <dd className={styles.value}>{snapshot.toString()}</dd>
          </div>
          <div>
            <dt className={styles.label}>Commit</dt>
            <dd className={styles.value}>{commit}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
