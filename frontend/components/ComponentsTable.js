import React, { useMemo, useCallback } from "react";
import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";
import styles from "../styles/ComponentsTable.module.css";
import commonStyles from "../styles/CommonStyles.module.css";

export default function ComponentsTable({
  components,
  sortColumn,
  sortDirection,
  onSortChange,
  componentsActual,
}) {
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
        width: 150,
      },
      {
        Header: "Version Info",
        accessor: "version_info",
        width: 250,
        Cell: ({ value }) =>
          value && (
            <div>
              <p className={styles.versionInfo}>
                Name: <span className={styles.versionName}>{value.name}</span> Version:{" "}
                <span className={styles.versionNumber}>{value.version}</span>
              </p>
            </div>
          ),
      },
      {
        Header: "Status",
        accessor: "message",
        width: 150,
        Cell: ({ value }) => (
          <span
            className={`${styles.badge} ${
              value.toLowerCase().includes("healthy") ? styles.healthyBadge : styles.unhealthyBadge
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
            <div>
              <p>Input: {component.input_type || component.input_spec.input_type || "-"}</p>
              <p>Output: {component.output_type || "N/A"}</p>
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
            <div key={index} className={styles.unit}>
              <p>
                <span className={styles.unitLabel}>ID:</span>{" "}
                <span className={styles.unitValue}>{unit.config?.id || "N/A"}</span>
              </p>
              <p>
                <span className={styles.unitLabel}>Version:</span>{" "}
                <span className={styles.unitValue}>
                  {unit.config?.meta?.package?.version || "N/A"}
                </span>
              </p>
              <p>
                <span className={styles.unitLabel}>Type:</span>{" "}
                <span className={styles.unitValue}>{unit.config?.type || "N/A"}</span>
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
    <div className={commonStyles.container}>
      <div className={commonStyles.header}>
        <h3 className={commonStyles.title}>Components</h3>
      </div>
      <div className={commonStyles.content}>
        <table {...getTableProps()} className={styles.table}>
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={styles.th}
                    onClick={() => handleSort(column.id)}
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
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} className={styles.td} key={cell.column.id}>
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
    </div>
  );
}
