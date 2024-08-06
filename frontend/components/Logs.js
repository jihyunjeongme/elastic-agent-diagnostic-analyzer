import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import LogsInfo from "../components/LogsInfo";
import LogsTable from "../components/LogsTable";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import OpenEvents from "../components/OpenEvents";
import EventsOverTime from "../components/EventsOverTime";
import { readLogsFromZip, filterLogs, filterGroupedLogs } from "../utils/logHandler";
import "react-datepicker/dist/react-datepicker.css";

const LOGS_PER_PAGE = 12;

export default function Logs() {
  const { activeTab, setActiveTab, isFileUploaded, diagnosticInfo, setDiagnosticInfo } =
    useDiagnostic();

  const [allLogs, setAllLogs] = useState([]);
  const [groupedLogs, setGroupedLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("ALL");
  const [selectedLogLevel, setSelectedLogLevel] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [timeRange, setTimeRange] = useState("30d");
  const [logsInfo, setLogsInfo] = useState({
    total: 0,
    error: 0,
    warn: 0,
    info: 0,
    debug: 0,
    trace: 0,
    fatal: 0,
  });
  const [openEvents, setOpenEvents] = useState({ ERROR: [], WARN: [], INFO: [] });
  const [sortConfig, setSortConfig] = useState({ key: "@timestamp", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState({
    "@timestamp": true,
    "log.level": true,
    status: true,
    message: true,
    "component.id": true,
    "component.type": true,
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isAbsoluteTime, setIsAbsoluteTime] = useState(false);
  const [isInitialView, setIsInitialView] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (typeof window !== "undefined" && window.zipContents && !diagnosticInfo.logs) {
        setLoading(true);
        try {
          const { logs, groupedLogs } = await readLogsFromZip(window.zipContents);
          setAllLogs(logs);
          setGroupedLogs(groupedLogs);
          setDiagnosticInfo((prev) => ({ ...prev, logs, groupedLogs }));
        } catch (error) {
          console.error("Error fetching logs:", error);
        } finally {
          setLoading(false);
        }
      } else if (diagnosticInfo.logs && diagnosticInfo.groupedLogs) {
        setAllLogs(diagnosticInfo.logs);
        setGroupedLogs(diagnosticInfo.groupedLogs);
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
    return filterLogs(
      allLogs,
      selectedId,
      selectedLogLevel,
      selectedType,
      selectedStatus,
      isAbsoluteTime ? null : timeRange,
      startDate,
      endDate
    );
  }, [
    allLogs,
    selectedId,
    selectedLogLevel,
    selectedType,
    selectedStatus,
    timeRange,
    isAbsoluteTime,
    startDate,
    endDate,
  ]);

  const filteredAndSortedGroupedLogs = useMemo(() => {
    return filterGroupedLogs(
      groupedLogs,
      selectedId,
      selectedLogLevel,
      selectedType,
      selectedStatus,
      isAbsoluteTime ? null : timeRange,
      startDate,
      endDate
    );
  }, [
    groupedLogs,
    selectedId,
    selectedLogLevel,
    selectedType,
    selectedStatus,
    timeRange,
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
      error: logs.filter((log) => log["log.level"].toLowerCase() === "error").length,
      warn: logs.filter((log) => log["log.level"].toLowerCase() === "warn").length,
      info: logs.filter((log) => log["log.level"].toLowerCase() === "info").length,
      debug: logs.filter((log) => log["log.level"].toLowerCase() === "debug").length,
      trace: logs.filter((log) => log["log.level"].toLowerCase() === "trace").length,
      fatal: logs.filter((log) => log["log.level"].toLowerCase() === "fatal").length,
    };
    setLogsInfo(info);
  }, []);

  const updateOpenEvents = useCallback((logs) => {
    const events = {
      ERROR: [],
      WARN: [],
      INFO: [],
    };
    logs.forEach((log) => {
      const level = log["log.level"].toUpperCase();
      if (["ERROR", "WARN", "INFO"].includes(level)) {
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

  const uniqueLogLevels = useMemo(() => {
    return ["ALL", ...new Set(allLogs.map((log) => log["log.level"]))];
  }, [allLogs]);

  const uniqueTypes = useMemo(() => {
    return ["ALL", ...new Set(allLogs.map((log) => log.component?.type).filter(Boolean))];
  }, [allLogs]);

  const uniqueStatuses = useMemo(() => {
    return ["ALL", ...new Set(allLogs.map((log) => log.status).filter(Boolean))];
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

  const handleLogLevelChange = (newLogLevel) => {
    setSelectedLogLevel(newLogLevel);
    if (newLogLevel !== "ALL") {
      setIsInitialView(false);
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
            <div className={styles.topSection}>
              <EventsOverTime
                groupedLogs={filteredAndSortedGroupedLogs}
                selectedLogLevel={selectedLogLevel}
                isInitialView={isInitialView}
                timeRange={timeRange}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className={styles.bottomSection}>
              <div className={styles.logsTableSection}>
                <LogsTable
                  logs={paginatedLogs}
                  sortConfig={sortConfig}
                  onSort={handleSort}
                  visibleColumns={visibleColumns}
                  selectedLogLevel={selectedLogLevel}
                  setSelectedLogLevel={handleLogLevelChange}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  uniqueIds={uniqueIds}
                  uniqueLogLevels={uniqueLogLevels}
                  uniqueTypes={uniqueTypes}
                  uniqueStatuses={uniqueStatuses}
                  timeRange={timeRange}
                  handleTimeRangeChange={handleTimeRangeChange}
                  isAbsoluteTime={isAbsoluteTime}
                  setIsAbsoluteTime={setIsAbsoluteTime}
                  startDate={startDate}
                  setStartDate={setStartDate}
                  endDate={endDate}
                  setEndDate={setEndDate}
                  handleColumnToggle={handleColumnToggle}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
              <div className={styles.openEventsSidebar}>
                <LogsInfo {...logsInfo} />
                <OpenEvents
                  events={openEvents}
                  selectedLogLevel={selectedLogLevel}
                  isInitialView={isInitialView}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
