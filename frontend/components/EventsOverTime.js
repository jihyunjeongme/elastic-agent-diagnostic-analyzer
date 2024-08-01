import React, { useMemo, useState, useCallback, useEffect } from "react";

const EventsOverTime = ({ logs }) => {
  const [containerWidth, setContainerWidth] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const [selectedError, setSelectedError] = useState(null);
  const [labelWidth, setLabelWidth] = useState(400);

  const processedData = useMemo(() => {
    if (!logs || logs.length === 0) {
      return { data: [], xLabels: [], yLabels: [] };
    }

    const errorLogs = logs.filter((log) => log["log.level"]?.toLowerCase() === "error");
    const groupedErrors = {};

    errorLogs.forEach((log) => {
      const date = new Date(log["@timestamp"]).toISOString().split("T")[0];
      if (!groupedErrors[log.message]) {
        groupedErrors[log.message] = {
          total: 0,
          dates: {},
          log,
          firstTimestamp: log["@timestamp"],
          lastTimestamp: log["@timestamp"],
        };
      }
      groupedErrors[log.message].total++;
      groupedErrors[log.message].dates[date] = (groupedErrors[log.message].dates[date] || 0) + 1;
      groupedErrors[log.message].lastTimestamp = log["@timestamp"];
    });

    const sortedErrors = Object.entries(groupedErrors)
      .sort(([, a], [, b]) => b.total - a.total)
      .slice(0, showMore ? 10 : 5);

    const allDates = [
      ...new Set(errorLogs.map((log) => new Date(log["@timestamp"]).toISOString().split("T")[0])),
    ].sort();

    const heatmapData = sortedErrors.map(([, data]) =>
      allDates.map((date) => data.dates[date] || 0)
    );

    return {
      data: heatmapData,
      xLabels: allDates,
      yLabels: sortedErrors.map(([error, data]) => ({
        message: error,
        total: data.total,
        log: data.log,
        firstTimestamp: data.firstTimestamp,
        lastTimestamp: data.lastTimestamp,
      })),
    };
  }, [logs, showMore]);

  const getColor = useCallback((value) => {
    if (value >= 10) return "rgb(174,54,43)";
    if (value >= 5) return "rgb(215,153,148)";
    if (value >= 1) return "rgb(237,205,203)";
    return "rgb(255,255,255)";
  }, []);

  const handleMoreClick = useCallback((message) => {
    setSelectedError(message);
  }, []);

  const cellWidth = 40;

  useEffect(() => {
    const updateWidth = () => {
      const container = document.getElementById("heatmapContainer");
      if (container) {
        const newContainerWidth = container.offsetWidth;
        setContainerWidth(newContainerWidth);
        const newLabelWidth = Math.max(400, newContainerWidth * 0.3);
        setLabelWidth(newLabelWidth);
      }
    };

    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const gridWidth = processedData.xLabels.length * cellWidth;
  const availableWidth = Math.max(containerWidth - labelWidth, gridWidth);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 1) + "…";
  };

  if (processedData.data.length === 0) {
    return <div className="text-center text-gray-500">No error data available</div>;
  }

  return (
    <div className="w-full" id="heatmapContainer">
      <h2 className="text-2xl font-bold mb-4">Events Over Time</h2>
      <div className="flex flex-col items-start overflow-x-auto border border-gray-300 rounded-lg p-5 bg-gray-50">
        <div className="flex w-full justify-center">
          <div
            className="flex flex-col justify-center mr-2"
            style={{ width: `${labelWidth}px`, minWidth: `${labelWidth}px` }}
          >
            {processedData.yLabels.map((label, index) => {
              const maxTextLength = Math.floor((labelWidth - 60) / 8); // Adjust for "More" button
              const truncatedMessage = truncateText(label.message, maxTextLength);
              const showMoreButton = truncatedMessage !== label.message;
              return (
                <div
                  key={index}
                  className="text-sm whitespace-nowrap overflow-hidden h-[40px] flex items-center px-2 py-2 border-r border-gray-200"
                >
                  <span className="flex-1 overflow-hidden truncate pr-1">{truncatedMessage}</span>
                  {showMoreButton && (
                    <button
                      onClick={() => handleMoreClick(label)}
                      className="bg-transparent border-none text-blue-500 cursor-pointer text-xs p-0 ml-1 whitespace-nowrap hover:underline flex-shrink-0"
                    >
                      More
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <div
            className="flex-grow relative"
            style={{ width: `${availableWidth}px`, maxWidth: `${availableWidth}px` }}
          >
            <div
              className="grid absolute top-0 left-0"
              style={{
                gridTemplateColumns: `repeat(${processedData.xLabels.length}, ${cellWidth}px)`,
                gridAutoRows: "40px",
                width: `${gridWidth}px`,
              }}
            >
              {processedData.data.map((row, rowIndex) =>
                row.map((value, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className="flex items-center justify-center text-xs font-bold text-gray-800 border-r border-b border-white"
                    style={{
                      backgroundColor: getColor(value),
                      opacity: value > 0 ? 1 : 0.1,
                      cursor: "initial",
                      width: `${cellWidth}px`,
                      height: "40px",
                    }}
                  >
                    {value > 0 && value}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div
          className="flex justify-start w-full text-xs border-t border-gray-200 pt-2"
          style={{
            marginLeft: `${labelWidth}px`,
            width: `${gridWidth}px`,
          }}
        >
          {processedData.xLabels.map((label, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-start"
              style={{
                width: `${cellWidth}px`,
              }}
            >
              <div className="h-4 w-px bg-gray-300" />
              <div
                className="mt-1 transform -rotate-90 origin-top-left translate-y-full whitespace-nowrap"
                style={{ width: `${cellWidth}px` }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-5 text-center">
        <button
          onClick={() => setShowMore(!showMore)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
      </div>
      {selectedError && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl max-h-[80vh] overflow-y-auto relative">
            <h3 className="text-xl font-bold mb-4 text-blue-600">{selectedError.message}</h3>
            <p className="mb-2">
              <strong className="font-semibold text-gray-700 inline-block w-[140px]">
                Component:
              </strong>
              <span className="text-gray-800">{selectedError.log.component?.id || "N/A"}</span>
            </p>
            <p className="mb-2">
              <strong className="font-semibold text-gray-700 inline-block w-[140px]">
                Message:
              </strong>
              <span className="text-gray-800">{selectedError.message}</span>
            </p>
            <p className="mb-2">
              <strong className="font-semibold text-gray-700 inline-block w-[140px]">Total:</strong>
              <span className="text-gray-800">{selectedError.total}</span>
            </p>
            <p className="mb-2">
              <strong className="font-semibold text-gray-700 inline-block w-[140px]">
                First Occurred:
              </strong>
              <span className="text-gray-800">
                {new Date(selectedError.firstTimestamp).toLocaleString()}
              </span>
            </p>
            <p className="mb-2">
              <strong className="font-semibold text-gray-700 inline-block w-[140px]">
                Last Occurred:
              </strong>
              <span className="text-gray-800">
                {new Date(selectedError.lastTimestamp).toLocaleString()}
              </span>
            </p>
            <button
              onClick={() => setSelectedError(null)}
              className="absolute top-2 right-2 bg-gray-200 text-gray-600 border-none rounded-full w-8 h-8 text-base leading-8 text-center cursor-pointer hover:bg-gray-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsOverTime;
