import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useActivities } from './ActivityContext';
import { api } from '../utils/api';
import { updateAllWidgets } from '../utils/widget-utils';

export interface Note {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  date?: string;
  createdAt?: string;
}

interface NoteContextType {
  notes: Note[];
  addNote: (title: string, content: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  refreshNotes: () => Promise<void>;
  isLoading: boolean;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addActivity } = useActivities();
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshNotes = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await api.notes.getAll();
      setNotes(data);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshNotes();
    } else {
      setNotes([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshNotes]);

  useEffect(() => {
    if (isAuthenticated && notes.length >= 0) {
      updateAllWidgets({ notes });
    }
  }, [notes, isAuthenticated]);


  const addNote = async (title: string, content: string) => {
    try {
      const newNote = await api.notes.create({ title, content });
      setNotes(prev => [newNote, ...prev]);
      addActivity({ type: 'note', action: 'created', title });
    } catch (error: any) {
      console.error('Failed to add note:', error);
      alert(error.message || 'Failed to add note');
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    try {
      const updatedNote = await api.notes.update(id, updates);
      setNotes(prev => prev.map(n => n.id === id ? updatedNote : n));
      addActivity({ type: 'note', action: 'updated', title: updates.title || 'Note' });
    } catch (error: any) {
      console.error('Failed to update note:', error);
      alert(error.message || 'Failed to update note');
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await api.notes.delete(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      alert(error.message || 'Failed to delete note');
    }
  };

  return (
    <NoteContext.Provider value={{ 
      notes, 
      addNote, 
      updateNote, 
      deleteNote,
      refreshNotes,
      isLoading 
    }}>
      {children}
    </NoteContext.Provider>
  );
};

export const useNotes = () => {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
};

