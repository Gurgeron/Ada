import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const BubbleChart = ({ clusters }) => {
  const svgRef = useRef(null);
  const width = 800;
  const height = 400;
  const padding = 2;
  const legendWidth = 250;
  const chartWidth = width - legendWidth;

  useEffect(() => {
    if (!clusters || clusters.length === 0) return;

    // Clear previous SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

    // Create tooltip div
    const tooltip = d3.select("body").append("div")
      .attr("class", "bubble-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(255, 255, 255, 0.98)")
      .style("border", "1px solid rgba(0, 0, 0, 0.1)")
      .style("border-radius", "6px")
      .style("padding", "10px 12px")
      .style("font-family", "system-ui")
      .style("font-size", "12px")
      .style("line-height", "1.4")
      .style("box-shadow", "0 2px 8px rgba(0,0,0,0.05)")
      .style("pointer-events", "none")
      .style("transition", "opacity 0.15s ease-in-out")
      .style("opacity", "0")
      .style("z-index", "1000");

    // Color scales with matching dendrogram colors
    const colors = [
      '#4c9085',  // Teal
      '#F15A5A',  // Coral Red
      '#7C4DFF',  // Purple
      '#FBB13C',  // Orange
      '#3498DB',  // Blue
      '#9B59B6',  // Violet
      '#2ECC71',  // Emerald
      '#E67E22',  // Carrot Orange
      '#34495E',  // Wet Asphalt
      '#C0392B',  // Pomegranate
    ];

    const colorScale = d3.scaleOrdinal()
      .domain(clusters.map(c => c.theme))
      .range(colors);

    // Create nodes for force simulation
    const nodes = clusters.map((cluster, index) => ({
      id: index,
      r: Math.sqrt((cluster.size / Math.max(...clusters.map(c => c.size))) * 5000),
      cluster,
      color: colorScale(cluster.theme)
    }));

    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force("center", d3.forceCenter(chartWidth / 2, height / 2))
      .force("charge", d3.forceManyBody().strength(-50))
      .force("collide", d3.forceCollide().radius(d => d.r + padding).strength(1))
      .on("tick", ticked);

    // Create chart area group
    const chartArea = svg.append("g")
      .attr("class", "chart-area");

    // Create group for nodes
    const node = chartArea.append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", "bubble-group")
      .call(drag(simulation));

    // Add circles with enhanced tooltip
    node.append("circle")
      .attr("r", d => d.r)
      .style("fill", d => d.color)
      .style("stroke", d => d3.color(d.color).darker(0.2))
      .style("stroke-width", 1.5)
      .style("cursor", "pointer")
      .style("transition", "all 0.2s ease-in-out")
      .on("mouseover", function(event, d) {
        const highPriority = d.cluster.metadata?.high_priority_percentage || 0;
        tooltip.html(`
          <div style="color: #2B2B2B; font-weight: 500; margin-bottom: 6px;">
            ${d.cluster.theme}
          </div>
          <div style="color: #666; display: flex; flex-direction: column; gap: 4px;">
            <span>${d.cluster.size} requests</span>
            <span>${Math.round(highPriority)}% High Priority</span>
          </div>
        `);
        tooltip
          .style("visibility", "visible")
          .style("opacity", "1")
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 12) + "px");
        
        // Subtle highlight
        d3.select(this)
          .style("stroke-opacity", "0.8")
          .style("stroke", "#2B2B2B")
          .style("stroke-width", "2");
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 12) + "px")
          .style("top", (event.pageY - 12) + "px");
      })
      .on("mouseout", function(event, d) {
        tooltip
          .style("opacity", "0")
          .style("visibility", "hidden");
        
        // Remove highlight
        d3.select(this)
          .style("stroke-opacity", "1")
          .style("stroke", d => d.color)
          .style("stroke-width", "1");
      });

    // Create legend container with background
    const legendContainer = svg.append("g")
      .attr("class", "legend-container")
      .attr("transform", `translate(${chartWidth}, 0)`);

    // Add white background for legend
    legendContainer.append("rect")
      .attr("width", legendWidth)
      .attr("height", height)
      .attr("fill", "white");

    // Create legend
    const legend = legendContainer.append("g")
      .attr("class", "legend")
      .attr("transform", "translate(20, 20)");

    // Calculate dynamic spacing based on number of items
    const legendSpacing = Math.min(60, Math.floor(height / (clusters.length + 1)));

    const legendItems = legend.selectAll(".legend-item")
      .data(clusters)
      .join("g")
      .attr("class", "legend-item")
      .attr("transform", (d, i) => `translate(0, ${i * legendSpacing})`);

    // Add colored circles to legend
    legendItems.append("circle")
      .attr("r", 6)
      .style("fill", (d, i) => colors[i % colors.length]);

    // Add theme text to legend with ellipsis if too long
    legendItems.append("text")
      .attr("x", 15)
      .attr("y", 0)
      .attr("dy", "0.32em")
      .text(d => {
        const maxLength = 30;
        return d.theme.length > maxLength ? d.theme.substring(0, maxLength) + "..." : d.theme;
      })
      .style("font-size", "12px")
      .style("font-family", "system-ui");

    // Add request count and priority percentage
    legendItems.append("text")
      .attr("x", 15)
      .attr("y", 15)
      .text(d => {
        const highPriority = d.metadata?.high_priority_percentage || 0;
        return `${d.size} requests • ${Math.round(highPriority)}% High Priority`;
      })
      .style("font-size", "11px")
      .style("fill", "#666")
      .style("font-family", "system-ui");

    function ticked() {
      nodes.forEach(node => {
        node.x = Math.max(node.r, Math.min(chartWidth - node.r, node.x));
        node.y = Math.max(node.r, Math.min(height - node.r, node.y));
      });

      node.attr("transform", d => `translate(${d.x},${d.y})`);
    }

    function drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      }

      return d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }

    // Cleanup
    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [clusters]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-semibold text-[#3D7269] mb-4">Feature Request Categories</h3>
      <div className="relative" style={{ width: '100%', height: '400px' }}>
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
    </div>
  );
};

export default BubbleChart; 