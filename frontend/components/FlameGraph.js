import React, { useRef, useEffect, useState } from "react";
import { flamegraph } from "d3-flame-graph";
import * as d3 from "d3";
import "d3-flame-graph/dist/d3-flamegraph.css";

const FlameGraph = ({ data }) => {
  const containerRef = useRef(null);
  // const [dimensions, setDimensions] = useState({ width: 960, height: 540 });
  const [dimensions, setDimensions] = useState(null);

  // useEffect(() => {
  //   function handleResize() {
  //     if (containerRef.current) {
  //       setDimensions({
  //         width: containerRef.current.offsetWidth,
  //         height: window.innerHeight * 0.7, // 화면 높이의 70%로 설정
  //       });
  //     }
  //   }

  useEffect(() => {
    function handleResize() {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: window.innerHeight * 0.6,
        });
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // useEffect(() => {
  //   if (containerRef.current && data && dimensions.width && dimensions.height) {
  //     console.log("Rendering flame graph with data:", data);

  //     const chart = flamegraph()
  //       .width(dimensions.width)
  //       .height(dimensions.height)
  //       .cellHeight(18)
  //       .transitionDuration(750)
  //       .minFrameSize(0)
  //       .label((d) => `${d.data.name}: ${d.data.value}`)
  //       .onClick((d) => {
  //         console.log("Clicked on:", d.data.fullName, "in file:", d.data.fileName);
  //       });

  useEffect(() => {
    if (containerRef.current && data && dimensions) {
      console.log("Rendering flame graph with data:", data);

      const chart = flamegraph()
        .width(dimensions.width)
        .height(dimensions.height)
        .cellHeight(18)
        .transitionDuration(750)
        .minFrameSize(0)
        .label((d) => `${d.data.name}: ${d.data.value}`)
        .onClick((d) => {
          console.log("Clicked on:", d.data.fullName, "in file:", d.data.fileName);
        });

      const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

      d3.select(containerRef.current).selectAll("*").remove();
      const svg = d3
        .select(containerRef.current)
        .append("svg")
        .attr("width", dimensions.width)
        .attr("height", dimensions.height);

      svg.datum(data).call(chart);

      svg.select(".title").remove();

      svg.selectAll("rect").style("fill", (d) => colorScale(d.data.name));

      svg
        .selectAll("text")
        .style("fill", "white")
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("font-size", "10px")
        .text(function (d) {
          const name = d.data.name;
          const value = d.data.value;
          if (name.length > 30) {
            return name.substr(0, 27) + "...:" + value;
          }
          return name + ":" + value;
        });
    }
    // }, [data, dimensions.width, dimensions.height]);
  }, [data, dimensions]);

  // return dimensions ? (
  //   <div ref={containerRef} style={{ width: "100%", height: `${dimensions.height}px` }}></div>
  // ) : (
  //   <div>Loading...</div>
  // );

  return <div ref={containerRef} style={{ width: "100%", height: "70vh" }}></div>;
};

export default FlameGraph;
