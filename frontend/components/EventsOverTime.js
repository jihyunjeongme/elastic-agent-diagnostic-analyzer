import React, { useMemo, useState, useCallback, useEffect } from "react";
import styles from "../styles/EventsOverTime.module.css";
import { format } from "date-fns";

const EventsOverTime = ({ logs }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [labelWidth, setLabelWidth] = useState(400);
  const [textWidth, setTextWidth] = useState({});
  const [selectedLogLevel, setSelectedLogLevel] = useState("ALL");

  const logLevelColors = {
    ERROR: "rgb(248,113,113)",
    WARN: "rgb(251,191,36)",
    INFO: "rgb(96,165,250)",
    DEBUG: "rgb(52,211,153)",
    TRACE: "rgb(209,213,219)",
    FATAL: "rgb(220,38,38)",
  };

  const processedData = useMemo(() => {
    if (!logs || logs.length === 0) {
      return { data: [], xLabels: [], yLabels: [], totalLogs: 0 };
    }

    const filteredLogs =
      selectedLogLevel === "ALL"
        ? logs
        : logs.filter((log) => log["log.level"]?.toUpperCase() === selectedLogLevel);

    const groupedLogs = {};

    filteredLogs.forEach((log) => {
      const date = new Date(log["@timestamp"]).toISOString().split("T")[0];
      if (!groupedLogs[log.message]) {
        groupedLogs[log.message] = {
          total: 0,
          dates: {},
          log,
          firstTimestamp: log["@timestamp"],
          lastTimestamp: log["@timestamp"],
        };
      }
      groupedLogs[log.message].total++;
      groupedLogs[log.message].dates[date] = (groupedLogs[log.message].dates[date] || 0) + 1;
      groupedLogs[log.message].lastTimestamp = log["@timestamp"];
    });

    const sortedLogs = Object.entries(groupedLogs).sort(([, a], [, b]) => b.total - a.total);

    const allDates = [
      ...new Set(
        filteredLogs.map((log) => new Date(log["@timestamp"]).toISOString().split("T")[0])
      ),
    ].sort();

    const displayedLogs = sortedLogs.slice(0, showMore ? 10 : 5);
    const heatmapData = displayedLogs.map(([, data]) =>
      allDates.map((date) => data.dates[date] || 0)
    );

    return {
      data: heatmapData,
      xLabels: allDates,
      yLabels: displayedLogs.map(([error, data]) => ({
        message: error,
        total: data.total,
        log: data.log,
        firstTimestamp: data.firstTimestamp,
        lastTimestamp: data.lastTimestamp,
      })),
      totalLogs: sortedLogs.length,
    };
  }, [logs, showMore, selectedLogLevel]);

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
      newTextWidth[index] = measureText(label.message, 14); // 14px is the font size
    });
    setTextWidth(newTextWidth);
  }, [processedData.yLabels]);

  const gridWidth = processedData.xLabels.length * cellWidth;
  const availableWidth = Math.max(containerWidth - labelWidth, gridWidth);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + "…";
  };

  if (processedData.data.length === 0) {
    return <div className={styles.noData}>No log data available</div>;
  }

  const formatDate = (timestamp) => {
    return format(new Date(timestamp), "yyyy-MM-dd, HH:mm:ss");
  };

  const showMoreLessButton = processedData.totalLogs > 5;

  console.log("Total logs:", processedData.totalLogs);
  console.log("Displayed logs:", processedData.yLabels.length);
  console.log("showMoreLessButton:", showMoreLessButton);

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
                        processedData.yLabels[rowIndex].log["log.level"].toUpperCase()
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
        {showMoreLessButton && (
          <div className={styles.showMoreContainer}>
            <button onClick={() => setShowMore(!showMore)} className={styles.showMoreButton}>
              {showMore ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
      {selectedError && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalTitle}>Log Details</h3>
            <p className={styles.modalField}>
              <strong>Log Level:</strong>
              <span
                className={`${styles.logLevel} ${
                  styles[selectedError.log["log.level"].toLowerCase() + "Level"]
                }`}
              >
                {selectedError.log["log.level"].toUpperCase()}
              </span>
            </p>
            <p className={styles.modalField}>
              <strong>Component:</strong> {selectedError.log.component?.id || "N/A"}
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
