import { useCallback } from "react";
import { useRouter } from "next/router";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import Header from "./Header";

export default function Layout({ children }) {
  const router = useRouter();
  const { activeTab, setActiveTab, isFileUploaded } = useDiagnostic();

  const tabs = [
    { name: "Overview", id: "overview" },
    { name: "Configuration", id: "configuration" },
    { name: "Logs", id: "logs" },
    { name: "Profiling", id: "profiling" },
  ];

  const handleTabClick = useCallback(
    (tabId) => {
      if (tabId !== "overview" && !isFileUploaded) {
        alert("A file must be attached before accessing other tabs.");
        return;
      }
      setActiveTab(tabId);
      router.push(`/${tabId === "overview" ? "" : tabId}`);
    },
    [setActiveTab, router, isFileUploaded]
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <Header version="0.1.0" />
      <nav className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`py-2 sm:py-3 text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200 w-full ${
                  activeTab === tab.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                } ${
                  !isFileUploaded && tab.id !== "overview" ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={!isFileUploaded && tab.id !== "overview"}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8 max-w-7xl">{children}</main>
    </div>
  );
}
