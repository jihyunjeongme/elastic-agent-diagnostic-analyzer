import protobuf from "protobufjs";

// pprof.proto의 JSON 표현
// 주의: 이 JSON은 실제 pprof.proto 파일의 내용에 따라 달라질 수 있습니다.
const pprofProtoJSON = {
  nested: {
    perftools: {
      nested: {
        profiles: {
          nested: {
            Profile: {
              fields: {
                sampleType: { rule: "repeated", type: "ValueType", id: 1 },
                sample: { rule: "repeated", type: "Sample", id: 2 },
                mapping: { rule: "repeated", type: "Mapping", id: 3 },
                location: { rule: "repeated", type: "Location", id: 4 },
                function: { rule: "repeated", type: "Function", id: 5 },
                stringTable: { rule: "repeated", type: "string", id: 6 },
                dropFrames: { type: "int64", id: 7 },
                keepFrames: { type: "int64", id: 8 },
                timeNanos: { type: "int64", id: 9 },
                durationNanos: { type: "int64", id: 10 },
                periodType: { type: "ValueType", id: 11 },
                period: { type: "int64", id: 12 },
                comment: { rule: "repeated", type: "string", id: 13 },
                defaultSampleType: { type: "int64", id: 14 },
              },
            },
            ValueType: {
              fields: {
                type: { type: "int64", id: 1 },
                unit: { type: "int64", id: 2 },
              },
            },
            Sample: {
              fields: {
                locationId: { rule: "repeated", type: "uint64", id: 1 },
                value: { rule: "repeated", type: "int64", id: 2 },
                label: { rule: "repeated", type: "Label", id: 3 },
              },
            },
            Label: {
              fields: {
                key: { type: "int64", id: 1 },
                str: { type: "int64", id: 2 },
                num: { type: "int64", id: 3 },
                numUnit: { type: "int64", id: 4 },
              },
            },
            Mapping: {
              fields: {
                id: { type: "uint64", id: 1 },
                memoryStart: { type: "uint64", id: 2 },
                memoryLimit: { type: "uint64", id: 3 },
                fileOffset: { type: "uint64", id: 4 },
                filename: { type: "int64", id: 5 },
                buildId: { type: "int64", id: 6 },
                hasFunctions: { type: "bool", id: 7 },
                hasFilenames: { type: "bool", id: 8 },
                hasLineNumbers: { type: "bool", id: 9 },
                hasInlineFrames: { type: "bool", id: 10 },
              },
            },
            Location: {
              fields: {
                id: { type: "uint64", id: 1 },
                mappingId: { type: "uint64", id: 2 },
                address: { type: "uint64", id: 3 },
                line: { rule: "repeated", type: "Line", id: 4 },
                isFolded: { type: "bool", id: 5 },
              },
            },
            Line: {
              fields: {
                functionId: { type: "uint64", id: 1 },
                line: { type: "int64", id: 2 },
              },
            },
            Function: {
              fields: {
                id: { type: "uint64", id: 1 },
                name: { type: "int64", id: 2 },
                systemName: { type: "int64", id: 3 },
                filename: { type: "int64", id: 4 },
                startLine: { type: "int64", id: 5 },
              },
            },
          },
        },
      },
    },
  },
};

export async function parseProfilingData(data) {
  const root = protobuf.Root.fromJSON(pprofProtoJSON);
  const Profile = root.lookupType("perftools.profiles.Profile");
  const profile = Profile.decode(new Uint8Array(data));
  return convertToFlameGraphData(profile);
}

function convertToFlameGraphData(profile) {
  const stringTable = profile.stringTable;
  const functionMap = new Map(profile.function.map((f) => [f.id, f]));
  const locationMap = new Map(profile.location.map((l) => [l.id, l]));

  const root = {
    name: "root",
    value: 0,
    children: {},
    alloc_objects_inc: 0,
    alloc_objects_exc: 0,
    alloc_space_inc: 0,
    alloc_space_exc: 0,
    inuse_objects_inc: 0,
    inuse_objects_exc: 0,
    inuse_space_inc: 0,
    inuse_space_exc: 0,
  };

  profile.sample.forEach((sample) => {
    let current = root;
    const values = sample.value;

    // Updating root values
    root.value += values[0];
    root.alloc_objects_inc += values[0];
    root.alloc_space_inc += values[1];
    root.inuse_objects_inc += values[2] || 0;
    root.inuse_space_inc += values[3] || 0;

    sample.locationId.reverse().forEach((locId, index) => {
      const location = locationMap.get(locId);
      if (location && location.line && location.line.length > 0) {
        const functionId = location.line[0].functionId;
        const func = functionMap.get(functionId);
        if (func) {
          const fullFuncName = stringTable[func.name] || "unknown";
          const fileName = stringTable[func.filename] || "unknown";
          const lineNumber = location.line[0].line || "unknown";

          const funcNameParts = fullFuncName.split("/");
          const shortFuncName = funcNameParts[funcNameParts.length - 1];

          const fileNameParts = fileName.split("/");
          const shortFileName = fileNameParts[fileNameParts.length - 1];

          const nodeName = `${shortFuncName}:L${lineNumber}`;

          if (!current.children[nodeName]) {
            current.children[nodeName] = {
              name: nodeName,
              value: 0,
              children: {},
              fullName: fullFuncName,
              fileName: shortFileName,
              alloc_objects_inc: 0,
              alloc_objects_exc: 0,
              alloc_space_inc: 0,
              alloc_space_exc: 0,
              inuse_objects_inc: 0,
              inuse_objects_exc: 0,
              inuse_space_inc: 0,
              inuse_space_exc: 0,
            };
          }

          current.children[nodeName].value += values[0];
          current.children[nodeName].alloc_objects_inc += values[0];
          current.children[nodeName].alloc_space_inc += values[1];
          current.children[nodeName].inuse_objects_inc += values[2] || 0;
          current.children[nodeName].inuse_space_inc += values[3] || 0;

          if (index === 0) {
            // This is the leaf node, update exclusive values
            current.children[nodeName].alloc_objects_exc += values[0];
            current.children[nodeName].alloc_space_exc += values[1];
            current.children[nodeName].inuse_objects_exc += values[2] || 0;
            current.children[nodeName].inuse_space_exc += values[3] || 0;
          }

          current = current.children[nodeName];
        }
      }
    });
  });

  // 객체를 배열로 변환
  function objectToArray(node) {
    node.children = Object.values(node.children).map(objectToArray);
    return node;
  }

  return objectToArray(root);
}
