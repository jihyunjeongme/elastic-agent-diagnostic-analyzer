import React, { useState, useMemo, useRef, useEffect } from "react";

const TreeTable = ({ data, searchTerm }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [sortColumn, setSortColumn] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [columnWidths, setColumnWidths] = useState({});
  const tableRef = useRef(null);
  const tableBodyRef = useRef(null);

  const toggleRow = (rowName) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(rowName)) {
      newExpandedRows.delete(rowName);
    } else {
      newExpandedRows.add(rowName);
    }
    setExpandedRows(newExpandedRows);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data.children;
    return [...data.children].sort((a, b) => {
      const aValue = a[sortColumn.toLowerCase().replace(/ /g, "_")];
      const bValue = b[sortColumn.toLowerCase().replace(/ /g, "_")];
      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [data.children, sortColumn, sortOrder]);

  const formatValue = (value, total) => {
    if (value === undefined || value === null) return "-";
    const percentage = ((value / total) * 100).toFixed(2);
    return `${percentage}% (${value.toExponential(4)})`;
  };

  const renderRow = (item, depth = 0) => {
    const isExpanded = expandedRows.has(item.name);
    const shouldShow =
      searchTerm === "" || item.name.toLowerCase().includes(searchTerm.toLowerCase());

    if (!shouldShow) {
      return null;
    }

    return (
      <React.Fragment key={item.name}>
        <tr className={depth % 2 === 0 ? "bg-gray-50" : "bg-white"}>
          <td
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            {item.children && item.children.length > 0 && (
              <button onClick={() => toggleRow(item.name)} className="mr-2">
                {isExpanded ? "▼" : "▶"}
              </button>
            )}
            {item.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.alloc_objects_inc, data.alloc_objects_inc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.alloc_objects_exc, data.alloc_objects_exc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.alloc_space_inc, data.alloc_space_inc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.alloc_space_exc, data.alloc_space_exc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.inuse_objects_inc, data.inuse_objects_inc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.inuse_objects_exc, data.inuse_objects_exc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.inuse_space_inc, data.inuse_space_inc)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {formatValue(item.inuse_space_exc, data.inuse_space_exc)}
          </td>
        </tr>
        {isExpanded && item.children && item.children.map((child) => renderRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const startResize = (e, column) => {
    e.preventDefault();
    const startX = e.pageX;
    const startWidth = columnWidths[column] || 200;

    const doDrag = (e) => {
      const newWidth = Math.max(100, startWidth + e.pageX - startX);
      setColumnWidths((prev) => ({ ...prev, [column]: newWidth }));
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.style.width = "100%";
      tableRef.current.style.overflowX = "auto";
    }
  }, []);

  const columns = [
    "Function",
    "ALLOC OBJECTS INC",
    "ALLOC OBJECTS EXC",
    "ALLOC SPACE INC",
    "ALLOC SPACE EXC",
    "INUSE OBJECTS INC",
    "INUSE OBJECTS EXC",
    "INUSE SPACE INC",
    "INUSE SPACE EXC",
  ];

  return (
    <div ref={tableRef} className="overflow-x-auto" style={{ maxHeight: "70vh" }}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer relative"
                style={{ width: columnWidths[column] || "auto", minWidth: "150px" }}
                onClick={() => handleSort(column)}
              >
                {column} {sortColumn === column && (sortOrder === "asc" ? "▲" : "▼")}
                <div
                  className="absolute right-0 top-0 h-full w-1 cursor-col-resize"
                  onMouseDown={(e) => startResize(e, column)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={tableBodyRef} className="bg-white divide-y divide-gray-200">
          {sortedData.map((item) => renderRow(item))}
        </tbody>
      </table>
    </div>
  );
};

export default TreeTable;
