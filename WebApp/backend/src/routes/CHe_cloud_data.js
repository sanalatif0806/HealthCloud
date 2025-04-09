const router = require('express').Router();
const { response } = require('express');
const { getAllIdsAndLinks } = require('../models/CHe_cloud_data');

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
                "url": `https://example.com/${item.identifier}`,
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

module.exports = router;