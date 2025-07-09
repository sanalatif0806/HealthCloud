import React, { useEffect, useState } from 'react';
import { dahboard_backend_url } from '../api';
import { Row, Col } from 'react-bootstrap';
import PieChart from '../components/pie_chart';
import axios from 'axios';
import { Link } from 'react-router-dom';
import BoxPlot from '../components/boxplot';
import DonutChart from '../components/donut_chart';
import MinimalTable from '../components/minimal_table';
import { renderValueAsLink } from '../utils';
import MaterialTable from '../components/material_table';

function Dashboard() {
    const [sparql_data, setSparqlData] = useState({});
    const [rdf_dump_data, setRdfDumpData] = useState({});
    const [license_data, setLicenseData] = useState({});
    const [mediatype_data, setMediaTypeData] = useState({});
    const [fair_stats_data, setFairStatsData] = useState({});
    const [only_fair_stats, setOnlyFairStats] = useState({});
    const [datasets_stats, setDatasetsStats] = useState({});
    const [datasets_ontologies, setDatasetsOntologies] = useState({});
    const [license_table, setLicenseTable] = useState(false);
    const [sparql_table, setSparqlTable] = useState(false);
    const [rdf_table, setRdfTable] = useState(false);
    const [media_table, setMediaTable] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [
                    sparqlRes,
                    rdfRes,
                    statsRes,
                    fairRes,
                    licenseRes,
                    mediaRes
                ] = await Promise.all([
                    axios.get(`${dahboard_backend_url}/sparql_endpoint`),
                    axios.get(`${dahboard_backend_url}/rdf_dump`),
                    axios.get(`${dahboard_backend_url}/datasets_stats`),
                    axios.get(`${dahboard_backend_url}/fair_stats`),
                    axios.get(`${dahboard_backend_url}/license`),
                    axios.get(`${dahboard_backend_url}/media_type`)
                ]);

                setSparqlData(sparqlRes.data);
                setRdfDumpData(rdfRes.data);
                setDatasetsOntologies({
                    datasets: statsRes.data.datasets,
                    ontologies: statsRes.data.ontologies,
                });
                delete statsRes.data.datasets
                delete statsRes.data.ontologies
                setDatasetsStats(statsRes.data);
                const fairOnly = { 'FAIR score': fairRes.data['FAIR score'] };
                delete fairRes.data['FAIR score'];
                setOnlyFairStats(fairOnly);
                setFairStatsData(fairRes.data);

                setLicenseData(licenseRes.data);
                setMediaTypeData(mediaRes.data);

            } catch (error) {
                console.error("Data fetch error:", error);
            }
        }

        fetchData();
    }, []);

    useEffect(() => {
        if (license_data) {
            const data = Object.entries(license_data).filter(([k]) => k !== 'False').map(([key, value]) => ({
                license: renderValueAsLink(key),
                count: value
            }));
            setLicenseTable(<MaterialTable columns_value={[
                { accessorKey: 'license', header: 'Machine-Readable License', size: 50 },
                { accessorKey: 'count', header: 'Count', size: 5 }
            ]} data_table={data} />);
        }

        if (sparql_data) {
            const data = Object.entries(sparql_data).filter(([k]) => k !== 'False').map(([key, value]) => {
                let label = key;
                if (key === '-') label = 'Not indicated';
                else if (key === 'offline') label = 'Offline';
                else if (key === 'Available') label = 'Online';
                else if (key === 'Restricted access to the endpoint') label = 'Access protected';
                return { sparql: label, count: value };
            });

            setSparqlTable(<MinimalTable columns_value={[
                { accessorKey: 'sparql', header: 'SPARQL Endpoint Status', size: 50 },
                { accessorKey: 'count', header: 'Count', size: 5 }
            ]} data_table={data} />);
        }

        if (rdf_dump_data) {
            const data = Object.entries(rdf_dump_data).filter(([k]) => k !== 'False').map(([key, value]) => {
                let label = key;
                if (key === '1') label = 'Online';
                else if (key === '0') label = 'Offline';
                else if (key === '-1') label = 'Not indicated';
                return { rdf: label, count: value };
            });

            setRdfTable(<MinimalTable columns_value={[
                { accessorKey: 'rdf', header: 'RDF Dump Status', size: 50 },
                { accessorKey: 'count', header: 'Count', size: 5 }
            ]} data_table={data} />);
        }

        if (mediatype_data) {
            const data = Object.entries(mediatype_data).filter(([k]) => k !== 'False').map(([key, value]) => ({
                media: key,
                count: value
            }));

            setMediaTable(<MaterialTable columns_value={[
                { accessorKey: 'media', header: 'Media Type', size: 50 },
                { accessorKey: 'count', header: 'Count', size: 5 }
            ]} data_table={data} />);
        }
    }, [license_data, sparql_data, rdf_dump_data, mediatype_data]);

    return (
        <div className="container-fluid mt-4 px-4">
            <div className="d-flex justify-content-start gap-2 mb-3">
                <Link to="/" className="btn btn-outline-success">Return to the Cloud</Link>
                <Link to="/search" className="btn btn-outline-success">Search</Link>
                <Link to="/add-dataset" className="btn btn-outline-success">Add a Dataset</Link>
            </div>

            <div className="card shadow p-4 mb-5 bg-light">
                <Row className="gy-4">
                    <Col md={4}>
                        <div className="card h-100 shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">Resources in the CHeCLOUD</h6>
                            <DonutChart categories={Object.keys(datasets_ontologies)} seriesData={Object.values(datasets_ontologies)} height={200} />
                        </div>
                    </Col>
                    <Col md={5}>
                        <div className="card h-100 shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">Datasets by Cultural Heritage Subcategory</h6>
                            <PieChart categories={Object.keys(datasets_stats)} seriesData={Object.values(datasets_stats)} height={200} />
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="card shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">SPARQL Endpoints</h6>
                            {sparql_table}
                        </div>
                    </Col>
                </Row>

                <hr className="my-5" />

                <Row className="gy-4">
                    <Col md={4}>
                        <div className="card shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">FAIR Score Distribution</h6>
                            <BoxPlot categories={Object.keys(only_fair_stats)} seriesData={only_fair_stats} height={250}/>
                        </div>
                    </Col>
                    <Col md={5}>
                        <div className="card shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">F-A-I-R Score Distribution</h6>
                            <BoxPlot seriesData={fair_stats_data} height={250}/>
                        </div>
                    </Col>
                    <Col md={3}>
                        <div className="card shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">RDF Dumps</h6>
                            {rdf_table}
                        </div>
                    </Col>
                </Row>

                <hr className="my-5" />

                <Row className="gy-4">
                    <Col md={6}>
                        <div className="card shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">Licensing Overview</h6>
                            {license_table}
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="card shadow-sm border-0 p-3 bg-white">
                            <h6 className="text-center fw-bold">Media Types</h6>
                            {media_table}
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
}

export default Dashboard;