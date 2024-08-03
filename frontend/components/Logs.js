import React, { useState, useEffect, useCallback, useMemo } from "react";
import Layout from "../components/Layout";
import LogsInfo from "../components/LogsInfo";
import LogsTable from "../components/LogsTable";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import OpenEvents from "../components/OpenEvents";
import EventsOverTime from "../components/EventsOverTime";
import { readLogsFromZip, filterLogs } from "../utils/logHandler";
import "react-datepicker/dist/react-datepicker.css";

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
    return filterLogs(
      allLogs,
      selectedId,
      selectedLogLevel,
      selectedType,
      isAbsoluteTime ? null : timeRange,
      startDate,
      endDate
    );
  }, [
    allLogs,
    selectedId,
    selectedLogLevel,
    selectedType,
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
      <div className="p-8 bg-gray-50">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Logs Details</h1>
        {!isFileUploaded ? (
          <p className="text-lg text-gray-600">Please upload a diagnostic bundle first.</p>
        ) : loading ? (
          <p className="text-lg text-gray-600">Loading logs...</p>
        ) : (
          <div className="flex flex-col space-y-6">
            <div className="w-full">
              <EventsOverTime
                logs={filteredAndSortedLogs}
                timeRange={timeRange}
                startDate={startDate}
                endDate={endDate}
              />
            </div>
            <div className="flex flex-col lg:flex-row lg:space-x-10">
              <div className="flex-grow lg:w-3/4">
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
                  uniqueIds={uniqueIds}
                  uniqueLogLevels={uniqueLogLevels}
                  uniqueTypes={uniqueTypes}
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
              <div className="lg:w-1/4 space-y-6">
                <LogsInfo {...logsInfo} />
                <OpenEvents events={openEvents} selectedLogLevel={selectedLogLevel} />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
