import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import LogsInfo from "../components/LogsInfo";
import LogsTable from "../components/LogsTable";
import OpenEvents from "../components/OpenEvents";
import Pagination from "../components/Pagination";
import EventsOverTime from "../components/EventsOverTime";
import { readLogsFromZip, filterLogs } from "../utils/logHandler";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../styles/Logs.module.css";

const LOGS_PER_PAGE = 12;
const LOG_LEVELS = ["FATAL", "ERROR", "WARN", "INFO", "DEBUG", "TRACE"];

export default function Logs({
  activeTab,
  setActiveTab,
  isFileUploaded,
  diagnosticInfo,
  setDiagnosticInfo,
}) {
  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("ALL");
  const [selectedLogLevel, setSelectedLogLevel] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [timeRange, setTimeRange] = useState("30d");
  const [logsInfo, setLogsInfo] = useState({
    total: 0,
    ...Object.fromEntries(LOG_LEVELS.map((level) => [level.toLowerCase(), 0])),
  });
  const [openEvents, setOpenEvents] = useState(
    Object.fromEntries(LOG_LEVELS.map((level) => [level, []]))
  );
  const [sortConfig, setSortConfig] = useState({ key: "@timestamp", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState({
    "@timestamp": true,
    "log.level": true,
    message: true,
    "component.id": true,
    "component.type": true,
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isAbsoluteTime, setIsAbsoluteTime] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (typeof window !== "undefined" && window.zipContents && !diagnosticInfo.logs) {
        setLoading(true);
        try {
          const fetchedLogs = await readLogsFromZip(window.zipContents);
          setAllLogs(fetchedLogs);
          setDiagnosticInfo((prev) => ({ ...prev, logs: fetchedLogs }));
        } catch (error) {
          console.error("Error fetching logs:", error);
        } finally {
          setLoading(false);
        }
      } else if (diagnosticInfo.logs) {
        setAllLogs(diagnosticInfo.logs);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };
    if (isFileUploaded) {
      fetchLogs();
    } else {
      setLoading(false);
    }
  }, [isFileUploaded, diagnosticInfo, setDiagnosticInfo]);

  const filteredAndSortedLogs = useMemo(() => {
    const filtered = filterLogs(
      allLogs,
      selectedId,
      selectedLogLevel,
      selectedType,
      isAbsoluteTime ? null : timeRange,
      startDate,
      endDate
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "component.id" || sortConfig.key === "component.type") {
          aValue = a.component?.[sortConfig.key.split(".")[1]] || "";
          bValue = b.component?.[sortConfig.key.split(".")[1]] || "";
        }

        if (aValue < bValue) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [
    allLogs,
    selectedId,
    selectedLogLevel,
    selectedType,
    timeRange,
    sortConfig,
    isAbsoluteTime,
    startDate,
    endDate,
  ]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * LOGS_PER_PAGE;
    return filteredAndSortedLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
  }, [filteredAndSortedLogs, currentPage]);

  useEffect(() => {
    updateLogsInfo(filteredAndSortedLogs);
    updateOpenEvents(filteredAndSortedLogs);
    setCurrentPage(1);
  }, [filteredAndSortedLogs]);

  const updateLogsInfo = useCallback((logs) => {
    const info = {
      total: logs.length,
      ...Object.fromEntries(
        LOG_LEVELS.map((level) => [
          level.toLowerCase(),
          logs.filter((log) => log["log.level"].toUpperCase() === level).length,
        ])
      ),
    };
    setLogsInfo(info);
  }, []);

  const updateOpenEvents = useCallback((logs) => {
    const events = Object.fromEntries(LOG_LEVELS.map((level) => [level, []]));
    logs.forEach((log) => {
      const level = log["log.level"].toUpperCase();
      if (LOG_LEVELS.includes(level)) {
        events[level].push({
          message: log.message,
          time: log["@timestamp"],
        });
      }
    });
    setOpenEvents(events);
  }, []);

  const uniqueIds = useMemo(() => {
    return ["ALL", ...new Set(allLogs.map((log) => log.component?.id).filter(Boolean))];
  }, [allLogs]);

  const uniqueTypes = useMemo(() => {
    return ["ALL", ...new Set(allLogs.map((log) => log.component?.type).filter(Boolean))];
  }, [allLogs]);

  const handleSort = useCallback((key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const totalPages = Math.ceil(filteredAndSortedLogs.length / LOGS_PER_PAGE);

  const handleColumnToggle = (columnKey) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleTimeRangeChange = (value) => {
    if (value === "absolute") {
      setIsAbsoluteTime(true);
    } else {
      setIsAbsoluteTime(false);
      setTimeRange(value);
      setStartDate(null);
      setEndDate(null);
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className={styles.logsContainer}>
        <h1 className={styles.title}>Logs Details</h1>
        {!isFileUploaded ? (
          <p className={styles.message}>Please upload a diagnostic bundle first.</p>
        ) : loading ? (
          <p className={styles.message}>Loading logs...</p>
        ) : (
          <div className={styles.content}>
            <div className={styles.mainContent}>
              <div className={styles.eventsAndInfo}>
                <div className={styles.eventsOverTime}>
                  <EventsOverTime
                    logs={filteredAndSortedLogs}
                    timeRange={timeRange}
                    startDate={startDate}
                    endDate={endDate}
                  />
                </div>
                <div className={styles.logsInfoContainer}>
                  <LogsInfo {...logsInfo} />
                </div>
              </div>
              <div className={styles.logsSection}>
                <div className={styles.filters}>
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className={styles.select}
                  >
                    <option value="ALL">ALL Components</option>
                    {uniqueIds
                      .filter((id) => id !== "ALL")
                      .map((id) => (
                        <option key={id} value={id}>
                          {id}
                        </option>
                      ))}
                  </select>

                  <select
                    value={selectedLogLevel}
                    onChange={(e) => setSelectedLogLevel(e.target.value)}
                    className={styles.select}
                  >
                    <option value="ALL">ALL Levels</option>
                    {LOG_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className={styles.select}
                  >
                    <option value="ALL">ALL Types</option>
                    {uniqueTypes
                      .filter((type) => type !== "ALL")
                      .map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                  </select>
                  {isAbsoluteTime ? (
                    <div className={styles.datePickerContainer}>
                      <DatePicker
                        selected={startDate}
                        onChange={(date) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start Date"
                        className={styles.datePicker}
                      />
                      <DatePicker
                        selected={endDate}
                        onChange={(date) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="End Date"
                        className={styles.datePicker}
                      />
                      <button onClick={() => setIsAbsoluteTime(false)} className={styles.button}>
                        Use Relative Time
                      </button>
                    </div>
                  ) : (
                    <select
                      value={timeRange}
                      onChange={(e) => handleTimeRangeChange(e.target.value)}
                      className={styles.select}
                    >
                      <option value="1d">Last 24 hours</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                      <option value="3m">3 months</option>
                      <option value="6m">6 months</option>
                      <option value="1y">1 year</option>
                      <option value="3y">3 years</option>
                      <option value="5y">5 years</option>
                      <option value="absolute">Absolute</option>
                    </select>
                  )}
                </div>
                <div className={styles.columnToggle}>
                  {Object.keys(visibleColumns).map((columnKey) => (
                    <label key={columnKey} className={styles.toggleLabel}>
                      <input
                        type="checkbox"
                        checked={visibleColumns[columnKey]}
                        onChange={() => handleColumnToggle(columnKey)}
                        className={styles.toggleCheckbox}
                      />
                      {columnKey}
                    </label>
                  ))}
                </div>
                <LogsTable
                  logs={paginatedLogs}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  visibleColumns={visibleColumns}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            </div>
            <div className={styles.sidebar}>
              <OpenEvents events={openEvents} />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
