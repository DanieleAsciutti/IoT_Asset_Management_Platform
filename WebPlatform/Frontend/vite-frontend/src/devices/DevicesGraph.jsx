import React from 'react';
import { useEffect, useState } from 'react';
import Graph from "../components/GraphMini2";

function Assets({onNodeClick, level1, level2, level3}) {

    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);


    useEffect(() =>{
        fetchData().then();
    },[]);

    const fetchData = async()=>{
        const response = await fetch(`/api/getFilteredNetwork?l1=${level1}&l2=${level2}&l3=${level3}`, {
            method: 'GET',
            credentials: 'include',
            mode : 'cors',
        });

        const jsonData = await response.json();
        const unchecked_links = jsonData.links;
        const nodeIds = jsonData.nodes.map(node => node.id);
        const filtered_links = unchecked_links.filter(link => {
            // Check if both link.source and link.target exist in the nodeIds array
            const sourceExists = nodeIds.includes(link.source);
            const targetExists = nodeIds.includes(link.target);

            return sourceExists && targetExists;
        });

        setNodes(jsonData.nodes);
        setLinks(filtered_links);
    }


    return (
        <div>
            <div>
                {nodes.length > 0 ? (
                    <Graph nodes={nodes} links={links} onNodeClick={onNodeClick}/>
                ) : (
                    <p></p>
                )}
            </div>
        
        </div>
    );
}

export default Assets;
