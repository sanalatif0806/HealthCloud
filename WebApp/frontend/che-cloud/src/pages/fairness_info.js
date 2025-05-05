import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base_url, kghb_url } from '../api';
import axios from 'axios';
import RadarChart from '../components/radar_chart'; 
import RadialBarChart from '../components/radial_bar';
import GaugeChart from '../components/gauge_chart';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';

function FairnessInfo(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const dataset_id = queryParams.get('dataset_id');
    const [fairness_data, setFairnessData] = useState({});
    const [dataset_metadata, setDatasetMetadata] = useState(false);
    const [showDownloads, setShowDownloads] = useState(false);

    useEffect(() => {
        async function getFairnessData(){
            try {
            const response = await axios.get(`${base_url}/CHe_cloud_data/fairness_data/${dataset_id}`);
            setFairnessData(response.data)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getFairnessData();
        async function getJsonData(){
            try {
                //Same trasformation done by KGHeartBeat
                
                //let sanitizedId = dataset_id.replace(/[\\/*?:"<>|]/g, "");
                //sanitizedId = dataset_id.replace(/[\\/*?:"<>|]/g, "");
                //sanitizedId = sanitizedId.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");
                //sanitizedId = sanitizedId.replace(/\s+/g, "");
                //const response = await axios.get(`${kghb_url}trust/believability?id=${sanitizedId}`);
                const response = await axios.get(`${base_url}/CHe_cloud_data/dataset_metadata/${dataset_id}`);
                console.log(response.data)
                setDatasetMetadata(response.data)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getJsonData();
    }, [])

    const chartReady = fairness_data && Object.keys(fairness_data).length > 0;
    const chart_categories = [
        "F score",
        "A score",
        "I score",
        "R score",
    ]
    const chartValues = chart_categories.map(category =>
        parseFloat(fairness_data[category] || 0)
    );
    const f_chart_categories = [
        "F1-M Unique and persistent ID",
        "F1-D URIs dereferenceability",
        "F2a-M - Metadata availability via standard primary sources",
        "F2b-M Metadata availability for all the attributes covered in the FAIR score computation",
        "F3-M Data referrable via a DOI",
        "F4-M Metadata registered in a searchable engine",
        "A1-D Working access point(s)",
        "A1-M Metadata availability via working primary sources",
        "A1.2 Authentication & HTTPS support",
        "A2-M Registered in search engines",
        "I1-D Standard & open representation format",
        "I1-M Metadata are described with VoID/DCAT predicates",
        "I2 Use of FAIR vocabularies",
        "I3-D Degree of connection",
        "R1.1 Machine- or human-readable license retrievable via any primary source",
        "R1.2 Publisher information, such as authors, contributors, publishers, and sources",
        "R1.3-D Data organized in a standardized way",
        "R1.3-M Metadata are described with VoID/DCAT predicates"
    ]
    const f_values = f_chart_categories.map(category =>
        parseFloat(fairness_data[category] || 0)
    );
    return (
        <>
            <div className="mt-2 ms-3">
                <Link to="/" className="btn btn-outline-success">Return to the Cloud</Link>
            </div>
            <div className="container mt-3">
                <div className="text-center mb-4">
                {fairness_data.Ontology == 'True' ? (
                    <>
                    <h1 className="d-inline mb-4">{dataset_metadata.title}</h1>
                    <span className="badge bg-warning text-dark d-inline ms-2">Ontology</span>
                    </>
                ) : (
                    <>
                    <h1 className="d-inline mb-4">{dataset_metadata.title}</h1>
                    <span className="badge bg-secondary d-inline ms-2">Dataset</span>
                    </>
                )}
                </div>

                {dataset_metadata.description ? (
                    <p className="text-justify mb-5">{dataset_metadata.description.en}</p>
                ) : (
                    <p className="text-center mb-5">Loading Description data</p>
                )}

            {dataset_metadata && (
                <div className="card shadow-sm p-4 mb-5">
                    <h5 className="mb-3">Dataset Information</h5>
                    <Row>
                        {dataset_metadata.website && (
                            <Col md={6} className="mb-3">
                                <strong>Website: </strong>
                                <a href={dataset_metadata.website} target="_blank" rel="noopener noreferrer">
                                    {dataset_metadata.website}
                                </a>
                            </Col>
                        )}
                        {dataset_metadata.license ? (
                            <Col md={6} className="mb-3">
                                <strong>License: </strong>{dataset_metadata.license}
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>License: </strong>Not specified
                            </Col>
                        )}
                        {dataset_metadata.sparql[0] ? (
                            <Col md={6} className="mb-3">
                                <strong>SPARQL Endpoint: </strong>
                                <a href={dataset_metadata.sparql[0].access_url} target="_blank" rel="noopener noreferrer">
                                    {dataset_metadata.sparql[0].access_url}
                                </a>
                            </Col>
                        ) : (
                            <Col md={6} className="mb-3">
                                <strong>SPARQL Endpoint: </strong>Not specified
                            </Col>
                        )}
                        {(dataset_metadata?.other_download?.length > 0 || dataset_metadata?.full_download?.length > 0) && (
                             <Col md={6} className="mb-3">
                                <button
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowDownloads(!showDownloads)}
                                >
                                    {showDownloads ? 'Hide Downloadable Resources' : 'Show Downloadable Resources'}
                                </button>
                            </Col>
                        )}
                        {showDownloads && (
                            <div className="card shadow-sm p-4 mb-5">
                                <h5 className="mb-3">Downloadable Resources</h5>
                                {[...(dataset_metadata.full_download || []), ...(dataset_metadata.other_download || [])].map((item, index) => (
                                    <div key={index} className="mb-3">
                                        <p className="mb-1">
                                            <strong>{item.title || "Untitled resource"}</strong>
                                        </p>
                                        <a href={item.access_url || item.download_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline-primary btn-sm">
                                            {item.access_url || item.download_url}
                                        </a>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Row>
                </div>
            )}

                {chartReady ? (
                    <Row className="g-4">
                    <Col md={4} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center"></h5>
                        <GaugeChart label={'FAIR Score'} value={parseFloat(fairness_data['FAIR score'])} />
                        </div>
                    </Col>
                    
                    <Col md={4} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center"></h5>
                        <RadialBarChart label={chart_categories} value={chartValues} />
                        </div>
                    </Col>

                    <Col md={4} sm={12}>
                        <div className="card shadow-sm p-3">
                        <h5 className="card-title text-center"></h5>
                        <RadarChart
                            title={''}
                            categories={f_chart_categories}
                            seriesData={[{ name: fairness_data['KG name'], data: f_values }]}
                            height={340}
                        />
                        </div>
                    </Col>
                    </Row>
                ) : (
                    <p className="text-center">Loading fairness data...</p>
                )}
            </div>
            <Footer />
        </>
      );
}

export default FairnessInfo;