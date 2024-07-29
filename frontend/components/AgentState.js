import styles from "../styles/CommonStyles.module.css";

export default function AgentState({ fleetMessage, fleetState, logLevel, message, state }) {
  return (
    <div className={`${styles.container} w-full`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Agent State</h3>
      </div>
      <div className={styles.content}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <dt className={styles.label}>Fleet Message</dt>
            <dd className={styles.value}>{fleetMessage}</dd>
          </div>
          <div>
            <dt className={styles.label}>Fleet State</dt>
            <dd className={styles.value}>{fleetState}</dd>
          </div>
          <div>
            <dt className={styles.label}>Log Level</dt>
            <dd className={styles.value}>{logLevel}</dd>
          </div>
          <div>
            <dt className={styles.label}>Message</dt>
            <dd className={styles.value}>{message}</dd>
          </div>
          <div>
            <dt className={styles.label}>State</dt>
            <dd className={styles.value}>{state}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
