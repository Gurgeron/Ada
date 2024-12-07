import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const KMeansPlot = ({ clusters, width = 800, height = 400 }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!clusters || clusters.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Setup SVG
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Create tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "kmeans-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(255, 255, 255, 0.98)")
      .style("border", "1px solid rgba(0, 0, 0, 0.1)")
      .style("border-radius", "6px")
      .style("padding", "12px")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.1)")
      .style("font-family", "system-ui")
      .style("font-size", "12px")
      .style("line-height", "1.4")
      .style("pointer-events", "none")
      .style("transition", "opacity 0.15s ease-in-out")
      .style("opacity", "0")
      .style("z-index", "1000");

    tooltipRef.current = tooltip;

    // Prepare data points
    const points = clusters.flatMap(cluster => 
      cluster.features.map(feature => ({
        ...feature,
        cluster_id: cluster.id,
        cluster_theme: cluster.theme,
        coordinates: feature.coordinates || [0, 0] // Fallback if no coordinates
      }))
    );

    // Color scale
    const colors = [
      'rgba(76, 144, 133, 0.7)',
      'rgba(61, 114, 105, 0.7)',
      'rgba(43, 43, 43, 0.7)',
      'rgba(179, 179, 179, 0.7)',
      'rgba(212, 212, 212, 0.7)'
    ];

    const colorScale = d3.scaleOrdinal()
      .domain(clusters.map(c => c.id))
      .range(colors);

    // Create scales
    const xExtent = d3.extent(points, d => d.coordinates[0]);
    const yExtent = d3.extent(points, d => d.coordinates[1]);

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - 1, xExtent[1] + 1])
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - 1, yExtent[1] + 1])
      .range([height - 50, 50]);

    // Add zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.5, 5])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);

    // Create main group for zooming
    const g = svg.append("g");

    // Add points
    g.selectAll("circle.point")
      .data(points)
      .join("circle")
      .attr("class", "point")
      .attr("cx", d => xScale(d.coordinates[0]))
      .attr("cy", d => yScale(d.coordinates[1]))
      .attr("r", 5)
      .style("fill", d => colorScale(d.cluster_id))
      .style("stroke", d => d3.color(colorScale(d.cluster_id)).darker())
      .style("stroke-width", 1)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const point = d3.select(event.currentTarget);
        point.attr("r", 7)
            .style("stroke-width", 2);

        tooltip.html(`
          <div style="color: #2B2B2B; font-weight: 500; margin-bottom: 6px;">
            ${d.feature['Feature Title']}
          </div>
          <div style="color: #666; margin-bottom: 4px;">
            ${d.feature['Description'].substring(0, 100)}${d.feature['Description'].length > 100 ? '...' : ''}
          </div>
          <div style="color: #4c9085; margin-top: 4px;">
            Cluster: ${d.cluster_theme}
          </div>
        `)
        .style("visibility", "visible")
        .style("opacity", "1")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", (event) => {
        const point = d3.select(event.currentTarget);
        point.attr("r", 5)
            .style("stroke-width", 1);

        tooltip
          .style("opacity", "0")
          .style("visibility", "hidden");
      });

    // Add cluster centroids
    g.selectAll("circle.centroid")
      .data(clusters)
      .join("circle")
      .attr("class", "centroid")
      .attr("cx", d => xScale(d.centroid[0]))
      .attr("cy", d => yScale(d.centroid[1]))
      .attr("r", 8)
      .style("fill", d => colorScale(d.id))
      .style("stroke", "white")
      .style("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        tooltip.html(`
          <div style="color: #2B2B2B; font-weight: 500; margin-bottom: 6px;">
            ${d.theme}
          </div>
          <div style="color: #666;">
            Cluster Center
          </div>
          <div style="color: #4c9085; margin-top: 4px;">
            ${d.size} features
          </div>
        `)
        .style("visibility", "visible")
        .style("opacity", "1")
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px");
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", () => {
        tooltip
          .style("opacity", "0")
          .style("visibility", "hidden");
      });

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0,${height - 40})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", "translate(40,0)")
      .call(yAxis);

    // Cleanup
    return () => {
      tooltipRef.current?.remove();
    };
  }, [clusters, width, height]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-[#3D7269]">K-means Clustering Visualization</h3>
        <div className="text-sm text-gray-500">
          Hover over points to see details
        </div>
      </div>
      <div className="relative" style={{ width: '100%', height: '400px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
    </div>
  );
};

export default React.memo(KMeansPlot); 