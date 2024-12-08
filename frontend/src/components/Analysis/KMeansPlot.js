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

    // Prepare and validate data points
    const points = clusters.flatMap(cluster => 
      cluster.features
        .filter(feature => feature.coordinates && Array.isArray(feature.coordinates) && feature.coordinates.length === 2)
        .map(feature => ({
          ...feature,
          cluster_id: cluster.id,
          cluster_theme: cluster.theme,
          x: feature.coordinates[0],
          y: feature.coordinates[1]
        }))
    );

    if (points.length === 0) {
      svg.append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("fill", "#666")
        .text("No valid coordinate data available");
      return;
    }

    // Color scale with more distinctive colors
    const colors = [
      'rgba(76, 144, 133, 0.85)',    // Teal
      'rgba(241, 90, 90, 0.85)',     // Coral Red
      'rgba(124, 77, 255, 0.85)',    // Purple
      'rgba(251, 177, 60, 0.85)',    // Orange
      'rgba(52, 152, 219, 0.85)',    // Blue
      'rgba(155, 89, 182, 0.85)',    // Violet
      'rgba(46, 204, 113, 0.85)',    // Emerald
      'rgba(230, 126, 34, 0.85)',    // Carrot Orange
      'rgba(52, 73, 94, 0.85)',      // Wet Asphalt
      'rgba(192, 57, 43, 0.85)',     // Pomegranate
    ];

    const colorScale = d3.scaleOrdinal()
      .domain(clusters.map(c => c.id))
      .range(colors);

    // Create scales using 2D coordinates
    const xExtent = d3.extent(points, d => d.x);
    const yExtent = d3.extent(points, d => d.y);

    // Add padding to the scales
    const xPadding = (xExtent[1] - xExtent[0]) * 0.1;
    const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([50, width - 50]);

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
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

    // Add grid lines
    const xGrid = g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height - 40})`);
    
    const yGrid = g.append("g")
      .attr("class", "grid")
      .attr("transform", "translate(40,0)");

    xGrid.call(d3.axisBottom(xScale)
      .ticks(10)
      .tickSize(-height + 90)
      .tickFormat("")
    ).style("stroke-opacity", 0.1);

    yGrid.call(d3.axisLeft(yScale)
      .ticks(10)
      .tickSize(-width + 90)
      .tickFormat("")
    ).style("stroke-opacity", 0.1);

    // Add points with transition
    g.selectAll("circle.point")
      .data(points)
      .join(
        enter => enter.append("circle")
          .attr("class", "point")
          .attr("cx", d => xScale(d.x))
          .attr("cy", d => yScale(d.y))
          .attr("r", 0)
          .style("fill", d => colorScale(d.cluster_id))
          .style("stroke", d => d3.color(colorScale(d.cluster_id)).darker(0.5))
          .style("stroke-width", 1.5)
          .style("cursor", "pointer")
          .call(enter => enter.transition()
            .duration(800)
            .attr("r", 6)
          )
      )
      .on("mouseover", (event, d) => {
        const point = d3.select(event.currentTarget);
        point.attr("r", 8)
            .style("stroke-width", 2.5)
            .style("filter", "brightness(1.1)");

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
          <div style="color: #666; margin-top: 2px;">
            Priority: ${d.feature['Priority']}
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
        point.attr("r", 6)
            .style("stroke-width", 1.5)
            .style("filter", "none");

        tooltip
          .style("opacity", "0")
          .style("visibility", "hidden");
      });

    // Filter clusters with valid centroids
    const validClusters = clusters.filter(cluster => 
      cluster.centroid && Array.isArray(cluster.centroid) && cluster.centroid.length === 2
    );

    // Add cluster centroids with transition
    g.selectAll("circle.centroid")
      .data(validClusters)
      .join(
        enter => enter.append("circle")
          .attr("class", "centroid")
          .attr("cx", d => xScale(d.centroid[0]))
          .attr("cy", d => yScale(d.centroid[1]))
          .attr("r", 0)
          .style("fill", d => colorScale(d.id))
          .style("stroke", "white")
          .style("stroke-width", 3)
          .style("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))")
          .style("cursor", "pointer")
          .call(enter => enter.transition()
            .duration(800)
            .attr("r", 10)
          )
      )
      .on("mouseover", (event, d) => {
        const centroid = d3.select(event.currentTarget);
        centroid.attr("r", 12)
               .style("stroke-width", 4)
               .style("filter", "drop-shadow(0 3px 5px rgba(0,0,0,0.3))");

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
          <div style="color: #666; margin-top: 2px;">
            ${Math.round(d.metadata?.high_priority_percentage || 0)}% High Priority
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
        const centroid = d3.select(event.currentTarget);
        centroid.attr("r", 10)
               .style("stroke-width", 3)
               .style("filter", "drop-shadow(0 2px 3px rgba(0,0,0,0.2))");

        tooltip
          .style("opacity", "0")
          .style("visibility", "hidden");
      });

    // Add legend
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${width - 160}, 20)`);

    clusters.forEach((cluster, i) => {
      const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${i * 28})`);  // Increased spacing

      legendItem.append("circle")
        .attr("r", 7)  // Slightly larger legend dots
        .attr("fill", colorScale(cluster.id))
        .style("stroke", d3.color(colorScale(cluster.id)).darker(0.5))
        .style("stroke-width", 1.5);

      legendItem.append("text")
        .attr("x", 18)
        .attr("y", 4)
        .style("font-size", "13px")  // Slightly larger text
        .style("font-weight", "500")
        .style("fill", "#444")
        .text(`${cluster.theme.substring(0, 15)}${cluster.theme.length > 15 ? '...' : ''}`);
    });

    // Cleanup
    return () => {
      tooltipRef.current?.remove();
    };
  }, [clusters, width, height]);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-[#3D7269]">Feature Request Distribution</h3>
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