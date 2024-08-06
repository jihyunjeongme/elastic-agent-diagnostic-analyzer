import React, { useMemo, useCallback, useEffect, useState } from "react";
import { useTable, useSortBy, useBlockLayout, useResizeColumns } from "react-table";
import styles from "../styles/ComponentsTable.module.css";

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
        Cell: ({ value }) => <div className={styles.cellContent}>{value}</div>,
      },
      {
        Header: "Version Info",
        accessor: "version_info",
        width: 250,
        Cell: ({ value }) =>
          value && (
            <div className={styles.versionInfo}>
              <p className={styles.cellContent}>
                Name: <span className={styles.fontMedium}>{value.name}</span>
              </p>
              <p className={styles.cellContent}>
                Version: <span className={styles.fontMedium}>{value.version || "N/A"}</span>
              </p>
            </div>
          ),
      },
      {
        Header: "Status",
        accessor: "message",
        width: 200,
        Cell: ({ value }) => (
          <p className={styles.cellContent}>
            <span
              className={`${styles.statusBadge} ${
                value.toLowerCase().includes("healthy")
                  ? styles.healthyBadge
                  : styles.unhealthyBadge
              }`}
            >
              {value}
            </span>
          </p>
        ),
      },
      {
        Header: "State",
        accessor: "state",
        width: 100,
        Cell: ({ value }) => <div className={styles.cellContent}>{value}</div>,
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
            <div className={styles.ioTypeInfo}>
              <p className={styles.cellContent}>
                Input:{" "}
                <span className={styles.fontMedium}>
                  {component.input_type || component.input_spec.input_type || "-"}
                </span>
              </p>
              <p className={styles.cellContent}>
                Output: <span className={styles.fontMedium}>{component.output_type || "N/A"}</span>
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
            <div key={index} className={styles.unitInfo}>
              <p className={styles.cellContent}>
                ID: <span className={styles.fontMedium}>{unit.config?.id || "N/A"}</span>
              </p>
              <p className={styles.cellContent}>
                Version:{" "}
                <span className={styles.fontMedium}>
                  {unit.config?.meta?.package?.version || "N/A"}
                </span>
              </p>
              <p className={styles.cellContent}>
                Type: <span className={styles.fontMedium}>{unit.config?.type || "N/A"}</span>
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
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader}>
        <h3 className={styles.tableTitle}>Components</h3>
      </div>
      <div className={styles.tableWrapper} style={{ width: tableWidth }}>
        <div {...getTableProps()} className={styles.table}>
          <div>
            {headerGroups.map((headerGroup) => (
              <div {...headerGroup.getHeaderGroupProps()} className={styles.tr}>
                {headerGroup.headers.map((column) => (
                  <div
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className={styles.th}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.id)}
                  >
                    <div className={styles.cellContent}>{column.render("Header")}</div>
                    <div
                      {...column.getResizerProps()}
                      className={`${styles.resizer} ${
                        column.isResizing ? styles.resizerActive : ""
                      }`}
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
                <div {...row.getRowProps()} className={styles.tr}>
                  {row.cells.map((cell) => (
                    <div
                      {...cell.getCellProps()}
                      className={styles.td}
                      style={{ width: cell.column.width }}
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
    </div>
  );
}
