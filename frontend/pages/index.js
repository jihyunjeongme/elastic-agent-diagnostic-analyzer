import { useState, useCallback, useRef, useEffect } from "react";
import Layout from "../components/Layout";
import { handleFileUpload, readConfigFiles, handleProfilingFiles } from "../utils/fileHandler";
import ConfigSection from "../components/ConfigSection";
import VersionInfo from "../components/VersionInfo";
import ComponentsTable from "../components/ComponentsTable";
import AgentState from "../components/AgentState";
import styles from "../styles/Home.module.css";
import { truncateText, getStatusColor, getRandomColor } from "../utils/helpers";
import JSZip from "jszip";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import { readLogsFromZip } from "../utils/logHandler";

export default function Home() {
  const {
    activeTab,
    setActiveTab,
    diagnosticInfo,
    setDiagnosticInfo,
    isFileUploaded,
    setIsFileUploaded,
    configData,
    setConfigData,
  } = useDiagnostic();

  const [error, setError] = useState(null);
  const [sortColumn, setSortColumn] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const [nameColors, setNameColors] = useState({});
  const [versionColors, setVersionColors] = useState({});
  const tableRef = useRef(null);

  useEffect(() => {
    if (diagnosticInfo && diagnosticInfo.components) {
      const newNameColors = {};
      const newVersionColors = {};
      diagnosticInfo.components.forEach((component) => {
        if (component.version_info) {
          if (!newNameColors[component.version_info.name]) {
            newNameColors[component.version_info.name] = getRandomColor();
          }
          if (!newVersionColors[component.version_info.version]) {
            newVersionColors[component.version_info.version] = getRandomColor();
          }
        }
      });
      setNameColors(newNameColors);
      setVersionColors(newVersionColors);
    }
  }, [diagnosticInfo]);

  useEffect(() => {
    if (tableRef.current) {
      const resizableGrid = (table) => {
        const cols = table.querySelectorAll("th");
        [].forEach.call(cols, function (col) {
          const resizer = document.createElement("div");
          resizer.classList.add("resizer");
          resizer.style.height = `${table.offsetHeight}px`;
          col.appendChild(resizer);
          createResizableColumn(col, resizer);
        });
      };

      const createResizableColumn = (col, resizer) => {
        let x = 0;
        let w = 0;

        const mouseDownHandler = function (e) {
          x = e.clientX;
          const styles = window.getComputedStyle(col);
          w = parseInt(styles.width, 10);

          document.addEventListener("mousemove", mouseMoveHandler);
          document.addEventListener("mouseup", mouseUpHandler);

          resizer.classList.add("resizing");
        };

        const mouseMoveHandler = function (e) {
          const dx = e.clientX - x;
          col.style.width = `${w + dx}px`;
        };

        const mouseUpHandler = function () {
          resizer.classList.remove("resizing");
          document.removeEventListener("mousemove", mouseMoveHandler);
          document.removeEventListener("mouseup", mouseUpHandler);
        };

        resizer.addEventListener("mousedown", mouseDownHandler);
      };

      resizableGrid(tableRef.current);
    }
  }, [diagnosticInfo]);

  // const onFileUpload = useCallback(
  //   async (event) => {
  //     const file = event.target.files[0];
  //     if (!file) return;

  //     console.log("File selected:", file);
  //     setError(null);

  //     try {
  //       const zip = new JSZip();
  //       const contents = await zip.loadAsync(file);
  //       window.zipContents = contents;

  //       const info = await handleFileUpload(file);
  //       console.log("Parsed info:", info);
  //       setDiagnosticInfo(info);

  //       const configs = await readConfigFiles(contents);
  //       setConfigData(configs);

  //       setIsFileUploaded(true);
  //     } catch (error) {
  //       console.error("Error processing file:", error);
  //       setError("파일 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
  //       setDiagnosticInfo(null);
  //       setConfigData(null);
  //       setIsFileUploaded(false);
  //     }
  //   },
  //   [setDiagnosticInfo, setIsFileUploaded]
  // );

  const onFileUpload = useCallback(
    async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      console.log("File selected:", file);
      setError(null);

      try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        window.zipContents = contents;

        const info = await handleFileUpload(file);
        console.log("Parsed info:", info);
        setDiagnosticInfo(info);

        const configs = await readConfigFiles(contents);
        setConfigData(configs);

        setIsFileUploaded(true);
      } catch (error) {
        console.error("Error processing file:", error);
        setError("파일 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
        setDiagnosticInfo(null);
        setConfigData(null);
        setIsFileUploaded(false);
      }
    },
    [setDiagnosticInfo, setConfigData, setIsFileUploaded]
  );

  const onSortChange = useCallback((column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-6 w-full">
      {diagnosticInfo && (
        <>
          <VersionInfo
            buildTime={diagnosticInfo.build_time}
            commit={diagnosticInfo.commit}
            snapshot={diagnosticInfo.snapshot}
            version={diagnosticInfo.version}
          />
          <AgentState
            fleetMessage={diagnosticInfo.fleet_message}
            fleetState={diagnosticInfo.fleet_state}
            logLevel={diagnosticInfo.log_level}
            message={diagnosticInfo.message}
            state={diagnosticInfo.state}
          />
          <ComponentsTable
            components={diagnosticInfo.components}
            componentsActual={diagnosticInfo.componentsActual}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSortChange={onSortChange}
            getStatusColor={getStatusColor}
            nameColors={nameColors}
            versionColors={versionColors}
            truncateText={truncateText}
          />
        </>
      )}
    </div>
  );

  const renderConfigurationTab = () => (
    <div className="space-y-6">
      {configData ? (
        <>
          <ConfigSection title="Local Config" content={configData["local-config.yaml"]} />
          <ConfigSection title="Pre-Config" content={configData["pre-config.yaml"]} />
          <ConfigSection title="Variables" content={configData["variables.yaml"]} />
          <ConfigSection title="Computed Config" content={configData["computed-config.yaml"]} />
          <ConfigSection
            title="Expected Components"
            content={configData["components-expected.yaml"]}
          />
          <ConfigSection title="Actual Components" content={configData["components-actual.yaml"]} />
        </>
      ) : (
        <p className="text-xl">No configuration data available. Please upload a file first.</p>
      )}
    </div>
  );

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      <style jsx global>{`
        .resizer {
          position: absolute;
          top: 0;
          right: 0;
          width: 5px;
          cursor: col-resize;
          user-select: none;
        }
        .resizer:hover,
        .resizing {
          border-right: 2px solid blue;
        }
        th {
          position: relative;
        }
      `}</style>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!isFileUploaded && (
        <div className={styles.uploadContainer}>
          <h2 className={styles.uploadTitle}>Upload Elastic Agent Diagnostic Bundle</h2>
          <div className={styles.fileInputWrapper}>
            <label htmlFor="file-upload" className={styles.uploadButton}>
              Choose File
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={onFileUpload}
              accept=".zip"
              className={styles.fileInput}
            />
            <span className={styles.fileName}>
              {diagnosticInfo ? diagnosticInfo.fileName : "No file chosen"}
            </span>
          </div>
        </div>
      )}
      {isFileUploaded && (
        <div className="max-w-full">
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "configuration" && renderConfigurationTab()}
        </div>
      )}
    </Layout>
  );
}
