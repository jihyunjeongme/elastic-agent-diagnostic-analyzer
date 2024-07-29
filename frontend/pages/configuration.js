// pages/configuration.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import ConfigSection from "../components/ConfigSection";
import { useDiagnostic } from "../contexts/DiagnosticContext";
import { readConfigFiles } from "../utils/fileHandler";
import styles from "../styles/Configuration.module.css";

export default function Configuration() {
  const { configData, setConfigData } = useDiagnostic();
  const [searchTerm, setSearchTerm] = useState("");

  const configDescriptions = {
    "local-config.yaml": "Local configuration settings for the Elastic Agent",
    "pre-config.yaml": "Initial agent policy configuration",
    "variables.yaml": "Environment variables and system information",
    "computed-config.yaml": "Final configuration after variable substitution",
    "components-expected.yaml": "Expected set of processes and units based on policy",
    "components-actual.yaml": "Currently running processes and units reported by runtime",
  };

  useEffect(() => {
    const loadConfigs = async () => {
      if (!configData) {
        try {
          const zipContents = window.zipContents;
          if (zipContents) {
            const configs = await readConfigFiles(zipContents);
            setConfigData(configs);
          } else {
            console.error("ZIP contents not found");
          }
        } catch (error) {
          console.error("Error loading configuration data:", error);
        }
      }
    };

    loadConfigs();
  }, [configData, setConfigData]);

  // 검색 기능 구현
  const filteredConfigs = Object.entries(configData || {}).filter(([key, value]) =>
    JSON.stringify({ [key]: value })
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <h1 className={styles.title}>Configuration</h1>
      {configData ? (
        <div className={styles.configContainer}>
          {filteredConfigs.map(([key, value]) => (
            <ConfigSection
              key={key}
              title={key}
              content={value}
              description={configDescriptions[key]}
            />
          ))}
        </div>
      ) : (
        <p>Loading configuration data...</p>
      )}
    </Layout>
  );
}
