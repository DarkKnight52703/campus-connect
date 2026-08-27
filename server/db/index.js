const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Strip channel_binding param — not supported by node-postgres
const cleanDbUrl = (process.env.DATABASE_URL || '')
  .replace(/[&?]channel_binding=[^&]*/g, '')
  .replace(/\?&/, '?');

const pool = new Pool({
  connectionString: cleanDbUrl,
  ssl: { rejectUnauthorized: false }
});

const initDB = async () => {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    await pool.query(schema);
    console.log('Database schema executed.');

    const adminCheck = await pool.query('SELECT * FROM admins WHERE username = $1', ['admin']);
    if (adminCheck.rows.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('admin123', salt);
      await pool.query('INSERT INTO admins (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
      console.log('Default admin created.');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

module.exports = {
  pool,
  initDB
};
