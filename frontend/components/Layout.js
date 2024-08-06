import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import Header from "./Header";

export default function Layout({ children }) {
  const router = useRouter();
  const { activeTab, setActiveTab, isFileUploaded } = useDiagnostic();
  const [showPopup, setShowPopup] = useState(false);

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
      if (tabId === "profiling") {
        return; // Profiling tab is always disabled
      }
      setActiveTab(tabId);
      router.push(`/${tabId === "overview" ? "" : tabId}`);
    },
    [setActiveTab, router, isFileUploaded]
  );

  const handleInfoHover = () => {
    setShowPopup(true);
  };

  const handleInfoLeave = () => {
    setShowPopup(false);
  };

  return (
    <div className="layout-container">
      <Header version="0.1.0" />
      <nav className="nav-container">
        <div className="tab-container">
          <div className="tab-list">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`tab-button ${activeTab === tab.id ? "active" : ""} ${
                  (!isFileUploaded && tab.id !== "overview") || tab.id === "profiling"
                    ? "disabled"
                    : ""
                } ${tab.id === "profiling" ? "profiling-tab" : ""}`}
                disabled={(!isFileUploaded && tab.id !== "overview") || tab.id === "profiling"}
              >
                {tab.name}
                {tab.id === "profiling" && (
                  <span
                    className="info-icon"
                    onMouseEnter={handleInfoHover}
                    onMouseLeave={handleInfoLeave}
                  >
                    i
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
      {showPopup && (
        <div className="popup-message">
          The project is currently under development and actively being worked on.
        </div>
      )}
    </div>
  );
}
