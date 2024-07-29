import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/EventsOverTime.module.css";

const EventsOverTime = ({ logs, timeRange }) => {
  const [data, setData] = useState([]);
  const [xLabels, setXLabels] = useState([]);
  const [yLabels, setYLabels] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const moreButtonRef = useRef(null);

  useEffect(() => {
    console.log("EventsOverTime - Received logs:", logs);
    console.log("EventsOverTime - Time range:", timeRange);

    if (!logs || logs.length === 0) {
      console.log("EventsOverTime - No logs, returning");
      setData([]);
      setXLabels([]);
      setYLabels([]);
      return;
    }

    const errorLogs = logs.filter((log) => log["log.level"] === "error");
    console.log("EventsOverTime - Filtered error logs:", errorLogs);

    if (errorLogs.length === 0) {
      console.log("EventsOverTime - No error logs, clearing data");
      setData([]);
      setXLabels([]);
      setYLabels([]);
      return;
    }

    const groupedErrors = errorLogs.reduce((acc, log) => {
      const date = new Date(log["@timestamp"]).toISOString().split("T")[0];
      const errorMessage = log.message;

      if (!acc[errorMessage]) {
        acc[errorMessage] = {
          total: 0,
          dates: {},
          log,
          firstTimestamp: log["@timestamp"],
          lastTimestamp: log["@timestamp"],
        };
      }
      if (!acc[errorMessage].dates[date]) {
        acc[errorMessage].dates[date] = 0;
      }
      acc[errorMessage].dates[date]++;
      acc[errorMessage].total++;
      acc[errorMessage].lastTimestamp = log["@timestamp"];

      return acc;
    }, {});

    const sortedErrors = Object.entries(groupedErrors)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, showMore ? 10 : 5);

    const allDates = [
      ...new Set(errorLogs.map((log) => new Date(log["@timestamp"]).toISOString().split("T")[0])),
    ].sort();

    const heatmapData = sortedErrors.map(([, data]) =>
      allDates.map((date) => data.dates[date] || 0)
    );

    console.log("EventsOverTime - Processed data:", heatmapData);
    console.log("EventsOverTime - X labels:", allDates);
    console.log("EventsOverTime - Y labels:", sortedErrors);

    setData(heatmapData);
    setXLabels(allDates);
    setYLabels(
      sortedErrors.map(([error, data]) => ({
        message: error,
        total: data.total,
        log: data.log,
        firstTimestamp: data.firstTimestamp,
        lastTimestamp: data.lastTimestamp,
      }))
    );
  }, [logs, timeRange, showMore]);

  const getColor = (value) => {
    if (value >= 10) return "rgb(174,54,43)";
    if (value >= 5) return "rgb(215,153,148)";
    if (value >= 1) return "rgb(237,205,203)";
    return "rgb(255,255,255)";
  };

  const formatDate = (date) => {
    const d = new Date(date);
    if (timeRange === "1d") {
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" });
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}, ${date.toLocaleTimeString()}`;
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + "...";
  };

  const handleMoreClick = (fullMessage, log, firstTimestamp, lastTimestamp, event) => {
    event.stopPropagation();
    if (expandedMessage === fullMessage) {
      setExpandedMessage(null);
    } else {
      setExpandedMessage({ message: fullMessage, log: log, firstTimestamp, lastTimestamp });
      const rect = event.target.getBoundingClientRect();
      setPopupPosition({
        top: rect.bottom + window.scrollY,
        left: rect.right + window.scrollX,
      });
    }
  };

  const handleClosePopup = () => {
    setExpandedMessage(null);
  };

  const getValue = (log, field) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      return log[parent]?.[child] ?? log.original?.[parent]?.[child] ?? "N/A";
    }
    return log[field] ?? log.original?.[field] ?? "N/A";
  };

  if (data.length === 0) {
    console.log("EventsOverTime - No data to display, returning null");
    return null;
  }

  console.log("EventsOverTime - Rendering component");

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Events Over Time</h2>
      <div className={styles.heatmapContainer}>
        <div className={styles.yLabelsAndHeatmap}>
          {yLabels.map(({ message, log, firstTimestamp, lastTimestamp }, index) => (
            <div key={index} className={styles.row}>
              <div className={styles.yLabel}>
                <span className={styles.errorMessage}>{truncateMessage(message)}</span>
                {message.length > 50 && (
                  <button
                    ref={moreButtonRef}
                    className={styles.moreButton}
                    onClick={(e) => handleMoreClick(message, log, firstTimestamp, lastTimestamp, e)}
                  >
                    more
                  </button>
                )}
              </div>
              <div className={styles.heatmapRow}>
                {data[index].map((value, x) => (
                  <div
                    key={x}
                    className={styles.cell}
                    style={{ backgroundColor: getColor(value) }}
                    title={`${message}: ${value} occurrences on ${formatDate(xLabels[x])}`}
                  >
                    {value > 0 ? value : ""}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className={styles.xLabels}>
            {xLabels.map((label, index) => (
              <div key={index} className={styles.xLabel}>
                {formatDate(label)}
              </div>
            ))}
          </div>
        </div>
        {yLabels.length >= 5 && (
          <div className={styles.buttonContainer}>
            <button onClick={() => setShowMore(!showMore)} className={styles.button}>
              {showMore ? "Show Less" : "Show More"}
            </button>
          </div>
        )}
      </div>
      {expandedMessage && (
        <div className={styles.popup} style={{ top: popupPosition.top, left: popupPosition.left }}>
          <div className={styles.popupContent}>
            <button className={styles.closeButton} onClick={handleClosePopup}>
              ×
            </button>
            <h3 className={styles.popupTitle}>Error Details</h3>
            <div className={styles.popupField}>
              <span className={styles.popupLabel}>Timestamp:</span>
              <span className={styles.popupValue}>
                {formatTimestamp(expandedMessage.firstTimestamp)} ~{" "}
                {formatTimestamp(expandedMessage.lastTimestamp)}
              </span>
            </div>
            <div className={styles.popupField}>
              <span className={styles.popupLabel}>Message:</span>
              <span className={styles.popupValue}>{getValue(expandedMessage.log, "message")}</span>
            </div>
            <div className={styles.popupField}>
              <span className={styles.popupLabel}>Component ID:</span>
              <span className={`${styles.popupValue} ${styles.smallerText}`}>
                {getValue(expandedMessage.log, "component.id")}
              </span>
            </div>
            <div className={styles.popupField}>
              <span className={styles.popupLabel}>Type:</span>
              <span className={`${styles.popupValue} ${styles.smallerText}`}>
                {getValue(expandedMessage.log, "component.type")}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsOverTime;
