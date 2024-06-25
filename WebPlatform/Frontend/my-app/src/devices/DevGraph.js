import React from 'react';
import { useEffect, useState, useCallback} from 'react';
import GraphMini from "../components/GraphMini";

function Assets({id}) {

    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);

    const fetchData = useCallback(async()=>{
        const response = await fetch('/api/getNetwork', {
            method: 'GET',
            credentials: 'include',
            mode : 'cors',
        });

        const jsonData = await response.json();

        const unchecked_links = jsonData.links;
        console.log(jsonData);
        const nodes = jsonData.nodes;
        const nodeIds = nodes.map(node => node.id);
        console.log(nodeIds);

        // Creare un oggetto per tracciare i nodi visitati
        const visited = {};
        for (let nodeId of nodeIds) {
            visited[nodeId] = false;
        }
        

        // Creare un array per i nodi raggiungibili e i link
        const reachableNodes = [];
        const reachableLinks = [];

        // Funzione DFS
        const dfs = (nodeId) => {
            visited[nodeId] = true;
            const node = nodes.find(node => node.id === nodeId);
            if (node) {
                reachableNodes.push(node);
            }

            const linkedNodes = unchecked_links.filter(link => link.source === nodeId || link.target === nodeId);
            console.log(linkedNodes)
            for (let link of linkedNodes) {
                reachableLinks.push(link);
                const nextNodeId = link.source === nodeId ? link.target : link.source;
                console.log(nextNodeId);
                if (!visited[nextNodeId]) {
                    dfs(nextNodeId);
                }
            }
        }

        // Esegui DFS a partire dal nodo con l'ID passato
        dfs(id);
        console.log(reachableNodes);
        console.log(reachableLinks);
        setNodes(reachableNodes);
        setLinks(reachableLinks);
    },[id]);
    useEffect(() =>{
        fetchData().then();
    },[fetchData]);


    return (
        <div>
            <div>
                {nodes.length > 0 ? (
                    <GraphMini nodes={nodes} links={links}/>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        
        </div>
    );
}

export default Assets;