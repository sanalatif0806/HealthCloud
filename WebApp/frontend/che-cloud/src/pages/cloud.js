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
            <h1>CHe Cloud!</h1>
            <Graph data={data}/>
        </div>
    )
}

export default Cloud;