import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Tooltip from './Tooltip';
import SimpleTooltip from "./SimpleTooltip";
import './ContextMenu.css';
import './LinkingMode.css'

const GraphMini2 = ({nodes, links, onNodeClick}) => {
    const svgRef = useRef();
    const graphRef = useRef();
    const tooltipRef = useRef();
    const [tooltipData, setTooltipData] = useState(null);
    const [scale, setScale] = useState(1);
    const [simpleTooltipData, setSimpleTooltipData] = useState(null);

    useEffect(() => {
        if (!nodes) return;

        const width = 450;
        const height = 400;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);


        svg.selectAll('*').remove();

        const labels = [...new Set(nodes.map(node => node ? node.label : null))];
        const colorScale = d3.scaleOrdinal()
            .domain(labels.filter(label => label !== null))
            .range(d3.schemeCategory10);

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(60))
            .force('charge', d3.forceManyBody().strength(-50))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const graphGroup = svg.append('g')
            .attr('class', 'graph-group')
            .attr('transform', `scale(${scale})`);

        const link = graphGroup.selectAll('.link')
            .data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', 'black')
            .attr('stroke-width', 2)
            .on('mouseover', function (event, data) {
                d3.select(this).transition()
                    .attr('opacity', '.95');
                setSimpleTooltipData({ ...data, x: event.x, y: event.y });
            })
            .on('mouseout', function (event, data) {
                d3.select(this).transition()
                    .attr('opacity', '1');
                setSimpleTooltipData(null);
            })

        const node = graphGroup.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node');

        node.append('circle')
            .attr('r', 25)
            .attr('fill', d => colorScale(d.label));

        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 4)
            .attr('font-size', '11px')
            .attr('font-weight', '300')
            .text(d => d.name ? d.name : "");

        node
            .on('mouseover', function (event, data) {
                d3.select(this).transition()
                    .attr('opacity', '.75');
            })
            .on('mouseout', function (event, data) {
                d3.select(this).transition()
                    .attr('opacity', '1');
            })
            .on('click', (event, data) => {
                onNodeClick(data.id);
                console.log(data.id);
            });

        node.call(d3.drag()
            .on('start', dragStart)
            .on('drag', dragging)
            .on('end', dragEnd));

        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        const zoom = d3.zoom()
            .scaleExtent([0.5, 2.5])
            .on('zoom', handleZoom);

        d3.select(graphRef.current)
            .call(zoom);

        function handleZoom(event) {
            graphGroup.attr('transform', event.transform);
            setScale(event.transform.k);
        }

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
    }, [nodes, links]);



    return (
        <div className="graph-container" ref={graphRef}>
            <svg ref={svgRef}>
                <g className="graph"></g>
            </svg>
            {tooltipData && (
                <Tooltip
                    ref={tooltipRef}
                    data={tooltipData}
                    x={scale < 1.3 ? tooltipData.x + 50 * scale : tooltipData.x + 25 * scale}
                    y={tooltipData.y}
                />
            )}
            {simpleTooltipData && (
                <SimpleTooltip
                    label={simpleTooltipData.label}
                    x={simpleTooltipData.x}
                    y={simpleTooltipData.y}
                />
            )}
        </div>
    );
};

export default GraphMini2;
