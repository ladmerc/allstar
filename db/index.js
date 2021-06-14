const mongoose = require('mongoose');
const { dbUrl } = require('../config')

if (!dbUrl) {
    throw new Error('Missing mongo db url');
}

mongoose.Promise = global.Promise;
let cachedPromise = null;

module.exports = connectToDatabase = async () => {
    if (!cachedPromise) {
        cachedPromise = mongoose.connect(dbUrl);
    }
    try {
        const connection = await cachedPromise;
        mongoose.connection.on('error', (error) => {
            console.error(`Mongo initial connection error:`, error);
        });
        return connection;
    } catch (error) {
        console.error(`Mongo initial connection error:`, error);
        process.exit(1);
    }
};