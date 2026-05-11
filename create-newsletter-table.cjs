require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    await conn.execute(`CREATE TABLE IF NOT EXISTS newsletterCampaigns (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        subject VARCHAR(255) NOT NULL,
        subjectEn VARCHAR(255),
        contentHtml TEXT NOT NULL,
        contentHtmlEn TEXT,
        previewText VARCHAR(255),
        previewTextEn VARCHAR(255),
        status ENUM('draft', 'scheduled', 'sending', 'sent') DEFAULT 'draft' NOT NULL,
        recipientCount INT DEFAULT 0,
        sentCount INT DEFAULT 0,
        openCount INT DEFAULT 0,
        scheduledAt TIMESTAMP,
        sentAt TIMESTAMP,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`);
    
    console.log('newsletterCampaigns table created');
    await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
