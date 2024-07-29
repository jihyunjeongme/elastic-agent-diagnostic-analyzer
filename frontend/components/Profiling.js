import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { parseProfilingData } from "../utils/profilingUtils";

const FlameGraph = dynamic(() => import("./FlameGraph"), { ssr: false });
const TreeTable = dynamic(() => import("./TreeTable"), { ssr: false });

const Profiling = ({ profilingData }) => {
  const [parsedData, setParsedData] = useState({});
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("flamegraph");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function parseData() {
      setIsLoading(true);
      const parsed = {};
      if (profilingData && typeof profilingData === "object") {
        for (const [fileName, data] of Object.entries(profilingData)) {
          if (data && data.data) {
            try {
              parsed[fileName] = await parseProfilingData(data.data);
              parsed[fileName].type = data.type;
            } catch (error) {
              parsed[fileName] = { error: error.message, type: data.type };
            }
          } else {
            parsed[fileName] = data;
          }
        }
      }
      setParsedData(parsed);
      setIsLoading(false);
    }
    parseData();
  }, [profilingData]);

  if (isLoading) {
    return <div>Loading profiling data...</div>;
  }

  if (!parsedData || Object.keys(parsedData).length === 0) {
    return <div>No profiling data available.</div>;
  }

  const handleProfileSelect = (fileName) => {
    setSelectedProfile(fileName);
    console.log("Selected profile:", fileName, parsedData[fileName]);
  };

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-2xl font-bold mb-4">Profiling Data</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(parsedData).map((fileName) => (
          <button
            key={fileName}
            className={`px-4 py-2 rounded ${
              selectedProfile === fileName
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            onClick={() => handleProfileSelect(fileName)}
          >
            {fileName}
          </button>
        ))}
      </div>
      {selectedProfile && (
        <div className="border rounded p-4">
          <h3 className="text-xl font-semibold mb-2">
            {selectedProfile} ({parsedData[selectedProfile].type})
          </h3>
          {parsedData[selectedProfile].error ? (
            <p className="text-red-500">{parsedData[selectedProfile].error}</p>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <button
                    className={`mr-2 px-4 py-2 rounded ${
                      viewMode === "flamegraph" ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setViewMode("flamegraph")}
                  >
                    Flame Graph
                  </button>
                  <button
                    className={`px-4 py-2 rounded ${
                      viewMode === "treetable" ? "bg-blue-500 text-white" : "bg-gray-200"
                    }`}
                    onClick={() => setViewMode("treetable")}
                  >
                    Tree Table
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="px-4 py-2 border rounded"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <p className="mb-2">Total value: {parsedData[selectedProfile].value}</p>
              <p className="mb-2">
                Number of children: {parsedData[selectedProfile].children.length}
              </p>
              <div className="w-full h-full" style={{ minHeight: "70vh" }}>
                {viewMode === "flamegraph" ? (
                  <FlameGraph key={selectedProfile} data={parsedData[selectedProfile]} />
                ) : (
                  <TreeTable data={parsedData[selectedProfile]} searchTerm={searchTerm} />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Profiling;
