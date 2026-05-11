require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
    const conn = await mysql.createConnection({
        uri: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });
    
    // Add unsubscribeToken column if not exists
    try {
        await conn.execute(`ALTER TABLE newsletterSubscribers ADD COLUMN unsubscribeToken VARCHAR(255)`);
        console.log('✓ unsubscribeToken column added');
    } catch(e) {
        if (e.message.includes('Duplicate')) console.log('✓ unsubscribeToken already exists');
        else console.log('Note:', e.message);
    }
    
    // Add unsubscribedReason column if not exists
    try {
        await conn.execute(`ALTER TABLE newsletterSubscribers ADD COLUMN unsubscribedReason VARCHAR(500)`);
        console.log('✓ unsubscribedReason column added');
    } catch(e) {
        if (e.message.includes('Duplicate')) console.log('✓ unsubscribedReason already exists');
        else console.log('Note:', e.message);
    }
    
    // Show current columns
    const [cols] = await conn.execute(`SHOW COLUMNS FROM newsletterSubscribers`);
    console.log('\nColumns:', cols.map(c => c.Field).join(', '));
    
    await conn.end();
}

run().catch(e => { console.error(e.message); process.exit(1); });
