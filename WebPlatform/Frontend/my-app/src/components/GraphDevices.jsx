import * as d3 from 'd3';
import React, { useEffect, useRef, useState } from 'react';

import Tooltip from './Tooltip';
// https://observablehq.com/@d3/disjoint-force-directed-graph/2?intent=fork


const Graph = React.forwardRef (({ nodes, links, onNodeClick}, ref) => {
    const svgRef = useRef();
    const graphRef = useRef();
    const tooltipRef = useRef();
    const [tooltipData, setTooltipData] = useState(null);
    const [scale, setScale] = useState(1);
    

    useEffect(() => {
        if (!nodes || !links) return;

        const width = window.innerWidth;
        const height = window.innerHeight*0.9;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        // Clear existing content
        svg.selectAll('*').remove();

        // Create color scale based on unique node labels
        const labels = [...new Set(nodes.map(node => node.label))]; // Get unique labels
        const colorScale = d3.scaleOrdinal()
            .domain(labels)
            .range(d3.schemeCategory10); // Use a categorical color scheme

        // Create the simulation for the force-directed graph layout
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2));

        // Create the graph group for both nodes and links
        const graphGroup = svg.append('g')
            .attr('class', 'graph-group')
            .attr('transform', `scale(${scale})`); // Apply initial scale to the graph group


        // Draw links
        const link = graphGroup.selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', 'black')


        // Draw nodes
        const node = graphGroup.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g') // Create a container for each node (circle + text)
            .attr('class', 'node')
            .on('click', (event, data) => {
                onNodeClick(data.id);
            });

        // Add circles representing nodes
        node.append('circle')
            .attr('r', 30)
            .attr('fill', d => colorScale(d.label)); // Assign color based on label

        // Add text labels for node names
        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 4) // Offset text slightly below circle center
            .attr('font-size', '13px') //Font size
            .text(d => d.name ? d.name : ""); // Display node name as text

        // Hovering effect
        // Mouse over effect
        node.on('mouseover', function (event, data) {
            d3.select(this).transition()
                .attr('opacity', '.95');
            setTooltipData({ ...data, x: event.x, y: event.y });
        })
        // Mouse out effect
        .on('mouseout', function (event, data) {
            d3.select(this).transition()
                .attr('opacity', '1');
            setTooltipData(null);
        });

        // Add drag behavior to nodes
        node.call(d3.drag()
            .on('start', dragStart)
            .on('drag', dragging)
            .on('end', dragEnd));

        // Update simulation on tick (update positions of nodes and links)
        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        // ZOOM
        // Initialize zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.5, 2.5]) // Define zoom scale limits
            .on('zoom', handleZoom);

        // Apply zoom behavior to SVG container
        d3.select(graphRef.current)
            .call(zoom);

        function handleZoom(event) {
            graphGroup.attr('transform', event.transform);
            setScale(event.transform.k)
        }

        // DRAGGING THE NODES
        function dragStart(event) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            event.subject.fx = event.subject.x;
            event.subject.fy = event.subject.y;
        }

        function dragging(event) {
            event.subject.fx = event.x;
            event.subject.fy = event.y;
        }

        function dragEnd(event) {
            if (!event.active) simulation.alphaTarget(0);
            event.subject.fx = null;
            event.subject.fy = null;
        }

        return () => {
            simulation.stop();
        };
    }, [nodes, links, onNodeClick]);

    return (
        <div className="graph-container" ref={graphRef}>
            <svg ref={svgRef}>
                <g className="graph"></g>
            </svg>
            {tooltipData && (
                <Tooltip
                    ref={tooltipRef}
                    data={tooltipData}
                    x={scale < 1.3 ? tooltipData.x+50*scale : tooltipData.x+25*scale}
                    y={tooltipData.y}
                />
            )}
        </div>

    );
});

export default Graph;
