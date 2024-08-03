import React, { useState, useMemo } from "react";
import styles from "../styles/OpenEvents.module.css";

const EVENTS_PER_PAGE = 5;

const logLevelColors = {
  ERROR: styles.errorBorder,
  WARN: styles.warnBorder,
  INFO: styles.infoBorder,
  DEBUG: styles.debugBorder,
  TRACE: styles.traceBorder,
  FATAL: styles.fatalBorder,
};

const OpenEvents = ({ events, selectedLogLevel }) => {
  const [currentPages, setCurrentPages] = useState({
    ERROR: 1,
    WARN: 1,
    INFO: 1,
    DEBUG: 1,
    TRACE: 1,
    FATAL: 1,
  });

  const processedEvents = useMemo(() => {
    console.log("Events received:", events);
    console.log("Selected log level:", selectedLogLevel);

    return Object.entries(events).reduce((acc, [level, levelEvents]) => {
      const upperCaseLevel = level.toUpperCase();
      const upperCaseSelectedLogLevel = selectedLogLevel.toUpperCase();

      if (upperCaseSelectedLogLevel === "ALL" || upperCaseLevel === upperCaseSelectedLogLevel) {
        const eventCounts = levelEvents.reduce((counts, event) => {
          counts[event.message] = (counts[event.message] || 0) + 1;
          return counts;
        }, {});

        acc[upperCaseLevel] = Object.entries(eventCounts)
          .map(([message, count]) => ({
            message,
            count,
          }))
          .sort((a, b) => b.count - a.count); // 카운트 기준 내림차순 정렬
      }
      return acc;
    }, {});
  }, [events, selectedLogLevel]);

  const paginatedEvents = useMemo(() => {
    return Object.entries(processedEvents).reduce((acc, [level, levelEvents]) => {
      const startIndex = (currentPages[level] - 1) * EVENTS_PER_PAGE;
      acc[level] = levelEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
      return acc;
    }, {});
  }, [processedEvents, currentPages]);

  const totalPages = useMemo(() => {
    return Object.entries(processedEvents).reduce((acc, [level, levelEvents]) => {
      acc[level] = Math.ceil(levelEvents.length / EVENTS_PER_PAGE);
      return acc;
    }, {});
  }, [processedEvents]);

  const handlePageChange = (level, newPage) => {
    setCurrentPages((prev) => ({
      ...prev,
      [level]: newPage,
    }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Open Events</h2>
      <div className={styles.eventSection}>
        {Object.entries(paginatedEvents).map(([level, levelEvents]) => (
          <div key={level}>
            <h3 className={`${styles.eventTitle} ${logLevelColors[level]}`}>{level}</h3>
            <ul className={styles.eventList}>
              {levelEvents.map((event, index) => (
                <li key={index} className={`${styles.eventItem} ${logLevelColors[level]}`}>
                  <span className={styles.eventMessage}>{event.message}</span>
                  <span className={styles.eventCount}>{event.count}</span>
                </li>
              ))}
            </ul>
            {totalPages[level] > 1 && (
              <div className={styles.pagination}>
                <button
                  onClick={() => handlePageChange(level, Math.max(currentPages[level] - 1, 1))}
                  disabled={currentPages[level] === 1}
                  className={styles.pageButton}
                >
                  Previous
                </button>
                {[...Array(Math.min(3, totalPages[level]))].map((_, i) => {
                  const pageNumber = currentPages[level] - 1 + i;
                  return pageNumber > 0 && pageNumber <= totalPages[level] ? (
                    <button
                      key={i}
                      onClick={() => handlePageChange(level, pageNumber)}
                      className={`${styles.pageNumber} ${
                        currentPages[level] === pageNumber
                          ? styles.activePageNumber
                          : styles.inactivePageNumber
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ) : null;
                })}
                <button
                  onClick={() =>
                    handlePageChange(level, Math.min(currentPages[level] + 1, totalPages[level]))
                  }
                  disabled={currentPages[level] === totalPages[level]}
                  className={styles.pageButton}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenEvents;
