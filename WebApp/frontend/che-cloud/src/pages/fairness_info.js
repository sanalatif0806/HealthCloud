import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { base_url, kghb_url } from '../api';
import axios from 'axios';
import RadarChart from '../components/radar_chart'; 
import RadialBarChart from '../components/radial_bar';
import GaugeChart from '../components/gauge_chart';
import { Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function FairnessInfo(){
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const dataset_id = queryParams.get('dataset_id');
    const [fairness_data, setFairnessData] = useState({});
    const [believability_data, setBelievabilityData] = useState(false);

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
        async function getBelievabilityData(){
            try {
                //Same trasformation done by KGHeartBeat
                let sanitizedId = dataset_id.replace(/[\\/*?:"<>|]/g, "");
                sanitizedId = dataset_id.replace(/[\\/*?:"<>|]/g, "");
                sanitizedId = sanitizedId.replace(/[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/g, "");
                sanitizedId = sanitizedId.replace(/\s+/g, "");

                const response = await axios.get(`${kghb_url}trust/believability?id=${sanitizedId}`);
                console.log(response.data[0])
                setBelievabilityData(response.data[0])
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getBelievabilityData();
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
                {fairness_data.isOntology ? (
                    <>
                    <h1 className="d-inline mb-4">{fairness_data['KG name']}</h1>
                    <span className="badge bg-primary d-inline ms-2">Ontology</span>
                    </>
                ) : (
                    <>
                    <h1 className="d-inline mb-4">{fairness_data['KG name']}</h1>
                    <span className="badge bg-secondary d-inline ms-2">Dataset</span>
                    </>
                )}
                </div>

                {believability_data ? (
                    <p className="text-center mb-5">{believability_data.Quality_category_array.Believability.description}</p>
                ) : (
                    <p className="text-center mb-5">Loading Believability data</p>
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
        </>
      );
}

export default FairnessInfo;