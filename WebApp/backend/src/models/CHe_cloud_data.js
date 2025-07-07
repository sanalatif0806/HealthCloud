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

async function getAllJsonDataByID(dataset_id) {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('CHe_cloud_data'); 

        const data = await collection.findOne({ identifier: dataset_id });
        return data;
    } catch (error) {
        console.error("Error during data recovering:", error);
        throw error;
    }
}

async function getAllJsonData() {
    try {
        const db = await connectToMongoDB();
        const collection = db.collection('CHe_cloud_data'); 

        const data = await collection.find({}).toArray();;
        return data;
    } catch (error) {
        console.error("Error during data recovering:", error);
        throw error;
    }
}

async function getCollection() {
    const db = await connectToMongoDB();
    const collection = db.collection('CHe_cloud_data'); 
    
    return collection
}

module.exports = { getAllIdsAndLinks, getAllJsonData, getAllJsonDataByID, getCollection};