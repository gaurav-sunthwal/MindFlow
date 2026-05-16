"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSync } from './SyncContext';

interface Note {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  date: string | null;
}

interface NoteContextType {
  notes: Note[];
  addNote: (title: string, content?: string) => Promise<void>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToQueue } = useSync();

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/notes');
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotes(data);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (title: string, content = '') => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const newNote: Note = {
      id: tempId,
      title,
      content,
      excerpt: content.slice(0, 100),
      date
    };

    // Optimistic Update
    setNotes(prev => [newNote, ...prev]);
    toast.success('Note saved (locally)');

    addToQueue({
      type: 'note',
      action: 'create',
      tempId,
      data: { title, content, excerpt: newNote.excerpt, date }
    });
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    // Optimistic Update
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    toast.success('Note updated (locally)');

    addToQueue({
      type: 'note',
      action: 'update',
      id,
      data: updates
    });
  };

  const deleteNote = async (id: string) => {
    // Optimistic Update
    setNotes(prev => prev.filter(n => n.id !== id));
    toast.success('Note deleted (locally)');

    addToQueue({
      type: 'note',
      action: 'delete',
      id
    });
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote, isLoading }}>
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}
