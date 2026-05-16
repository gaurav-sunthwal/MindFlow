const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

async function create() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" uuid PRIMARY KEY,
        "full_name" text,
        "email" text NOT NULL,
        "avatar_url" text,
        "updated_at" timestamp DEFAULT now() NOT NULL
      )
    `;
    console.log('Profiles table created successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Creation failed:', err.message);
    process.exit(1);
  }
}

create();
