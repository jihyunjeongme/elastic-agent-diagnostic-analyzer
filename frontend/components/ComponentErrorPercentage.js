import React, { useMemo } from "react";
import styles from "../styles/ComponentErrorPercentage.module.css";

const ComponentErrorPercentage = ({ logs }) => {
  const componentErrors = useMemo(() => {
    const errorCounts = {};
    const totalCounts = {};

    logs.forEach((log) => {
      const componentId = log.component?.id || "Unknown";
      totalCounts[componentId] = (totalCounts[componentId] || 0) + 1;

      if (log["log.level"] === "error") {
        errorCounts[componentId] = (errorCounts[componentId] || 0) + 1;
      }
    });

    return Object.keys(totalCounts)
      .map((componentId) => ({
        id: componentId,
        errorPercentage: ((errorCounts[componentId] || 0) / totalCounts[componentId]) * 100,
        errorCount: errorCounts[componentId] || 0,
        totalCount: totalCounts[componentId],
      }))
      .sort((a, b) => b.errorPercentage - a.errorPercentage);
  }, [logs]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Component Error Percentages</h2>
      <div className={styles.componentList}>
        {componentErrors.map((component) => (
          <div key={component.id} className={styles.componentItem}>
            <div className={styles.componentInfo}>
              <span className={styles.componentId}>{component.id}</span>
              <span className={styles.errorPercentage}>
                {component.errorPercentage.toFixed(2)}%
              </span>
            </div>
            <div className={styles.percentageBar}>
              <div
                className={styles.errorBar}
                style={{ width: `${component.errorPercentage}%` }}
              ></div>
            </div>
            <div className={styles.counts}>
              <span>Errors: {component.errorCount}</span>
              <span>Total: {component.totalCount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComponentErrorPercentage;
