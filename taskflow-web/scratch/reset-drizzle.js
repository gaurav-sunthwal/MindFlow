const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function reset() {
  try {
    await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
    console.log('Drizzle metadata schema dropped.');
    process.exit(0);
  } catch (err) {
    console.error('Reset failed:', err.message);
    process.exit(1);
  }
}

reset();
