import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";

export default function ComponentsTable({
  components,
  sortColumn,
  sortDirection,
  onSortChange,
  componentsActual,
}) {
  const [tableWidth, setTableWidth] = useState("100%");

  useEffect(() => {
    const handleResize = () => {
      setTableWidth(`${window.innerWidth - 40}px`);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        width: 150,
        Cell: ({ value }) => (
          <div className="truncate text-sm" title={value}>
            {value}
          </div>
        ),
      },
      {
        Header: "Version Info",
        accessor: "version_info",
        width: 250,
        Cell: ({ value }) =>
          value && (
            <div className="space-y-1">
              <p className="text-sm">
                Name: <span className="font-medium bg-gray-200 px-1 rounded">{value.name}</span>
              </p>
              <p className="text-sm">
                Version:{" "}
                <span
                  className={`font-medium px-1 rounded ${
                    value.version ? "bg-gray-200" : "bg-gray-200"
                  }`}
                >
                  {value.version || "N/A"}
                </span>
              </p>
            </div>
          ),
      },
      {
        Header: "Status",
        accessor: "message",
        width: 200,
        Cell: ({ value }) => (
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              value.toLowerCase().includes("healthy")
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "State",
        accessor: "state",
        width: 100,
        Cell: ({ value }) => (
          <div className="truncate text-sm" title={value}>
            {value}
          </div>
        ),
      },
      {
        Header: "I/O Type",
        accessor: "in_out_id",
        width: 200,
        Cell: ({ row }) => {
          const componentId = row.original.id;
          if (
            !componentsActual ||
            !Array.isArray(componentsActual) ||
            componentsActual.length === 0
          )
            return "N/A";

          const componentArray = componentsActual[0].components[0];
          const component = componentArray.find((c) => c.id === componentId);
          if (!component) return "N/A";

          return (
            <div className="text-sm space-y-1">
              <p>
                Input:{" "}
                <span className="font-medium">
                  {component.input_type || component.input_spec.input_type || "-"}
                </span>
              </p>
              <p>
                Output: <span className="font-medium">{component.output_type || "N/A"}</span>
              </p>
            </div>
          );
        },
      },
      {
        Header: "Units",
        accessor: "units",
        width: 300,
        Cell: ({ row }) => {
          const componentId = row.original.id;
          if (
            !componentsActual ||
            !Array.isArray(componentsActual) ||
            componentsActual.length === 0
          )
            return "N/A";

          const componentArray = componentsActual[0].components[0];
          const component = componentArray.find((c) => c.id === componentId);
          if (!component) return "N/A";

          return component.units.map((unit, index) => (
            <div key={index} className="text-sm mb-2 last:mb-0 space-y-1">
              <p>
                ID: <span className="font-medium">{unit.config?.id || "N/A"}</span>
              </p>
              <p>
                Version:{" "}
                <span className="font-medium">{unit.config?.meta?.package?.version || "N/A"}</span>
              </p>
              <p>
                Type: <span className="font-medium">{unit.config?.type || "N/A"}</span>
              </p>
            </div>
          ));
        },
      },
    ],
    [componentsActual]
  );

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 1000,
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
    {
      columns,
      data: components,
      defaultColumn,
      initialState: { sortBy: [{ id: sortColumn, desc: sortDirection === "desc" }] },
      manualSortBy: true,
      disableMultiSort: true,
    },
    useBlockLayout,
    useResizeColumns,
    useSortBy
  );

  const handleSort = useCallback(
    (columnId) => {
      const isDesc = sortColumn === columnId && sortDirection === "asc";
      onSortChange(columnId, isDesc ? "desc" : "asc");
    },
    [onSortChange, sortColumn, sortDirection]
  );

  return (
    <div className="w-full bg-white shadow-md rounded-lg overflow-hidden mb-6">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900">Components</h3>
      </div>
      <div className="p-6 overflow-x-auto">
        <div style={{ width: tableWidth }}>
          <table {...getTableProps()} className="min-w-full">
            <thead className="bg-gray-50">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column, index) => (
                    <th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider relative"
                      onClick={() => handleSort(column.id)}
                    >
                      {column.render("Header")}
                      {index < headerGroup.headers.length && (
                        <div
                          {...column.getResizerProps()}
                          className={`
                            absolute right-0 top-0 h-full w-1 bg-gray-100 cursor-col-resize
                            hover:bg-blue-500 active:bg-blue-500
                            ${column.isResizing ? "bg-blue-500" : ""}
                          `}
                        />
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
              {rows.map((row) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map((cell, index) => {
                      return (
                        <td
                          {...cell.getCellProps()}
                          className={`
                            px-6 py-4 whitespace-normal break-words relative
                            ${index < row.cells.length - 1 ? "border-r border-gray-200" : ""}
                          `}
                          key={cell.column.id}
                        >
                          {cell.render("Cell")}
                          {index < row.cells.length - 1 && (
                            <div
                              {...cell.column.getResizerProps()}
                              className={`
                                absolute right-0 top-0 h-full cursor-col-resize
                                hover:bg-blue-500 active:bg-blue-500
                                ${cell.column.isResizing ? "bg-blue-500" : ""}
                              `}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
