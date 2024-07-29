import JSZip from "jszip";
import yaml from "js-yaml";
import pako from "pako";
import { parseProfilingData } from "./profilingUtils";

export const handleFileUpload = async (file) => {
  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    window.zipContents = contents;

    const versionText = await contents.file("version.txt").async("string");
    const stateYaml = await contents.file("state.yaml").async("string");
    const componentsActualYaml = await contents.file("components-actual.yaml").async("string");

    const versionInfo = parseVersionTxt(versionText);
    let stateInfo = { components: [] };
    let componentsActual = [];
    let duplicatedKeys = [];

    try {
      stateInfo = yaml.load(stateYaml, {
        json: true,
        onWarning: (e) => {
          if (e.reason === "duplicated mapping key") {
            duplicatedKeys.push(e.key);
          }
        },
      });
      const componentsActualData = yaml.load(componentsActualYaml);
      componentsActual = [
        {
          components: Array.isArray(componentsActualData)
            ? componentsActualData
            : Object.values(componentsActualData),
        },
      ];
    } catch (yamlError) {
      console.error("Error parsing YAML:", yamlError);
    }

    console.log("Parsed stateInfo:", stateInfo);
    console.log("Parsed componentsActual:", componentsActual);

    return {
      ...versionInfo,
      ...stateInfo,
      components: (stateInfo.components || []).map((component) => ({
        ...component,
        state: component.state?.state || "unknown",
        message: component.state?.message || "",
        units: component.state?.units || {},
        version_info: component.state?.version_info || {},
      })),
      componentsActual,
      duplicatedKeys,
    };
  } catch (error) {
    console.error("Error processing ZIP file:", error);
    throw error;
  }
};

// fileHandler.js에 추가

export const handleProfilingFiles = async (zipContents) => {
  const profilingFiles = [
    "allocs.pprof.gz",
    "block.pprof.gz",
    "goroutine.pprof.gz",
    "heap.pprof.gz",
    "mutex.pprof.gz",
    "threadcreate.pprof.gz",
  ];

  const profilingData = {};

  for (const fileName of profilingFiles) {
    console.log(`Processing ${fileName}`);
    const fileContent = await zipContents.file(fileName)?.async("arraybuffer");
    if (fileContent) {
      try {
        const uncompressedContent = pako.inflate(new Uint8Array(fileContent));
        profilingData[fileName] = {
          type: getProfileType(fileName),
          data: uncompressedContent,
        };
      } catch (error) {
        console.error(`Error parsing ${fileName}:`, error);
        profilingData[fileName] = { error: error.message, type: getProfileType(fileName) };
      }
    } else {
      console.warn(`File not found: ${fileName}`);
      profilingData[fileName] = { error: "File not found", type: getProfileType(fileName) };
    }
  }

  return profilingData;
};

function getProfileType(fileName) {
  if (fileName.includes("allocs")) return "Allocations";
  if (fileName.includes("block")) return "Blocking profile";
  if (fileName.includes("goroutine")) return "Goroutine profile";
  if (fileName.includes("heap")) return "Heap profile";
  if (fileName.includes("mutex")) return "Mutex profile";
  if (fileName.includes("threadcreate")) return "Thread creation";
  return "Unknown";
}

function parseVersionTxt(content) {
  const lines = content.split("\n");
  const result = {};
  lines.forEach((line) => {
    const [key, value] = line.split(": ");
    if (key && value) {
      result[key.trim()] = value.trim();
    }
  });
  return result;
}

export const readConfigFiles = async (zipContents) => {
  const configFiles = [
    "local-config.yaml",
    "pre-config.yaml",
    "variables.yaml",
    "computed-config.yaml",
    "components-expected.yaml",
    "components-actual.yaml",
  ];

  const configs = {};

  for (const fileName of configFiles) {
    const fileContent = await zipContents.file(fileName)?.async("string");
    if (fileContent) {
      try {
        configs[fileName] = yaml.load(fileContent);
      } catch (error) {
        console.error(`Error parsing ${fileName}:`, error);
        configs[fileName] = fileContent;
      }
    }
  }

  return configs;
};
