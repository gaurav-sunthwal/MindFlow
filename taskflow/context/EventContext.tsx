import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useActivities } from './ActivityContext';
import { api } from '../utils/api';
import { updateAllWidgets } from '../utils/widget-utils';

export interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  location?: string;
  type: 'work' | 'personal' | 'health';
}

interface EventContextType {
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  refreshEvents: () => Promise<void>;
  isLoading: boolean;
}

const EventContext = createContext<EventContextType | undefined>(undefined);


export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addActivity } = useActivities();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshEvents = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await api.events.getAll();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshEvents();
    } else {
      setEvents([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshEvents]);

  useEffect(() => {
    if (isAuthenticated && events.length >= 0) {
      updateAllWidgets({ events });
    }
  }, [events, isAuthenticated]);


  const addEvent = async (event: Omit<Event, 'id'>) => {
    try {
      const newEvent = await api.events.create(event);
      setEvents(prev => [newEvent, ...prev]);
      addActivity({ type: 'event', action: 'scheduled', title: event.title });
    } catch (error: any) {
      console.error('Failed to add event:', error);
      alert(error.message || 'Failed to add event');
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await api.events.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (error: any) {
      console.error('Failed to delete event:', error);
      alert(error.message || 'Failed to delete event');
    }
  };

  return (
    <EventContext.Provider value={{ 
      events, 
      addEvent, 
      deleteEvent,
      refreshEvents,
      isLoading 
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (context === undefined) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};


