import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { base_url } from '../api';

const Graph = () => {
    const [data, setData] = useState({ nodes: [], links: [] });

    useEffect(() => {
        // Fetch data from the backend
        fetch(`${base_url}/CHe_cloud_data/all_ch_links`)
            .then(response => response.json())
            .then(data => 
                setData(data));
    }, []);

    useEffect(() => {
        if (data.nodes.length === 0 || data.links.length === 0) return;
    
        const svgElement = document.getElementById("graph");
        const width = svgElement.clientWidth;
        const height = svgElement.clientHeight;
        const svg = d3.select("#graph");
        const categories = ["Type 1", "Type 2"];
        const colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(categories);
        
        // Define the boundary between connected and isolated nodes
        const boundaryX = width * 0.6;
    
        // Clear previous graph elements before drawing a new one
        svg.selectAll("*").remove();
    
        // Draw color legend
        const legend = svg.append("g").attr("transform", "translate(10, 10)");
    
        legend.selectAll("rect")
            .data(categories)
            .enter().append("rect")
            .attr("x", 0)
            .attr("y", (d, i) => i * 20)
            .attr("width", 20)
            .attr("height", 15)
            .attr("fill", d => colorScale(d));
    
        legend.selectAll("text")
            .data(categories)
            .enter().append("text")
            .attr("x", 30)
            .attr("y", (d, i) => i * 20 + 12)
            .text(d => d)
            .attr("class", "legend");
        
        // Identify nodes with and without links
        const linkedNodeIds = new Set();
        data.links.forEach(link => {
            linkedNodeIds.add(typeof link.source === 'object' ? link.source.id : link.source);
            linkedNodeIds.add(typeof link.target === 'object' ? link.target.id : link.target);
        });
        
        // Create separate node arrays for connected and isolated nodes
        const connectedNodes = data.nodes.filter(node => linkedNodeIds.has(node.id));
        const isolatedNodes = data.nodes.filter(node => !linkedNodeIds.has(node.id));
        
        // Process links to ensure they reference only connected nodes
        const validLinks = data.links.filter(link => {
            const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
            const targetId = typeof link.target === 'object' ? link.target.id : link.target;
            return linkedNodeIds.has(sourceId) && linkedNodeIds.has(targetId);
        });
        
        // Create a separate force simulation for connected nodes
        const connectedSimulation = d3.forceSimulation(connectedNodes)
            .force("link", d3.forceLink(validLinks).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-25))
            .force("center", d3.forceCenter(width / 3, height / 2))
            .force("collide", d3.forceCollide(35))
            // Add a force to keep nodes within the left side boundary
            .force("x", d3.forceX(width / 3).strength(0.05))
            .force("y", d3.forceY(height / 2).strength(0.05));
        
        // Position isolated nodes in a grid on the right side
        const isolatedNodesPerRow = Math.max(1, Math.floor(Math.sqrt(isolatedNodes.length)));
        const rightSideStartX = boundaryX + 50; // Add some padding from the divider
        const rightSideWidth = width - rightSideStartX - 30; // Leave some margin on the right edge
        const xSpacing = Math.min(70, rightSideWidth / isolatedNodesPerRow);
        const ySpacing = Math.min(70, (height - 100) / (Math.ceil(isolatedNodes.length / isolatedNodesPerRow) || 1));
        
        isolatedNodes.forEach((node, i) => {
            const row = Math.floor(i / isolatedNodesPerRow);
            const col = i % isolatedNodesPerRow;
            node.x = rightSideStartX + col * xSpacing;
            node.y = 100 + row * ySpacing;
            node.fx = node.x; // Fix position X
            node.fy = node.y; // Fix position Y
        });
        
        // Create links (edges)
        const linkElements = svg.append("g")
            .selectAll("line")
            .data(validLinks)
            .enter().append("line")
            .attr("class", "link")
            .attr("data-source", d => typeof d.source === 'object' ? d.source.id : d.source)
            .attr("data-target", d => typeof d.target === 'object' ? d.target.id : d.target)
            .attr("stroke", "grey")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.3);
    
        // Create groups for connected nodes
        const connectedNodeGroups = svg.append("g")
            .selectAll("g.connected")
            .data(connectedNodes)
            .enter().append("g")
            .attr("class", "node-group connected")
            .attr("data-id", d => d.id);
        
        // Create groups for isolated nodes
        const isolatedNodeGroups = svg.append("g")
            .selectAll("g.isolated")
            .data(isolatedNodes)
            .enter().append("g")
            .attr("class", "node-group isolated")
            .attr("data-id", d => d.id)
            .attr("transform", d => `translate(${d.x},${d.y})`);
        
        // Add click behavior to connected nodes
        const connectedLinkGroup = connectedNodeGroups.append("g")
            .attr("data-url", d => d.url)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                window.open(d.url, "_blank");
            });
        
        // Add click behavior to isolated nodes
        const isolatedLinkGroup = isolatedNodeGroups.append("g")
            .attr("data-url", d => d.url)
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                window.open(d.url, "_blank");
            });
    
        // Append circles for connected nodes
        connectedLinkGroup.append("circle")
            .attr("r", 25)
            .attr("fill", d => colorScale(d.category));
    
        // Append text labels for connected nodes
        connectedLinkGroup.append("text")
            .attr("fill", "black")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(d => abbreviateText(d.title || d.id, 6));
            
        // Append circles for isolated nodes
        isolatedLinkGroup.append("circle")
            .attr("r", 25)
            .attr("fill", d => colorScale(d.category))
            .style("opacity", 0.8);
    
        // Append text labels for isolated nodes
        isolatedLinkGroup.append("text")
            .attr("fill", "black")
            .attr("font-size", "10px")
            .attr("font-weight", "bold")
            .attr("text-anchor", "middle")
            .attr("dy", ".35em")
            .text(d => abbreviateText(d.title || d.id, 6));
    
        // Function to abbreviate text if needed
        function abbreviateText(text, maxLength) {
            if (text.length > maxLength) {
                return text.substring(0, maxLength) + "...";
            }
            return text;
        }
    
        // Apply simulation updates only for connected nodes
        connectedSimulation.on("tick", () => {
            // Update link positions
            linkElements
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
    
            // Update connected node positions with strict boundary enforcement
            connectedNodeGroups.attr("transform", d => {
                // Enforce boundaries more strictly
                const x = Math.min(Math.max(d.x, 30), boundaryX - 40); // Keep at least 40px away from boundary
                const y = Math.min(Math.max(d.y, 30), height - 30);
                return `translate(${x},${y})`;
            });
        });
    
        // Add a divider line between connected and isolated nodes
        svg.append("line")
            .attr("x1", boundaryX)
            .attr("y1", 0)
            .attr("x2", boundaryX)
            .attr("y2", height)
            .attr("stroke", "#ccc")
            .attr("stroke-dasharray", "5,5")
            .attr("stroke-width", 1);
        
        // Add a label for isolated nodes section
        if (isolatedNodes.length > 0) {
            svg.append("text")
                .attr("x", boundaryX + (width - boundaryX) / 2)
                .attr("y", 30)
                .attr("text-anchor", "middle")
                .attr("font-size", "14px")
                .attr("font-weight", "bold")
                .text("Isolated Nodes");
        }
    
        // Highlight links when hovering over a connected node
        connectedNodeGroups.on("mouseover", (event, d) => {
            // Highlight links connected to this node
            linkElements.classed("highlighted", link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return sourceId === d.id || targetId === d.id;
            });
        })
        .on("mouseout", () => {
            // Remove highlight when mouse leaves the node
            linkElements.classed("highlighted", false);
        });
    
    }, [data]);

    const handleDownload = () => {
        const svgElement = document.getElementById("graph");
        const clonedSvg = svgElement.cloneNode(true);
        
        // Add necessary namespaces
        clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");

        // Add styles for exported SVG
        const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
        styleElement.textContent = `
            .link { stroke: #aaa; stroke-width: 2; transition: stroke 0.3s; }
            .highlighted { stroke: orange !important; stroke-width: 4 !important; }
            .legend { font-size: 12px; }
            .isolated { opacity: 0.8; }
        `;
        clonedSvg.insertBefore(styleElement, clonedSvg.firstChild);

        // Create a script element for interactivity (optional, if needed)
        const scriptContent = `
            // This script adds interactivity to the SVG when opened in a browser
            (function() {
                document.addEventListener('DOMContentLoaded', function() {
                    const nodes = document.querySelectorAll('.node-group');
                    const links = document.querySelectorAll('.link');
                    
                    nodes.forEach(node => {
                        const nodeId = node.getAttribute('data-id');
                        
                        node.addEventListener('mouseover', () => {
                            links.forEach(link => {
                                const source = link.getAttribute('data-source');
                                const target = link.getAttribute('data-target');
                                
                                if (source === nodeId || target === nodeId) {
                                    link.classList.add('highlighted');
                                }
                            });
                        });
                        
                        node.addEventListener('mouseout', () => {
                            links.forEach(link => {
                                link.classList.remove('highlighted');
                            });
                        });
                    });
                });
            })();
        `;
        
        // Add foreign object to include script within SVG
        const foreignObject = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
        foreignObject.setAttribute("width", "0");
        foreignObject.setAttribute("height", "0");
        
        // Create HTML div to hold the script
        const div = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
        const script = document.createElementNS("http://www.w3.org/1999/xhtml", "script");
        script.textContent = scriptContent;
        div.appendChild(script);
        foreignObject.appendChild(div);
        
        // Add foreign object to SVG
        clonedSvg.appendChild(foreignObject);

        // Convert to Blob and trigger download
        const serializer = new XMLSerializer();
        const svgData = serializer.serializeToString(clonedSvg);
        const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "interactive-graph.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={{ height: "100vh", width: "100vw", margin: 0, padding: 0 }}>
            <button 
                id="download" 
                onClick={handleDownload}
                style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    zIndex: 10
                }}
            >
                Download SVG
            </button>
            <svg id="graph" width="100%" height="100%"></svg>
        </div>
    );
};

export default Graph;