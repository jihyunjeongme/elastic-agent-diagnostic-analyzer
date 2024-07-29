import { useState, useEffect, useRef } from "react";
import YAML from "yaml";
import styles from "../styles/ConfigSection.module.css";

const YAMLLine = ({
  lineNumber,
  content,
  depth,
  isCollapsible,
  isCollapsed,
  onToggle,
  children,
}) => {
  const [key, value] = content.split(":").map((part) => part.trim());
  return (
    <>
      <div className={styles.codeLine} data-line-number={lineNumber}>
        <span className={styles.lineNumber}>{lineNumber}</span>
        <span className={styles.codeIndent} style={{ width: `${depth * 20}px` }} />
        {isCollapsible && (
          <span
            className={styles.codeToggle}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isCollapsed ? "▶" : "▼"}
          </span>
        )}
        <span className={styles.codeContent}>
          <span className={styles.key}>{key}:</span>
          {value && <span className={styles.value}> {value}</span>}
        </span>
      </div>
      {!isCollapsed && children}
    </>
  );
};

const YAMLContent = ({ content, depth = 0, startLine = 1, onToggle, collapsedLines }) => {
  let currentLine = startLine;

  const renderContent = (obj, currentDepth) => {
    return Object.entries(obj).map(([key, value]) => {
      const isCollapsible = typeof value === "object" && value !== null;
      const lineContent = `${key}:${isCollapsible ? "" : " " + value}`;
      const isCollapsed = collapsedLines.includes(currentLine);
      const lineNumber = currentLine++;

      return (
        <YAMLLine
          key={lineNumber}
          lineNumber={lineNumber}
          content={lineContent}
          depth={currentDepth}
          isCollapsible={isCollapsible}
          isCollapsed={isCollapsed}
          onToggle={() => onToggle(lineNumber)}
        >
          {isCollapsible && !isCollapsed && renderContent(value, currentDepth + 1)}
        </YAMLLine>
      );
    });
  };

  return <>{renderContent(content, depth)}</>;
};

export default function ConfigSection({ title, content, description }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [parsedContent, setParsedContent] = useState(null);
  const [collapsedLines, setCollapsedLines] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const codeRef = useRef(null);

  useEffect(() => {
    if (isExpanded && content) {
      try {
        const parsed = typeof content === "string" ? YAML.parse(content) : content;
        setParsedContent(parsed);
      } catch (e) {
        console.error("Failed to parse content:", e);
        setParsedContent(content);
      }
    }
  }, [content, isExpanded]);

  const toggleLine = (lineNumber) => {
    setCollapsedLines((prev) =>
      prev.includes(lineNumber) ? prev.filter((line) => line !== lineNumber) : [...prev, lineNumber]
    );
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <button className={styles.toggleButton} onClick={() => setIsExpanded(!isExpanded)}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
      </button>
      {isExpanded && (
        <div className={styles.content}>
          <div className={styles.controls}>
            <button onClick={toggleDarkMode} className={styles.darkModeToggle}>
              {isDarkMode ? "Light" : "Dark"}
            </button>
          </div>
          <div
            ref={codeRef}
            className={`${styles.codeContainer} ${isDarkMode ? styles.darkMode : ""}`}
          >
            {parsedContent && (
              <YAMLContent
                content={parsedContent}
                onToggle={toggleLine}
                collapsedLines={collapsedLines}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
