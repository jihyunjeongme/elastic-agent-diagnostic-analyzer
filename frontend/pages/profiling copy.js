import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Profiling from "../components/Profiling";
import { handleProfilingFiles } from "../utils/fileHandler";
import { useDiagnostic } from "../contexts/DiagnosticContext";

export default function ProfilingPage() {
  const { activeTab, setActiveTab, isFileUploaded, diagnosticInfo, setDiagnosticInfo } =
    useDiagnostic();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchProfilingData() {
      if (isFileUploaded && window.zipContents && !diagnosticInfo.profilingData) {
        setIsLoading(true);
        setError(null);
        try {
          const data = await handleProfilingFiles(window.zipContents);
          console.log("Fetched profiling data:", data);
          setDiagnosticInfo((prev) => ({ ...prev, profilingData: data }));
        } catch (error) {
          console.error("Error fetching profiling data:", error);
          setError("Failed to load profiling data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    }

    fetchProfilingData();
  }, [isFileUploaded, diagnosticInfo, setDiagnosticInfo]);

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <h1 className="text-3xl font-bold mb-4">Profiling</h1>
      {isFileUploaded ? (
        isLoading ? (
          <p>Loading profiling data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Profiling profilingData={diagnosticInfo.profilingData} />
        )
      ) : (
        <p>Please upload a diagnostic bundle first.</p>
      )}
    </Layout>
  );
}
