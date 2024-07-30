import React from "react";
import styles from "../styles/LogsInfo.module.css";

const LogsInfo = ({ total, fatal, error, warn, info, debug, trace }) => {
  const calculatePercentage = (value) => ((value / total) * 100).toFixed(2);

  const logLevels = [
    { name: "Fatal", value: fatal, style: styles.fatalText, barStyle: styles.fatalBar },
    { name: "Error", value: error, style: styles.errorText, barStyle: styles.errorBar },
    { name: "Warn", value: warn, style: styles.warnText, barStyle: styles.warnBar },
    { name: "Info", value: info, style: styles.infoText, barStyle: styles.infoBar },
    { name: "Debug", value: debug, style: styles.debugText, barStyle: styles.debugBar },
    { name: "Trace", value: trace, style: styles.traceText, barStyle: styles.traceBar },
  ];

  return (
    <div className={styles.logsInfo}>
      <h2 className={styles.title}>Logs Info</h2>
      <div className={styles.stats}>
        <div>
          Total Logs: <span className={styles.count}>{total}</span>
        </div>
        {logLevels.map((level) => (
          <div key={level.name} className={styles.logLevel}>
            <span className={level.style}>{level.name}</span>:{" "}
            <span className={styles.count}>
              {level.value}{" "}
              {level.value > 0 && (
                <span className={styles.percentage}>({calculatePercentage(level.value)}%)</span>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className={styles.percentageBar}>
        {logLevels.map((level) => (
          <div
            key={level.name}
            className={level.barStyle}
            style={{ width: `${calculatePercentage(level.value)}%` }}
            title={`${level.name}: ${calculatePercentage(level.value)}%`}
          />
        ))}
      </div>
      <div className={styles.legend}>
        {logLevels.map((level) => (
          <div key={level.name} className={styles.legendItem}>
            <div className={styles[`${level.name.toLowerCase()}Legend`]} />
            <span>{level.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LogsInfo;
