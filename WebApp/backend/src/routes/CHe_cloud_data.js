const router = require('express').Router();
const { response } = require('express');
const { getAllIdsAndLinks, getAllJsonData } = require('../models/CHe_cloud_data');
const express = require('express');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();
const path = require('path');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const fairness_page = 'CHe-cloud/fairness-info';

router.get('/all_ch_links', async (req, res) => {
    try {
        const items = await getAllIdsAndLinks();
        const allowedKeywords = ["ch-tangible", "ch-intangible",'ch-natural','ch-generic'];
        if (!items.length) {
            return res.status(404).json({ message: "No elements founded." });
        }
        const nodes = items.map(item => {
            let matchedKeyword = item.keywords.find(kw => allowedKeywords.includes(kw));
            if (matchedKeyword == 'ch-tangible'){
                matchedKeyword = 'Tangible'
            }
            if (matchedKeyword == 'ch-intangible'){
                matchedKeyword = 'Intangible'
            }
            if (matchedKeyword == 'ch-generic'){
                matchedKeyword = 'Generic'
            }
            if (matchedKeyword == 'ch-natural'){
                matchedKeyword = 'Natural'
            }
            return {
                "id": item.identifier,
                "title" : item.title,
                "url": `${frontendUrl}${fairness_page}?dataset_id=${item.identifier}`,
                "category": matchedKeyword || 'Generic'
            }
        });
        const links = [];
        const nodeIds = new Set(nodes.map(node => node.id)); // Create a set of node IDs for faster lookup
        items.forEach(item => {
            item.links
                .filter(link => nodeIds.has(link.target)) // Only keep links with a valid target, we want to build a Cloud with only CH KGs
                .forEach(link => {
                    links.push({
                        "source": item.identifier,
                        "target": link.target,
                        //"value": link.value,
                    });
                });
        });
        const response = {
            "nodes" : nodes,
            "links" : links
        }
        res.json(response);
        
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/fairness_data/:id', async (req, res) => {
    try{
        const csvPath = path.join(__dirname, '../../data/fairness-data.csv'); 
        const targetId = req.params.id;
        let found = false;
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (row) => {
            if (row['KG id'] === targetId) {
                found = true;
                res.json(row);
            }
            })
            .on('end', () => {
            if (!found) {
                res.status(404).json({ message: 'Row not found' });
            }
            })
            .on('error', (err) => {
            console.error(err);
            res.status(500).json({ error: 'Error reading CSV file' });
            });

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/dataset_metadata/:id', async (req, res) => {
    try{
        const dataset_id = req.params.id;
        const json_data = await getAllJsonData(dataset_id);
        if (json_data){
            res.status(200).json(json_data);
        } else {
            res.status(404).json({ message: "Dataset not found" });
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Server error" });
    }
});

router.get('/get_all', async (req, res) => {
    try {
        const items = await getAllJsonData();
        if (!items.length) {
            return res.status(404).json({ message: "No elements founded." });
        }
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;