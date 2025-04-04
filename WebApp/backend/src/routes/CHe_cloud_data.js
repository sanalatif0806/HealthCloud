const router = require('express').Router();
const { response } = require('express');
const { getAllIdsAndLinks } = require('../models/CHe_cloud_data');

router.get('/links', async (req, res) => {
    try {
        const items = await getAllIdsAndLinks();

        if (!items.length) {
            return res.status(404).json({ message: "No elements founded." });
        }
        const nodes = items.map(item => ({
            "id": item.identifier,
            "url": `https://example.com/${item.identifier}`,
            "category": "Type 1"
        }));
        const links = [];
        items.forEach(item => {
            item.links.forEach(link => {
            links.push({
                "source": item.identifier,
                "target": link.target,
                "value": link.value,
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

module.exports = router;