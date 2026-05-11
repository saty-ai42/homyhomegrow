require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    await conn.execute(`CREATE TABLE IF NOT EXISTS growDiaryEntries (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        diaryId BIGINT UNSIGNED NOT NULL,
        day INT NOT NULL,
        week INT,
        titleDe VARCHAR(255) NOT NULL,
        titleEn VARCHAR(255) NOT NULL,
        contentDe TEXT,
        contentEn TEXT,
        images JSON,
        humidity INT,
        temperature INT,
        waterAmount INT,
        nutrientsUsed JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    
    console.log('✓ growDiaryEntries table created');
    await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
