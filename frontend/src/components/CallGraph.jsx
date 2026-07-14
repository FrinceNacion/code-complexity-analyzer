import { useEffect, useRef, useMemo } from "react";
import * as d3 from "d3";
import { getSeverity, computeFunctionMetrics } from "./utils/formatters";

export default function CallGraph({ callGraph, functions, selectedFunction, onSelectFunction }) {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const tooltipRef = useRef(null);

    const d3Data = useMemo(() => {
        const nodesData = callGraph?.nodes || [];
        const edgesData = callGraph?.edges || [];

        const nodeMap = new Map();
        nodesData.forEach((n) => {
            nodeMap.set(n.label, {
                id: n.label,
                label: n.label,
                complexity: n.complexity,
                isDefined: true,
            });
        });

        // Add any missing nodes referenced in edges
        edgesData.forEach((e) => {
            if (!nodeMap.has(e.source)) {
                nodeMap.set(e.source, {
                    id: e.source,
                    label: e.source,
                    complexity: 1,
                    isDefined: false,
                });
            }
            if (!nodeMap.has(e.target)) {
                nodeMap.set(e.target, {
                    id: e.target,
                    label: e.target,
                    complexity: 1,
                    isDefined: false,
                });
            }
        });

        const nodes = Array.from(nodeMap.values());

        const links = edgesData.map((e) => ({
            source: e.source,
            target: e.target,
        }));

        return { nodes, links };
    }, [callGraph]);

    const functionDetails = useMemo(() => {
        const details = new Map();
        functions.forEach((fn) => {
            const metrics = computeFunctionMetrics(fn);
            details.set(fn.name, {
                complexity: fn.cyclomatic_complexity,
                maintainabilityIndex: metrics.maintainability_index,
            });
        });
        return details;
    }, [functions]);

    const nodeDegree = useMemo(() => {
        const degree = {};
        d3Data.nodes.forEach((n) => {
            degree[n.id] = { callers: new Set(), callees: new Set() };
        });
        d3Data.links.forEach((link) => {
            if (degree[link.target]) degree[link.target].callers.add(link.source);
            if (degree[link.source]) degree[link.source].callees.add(link.target);
        });

        const counts = {};
        Object.keys(degree).forEach((id) => {
            counts[id] = {
                callers: degree[id].callers.size,
                callees: degree[id].callees.size,
                callerIds: Array.from(degree[id].callers),
                calleeIds: Array.from(degree[id].callees),
            };
        });
        return counts;
    }, [d3Data]);

    useEffect(() => {
        if (!svgRef.current || !containerRef.current) return;

        const width = containerRef.current.clientWidth || 600;
        const height = 450;

        // Clear existing SVG contents
        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", "100%")
            .attr("height", height)
            .attr("viewBox", `0 0 ${width} ${height}`);

        const defs = svg.append("defs");
        const markerColors = [
            { id: "arrow-default", color: "#94a3b8" },
            { id: "arrow-incoming", color: "#3b82f6" },
            { id: "arrow-outgoing", color: "#f97316" },
        ];

        markerColors.forEach(({ id, color }) => {
            defs.append("marker")
                .attr("id", id)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 19) // Offset so arrowhead sits near node boundary
                .attr("refY", 0)
                .attr("orient", "auto")
                .attr("markerWidth", 4)
                .attr("markerHeight", 5)
                .append("path")
                .attr("d", "M0,-5L10,0L0,5")
                .attr("fill", color);
        });

        // SVG Group for all elements (enables zoom/pan)
        const group = svg.append("g");

        const zoom = d3.zoom()
            .scaleExtent([0.2, 3])
            .on("zoom", (event) => {
                group.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Simulation setup
        const simulation = d3.forceSimulation(d3Data.nodes)
            .force("link", d3.forceLink(d3Data.links).id((node) => node.id).distance(120))
            .force("charge", d3.forceManyBody().strength(-200))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius((node) => getRadius(node) + 15))
            .alphaDecay(0.03);

        function getRadius(node) {
            if (!node.isDefined) return 10;
            return Math.min(26, 10 + node.complexity * 1.5);
        }

        // Draw Links
        const link = group.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(d3Data.links)
            .enter()
            .append("line")
            .attr("stroke", "#cbd5e1")
            .attr("stroke-width", 1.5)
            .attr("marker-end", "url(#arrow-default)");

        // Draw Nodes
        const node = group.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(d3Data.nodes)
            .enter()
            .append("g")
            .style("cursor", "pointer")
            .on("click", (event, node) => {
                if (node.isDefined) {
                    const matchingFn = functions.find((fn) => fn.name === node.id);
                    if (matchingFn) {
                        onSelectFunction(matchingFn);
                    }
                }
            })
            .on("mouseover", (event, node) => {
                const tooltip = tooltipRef.current;
                if (!tooltip) return;

                const detail = functionDetails.get(node.id);
                const degree = nodeDegree[node.id] || { callers: 0, callees: 0 };

                let content = `
                    <div class="fw-bold mb-1 font-monospace">${node.id}</div>
                    <div class="small">
                        ${node.isDefined ? `
                            <div><strong>Complexity (CC):</strong> ${node.complexity}</div>
                            <div><strong>Maintainability (MI):</strong> ${detail?.maintainabilityIndex ?? "—"}</div>
                        ` : `
                            <div class="text-muted italic">External module/call</div>
                        `}
                        <div><strong>Incoming Calls (Callers):</strong> ${degree.callers}</div>
                        <div><strong>Outgoing Calls (Callees):</strong> ${degree.callees}</div>
                    </div>
                `;

                tooltip.innerHTML = content;
                tooltip.style.opacity = 1;
            })
            .on("mousemove", (event) => {
                const tooltip = tooltipRef.current;
                if (!tooltip) return;
                // Position relative to screen
                tooltip.style.left = `${event.pageX + 12}px`;
                tooltip.style.top = `${event.pageY + 12}px`;
            })
            .on("mouseout", () => {
                if (tooltipRef.current) {
                    tooltipRef.current.style.opacity = 0;
                }
            })
            .call(drag(simulation));

        // Draw Node Circles
        node.append("circle")
            .attr("r", (node) => getRadius(node))
            .attr("fill", (node) => {
                if (!node.isDefined) return "#e2e8f0"; 
                const severity = getSeverity("cyclomatic_complexity", node.complexity);
                return severity.color;
            })
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 2)
            .attr("class", "node-circle");

        // Draw Node Labels
        node.append("text")
            .attr("dy", (node) => getRadius(node) + 14)
            .attr("text-anchor", "middle")
            .text((node) => node.label)
            .attr("fill", "#475569")
            .attr("font-size", "10px")
            .attr("font-family", "Inter, sans-serif")
            .style("pointer-events", "none");

        simulation.on("tick", () => {
            link
                .attr("x1", (link) => link.source.x)
                .attr("y1", (link) => link.source.y)
                .attr("x2", (link) => link.target.x)
                .attr("y2", (link) => link.target.y);

            node.attr("transform", (node) => `translate(${node.x},${node.y})`);
        });

        // Drag handlers
        function drag(sim) {
            function dragstarted(event, node) {
                if (!event.active) sim.alphaTarget(0.3).restart();
                node.fx = node.x;
                node.fy = node.y;
            }

            function dragged(event, node) {
                node.fx = event.x;
                node.fy = event.y;
            }

            function dragended(event, node) {
                if (!event.active) sim.alphaTarget(0);
                node.fx = null;
                node.fy = null;
            }

            return d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);
        }

        // Store references for style modifications
        svgRef.current.nodeSelection = node;
        svgRef.current.linkSelection = link;

    }, [d3Data, functions, functionDetails, nodeDegree, onSelectFunction]);

    useEffect(() => {
        const node = svgRef.current?.nodeSelection;
        const link = svgRef.current?.linkSelection;

        if (!node || !link) return;

        const selectedName = selectedFunction?.name;

        if (!selectedName) {
            // Reset to default styling
            node.selectAll(".node-circle")
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 2)
                .style("opacity", 1);
            node.selectAll("text").style("opacity", 1);
            link
                .attr("stroke", "#cbd5e1")
                .attr("stroke-width", 1.5)
                .attr("marker-end", "url(#arrow-default)")
                .style("opacity", 1);
            return;
        }

        // Get neighbors of the selected node
        const degree = nodeDegree[selectedName] || { callerIds: [], calleeIds: [] };
        const callers = degree.callerIds;
        const callees = degree.calleeIds;

        // Apply visual highlights to nodes
        node.selectAll(".node-circle")
            .attr("stroke", (node) => (node.id === selectedName ? "#111827" : "#ffffff"))
            .attr("stroke-width", (node) => (node.id === selectedName ? 4 : 2))
            .style("opacity", (node) => {
                if (node.id === selectedName || callers.includes(node.id) || callees.includes(node.id)) return 1;
                return 0.15;
            });

        node.selectAll("text").style("opacity", (node) => {
            if (node.id === selectedName || callers.includes(node.id) || callees.includes(node.id)) return 1;
            return 0.15;
        });

        link
            .attr("stroke", (link) => {
                if (link.source.id === selectedName && link.target.id !== selectedName) {
                    return "#f97316"; // Outgoing
                }
                if (link.target.id === selectedName && link.source.id !== selectedName) {
                    return "#3b82f6"; // Incoming
                }
                return "#cbd5e1";
            })
            .attr("stroke-width", (link) => {
                if (link.source.id === selectedName || link.target.id === selectedName) return 3;
                return 1.5;
            })
            .attr("marker-end", (link) => {
                if (link.source.id === selectedName && link.target.id !== selectedName) {
                    return "url(#arrow-outgoing)";
                }
                if (link.target.id === selectedName && link.source.id !== selectedName) {
                    return "url(#arrow-incoming)";
                }
                return "url(#arrow-default)";
            })
            .style("opacity", (link) => {
                if (link.source.id === selectedName || link.target.id === selectedName) return 1;
                return 0.05;
            });

    }, [selectedFunction, nodeDegree]);

    if (!callGraph?.nodes?.length) {
        return (
            <div className="text-center py-5 text-muted bg-light rounded border">
                No call graph nodes detected. Define functions with calls between each other to visualize relationships.
            </div>
        );
    }

    return (
        <div className="card border p-3 bg-white w-100 position-relative" style={{ overflow: "hidden" }}>
            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <div>
                    <h6 className="fw-bold mb-0 text-dark">Interactive Call Graph</h6>
                    <small className="text-muted">Scroll to zoom, drag nodes to layout. Click to select.</small>
                </div>
                <div className="d-flex gap-2 align-items-center">
                    <span className="small text-muted d-flex align-items-center gap-1">
                        <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#3b82f6" }}></span>
                        Incoming (Callers)
                    </span>
                    <span className="small text-muted d-flex align-items-center gap-1">
                        <span className="d-inline-block rounded-circle" style={{ width: 8, height: 8, backgroundColor: "#f97316" }}></span>
                        Outgoing (Callees)
                    </span>
                </div>
            </div>

            <div ref={containerRef} className="position-relative border rounded bg-light" style={{ height: 450, overflow: "hidden" }}>
                <svg ref={svgRef} className="w-100 h-100" />
            </div>

            {/* Tooltip HTML container */}
            <div
                ref={tooltipRef}
                style={{
                    position: "absolute",
                    pointerEvents: "none",
                    opacity: 0,
                    zIndex: 1000,
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    color: "#ffffff",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
                    transition: "opacity 0.15s ease",
                    maxWidth: 280,
                }}
            />
        </div>
    );
}
