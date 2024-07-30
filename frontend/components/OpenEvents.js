import React, { useState } from "react";
import styles from "../styles/OpenEvents.module.css";

const OpenEvents = ({ events }) => {
  const [errorPage, setErrorPage] = useState(1);
  const [warnPage, setWarnPage] = useState(1);
  const eventsPerPage = 5;

  const groupEvents = (eventsArray) => {
    if (!eventsArray || eventsArray.length === 0) return {};
    return eventsArray.reduce((acc, event) => {
      const key = event.message.split("\n")[0].trim();
      if (!acc[key]) {
        acc[key] = { ...event, count: 1 };
      } else {
        acc[key].count += 1;
      }
      return acc;
    }, {});
  };

  const sortEvents = (events) => {
    return Object.values(events).sort((a, b) => b.count - a.count);
  };

  const paginateEvents = (events, page) => {
    const startIndex = (page - 1) * eventsPerPage;
    return events.slice(startIndex, startIndex + eventsPerPage);
  };

  const groupedErrors = sortEvents(groupEvents(events.ERROR));
  const groupedWarnings = sortEvents(groupEvents(events.WARN));

  const paginatedErrors = paginateEvents(groupedErrors, errorPage);
  const paginatedWarnings = paginateEvents(groupedWarnings, warnPage);

  const truncateMessage = (message, maxLines = 5) => {
    const lines = message.split("\n");
    if (lines.length > maxLines) {
      return lines.slice(0, maxLines).join("\n") + "...";
    }
    return message;
  };

  const renderPagination = (currentPage, setPage, totalItems) => {
    const totalPages = Math.ceil(totalItems / eventsPerPage);
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className={styles.pagination}>
        {currentPage > 1 && (
          <button onClick={() => setPage((prev) => prev - 1)} className={styles.pageButton}>
            Previous
          </button>
        )}
        {pageNumbers.map((num) => (
          <button
            key={num}
            onClick={() => setPage(num)}
            className={`${styles.pageButton} ${currentPage === num ? styles.activePage : ""}`}
          >
            {num}
          </button>
        ))}
        {currentPage < totalPages && (
          <button onClick={() => setPage((prev) => prev + 1)} className={styles.pageButton}>
            Next
          </button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.openEvents}>
      <h3 className={styles.title}>Open Events</h3>
      <div className={styles.eventSection}>
        <h4 className={styles.errorTitle}>ERROR</h4>
        {paginatedErrors.map((event, index) => (
          <div key={index} className={styles.event}>
            <div className={styles.errorIndicator}></div>
            <div className={styles.eventContent}>
              <span className={styles.eventMessage}>
                {truncateMessage(event.message)}
                {event.message.split("\n").length > 5 && (
                  <span className={styles.moreLink} onClick={() => alert(event.message)}>
                    more
                  </span>
                )}
                {event.count > 1 && <span className={styles.eventCount}>({event.count})</span>}
              </span>
            </div>
          </div>
        ))}
        {renderPagination(errorPage, setErrorPage, groupedErrors.length)}
      </div>
      <div className={styles.eventSection}>
        <h4 className={styles.warnTitle}>WARN</h4>
        {paginatedWarnings.map((event, index) => (
          <div key={index} className={styles.event}>
            <div className={styles.warnIndicator}></div>
            <div className={styles.eventContent}>
              <span className={styles.eventMessage}>
                {truncateMessage(event.message)}
                {event.message.split("\n").length > 5 && (
                  <span className={styles.moreLink} onClick={() => alert(event.message)}>
                    more
                  </span>
                )}
                {event.count > 1 && <span className={styles.eventCount}>({event.count})</span>}
              </span>
            </div>
          </div>
        ))}
        {renderPagination(warnPage, setWarnPage, groupedWarnings.length)}
      </div>
    </div>
  );
};

export default OpenEvents;
