require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    await conn.execute(`CREATE TABLE IF NOT EXISTS newsletterImages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        type VARCHAR(50) DEFAULT 'image' NOT NULL,
        sizeBytes INT,
        caption VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    
    console.log('✓ newsletterImages table created');
    await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
