import Graph from "../components/Graph";
import { base_url } from '../api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Cloud(){
    const [data, setData] = useState({ nodes: [], links: [] });
    const navigate = useNavigate();

    useEffect(() => {
            fetch(`${base_url}/CHe_cloud_data/all_ch_links`)
                .then(response => response.json())
                .then(data => setData(data));
    }, []);

    const handleInsertResource = () => {
        navigate('/add-dataset'); // naviga alla pagina /add-dataset
    }

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
            <div style={{ textAlign: 'left', marginBottom: '1.5rem', marginLeft: '2rem' }}>
                <button 
                    onClick={handleInsertResource}
                    style={{
                        padding: '0.5rem 1.3rem',
                        fontSize: '1rem',
                        backgroundColor: '#8da89f',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#7b978c'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#8da89f'}
                >
                    Ask to insert resource
                </button>
            </div>
            <Graph data={data}/>
        </div>
    )
}

export default Cloud;