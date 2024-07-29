import {
  parseISO,
  isAfter,
  isBefore,
  subDays,
  subMonths,
  subYears,
  isWithinInterval,
} from "date-fns";

export const readLogsFromZip = async (zipContents) => {
  const logs = [];
  await Promise.all(
    Object.keys(zipContents.files)
      .filter((fileName) => fileName.endsWith(".ndjson"))
      .map(async (fileName) => {
        const fileContent = await zipContents.files[fileName].async("string");
        const lines = fileContent.split("\n");
        lines.forEach((line) => {
          if (line.trim()) {
            try {
              const log = JSON.parse(line);
              logs.push({
                "@timestamp": log["@timestamp"],
                "log.level": log["log.level"],
                message: log.message,
                component: {
                  id: log.component?.id || "N/A",
                  type: log.component?.type || "N/A",
                },
                error: log.error,
              });
            } catch (error) {
              console.error("Error parsing log line:", error);
            }
          }
        });
      })
  );
  return logs;
};

const getStartDateTimeFromTimeRange = (timeRange) => {
  const now = new Date();
  switch (timeRange) {
    case "1d":
      return subDays(now, 1);
    case "7d":
      return subDays(now, 7);
    case "30d":
      return subDays(now, 30);
    case "3m":
      return subMonths(now, 3);
    case "6m":
      return subMonths(now, 6);
    case "1y":
      return subYears(now, 1);
    case "3y":
      return subYears(now, 3);
    case "5y":
      return subYears(now, 5);
    default:
      return subDays(now, 30);
  }
};

export const filterLogs = (
  logs,
  selectedId,
  selectedLogLevel,
  selectedType,
  timeRange,
  startDate,
  endDate
) => {
  return logs.filter((log) => {
    const logDate = parseISO(log["@timestamp"]);

    const matchesId = selectedId === "ALL" || log.component?.id === selectedId;
    const matchesLogLevel = selectedLogLevel === "ALL" || log["log.level"] === selectedLogLevel;
    const matchesType = selectedType === "ALL" || log.component?.type === selectedType;

    let isWithinTimeRange = true;
    if (timeRange) {
      const startDateTime = getStartDateTimeFromTimeRange(timeRange);
      isWithinTimeRange = isAfter(logDate, startDateTime);
    } else if (startDate && endDate) {
      isWithinTimeRange = isWithinInterval(logDate, { start: startDate, end: endDate });
    }

    return matchesId && matchesLogLevel && matchesType && isWithinTimeRange;
  });
};
