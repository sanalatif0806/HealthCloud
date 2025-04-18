import Graph from "../components/Graph";
import { base_url } from '../api';
import React, { useEffect, useState } from 'react';

function Cloud(){
    const [data, setData] = useState({ nodes: [], links: [] });

    useEffect(() => {
            fetch(`${base_url}/CHe_cloud_data/all_ch_links`)
                .then(response => response.json())
                .then(data => setData(data));
    }, []);

    return (
        <div>
            <h1 style={{
                textAlign: 'center',
                fontSize: '3rem',
                margin: '1rem 0',
                color: '#8da89f',
                fontFamily: 'Segoe UI, sans-serif',
                letterSpacing: '1px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                animation: 'fadeIn 1s ease-in-out'
            }}>
                CHe Cloud!
            </h1>
            <Graph data={data}/>
        </div>
    )
}

export default Cloud;