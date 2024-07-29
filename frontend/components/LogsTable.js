import React, { useMemo } from "react";
import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";
import styles from "../styles/LogsTable.module.css";

export default function LogsTable({ logs, sortConfig, onSort, visibleColumns }) {
  console.log("Received logs in LogsTable:", logs);
  console.log("Received visibleColumns:", visibleColumns);

  // 테이블 컬럼 정의
  const columns = useMemo(() => {
    const allColumns = [
      { Header: "Timestamp", accessor: "@timestamp", width: 180 },
      { Header: "Level", accessor: "log.level", width: 80 },
      { Header: "Message", accessor: "message", width: 300 },
      { Header: "Component ID", accessor: "component.id", width: 150 },
      { Header: "Type", accessor: "component.type", width: 100 },
    ];
    return allColumns.filter((column) => visibleColumns && visibleColumns[column.accessor]);
  }, [visibleColumns]);

  // 로그 데이터 처리
  const data = useMemo(() => {
    console.log("Processing logs for table:", logs);
    return logs.map((log) => ({
      "@timestamp": log["@timestamp"] || "N/A",
      "log.level": log["log.level"] || "N/A",
      message: log.message || "N/A",
      "component.id": log.component?.id || "N/A",
      "component.type": log.component?.type || "N/A",
    }));
  }, [logs]);

  console.log("Processed data:", data);

  // 기본 컬럼 설정
  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400,
    }),
    []
  );

  // react-table 훅 사용
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: {
        sortBy: [{ id: sortConfig.key, desc: sortConfig.direction === "desc" }],
      },
      manualSortBy: true,
      disableMultiSort: true,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );

  console.log("Rows:", rows);

  return (
    <div className={styles.tableContainer}>
      <table {...getTableProps()} className={styles.table}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} className={styles.tr}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className={styles.th}
                  onClick={() => onSort(column.id)}
                >
                  {column.render("Header")}
                  <div
                    {...column.getResizerProps()}
                    className={`${styles.resizer} ${column.isResizing ? styles.isResizing : ""}`}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className={styles.tr}>
                {row.cells.map((cell) => {
                  // 셀 값이 null이면 원본 데이터에서 값을 가져옴
                  const cellValue = cell.value ?? row.original[cell.column.id];
                  return (
                    <td {...cell.getCellProps()} className={styles.td}>
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
