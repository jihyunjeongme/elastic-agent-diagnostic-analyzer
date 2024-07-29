import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import LogsInfo from "../components/LogsInfo";
import LogsTable from "../components/LogsTable";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import OpenEvents from "../components/OpenEvents";
import Pagination from "../components/Pagination";
import EventsOverTime from "../components/EventsOverTime";
import { readLogsFromZip, filterLogs } from "../utils/logHandler";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../styles/Logs.module.css";

const LOGS_PER_PAGE = 12;

export default function Logs() {
  const { activeTab, setActiveTab, isFileUploaded, diagnosticInfo, setDiagnosticInfo } =
    useDiagnostic();

  const [allLogs, setAllLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("ALL");
  const [selectedLogLevel, setSelectedLogLevel] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [timeRange, setTimeRange] = useState("30d");
  const [logsInfo, setLogsInfo] = useState({ total: 0, error: 0, warn: 0, others: 0 });
  const [openEvents, setOpenEvents] = useState({ ERROR: [], WARN: [] });
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
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (typeof window !== "undefined" && window.zipContents && !diagnosticInfo.logs) {
        setLoading(true);
        try {
          const fetchedLogs = await readLogsFromZip(window.zipContents);
          console.log("Fetched logs:", fetchedLogs.length);
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
    console.log("Calculating filteredAndSortedLogs");
    console.log("Current filters:", { selectedId, selectedLogLevel, selectedType, timeRange });
    console.log("Total logs before filtering:", allLogs.length);

    const filtered = filterLogs(
      allLogs,
      selectedId,
      selectedLogLevel,
      selectedType,
      isAbsoluteTime ? null : timeRange,
      startDate,
      endDate
    );

    console.log("Filtered logs count after filtering:", filtered.length);

    if (sortConfig.key) {
      console.log("Sorting by:", sortConfig.key, "Direction:", sortConfig.direction);
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
    const paginatedResult = filteredAndSortedLogs.slice(startIndex, startIndex + LOGS_PER_PAGE);
    console.log("Paginated logs:", {
      totalFiltered: filteredAndSortedLogs.length,
      currentPage,
      logsPerPage: LOGS_PER_PAGE,
      paginatedCount: paginatedResult.length,
    });
    return paginatedResult;
  }, [filteredAndSortedLogs, currentPage]);

  useEffect(() => {
    console.log("filteredAndSortedLogs changed, new length:", filteredAndSortedLogs.length);
    console.log("paginatedLogs:", paginatedLogs.length);
    updateLogsInfo(filteredAndSortedLogs);
    updateOpenEvents(filteredAndSortedLogs);
    setCurrentPage(1);
  }, [filteredAndSortedLogs, paginatedLogs]);

  const updateLogsInfo = useCallback((logs) => {
    const info = {
      total: logs.length,
      error: logs.filter((log) => log["log.level"] === "error").length,
      warn: logs.filter((log) => log["log.level"] === "warn").length,
      others: logs.filter((log) => !["error", "warn"].includes(log["log.level"])).length,
    };
    setLogsInfo(info);
  }, []);

  const updateOpenEvents = useCallback((logs) => {
    const events = {
      ERROR: [],
      WARN: [],
    };
    logs.forEach((log) => {
      if (log["log.level"] === "error" || log["log.level"] === "warn") {
        const key = log["log.level"].toUpperCase();
        events[key].push({
          message: log.message,
          time: log["@timestamp"],
        });
      }
    });
    setOpenEvents(events);
  }, []);

  const uniqueIds = useMemo(() => {
    const ids = ["ALL", ...new Set(allLogs.map((log) => log.component?.id).filter(Boolean))];
    console.log("Unique IDs:", ids);
    return ids;
  }, [allLogs]);

  const uniqueLogLevels = useMemo(() => {
    const levels = ["ALL", ...new Set(allLogs.map((log) => log["log.level"]))];
    console.log("Unique Log Levels:", levels);
    return levels;
  }, [allLogs]);

  const uniqueTypes = useMemo(() => {
    const types = ["ALL", ...new Set(allLogs.map((log) => log.component?.type).filter(Boolean))];
    console.log("Unique Types:", types);
    return types;
  }, [allLogs]);

  const handleSort = useCallback((key) => {
    console.log("Sorting by:", key);
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

  useEffect(() => {
    const errorLogs = filteredAndSortedLogs.filter((log) => log["log.level"] === "error");
    setHasErrors(errorLogs.length > 0);
  }, [filteredAndSortedLogs]);

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
            {filteredAndSortedLogs.some((log) => log["log.level"] === "error") && (
              <EventsOverTime
                logs={filteredAndSortedLogs}
                timeRange={timeRange}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            <div className={styles.mainContent}>
              <div className={styles.logsSection}>
                <div className={styles.filters}>
                  <select
                    value={selectedId}
                    onChange={(e) => {
                      console.log("Selected ID changing from", selectedId, "to", e.target.value);
                      setSelectedId(e.target.value);
                      const immediateFilterResult = allLogs.filter(
                        (log) => e.target.value === "ALL" || log.component?.id === e.target.value
                      );
                      console.log("Immediate filtering result:", {
                        filteredCount: immediateFilterResult.length,
                        firstFewLogs: immediateFilterResult.slice(0, 5),
                      });
                    }}
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
                    onChange={(e) => {
                      console.log("Selected Log Level changed:", e.target.value);
                      setSelectedLogLevel(e.target.value);
                    }}
                    className={styles.select}
                  >
                    <option value="ALL">ALL Levels</option>
                    {uniqueLogLevels
                      .filter((level) => level !== "ALL")
                      .map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                  </select>

                  <select
                    value={selectedType}
                    onChange={(e) => {
                      console.log("Selected Type changed:", e.target.value);
                      setSelectedType(e.target.value);
                    }}
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
                {console.log("Logs passed to LogsTable:", paginatedLogs.length)}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
              <div className={styles.sidebar}>
                <LogsInfo {...logsInfo} />
                <OpenEvents events={openEvents} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
