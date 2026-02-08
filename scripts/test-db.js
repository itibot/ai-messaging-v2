
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function testConnection() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('❌ DATABASE_URL is not defined in .env');
        return;
    }

    const client = new Client({
        connectionString,
        connectionTimeoutMillis: 5000,
    });

    console.log('🔍 Testing connection to:', connectionString.split('@')[1]);

    try {
        await client.connect();
        console.log('✅ Connection successful!');
        const res = await client.query('SELECT current_database();');
        console.log('Database name:', res.rows[0].current_database);
        await client.end();
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        if (err.code) console.error('Error Code:', err.code);
    }
}

testConnection();
