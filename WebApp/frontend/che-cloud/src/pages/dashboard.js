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

function Dashboard(){
    const [sparql_data, setSparqlData] = useState({})
    const [rdf_dump_data, setRdfDumpData] = useState({})
    const [license_data, setLicenseData] = useState({})
    const [mediatype_data, setMediaTypeData] = useState({})
    const [fair_stats_data, setFairStatsData] = useState({})
    const [only_fair_stats, setOnlyFairStats] = useState({})
    const [datasets_stats, setDatasetsStats] = useState({})
    const [datasets_ontologies, setDatasetsOntologies] = useState({})
    const [license_table, setLicenseTable] = useState(false)

    useEffect(() => {
        async function getSparqlData(){
            try {
                const response = await axios.get(`${dahboard_backend_url}/sparql_endpoint`);
                setSparqlData(response.data)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getSparqlData();

        async function getDatasetsStats(){
            try {
                const response = await axios.get(`${dahboard_backend_url}/datasets_stats`);
                setDatasetsStats(response.data)
                const only_dat_ont = {
                    datasets : response.data.datasets,
                    ontologies : response.data.ontologies,
                }
                setDatasetsOntologies(only_dat_ont)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getDatasetsStats();

        async function getFairStats(){
            try {
                const response = await axios.get(`${dahboard_backend_url}/fair_stats`);
                const l = {
                    'FAIR score' : response.data['FAIR score']
                }
                setOnlyFairStats(l)
                delete response.data['FAIR score']
                setFairStatsData(response.data)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getFairStats();

        async function getLicense(){
            try {
                const response = await axios.get(`${dahboard_backend_url}/license`);
                console.log(response.data)
                setLicenseData(response.data)
            } catch (error) {
            console.error("Error:",error)
            }
        } 
        getLicense();

    }, [])

    useEffect(() => {
        if(license_data){
            let data = []
            const columns = [
                {
                    accessorKey: 'license',
                    header: 'Machine Redeable license',
                    size : 50,
                },
                {
                    accessorKey: 'count',
                    header: 'Count',
                    size:5
                }
            ]
            for (const [key, value] of Object.entries(license_data)) {
                if(key !== 'False'){
                    data.push(
                        {
                            license : renderValueAsLink(key),
                            count : value
                        }
                    )
                }
            }
            setLicenseTable(<MaterialTable columns_value={columns} data_table={data}/>)
        }
    },[license_data])


    return (
        <>
            <div className="mt-2 ms-3">
                <Link to="/search" className="btn btn-outline-success">Search</Link>
                <Link to="/" className="btn btn-outline-success" style={{marginLeft: '5px'}}>Return to the Cloud</Link>
            </div>
            <div className="card shadow-sm p-4 mb-5">
                <Row>
                    {datasets_stats ? (
                        <>
                            <Col mb={4} sm={6} >
                                <div className="card shadow-sm p-3">
                                    <h5 className="card-title text-center"></h5>
                                    {delete datasets_stats.datasets}
                                    {delete datasets_stats.ontologies}
                                    <DonutChart categories={Object.keys(datasets_ontologies)} seriesData={Object.values(datasets_ontologies)} title={'Resources in the CHeCLOUD'} />
                                </div>
                            </Col>
                            <Col mb={4} sm={6} >
                                <div className="card shadow-sm p-3">
                                    <h5 className="card-title text-center"></h5>
                                    {delete datasets_stats.datasets}
                                    {delete datasets_stats.ontologies}
                                    <PieChart categories={Object.keys(datasets_stats)} seriesData={Object.values(datasets_stats)} title={'Dataset by Cultural Heritage subcategory'} />
                                </div>
                            </Col>
                            {fair_stats_data ? (
                                <>
                                    <Col mb={4} sm={6} >
                                        <div className="card shadow-sm p-3">
                                            <h5 className="card-title text-center"></h5>
                                            <BoxPlot seriesData={fair_stats_data} title={'F-A-I-R score distribution'} />
                                        </div>
                                    </Col>
                                    <Col mb={4} sm={6} >
                                        <div className="card shadow-sm p-3">
                                            <h5 className="card-title text-center"></h5>
                                            <BoxPlot categories={Object.keys(only_fair_stats)} seriesData={only_fair_stats} title={'FAIR score distribution'} />
                                        </div>
                                    </Col>
                                </>
                                ) : (
                                    <p>Loading data</p>
                                )}
                        </>
                    ) : ( 
                        <p>Loading data</p>
                    )}
                </Row>
                <Row>
                    {license_data ? (
                         <Col mb={4} sm={5} >
                            {license_table}
                        </Col>
                    ) : (
                        <p>Loading data</p>
                    )}
                </Row>

            </div>
        </>
    )


}

export default Dashboard;