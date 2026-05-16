// Run this to prepare the bot for the first time
// node setup.js

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.txt');

async function setup() {
  console.log('🚀 Starting setup...');

  // Initialize data.txt if it doesn't exist
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, `[${new Date().toISOString()}] Bot initialized. Categorized data will be stored here.\n`);
    console.log('✅ Created data.txt');
  } else {
    console.log('ℹ️ data.txt already exists.');
  }

  // Check for .env file
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, 'GEMINI_API_KEY=your_gemini_api_key_here\n');
    console.log('✅ Created .env template. Please add your API key.');
  }

  console.log('🎉 Setup complete! You can now run "npm start".');
}

setup().catch((err) => {
  console.error('❌ Setup failed:', err.message);
  process.exit(1);
});
