const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function check() {
  try {
    const migrations = await sql`SELECT * FROM drizzle.__drizzle_migrations`;
    console.log('Migrations in drizzle schema:', migrations);
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err.message);
    process.exit(1);
  }
}

check();
