import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import LogsInfo from "../components/LogsInfo";
import LogsTable from "../components/LogsTable";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import OpenEvents from "../components/OpenEvents";
import EventsOverTime from "../components/EventsOverTime";
import { readLogsFromZip, filterLogs } from "../utils/logHandler";
import styles from "../styles/Logs.module.css";

const LOGS_PER_PAGE = 15;

export default function Logs() {
  const { activeTab, setActiveTab, isFileUploaded, diagnosticInfo, setDiagnosticInfo } =
    useDiagnostic();

  // allLogs 상태를 객체로 변경
  const [allLogs, setAllLogs] = useState({ logs: [], groupedLogs: [] });
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState("ALL");
  const [selectedLogLevel, setSelectedLogLevel] = useState("ALL");
  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL"); // 추가: status 상태
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
  const [openEvents, setOpenEvents] = useState({
    ERROR: [],
    WARN: [],
    INFO: [],
    DEBUG: [],
    TRACE: [],
    FATAL: [],
  });
  const [sortConfig, setSortConfig] = useState({ key: "@timestamp", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);

  // 여기에 visibleColumns 상태를 추가합니다
  const [visibleColumns, setVisibleColumns] = useState({
    "@timestamp": true,
    "log.level": true,
    message: true,
    "component.id": true,
    "component.type": true,
    status: true, // status 컬럼 추가
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
          const fetchedLogs = await readLogsFromZip(window.zipContents);
          console.log("Fetched logs:", fetchedLogs);
          setAllLogs(fetchedLogs);
          setDiagnosticInfo((prev) => ({
            ...prev,
            logs: fetchedLogs.logs,
            groupedLogs: fetchedLogs.groupedLogs,
          }));
        } catch (error) {
          console.error("Error fetching logs:", error);
        } finally {
          setLoading(false);
        }
      } else if (diagnosticInfo.logs) {
        console.log("Using cached logs:", diagnosticInfo.logs);
        setAllLogs({ logs: diagnosticInfo.logs, groupedLogs: diagnosticInfo.groupedLogs || [] });
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
      allLogs.logs,
      selectedId,
      selectedLogLevel,
      selectedType,
      selectedStatus,
      isAbsoluteTime ? null : timeRange,
      startDate,
      endDate
    );
  }, [
    allLogs.logs,
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
      DEBUG: [],
      TRACE: [],
      FATAL: [],
    };

    logs.forEach((log) => {
      const level = log["log.level"].toUpperCase();
      if (["ERROR", "WARN", "INFO", "DEBUG", "TRACE", "FATAL"].includes(level)) {
        events[level].push({
          message: log.message,
          time: log["@timestamp"],
        });
      }
    });
    setOpenEvents(events);
  }, []);

  // allLogs.logs를 사용하도록 수정
  const uniqueIds = useMemo(() => {
    console.log("Calculating uniqueIds, allLogs:", allLogs);
    if (!Array.isArray(allLogs.logs)) {
      console.error("allLogs.logs is not an array:", allLogs.logs);
      return ["ALL"];
    }
    return ["ALL", ...new Set(allLogs.logs.map((log) => log.component?.id).filter(Boolean))];
  }, [allLogs.logs]);

  const uniqueLogLevels = useMemo(() => {
    if (!Array.isArray(allLogs.logs)) {
      console.error("allLogs.logs is not an array:", allLogs.logs);
      return ["ALL"];
    }
    return ["ALL", ...new Set(allLogs.logs.map((log) => log["log.level"]))];
  }, [allLogs.logs]);

  const uniqueTypes = useMemo(() => {
    if (!Array.isArray(allLogs.logs)) {
      console.error("allLogs.logs is not an array:", allLogs.logs);
      return ["ALL"];
    }
    return ["ALL", ...new Set(allLogs.logs.map((log) => log.component?.type).filter(Boolean))];
  }, [allLogs.logs]);

  const uniqueStatuses = useMemo(() => {
    if (!Array.isArray(allLogs.logs)) {
      console.error("allLogs.logs is not an array:", allLogs.logs);
      return ["ALL"];
    }
    const statuses = ["ALL", ...new Set(allLogs.logs.map((log) => log.status).filter(Boolean))];
    console.log("Unique statuses:", statuses);
    return statuses;
  }, [allLogs.logs]);

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
                logs={filteredAndSortedLogs}
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
                  setSelectedLogLevel={setSelectedLogLevel}
                  selectedId={selectedId}
                  setSelectedId={setSelectedId}
                  selectedType={selectedType}
                  setSelectedType={setSelectedType}
                  selectedStatus={selectedStatus} // 추가: status 상태 전달
                  setSelectedStatus={setSelectedStatus} // 추가: status 상태 설정 함수 전달
                  uniqueIds={uniqueIds}
                  uniqueLogLevels={uniqueLogLevels}
                  uniqueTypes={uniqueTypes}
                  uniqueStatuses={uniqueStatuses} // 추가: 유니크한 status 목록 전달
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
