import { parseProfilingData } from "./profilingUtils";

self.onmessage = async (event) => {
  const { profilingData } = event.data;
  const parsed = {};
  const totalFiles = Object.keys(profilingData).length;
  let processedFiles = 0;

  try {
    for (const [fileName, data] of Object.entries(profilingData)) {
      if (data.data) {
        parsed[fileName] = await parseProfilingData(data.data);
        parsed[fileName].type = data.type;
      } else {
        parsed[fileName] = data;
      }
      processedFiles++;
      self.postMessage({
        type: "progress",
        progress: Math.round((processedFiles / totalFiles) * 100),
      });
    }
    self.postMessage({ type: "result", parsedData: parsed });
  } catch (error) {
    self.postMessage({ type: "error", error: error.message });
  }
};
