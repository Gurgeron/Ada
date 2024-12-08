import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const DendrogramView = ({ hierarchyData, width = 800, height = 400 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!hierarchyData) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    // Calculate margins to center the visualization
    const margin = { 
      top: 20, 
      right: 160,  // Reduced from 200
      bottom: 30, 
      left: 160    // Reduced from 200
    };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG with centered viewBox
    const svg = d3.select(svgRef.current)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; display: block; margin: auto;");

    // Create centered container group with smaller offset
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left + (innerWidth * 0.05)},${margin.top})`);  // Reduced offset from 0.1 to 0.05

    // Create cluster layout with larger width
    const cluster = d3.cluster()
      .size([innerHeight, innerWidth * 0.85]);  // Increased from 0.7 to 0.85

    // Create root hierarchy
    const root = d3.hierarchy(hierarchyData);
    
    cluster(root);

    // Function to truncate text
    const truncateText = (text, maxLength = 30) => {
      return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
    };

    // Color scales
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
      .domain(root.children.map(d => d.data.name))
      .range(colors);

    // Add links
    g.selectAll(".link")
      .data(root.descendants().slice(1))
      .join("path")
      .attr("class", "link")
      .attr("d", d => `
        M${d.y},${d.x}
        C${(d.parent.y + d.y) / 2},${d.x}
        ${(d.parent.y + d.y) / 2},${d.parent.x}
        ${d.parent.y},${d.parent.x}
      `)
      .style("fill", "none")
      .style("stroke", d => d.parent === root ? colorScale(d.data.name) : "#ccc")
      .style("stroke-width", 1.5)
      .style("opacity", 0.7);

    // Add nodes
    const node = g.selectAll(".node")
      .data(root.descendants())
      .join("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`);

    // Add circles at nodes
    node.append("circle")
      .attr("r", 4)
      .style("fill", d => d === root ? "#fff" : d.parent === root ? colorScale(d.data.name) : "#ccc")
      .style("stroke", d => d === root ? "#4c9085" : d.parent === root ? colorScale(d.data.name) : "#ccc")
      .style("stroke-width", 1.5);

    // Create invisible labels for all nodes with truncation
    const labels = node.append("text")
      .attr("dy", ".31em")
      .attr("x", d => d.children ? -8 : 8)
      .style("text-anchor", d => d.children ? "end" : "start")
      .style("font-size", d => d === root ? "16px" : "14px")
      .style("font-family", "system-ui")
      .style("font-weight", d => d === root ? "600" : "400")
      .style("fill", d => d.parent === root ? colorScale(d.data.name) : "#666")
      .style("opacity", 0)  // Start with opacity 0
      .text(d => truncateText(d.data.name, d === root ? 40 : 35));

    // Update circle sizes to match larger text
    node.selectAll("circle")
      .attr("r", d => d === root ? 6 : 5)
      .style("stroke-width", d => d === root ? 2 : 1.5);

    // Add title for full text on hover
    labels.append("title")
      .text(d => d.data.name);

    // Add hover effects
    node.on("mouseover", (event, d) => {
      // Highlight the node
      d3.select(event.currentTarget)
        .select("circle")
        .transition()
        .duration(200)
        .attr("r", d === root ? 8 : 7)
        .style("stroke-width", 2.5);

      // Show and highlight the label
      d3.select(event.currentTarget)
        .select("text")
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("font-weight", "600")
        .style("font-size", d === root ? "17px" : "15px");

      // Highlight the path to root
      let current = d;
      while (current.parent) {
        d3.select(g.selectAll(".link").filter(link => link === current).node())
          .transition()
          .duration(200)
          .style("stroke-width", 2.5)
          .style("opacity", 1);
        current = current.parent;
      }
    })
    .on("mouseout", (event, d) => {
      // Reset node
      d3.select(event.currentTarget)
        .select("circle")
        .transition()
        .duration(200)
        .attr("r", d === root ? 6 : 5)
        .style("stroke-width", d => d === root ? 2 : 1.5);

      // Hide label
      d3.select(event.currentTarget)
        .select("text")
        .transition()
        .duration(200)
        .style("opacity", 0)
        .style("font-weight", d => d === root ? "600" : "400")
        .style("font-size", d => d === root ? "16px" : "14px");

      // Reset path highlight
      let current = d;
      while (current.parent) {
        d3.select(g.selectAll(".link").filter(link => link === current).node())
          .transition()
          .duration(200)
          .style("stroke-width", 1.5)
          .style("opacity", 0.7);
        current = current.parent;
      }
    });

    // Show root label by default
    node.filter(d => d === root)
      .select("text")
      .style("opacity", 1);

  }, [hierarchyData, width, height]);

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-[#3D7269]">Cluster Hierarchy</h3>
        <div className="text-base text-gray-500">
          Hover over nodes to explore relationships
        </div>
      </div>
      <div className="relative overflow-hidden flex justify-center items-center" style={{ width: '100%', height: '450px' }}>  {/* Increased height from 400px to 450px */}
        <svg ref={svgRef} width="100%" height="100%" />
      </div>
    </div>
  );
};

export default React.memo(DendrogramView); 