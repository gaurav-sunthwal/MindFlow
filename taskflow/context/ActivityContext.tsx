import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';

export interface Activity {
  id: string;
  type: 'task' | 'event' | 'note' | 'document';
  action: 'created' | 'updated' | 'deleted' | 'completed';
  title: string;
  timestamp: string;
}

interface ActivityContextType {
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
  refreshActivities: () => Promise<void>;
  isLoading: boolean;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

export const ActivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // For now, we derive activities from local actions + server sync
  const refreshActivities = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      // In a real app, we'd fetch from /api/activities
      // For now, we'll simulate some activities or just keep local state
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const addActivity = useCallback((activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 20)); // Keep last 20
  }, []);

  return (
    <ActivityContext.Provider value={{ 
      activities, 
      addActivity, 
      refreshActivities, 
      isLoading 
    }}>
      {children}
    </ActivityContext.Provider>
  );
};

export function useActivities() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivities must be used within an ActivityProvider');
  }
  return context;
}
