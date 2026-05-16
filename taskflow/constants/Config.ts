export const CONFIG = {
  // Use EXPO_PUBLIC_ prefix to expose variables to the client
  API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000', 
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
};

// Validation for security: Ensure critical keys are present
if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  console.error('CRITICAL: Supabase configuration is missing. Check your .env file.');
}

