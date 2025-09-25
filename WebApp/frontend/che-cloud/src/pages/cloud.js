import Graph from "../components/Graph";
import { base_url } from '../api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGithub } from 'react-icons/fa';

function Cloud(){
    const [data, setData] = useState({ nodes: [], links: [] });
    const navigate = useNavigate();

    useEffect(() => {
            fetch(`${base_url}/CHe_cloud_data/all_ch_links`)
                .then(response => response.json())
                .then(data => setData(data));
    }, []);

    const handleInsertResource = () => {
        navigate('/add-dataset'); 
    }

    const handleSearch = () => {
        navigate('/search'); 
    }

    const handleDash = () => {
        navigate('/dashboard')
    }

    const handleAbout = () => {
        navigate('/about')
    }

    return (
        <div>
            <div style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                display: 'flex',
                gap: '1rem',
                zIndex: 1000
            }}>
                <button
                    onClick={() => window.open('https://github.com/GabrieleT0/CHe-CLOUD', '_blank')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.4rem 1rem',
                        fontSize: '0.9rem',
                        backgroundColor: '#333',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#24292e'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#333'}
                >
                    <FaGithub size={18} />
                    GitHub
                </button>
                <button
                    onClick={() => window.open('https://gabrielet0.github.io/CHe-CLOUD/fair_mapping.html', '_blank')}
                    style={{
                        padding: '0.4rem 1rem',
                        fontSize: '0.9rem',
                        backgroundColor: '#4a90e2',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#3a7dc1'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#4a90e2'}
                >
                    FAIR principles calculation
                </button>
            </div>
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
             CHeCLOUD
            <img 
                    src="/favicon.png" 
                    alt="Cloud Logo" 
                    style={{ height: "50px", width: "50px", marginLeft: "20px", marginBottom: "2px" }} 
            />
            </h1>
            <h3 style={{
                textAlign: 'center',
                fontSize: '2.3rem',
                margin: '1rem 0',
                color: '#8da89f',
                fontFamily: 'Segoe UI, sans-serif',
                letterSpacing: '1px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                animation: 'fadeIn 1s ease-in-out'
            }}>
                The Cultural Heritage Linked Open Data (sub)cloud
            </h3>
            <div style={{ textAlign: 'left', marginBottom: '1.5rem', marginLeft: '2rem' }}>
                <button 
                    onClick={handleSearch}
                    style={{
                        padding: '0.5rem 1.3rem',
                        marginRight: '1rem',
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
                    Search
                </button>

                                <button 
                    onClick={handleDash}
                    style={{
                        padding: '0.5rem 1.3rem',
                        marginRight: '1rem',
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
                    Dashboard
                </button>

                <button 
                    onClick={handleInsertResource}
                    style={{
                        padding: '0.5rem 1.3rem',
                        fontSize: '1rem',
                        backgroundColor: '#8da89f',
                        marginRight: '1rem',
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
                    Ask to insert a new dataset
                </button>
                
                <button 
                    onClick={handleAbout}
                    style={{
                        padding: '0.5rem 1.3rem',
                        marginRight: '1rem',
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
                    About
                </button>
            </div>
            <Graph data={data}/>
        </div>
    )
}

export default Cloud;