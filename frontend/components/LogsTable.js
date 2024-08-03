import React, { useCallback, useMemo } from "react";
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
  uniqueIds,
  uniqueLogLevels,
  uniqueTypes,
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

  const columns = useMemo(
    () =>
      Object.keys(visibleColumns)
        .filter((key) => visibleColumns[key])
        .map((key) => ({
          Header: key,
          accessor: key,
          Cell: ({ value, row }) => {
            if (key === "log.level") {
              return (
                <span
                  className={`${styles.badge} ${
                    logLevelColors[value?.toUpperCase()] || styles.defaultLevel
                  }`}
                >
                  {value}
                </span>
              );
            } else if (key === "component.id" || key === "component.type") {
              return row.original.component?.[key.split(".")[1]] || "N/A";
            } else if (key === "message") {
              return (
                <div className={styles.messageCell} title={value}>
                  {value}
                </div>
              );
            }
            return value || "N/A";
          },
        })),
    [visibleColumns, logLevelColors]
  );

  const defaultColumn = useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: logs,
      defaultColumn,
      initialState: { sortBy: [{ id: sortConfig.key, desc: sortConfig.direction === "desc" }] },
      manualSortBy: true,
      disableMultiSort: true,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );

  const handleSort = useCallback(
    (column) => {
      onSort(column.id);
    },
    [onSort]
  );

  return (
    <div className={styles.tableContainer}>
      <h2 className={styles.title}>Log Table</h2>
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

      <div className={styles.tableWrapper}>
        <table {...getTableProps()} className={styles.table}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()} className={styles.headerGroup}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={styles.th}
                    onClick={() => handleSort(column)}
                  >
                    {column.render("Header")}
                    <div
                      {...column.getResizerProps()}
                      className={`${styles.resizer} ${column.isResizing ? "isResizing" : ""}`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className={styles.tbody}>
            {rows.map((row) => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className={styles.tr}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} className={styles.td}>
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
};

export default LogsTable;
