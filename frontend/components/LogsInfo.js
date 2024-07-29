import React from "react";

const LogsInfo = ({ total, error, warn, others }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-3">Logs Info</h2>
      <div className="grid grid-cols-2 gap-2">
        <div>
          Total Logs: <span className="font-bold">{total}</span>
        </div>
        <div>
          Errors: <span className="font-bold text-red-600">{error}</span>
        </div>
        <div>
          Warnings: <span className="font-bold text-yellow-600">{warn}</span>
        </div>
        <div>
          Others: <span className="font-bold text-blue-600">{others}</span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(LogsInfo);
