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
  const groupedLogs = {};

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
              let status = null;

              // message에서 status 추출
              const statusMatch = log.message.match(/"status":(\d+)/);
              if (statusMatch) {
                status = parseInt(statusMatch[1], 10);
              } else {
                // HTTP status code 추출
                const httpStatusMatch = log.message.match(/http status code (\d+)/i);
                if (httpStatusMatch) {
                  status = parseInt(httpStatusMatch[1], 10);
                }
              }

              const logEntry = {
                "@timestamp": log["@timestamp"],
                "log.level": log["log.level"],
                message: log.message,
                component: {
                  id: log.component?.id || "N/A",
                  type: log.component?.type || "N/A",
                },
                error: log.error,
                status: status,
              };

              logs.push(logEntry);

              // 그룹화 로직
              const groupKey = getGroupKey(logEntry.message);
              if (!groupedLogs[groupKey]) {
                groupedLogs[groupKey] = {
                  ...logEntry,
                  count: 1,
                  nestedLogs: [logEntry],
                };
              } else {
                groupedLogs[groupKey].count++;
                groupedLogs[groupKey].nestedLogs.push(logEntry);
                // 첫 번째와 마지막 타임스탬프 업데이트
                if (logEntry["@timestamp"] < groupedLogs[groupKey]["@timestamp"]) {
                  groupedLogs[groupKey]["@timestamp"] = logEntry["@timestamp"];
                }
                if (logEntry["@timestamp"] > groupedLogs[groupKey].lastTimestamp) {
                  groupedLogs[groupKey].lastTimestamp = logEntry["@timestamp"];
                }
              }
            } catch (error) {
              console.error("Error parsing log line:", error);
            }
          }
        });
      })
  );

  console.log("Processed logs:", logs);
  console.log("Grouped logs:", Object.values(groupedLogs));
  return { logs, groupedLogs: Object.values(groupedLogs) };
};

function getGroupKey(message) {
  // 앞 30자 또는 첫 5개 단어 중 긴 것을 그룹 키로 사용
  const firstThirtyChars = message.substring(0, 30);
  const firstFiveWords = message.split(" ").slice(0, 5).join(" ");
  return firstThirtyChars.length > firstFiveWords.length ? firstThirtyChars : firstFiveWords;
}

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
  selectedStatus,
  timeRange,
  startDate,
  endDate
) => {
  if (!Array.isArray(logs)) {
    console.error("Logs is not an array:", logs);
    return [];
  }

  return logs.filter((log) => {
    const logDate = parseISO(log["@timestamp"]);

    const matchesId = selectedId === "ALL" || log.component?.id === selectedId;
    const matchesLogLevel = selectedLogLevel === "ALL" || log["log.level"] === selectedLogLevel;
    const matchesType = selectedType === "ALL" || log.component?.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || log.status === parseInt(selectedStatus, 10);

    let isWithinTimeRange = true;
    if (timeRange) {
      const startDateTime = getStartDateTimeFromTimeRange(timeRange);
      isWithinTimeRange = isAfter(logDate, startDateTime);
    } else if (startDate && endDate) {
      isWithinTimeRange = isWithinInterval(logDate, { start: startDate, end: endDate });
    }

    return matchesId && matchesLogLevel && matchesType && matchesStatus && isWithinTimeRange;
  });
};

export const filterGroupedLogs = (
  groupedLogs,
  selectedId,
  selectedLogLevel,
  selectedType,
  selectedStatus,
  timeRange,
  startDate,
  endDate
) => {
  if (!Array.isArray(groupedLogs)) {
    console.error("GroupedLogs is not an array:", groupedLogs);
    return [];
  }

  return groupedLogs.filter((group) => {
    const logDate = parseISO(group["@timestamp"]);

    const matchesId = selectedId === "ALL" || group.component?.id === selectedId;
    const matchesLogLevel = selectedLogLevel === "ALL" || group["log.level"] === selectedLogLevel;
    const matchesType = selectedType === "ALL" || group.component?.type === selectedType;
    const matchesStatus = selectedStatus === "ALL" || group.status === parseInt(selectedStatus, 10);

    let isWithinTimeRange = true;
    if (timeRange) {
      const startDateTime = getStartDateTimeFromTimeRange(timeRange);
      isWithinTimeRange = isAfter(logDate, startDateTime);
    } else if (startDate && endDate) {
      isWithinTimeRange = isWithinInterval(logDate, { start: startDate, end: endDate });
    }

    return matchesId && matchesLogLevel && matchesType && matchesStatus && isWithinTimeRange;
  });
};
