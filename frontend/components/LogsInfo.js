import React from "react";

const LogsInfo = ({ total, error, warn, info, debug, trace }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-5 mb-5">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Logs Info</h2>
      <div className="space-y-2">
        <p className="text-sm">
          Total: <span className="font-medium">{total}</span>
        </p>
        <p className="text-sm text-red-600">
          Error: <span className="font-medium">{error}</span>
        </p>
        <p className="text-sm text-yellow-600">
          Warn: <span className="font-medium">{warn}</span>
        </p>
        <p className="text-sm text-blue-600">
          Info: <span className="font-medium">{info}</span>
        </p>
        <p className="text-sm text-green-600">
          Debug: <span className="font-medium">{debug}</span>
        </p>
        <p className="text-sm text-purple-600">
          Trace: <span className="font-medium">{trace}</span>
        </p>
      </div>
    </div>
  );
};

export default LogsInfo;
