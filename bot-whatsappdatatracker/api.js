const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:3000';

const supabase = createClient(supabaseUrl, supabaseKey);

let authToken = null;

async function getAuthToken() {
  if (authToken) return authToken;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: process.env.BOT_USER_EMAIL,
    password: process.env.BOT_USER_PASSWORD,
  });

  if (error) {
    console.error('❌ Bot Auth Error:', error.message);
    return null;
  }

  authToken = data.session.access_token;
  return authToken;
}

async function fetchWithAuth(endpoint, options = {}) {
  const token = await getAuthToken();
  if (!token) throw new Error('Authentication failed');

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API Request failed: ${response.status}`);
  }

  return response.json();
}

const botApi = {
  createTask: (title, category) => 
    fetchWithAuth('/api/tasks', { method: 'POST', body: JSON.stringify({ title, category }) }),
  
  createEvent: (title, date, time, type = 'work') => 
    fetchWithAuth('/api/events', { method: 'POST', body: JSON.stringify({ title, date, time, type }) }),
  
  createNote: (title, content) => 
    fetchWithAuth('/api/notes', { method: 'POST', body: JSON.stringify({ title, content }) }),
  
  createDocument: (name, type, size, url) => 
    fetchWithAuth('/api/documents', { method: 'POST', body: JSON.stringify({ name, type, size, url }) }),
  
  uploadFile: async (buffer, fileName, mimeType) => {
    const { data, error } = await supabase.storage
      .from('vault')
      .upload(`${Date.now()}_${fileName}`, buffer, {
        contentType: mimeType,
        upsert: false
      });
    
    if (error) throw error;
    return data.path;
  }
};

module.exports = { botApi };
