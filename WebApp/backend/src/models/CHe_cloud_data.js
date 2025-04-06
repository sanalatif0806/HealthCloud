const { connectToMongoDB } = require('../db');

async function getAllIdsAndLinks() {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('CHe_cloud_data'); 

        return await collection.find({}, { projection: { identifier: 1, title: 1 , links: 1, keywords: 1 } }).toArray();
    } catch (error) {
        console.error("Error during data recovering:", error);
        throw error;
    }
}

module.exports = { getAllIdsAndLinks };