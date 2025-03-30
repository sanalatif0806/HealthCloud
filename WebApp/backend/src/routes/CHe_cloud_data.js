const router = require('express').Router();
const { getAllIdsAndLinks } = require('../models/CHe_cloud_data');

router.get('/links', async (req, res) => {
    try {
        const items = await getAllIdsAndLinks();

        if (!items.length) {
            return res.status(404).json({ message: "No elements founded." });
        }

        res.json(items);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;