"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSync } from './SyncContext';

interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'work' | 'personal';
}

interface EventContextType {
  events: Event[];
  addEvent: (title: string, date?: string, time?: string) => Promise<void>;
  updateEvent: (id: string, updates: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { addToQueue } = useSync();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const addEvent = async (title: string, date = 'Today', time = '12:00 PM') => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newEvent: Event = {
      id: tempId,
      title,
      date,
      time,
      type: 'work'
    };

    // Optimistic Update
    setEvents(prev => [...prev, newEvent]);
    toast.success('Event scheduled (locally)');

    addToQueue({
      type: 'event',
      action: 'create',
      tempId,
      data: { title, date, time }
    });
  };

  const updateEvent = async (id: string, updates: Partial<Event>) => {
    // Optimistic Update
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    toast.success('Event updated (locally)');

    addToQueue({
      type: 'event',
      action: 'update',
      id,
      data: updates
    });
  };

  const deleteEvent = async (id: string) => {
    // Optimistic Update
    setEvents(prev => prev.filter(e => e.id !== id));
    toast.success('Event removed (locally)');

    addToQueue({
      type: 'event',
      action: 'delete',
      id
    });
  };

  return (
    <EventContext.Provider value={{ events, addEvent, updateEvent, deleteEvent, isLoading }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvents() {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
}
