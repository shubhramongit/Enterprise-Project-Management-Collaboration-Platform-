const { Pool } = require('pg');
const { createClient } = require('redis');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('❌ Redis Error:', err.message));

const connectDB = async () => {
    try {
        await redisClient.connect();
        console.log('✅ Redis & PostgreSQL ready');
    } catch (err) {
        console.error('⚠️ Database/Cache connection failed');
    }
};

module.exports = { pool, redisClient, connectDB };