require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    // mediaTags table
    await conn.execute(`CREATE TABLE IF NOT EXISTS mediaTags (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        mediaId BIGINT UNSIGNED NOT NULL,
        tag VARCHAR(50) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    
    // Add index for fast tag lookup
    try {
        await conn.execute(`CREATE INDEX idx_mediaTags_tag ON mediaTags(tag)`);
        await conn.execute(`CREATE INDEX idx_mediaTags_media ON mediaTags(mediaId)`);
    } catch(e) { /* indexes might already exist */ }
    
    console.log('✓ mediaTags table + indexes created');
    await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
