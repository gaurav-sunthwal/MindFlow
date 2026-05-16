import { supabase } from './supabase';
import { CONFIG } from '../constants/Config';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('No active session found. Please log in.');

  const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Tasks
  tasks: {
    getAll: () => fetchWithAuth('/api/tasks'),
    create: (data: { title: string; category?: string }) => 
      fetchWithAuth('/api/tasks', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { completed?: boolean; title?: string; category?: string }) => 
      fetchWithAuth(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetchWithAuth(`/api/tasks/${id}`, { method: 'DELETE' }),
  },

  // Events
  events: {
    getAll: () => fetchWithAuth('/api/events'),
    create: (data: { title: string; date: string; time: string; type?: string; location?: string }) => 
      fetchWithAuth('/api/events', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      fetchWithAuth(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetchWithAuth(`/api/events/${id}`, { method: 'DELETE' }),
  },

  // Notes
  notes: {
    getAll: () => fetchWithAuth('/api/notes'),
    create: (data: { title: string; content: string; excerpt?: string; date?: string }) => 
      fetchWithAuth('/api/notes', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      fetchWithAuth(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetchWithAuth(`/api/notes/${id}`, { method: 'DELETE' }),
  },

  // Documents
  documents: {
    getAll: () => fetchWithAuth('/api/documents'),
    create: (data: { name: string; type: string; size: string; url: string; date?: string }) => 
      fetchWithAuth('/api/documents', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => 
      fetchWithAuth(`/api/documents/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => 
      fetchWithAuth(`/api/documents/${id}`, { method: 'DELETE' }),
    getSignedUrl: async (path: string) => {
      const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data.signedUrl;
    }
  },

  // Batch Activities (Sync)
  activities: {
    sync: (activities: any[]) => 
      fetchWithAuth('/api/activities', { method: 'POST', body: JSON.stringify({ activities }) }),
  },

  // Auth & Profile
  auth: {
    syncProfile: () => fetchWithAuth('/api/auth/sync', { method: 'POST' }),
  },

  // System Health
  system: {
    checkHealth: async () => {
      const response = await fetch(`${CONFIG.API_BASE_URL}/api/health`);
      return response.json();
    }
  }
};

