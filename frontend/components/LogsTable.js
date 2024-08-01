import React, { useCallback } from "react";
import { useTable, useSortBy, useResizeColumns, useBlockLayout } from "react-table";

const LogsTable = ({ logs, sortConfig, onSort, visibleColumns }) => {
  const columns = React.useMemo(
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
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    value?.toLowerCase() === "error"
                      ? "bg-red-100 text-red-800"
                      : value?.toLowerCase() === "warn"
                      ? "bg-yellow-100 text-yellow-800"
                      : value?.toLowerCase() === "info"
                      ? "bg-blue-100 text-blue-800"
                      : value?.toLowerCase() === "debug"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {value}
                </span>
              );
            } else if (key === "component.id" || key === "component.type") {
              return row.original.component?.[key.split(".")[1]] || "N/A";
            } else if (key === "message") {
              return (
                <div className="truncate" title={value}>
                  {value}
                </div>
              );
            }
            return value || "N/A";
          },
        })),
    [visibleColumns]
  );

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 100,
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
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <div {...getTableProps()} className="inline-block min-w-full">
        <div>
          {headerGroups.map((headerGroup) => (
            <div {...headerGroup.getHeaderGroupProps()} className="bg-gray-50">
              {headerGroup.headers.map((column) => (
                <div
                  {...column.getHeaderProps()}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-between">
                    {column.render("Header")}
                    <span>{column.isSorted ? (column.isSortedDesc ? " ▼" : " ▲") : ""}</span>
                  </div>
                  <div
                    {...column.getResizerProps()}
                    className={`resizer ${column.isResizing ? "isResizing" : ""}`}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: 0,
                      height: "100%",
                      width: "5px",
                      background: "rgba(0, 0, 0, 0.1)",
                      cursor: "col-resize",
                      userSelect: "none",
                      touchAction: "none",
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <div {...row.getRowProps()} className="hover:bg-gray-50">
                {row.cells.map((cell) => (
                  <div
                    {...cell.getCellProps()}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-500"
                  >
                    {cell.render("Cell")}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LogsTable;
