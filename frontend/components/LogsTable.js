import React, { useCallback, useMemo, useState } from "react";
import { useTable, useSortBy, useResizeColumns, useBlockLayout } from "react-table";
import DatePicker from "react-datepicker";
import Pagination from "./Pagination";
import styles from "../styles/LogsTable.module.css";

const LogsTable = ({
  logs,
  sortConfig,
  onSort,
  visibleColumns,
  selectedId,
  setSelectedId,
  selectedLogLevel,
  setSelectedLogLevel,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  uniqueIds,
  uniqueLogLevels,
  uniqueTypes,
  uniqueStatuses,
  timeRange,
  handleTimeRangeChange,
  isAbsoluteTime,
  setIsAbsoluteTime,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  handleColumnToggle,
  currentPage,
  totalPages,
  onPageChange,
}) => {
  console.log("Logs received in LogsTable:", logs);
  const [localSortConfig, setLocalSortConfig] = useState(sortConfig);

  const logLevelColors = useMemo(
    () => ({
      ERROR: styles.errorLevel,
      WARN: styles.warnLevel,
      INFO: styles.infoLevel,
      DEBUG: styles.debugLevel,
      TRACE: styles.traceLevel,
      FATAL: styles.fatalLevel,
    }),
    []
  );

  const allColumns = useMemo(
    () => [
      { Header: "@timestamp", accessor: "@timestamp" },
      { Header: "Log Level", accessor: "log.level" },
      { Header: "Status", accessor: "status" },
      { Header: "Message", accessor: "message" },
      { Header: "Component ID", accessor: "component.id" },
      { Header: "Component Type", accessor: "component.type" },
    ],
    []
  );

  const columns = useMemo(
    () => allColumns.filter((column) => visibleColumns[column.accessor]),
    [visibleColumns]
  );

  const defaultColumn = useMemo(
    () => ({
      minWidth: 50,
      width: 150,
      maxWidth: 1000,
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: logs,
      defaultColumn,
      initialState: {
        sortBy: [{ id: localSortConfig.key, desc: localSortConfig.direction === "desc" }],
      },
      manualSortBy: true,
      disableMultiSort: true,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );

  const handleSort = useCallback(
    (columnId) => {
      const isDesc = localSortConfig.key === columnId && localSortConfig.direction === "asc";
      const newSortConfig = {
        key: columnId,
        direction: isDesc ? "desc" : "asc",
      };
      setLocalSortConfig(newSortConfig);
      onSort(newSortConfig);
    },
    [localSortConfig, onSort]
  );

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Log Table</h2>

      {/* Filters section */}
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
          {uniqueLogLevels
            .filter((level) => level !== "ALL")
            .map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={styles.select}
        >
          <option value="ALL">ALL Statuses</option>
          {uniqueStatuses
            .filter((status) => status !== "ALL")
            .map((status) => (
              <option key={status} value={status}>
                {status}
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
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className={styles.datePicker}
                dateFormat="yyyy-MM-dd"
                popperClassName={styles.datePickerPopper}
                popperPlacement="bottom-start"
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 10],
                    },
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            </div>
            <div className={styles.datePickerWrapper}>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className={styles.datePicker}
                dateFormat="yyyy-MM-dd"
                popperClassName={styles.datePickerPopper}
                popperPlacement="bottom-start"
                popperModifiers={[
                  {
                    name: "offset",
                    options: {
                      offset: [0, 10],
                    },
                  },
                  {
                    name: "preventOverflow",
                    options: {
                      rootBoundary: "viewport",
                      tether: false,
                      altAxis: true,
                    },
                  },
                ]}
              />
            </div>
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

      {/* Column toggle section */}
      <div className={styles.columnToggle}>
        {allColumns.map((column) => (
          <label key={column.accessor} className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={visibleColumns[column.accessor]}
              onChange={() => handleColumnToggle(column.accessor)}
              className={styles.toggleCheckbox}
            />
            <span className={styles.toggleText}>{column.Header}</span>
          </label>
        ))}
      </div>

      {/* Table section */}
      <div className={styles.tableWrapper}>
        <div {...getTableProps()} className={styles.table}>
          <div className={styles.thead}>
            {headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className={styles.tr}>
                {headerGroup.headers.map((column, index) => (
                  <div
                    {...column.getHeaderProps()}
                    className={`${styles.th} ${
                      index < headerGroup.headers.length - 1 ? styles.cellBorder : ""
                    }`}
                    style={{
                      ...column.getHeaderProps().style,
                      position: "relative",
                    }}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className={styles.headerContent}>{column.render("Header")}</div>
                    <div
                      {...column.getResizerProps()}
                      className={`${styles.resizer} ${
                        column.isResizing ? styles.resizerActive : ""
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div {...getTableBodyProps()} className={styles.tbody}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <div {...row.getRowProps()} className={styles.tr}>
                  {row.cells.map((cell, index) => {
                    console.log(
                      `Rendering cell for row ${row.id}, column ${cell.column.id}:`,
                      cell.value
                    );

                    const cellValue = cell.value ?? row.original[cell.column.id];
                    return (
                      <div
                        {...cell.getCellProps()}
                        className={`${styles.td} ${
                          index < row.cells.length - 1 ? styles.cellBorder : ""
                        }`}
                        style={{
                          ...cell.getCellProps().style,
                        }}
                      >
                        {cell.column.id === "log.level" ? (
                          <span
                            className={`${styles.logLevel} ${
                              styles[`${cellValue.toLowerCase()}Level`]
                            }`}
                          >
                            {cellValue.toUpperCase()}
                          </span>
                        ) : cell.column.id === "status" ? (
                          <span className={styles.status}>{cellValue || "N/A"}</span>
                        ) : (
                          <div className={styles.cellContent} data-column={cell.column.id}>
                            {cellValue || "N/A"}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default LogsTable;
