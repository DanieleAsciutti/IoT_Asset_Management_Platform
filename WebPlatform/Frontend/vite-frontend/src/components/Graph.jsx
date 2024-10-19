import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import Tooltip from './Tooltip';
import SimpleTooltip from "./SimpleTooltip";
import './ContextMenu.css';
import './LinkingMode.css'
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import {TextField} from "@mui/material";


const Graph = ({ nodes, links, addRelationship, deleteNode, deleteLink, updateLevel, currentFilter, style }) => {
    const svgRef = useRef();
    const graphRef = useRef();
    const tooltipRef = useRef();
    const [tooltipData, setTooltipData] = useState(null);
    const [scale, setScale] = useState(1);
    const [simpleTooltipData, setSimpleTooltipData] = useState(null);
    const [contextMenuData, setContextMenuData] = useState(null);
    const [linkingMode, setLinkingMode] = useState(null);
    const linkSourceId= useRef(null);
    const [linkSelectionPopupOpen, setLinkSelectionPopupOpen] = useState(false);
    const [relationsToDelete, setRelationsToDelete] = useState([]);

    // New state for relation dialog
    const [relDialogOpen, setRelDialogOpen] = useState(false);
    const [newRelName, setNewRelName] = useState('');
    const [newRelSource, setNewRelSource] = useState('');
    const [newRelTarget, setNewRelTarget] = useState('');

    useEffect(() => {
        if (!nodes) return;

        const width = window.innerWidth - 25;
        const height = window.innerHeight - 25;

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        svg.selectAll('*').remove();

        const labels = [...new Set(nodes.map(node => node ? node.label : null))];
        const colorScale = d3.scaleOrdinal()
            .domain(labels.filter(label => label !== null))
            .range(d3.schemeCategory10);

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(120))
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(width / 2, height / 2));

        const graphGroup = svg.append('g')
            .attr('class', 'graph-group')
            .attr('transform', `scale(${scale})`);

        // Aggregate the links between nodes if there are multiple links between 2 nodes, disabled for now
        const groupedLinks = links.reduce((acc, link) => {
            const key = `${link.source.id}-${link.target.id}`;  // Unique key for each source-target pair

            // If the key doesn't exist, initialize it with the link and its name
            if (!acc[key]) {
                acc[key] = {
                    source: link.source,
                    target: link.target,
                    label: link.label,  // Initialize with the first link's name
                    relations: [{
                        label: link.label,
                        relId: link.relId
                    }]
                };
            } else {
                // If the key exists, concatenate the link's name
                acc[key].label += `, ${link.label}`;
                acc[key].relations.push({label: link.label, relId: link.relId});
            }

            return acc;
        }, {});

        const aggregatedLinks = Object.values(groupedLinks);

        const link = graphGroup.selectAll('.link')
            .data(aggregatedLinks) //if there are more links between 2 nodes
            //.data(links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', 'black')
            .attr('stroke-width', function (data) {
                // Dynamically adjust stroke width based on number of relationships
                const relations = data.relations || [];
                return relations.length > 1 ? relations.length * 2 : 2; // Increase width if more than 1 relationship
            })
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
            // .on('contextmenu', function (event, data) {
            //     event.preventDefault();
            //     //setContextMenuData({ type: 'Link', id: data.relId, x: event.x, y: event.y });
            //     setContextMenuData({ type: 'Link', relations: data.relations, x: event.x, y: event.y });
            // });
            .on('contextmenu', function (event, data) {
                event.preventDefault();

                // Log to check what data.relations contains
                console.log('Context menu data:', data);

                // Safely ensure relations is an array (or empty if not available)
                const relations = data.relations || [];

                // Now set the contextMenuData with the relations array
                setContextMenuData({
                    type: 'Link',
                    relations: relations,  // Ensure this is passed correctly
                    x: event.x,
                    y: event.y
                });
            });


        const node = graphGroup.selectAll('.node')
            .data(nodes)
            .enter()
            .append('g')
            .attr('class', 'node');

        node.append('circle')
            .attr('r', 35)
            .attr('fill', d => colorScale(d.label));

        // node.append('circle')
        //     .attr('r', d => Math.max(35, d.name.length *2))
        //     .attr('fill', d => colorScale(d.label));

        node.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 4)
            .attr('font-size', '13px')
            .attr('font-weight', '400')
            .text(d => d.name ? d.name : "");


        node
            .on('mouseover', function (event, data) {
                if(currentFilter === 'filtered') {
                    d3.select(this).transition()
                        .attr('opacity', '.95');
                    setTooltipData({...data, x: event.clientX, y: event.clientY});
                }
            })
            .on('mouseout', function (event, data) {
                d3.select(this).transition()
                    .attr('opacity', '1');
                setTooltipData(null);
            })
            .on('dblclick', function (event, data) {
                if(currentFilter === 'filtered'){
                    const assetId = data.id;
                    window.location.href = data.label === 'Device'
                        ? `/devices/${assetId}`
                        : `/assets/${assetId}`;
                }else{
                    data.value = data.name;
                    updateLevel(data, false);
                }
            })
            // .on('dblclick', function (event, data) {
            //     const assetId = data.id;
            //     window.location.href = data.label === 'Device'
            //         ? `/devices/${assetId}`
            //         : `/assets/${assetId}`;
            // })
            .on('contextmenu', function (event, data) {
                if (currentFilter === 'filtered') {
                    event.preventDefault();
                    setContextMenuData({type: 'Node', id: data.id, x: event.clientX, y: event.clientY});
                }
            })
            .on('click', (event, data) => {
                const nodeId = data.id;
                handleNodeClick(nodeId);
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
            .scaleExtent([0.3, 2.5])
            //.scaleExtent([0.3, 1])  // Limit zooming
            .filter(function(event) {
                // Disable zoom on double-click
                return !event.type.includes('dblclick');
            })
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

        // Create legend
        const legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${100},${100})`); // Position the legend

        const legendItems = legend.selectAll('.legend-item')
            .data(labels.filter(label => label !== null))
            .enter()
            .append('g')
            .attr('class', 'legend-item')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);

        legendItems.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 6)
            .attr('fill', d => colorScale(d));

        legendItems.append('text')
            .attr('x', 12)
            .attr('y', 5)
            .text(d => d);

        return () => {
            simulation.stop();
        };
    }, [nodes, links]);

    const handleDeleteNode = async () => {
        if (contextMenuData) {
            await deleteNode(contextMenuData.id);
            setContextMenuData(null);
        }
    };


    // const handleDeleteLink = async () => {
    //     if (contextMenuData) {
    //         console.log(contextMenuData);
    //         await deleteLink(contextMenuData.id);
    //         setContextMenuData(null);
    //     }
    // };
    const handleDeleteLink = async () => {
        if (contextMenuData && contextMenuData.relations) {
            // Check if there are multiple links
            if (contextMenuData.relations.length > 1) {
                // Open the popup/modal for selecting the link to delete
                setContextMenuData(null);
                setRelationsToDelete(contextMenuData.relations);
                setLinkSelectionPopupOpen(true);
            } else if (contextMenuData.relations.length === 1) {
                // If only one link, delete it directly
                await deleteLink(contextMenuData.relations[0].relId);
                setContextMenuData(null);
                setRelationsToDelete([]);  // Clear the relations to delete
            }
        }
    };

    const handleSelectLinkToDelete = async (relId) => {
        // Perform the deletion of the selected link
        await deleteLink(relId);
        setContextMenuData(null);
        setLinkSelectionPopupOpen(false);  // Close the popup after deletion
        setRelationsToDelete([]);  // Clear the relations to delete
    };

    // Event listener for node click
    // If linkin mode call linkAnotherNode
    const handleNodeClick = (nodeId) => {
        const targetId = nodeId;
        if (linkSourceId.current) {
            const sourceId = linkSourceId.current;
            console.log("Linking from "+sourceId+" to "+targetId);
            //linkAnotherNode(sourceId, targetId);
            setNewRelTarget(targetId);
            setNewRelSource(sourceId);
            openRelDialog();
        }
    };

    const startLinkingMode = () => {
        const sourceId = contextMenuData.id;
        setLinkingMode(true);
        linkSourceId.current = sourceId;
        console.log("Linking mode from "+sourceId);
        setContextMenuData(null);
    };

    const linkAnotherNode = async (sourceId, targetId) => {
        //const connectionName = prompt("Enter the connection name:");
        const connectionName = newRelName;

        if (!connectionName) {
            return;
        }

        const relationships = {
            "relationships": {
                [targetId]: connectionName}
        };
        await addRelationship(sourceId, relationships);
        linkSourceId.current = null;
        setLinkingMode(null);
        closeRelDialog();
    };


    const closeMenu = () => {
        if (contextMenuData) {
            setContextMenuData(null);
            setLinkingMode(null);
        }
    };

    const openRelDialog = () => {
        setRelDialogOpen(true);
    }

    const closeRelDialog = () => {
        setRelDialogOpen(false);
        setNewRelSource('');
        setNewRelTarget('');
        setNewRelName('');
    }

    const handleNewRelName = (e) => {
        setNewRelName(e.target.value);
    }


    return (
        <div className="graph-container" ref={graphRef}>
            <svg ref={svgRef}>
                <g className="graph"></g>
            </svg>
            {linkingMode && (
                <div className="linking-mode">
                    <p className="linking-mode-text">Click on another node to link it with the selected node</p>
                </div>
            )}
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
            {/* Context menu */}
            {contextMenuData && (
                <div className="context-menu" style={{ left: contextMenuData.x, top: contextMenuData.y }}>
                    {contextMenuData.type === 'Node' ? (
                        <>
                            <div className="context-menu-item" onClick={handleDeleteNode}>
                                Delete Node
                            </div>
                            <div
                                className={`context-menu-item ${nodes.length <= 1 ? 'disabled' : ''}`}
                                onClick={nodes.length > 1 ? startLinkingMode : null}  // Disable click if only 1 node
                            >
                                Connect Another Node
                            </div>
                        </>
                    ) : (
                        // <div className="context-menu-item" onClick={handleDeleteLink}>
                        //     Delete Link
                        // </div>
                        <div className="context-menu-item" onClick={handleDeleteLink}>
                            Delete Link
                        </div>
                    )}
                    <div className="context-menu-item" onClick={closeMenu}>Close Menu </div>
                </div>
            )}
            <Dialog open={linkSelectionPopupOpen} onClose={() => setLinkSelectionPopupOpen(false)}>
                <DialogTitle>Select a Link to Delete</DialogTitle>
                <DialogContent>
                    <ul>
                        {relationsToDelete.map((rel, index) => (
                            <li key={index}>
                                <Button onClick={() => handleSelectLinkToDelete(rel.relId)}
                                        variant="contained">
                                    {rel.label}
                                </Button>
                            </li>
                        ))}
                    </ul>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setLinkSelectionPopupOpen(false)}
                            variant="contained">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
            <Dialog open={relDialogOpen} onClose={closeRelDialog}>
                <DialogTitle>Enter the connection name</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="relName"
                        label="name"
                        type="text"
                        fullWidth
                        value={newRelName}
                        onChange={handleNewRelName}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeRelDialog} color="primary" variant="contained">
                        Back
                    </Button>
                    <Button onClick={() => linkAnotherNode(newRelSource, newRelTarget)} color="primary" variant="contained">
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default Graph;
