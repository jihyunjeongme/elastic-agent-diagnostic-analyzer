import React, { useMemo, useState, useCallback, useEffect } from "react";
import styles from "../styles/EventsOverTime.module.css";
import { format, parseISO } from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const INITIAL_DISPLAYED_LOGS = 5;

const logLevelColors = {
  ERROR: "rgb(248,113,113)",
  WARN: "rgb(251,191,36)",
  INFO: "rgb(96,165,250)",
  DEBUG: "rgb(52,211,153)",
  TRACE: "rgb(209,213,219)",
  FATAL: "rgb(220,38,38)",
};

const EventsOverTime = ({
  logs,
  selectedLogLevel,
  isInitialView,
  timeRange,
  startDate,
  endDate,
}) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [displayedLogsCount, setDisplayedLogsCount] = useState(INITIAL_DISPLAYED_LOGS);
  const [selectedError, setSelectedError] = useState(null);
  const [labelWidth, setLabelWidth] = useState(400);
  const [textWidth, setTextWidth] = useState({});

  const processedData = useMemo(() => {
    if (!logs || logs.length === 0) {
      return { data: [], xLabels: [], yLabels: [], totalLogs: 0 };
    }

    const upperCaseSelectedLogLevel = selectedLogLevel.toUpperCase();

    const filteredLogs = logs.filter((log) => {
      const logLevel = log["log.level"]?.toUpperCase();
      if (isInitialView && upperCaseSelectedLogLevel === "ALL") {
        return logLevel === "ERROR" || logLevel === "WARN";
      }
      return upperCaseSelectedLogLevel === "ALL" || logLevel === upperCaseSelectedLogLevel;
    });

    const groupedLogs = {};

    filteredLogs.forEach((log) => {
      const utcDate = new Date(log["@timestamp"]);
      const date = utcDate.toISOString().split("T")[0];
      if (!groupedLogs[log.message]) {
        groupedLogs[log.message] = {
          total: 0,
          dates: {},
          components: new Set(),
          firstTimestamp: utcDate,
          lastTimestamp: utcDate,
          logLevel: log["log.level"]?.toUpperCase() || "UNKNOWN",
        };
      }
      groupedLogs[log.message].total++;
      groupedLogs[log.message].dates[date] = (groupedLogs[log.message].dates[date] || 0) + 1;
      groupedLogs[log.message].components.add(log.component?.id || "N/A");

      if (utcDate < groupedLogs[log.message].firstTimestamp) {
        groupedLogs[log.message].firstTimestamp = utcDate;
      }
      if (utcDate > groupedLogs[log.message].lastTimestamp) {
        groupedLogs[log.message].lastTimestamp = utcDate;
      }
    });

    const sortedLogs = Object.entries(groupedLogs).sort(([, a], [, b]) => b.total - a.total);

    const allDates = [
      ...new Set(
        filteredLogs.map((log) => new Date(log["@timestamp"]).toISOString().split("T")[0])
      ),
    ].sort();

    const displayedLogs = sortedLogs.slice(0, displayedLogsCount);
    const heatmapData = displayedLogs.map(([, data]) =>
      allDates.map((date) => data.dates[date] || 0)
    );

    return {
      data: heatmapData,
      xLabels: allDates,
      yLabels: displayedLogs.map(([error, data]) => ({
        message: error,
        total: data.total,
        components: Array.from(data.components),
        firstTimestamp: data.firstTimestamp,
        lastTimestamp: data.lastTimestamp,
        logLevel: data.logLevel,
      })),
      totalLogs: sortedLogs.length,
    };
  }, [logs, selectedLogLevel, isInitialView, displayedLogsCount]);

  const getColor = useCallback((value, logLevel) => {
    const baseColor = logLevelColors[logLevel] || logLevelColors.INFO;
    if (value === 0) return "rgb(255,255,255)";
    const alpha = Math.min(value / 10, 1);
    return `rgba(${parseInt(baseColor.slice(4, -1).split(",")[0])}, ${parseInt(
      baseColor.slice(4, -1).split(",")[1]
    )}, ${parseInt(baseColor.slice(4, -1).split(",")[2])}, ${alpha})`;
  }, []);

  const handleMoreClick = useCallback((message) => {
    setSelectedError(message);
  }, []);

  const handleShowMore = useCallback(() => {
    setDisplayedLogsCount((prevCount) => prevCount + 5);
  }, []);

  const handleShowLess = useCallback(() => {
    setDisplayedLogsCount((prevCount) => Math.max(INITIAL_DISPLAYED_LOGS, prevCount - 5));
  }, []);

  const cellWidth = 40;

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById("heatmapContainer");
      if (container) {
        const newContainerWidth = container.offsetWidth;
        setContainerWidth(newContainerWidth);
        const newLabelWidth = Math.max(40, newContainerWidth * 0.4);
        setLabelWidth(newLabelWidth);
      }
    };

    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  useEffect(() => {
    const measureText = (text, fontSize) => {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      context.font = `${fontSize}px sans-serif`;
      return context.measureText(text).width;
    };

    const newTextWidth = {};
    processedData.yLabels.forEach((label, index) => {
      newTextWidth[index] = measureText(label.message, 14);
    });
    setTextWidth(newTextWidth);
  }, [processedData.yLabels]);

  const gridWidth = processedData.xLabels.length * cellWidth;
  const availableWidth = Math.max(containerWidth - labelWidth, gridWidth);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return format(date, "yyyy-MM-dd, HH:mm:ss");
  };

  const truncateComponents = (components, maxLength = 50) => {
    const joined = components.join(", ");
    if (joined.length <= maxLength) return joined;
    return joined.substring(0, maxLength - 3) + "...";
  };

  if (processedData.data.length === 0) {
    return <div className={styles.noData}>No log data available</div>;
  }

  return (
    <div className={styles.eventsOverTime} id="heatmapContainer">
      <h2 className={styles.title}>Events Over Time</h2>
      <div className={styles.heatmapContainer}>
        <div className={styles.heatmapContent}>
          <div
            className={styles.labels}
            style={{ width: `${labelWidth}px`, minWidth: `${labelWidth}px` }}
          >
            {processedData.yLabels.map((label, index) => {
              const showMoreButton = textWidth[index] > labelWidth - 60;
              return (
                <div key={index} className={styles.label}>
                  <span className={styles.labelText}>{label.message}</span>
                  {showMoreButton && (
                    <button onClick={() => handleMoreClick(label)} className={styles.moreButton}>
                      More
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div
            className={styles.heatmap}
            style={{ width: `${availableWidth}px`, maxWidth: `${availableWidth}px` }}
          >
            <div
              className={styles.heatmapGrid}
              style={{
                gridTemplateColumns: `repeat(${processedData.xLabels.length}, ${cellWidth}px)`,
                width: `${gridWidth}px`,
              }}
            >
              {processedData.data.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={styles.heatmapCell}
                    style={{
                      backgroundColor: getColor(
                        value,
                        processedData.yLabels[rowIndex].logLevel.toUpperCase()
                      ),
                      opacity: value > 0 ? 1 : 0.1,
                      width: `${cellWidth}px`,
                      height: "40px",
                    }}
                  >
                    {value > 0 && value}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div
          className={styles.xLabels}
          style={{
            marginLeft: `${labelWidth}px`,
            width: `${gridWidth}px`,
          }}
        >
          {processedData.xLabels.map((label, index) => (
            <div
              key={index}
              className={styles.xLabel}
              style={{
                width: `${cellWidth}px`,
              }}
            >
              <div className={styles.xLabelText}>{label}</div>
            </div>
          ))}
        </div>
        <div className={styles.showMoreLessContainer}>
          {displayedLogsCount > INITIAL_DISPLAYED_LOGS && (
            <button onClick={handleShowLess} className={styles.showLessButton}>
              Show Less
            </button>
          )}
          {processedData.totalLogs > displayedLogsCount && (
            <button onClick={handleShowMore} className={styles.showMoreButton}>
              Show More
            </button>
          )}
        </div>
      </div>
      {selectedError && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Log Details</h3>
            <p className={styles.modalField}>
              <strong>Log Level:</strong>
              <span
                className={`${styles.logLevel} ${
                  styles[selectedError.logLevel.toLowerCase() + "Level"]
                }`}
              >
                {selectedError.logLevel}
              </span>
            </p>
            <p className={styles.modalField}>
              <strong>Components:</strong> {truncateComponents(selectedError.components)}
            </p>
            <p className={styles.modalField}>
              <strong>Message:</strong>
              <span className={styles.messageValue}>{selectedError.message}</span>
            </p>
            <p className={styles.modalField}>
              <strong>Total:</strong> {selectedError.total}
            </p>
            <p className={styles.modalField}>
              <strong>First Occurred:</strong> {formatDate(selectedError.firstTimestamp)}
            </p>
            <p className={styles.modalField}>
              <strong>Last Occurred:</strong> {formatDate(selectedError.lastTimestamp)}
            </p>
            <button onClick={() => setSelectedError(null)} className={styles.closeButton}>
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsOverTime;
