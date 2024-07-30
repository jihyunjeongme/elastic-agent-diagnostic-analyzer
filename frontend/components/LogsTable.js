import React, { useMemo } from "react";
import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";
import styles from "../styles/LogsTable.module.css";

export default function LogsTable({ logs, sortConfig, onSort, visibleColumns }) {
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

  const data = useMemo(() => {
    return logs.map((log) => ({
      "@timestamp": log["@timestamp"] || "N/A",
      "log.level": log["log.level"]?.toUpperCase() || "N/A",
      message: log.message || "N/A",
      "component.id": log.component?.id || "N/A",
      "component.type": log.component?.type || "N/A",
    }));
  }, [logs]);

  const defaultColumn = React.useMemo(
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
                  const cellValue = cell.value ?? row.original[cell.column.id];
                  return (
                    <td
                      {...cell.getCellProps()}
                      className={`${styles.td} ${styles[cell.column.id]}`}
                      data-level={cell.column.id === "log.level" ? cellValue : undefined}
                    >
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
