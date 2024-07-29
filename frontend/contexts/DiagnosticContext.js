// contexts/DiagnosticContext.js
import React, { createContext, useState, useContext } from "react";

const DiagnosticContext = createContext();

export function DiagnosticProvider({ children }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [diagnosticInfo, setDiagnosticInfo] = useState(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [configData, setConfigData] = useState(null);
  const [logsData, setLogsData] = useState(null);
  const [profilingData, setProfilingData] = useState(null);

  return (
    <DiagnosticContext.Provider
      value={{
        activeTab,
        setActiveTab,
        diagnosticInfo,
        setDiagnosticInfo,
        isFileUploaded,
        setIsFileUploaded,
        configData,
        setConfigData,
        logsData,
        setLogsData,
        profilingData,
        setProfilingData,
      }}
    >
      {children}
    </DiagnosticContext.Provider>
  );
}

export function useDiagnostic() {
  return useContext(DiagnosticContext);
}
