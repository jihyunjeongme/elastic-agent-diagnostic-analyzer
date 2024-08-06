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

// 이벤트를 처리하는 함수
const processLevelEvents = (levelEvents) => {
  const eventCounts = levelEvents.reduce((counts, event) => {
    counts[event.message] = (counts[event.message] || 0) + 1;
    return counts;
  }, {});

  return Object.entries(eventCounts)
    .map(([message, count]) => ({
      message,
      count,
    }))
    .sort((a, b) => b.count - a.count);
};

const OpenEvents = ({ events, selectedLogLevel, isInitialView }) => {
  // 각 로그 레벨의 현재 페이지 상태
  const [currentPages, setCurrentPages] = useState({
    ERROR: 1,
    WARN: 1,
    INFO: 1,
    DEBUG: 1,
    TRACE: 1,
    FATAL: 1,
  });

  // 처리된 이벤트 데이터
  const processedEvents = useMemo(() => {
    const upperCaseSelectedLogLevel = selectedLogLevel.toUpperCase();

    return Object.entries(events).reduce((acc, [level, levelEvents]) => {
      const upperCaseLevel = level.toUpperCase();

      // 초기 뷰이고 ALL이 선택된 경우 ERROR와 WARN만 표시
      if (isInitialView && upperCaseSelectedLogLevel === "ALL") {
        if (upperCaseLevel === "ERROR" || upperCaseLevel === "WARN") {
          acc[upperCaseLevel] = processLevelEvents(levelEvents);
        }
      }
      // 초기 뷰가 아니거나 특정 레벨이 선택된 경우
      else if (!isInitialView || upperCaseLevel === upperCaseSelectedLogLevel) {
        acc[upperCaseLevel] = processLevelEvents(levelEvents);
      }
      return acc;
    }, {});
  }, [events, selectedLogLevel, isInitialView]);

  // 페이지네이션된 이벤트 데이터
  const paginatedEvents = useMemo(() => {
    return Object.entries(processedEvents).reduce((acc, [level, levelEvents]) => {
      const startIndex = (currentPages[level] - 1) * EVENTS_PER_PAGE;
      acc[level] = levelEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE);
      return acc;
    }, {});
  }, [processedEvents, currentPages]);

  // 각 로그 레벨의 총 페이지 수 계산
  const totalPages = useMemo(() => {
    return Object.entries(processedEvents).reduce((acc, [level, levelEvents]) => {
      acc[level] = Math.ceil(levelEvents.length / EVENTS_PER_PAGE);
      return acc;
    }, {});
  }, [processedEvents]);

  // 페이지 변경 핸들러
  const handlePageChange = (level, newPage) => {
    setCurrentPages((prev) => ({
      ...prev,
      [level]: newPage,
    }));
  };

  // 컴포넌트 렌더링
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
