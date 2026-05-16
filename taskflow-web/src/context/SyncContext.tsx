"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type Activity = {
  type: 'task' | 'event' | 'note';
  action: 'create' | 'update' | 'delete';
  id?: string;
  data?: any;
  tempId?: string;
};

interface SyncContextType {
  addToQueue: (activity: Activity) => void;
  isSyncing: boolean;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Activity[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const queueRef = useRef<Activity[]>([]);
  const initialized = useRef(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialized.current) {
      const savedQueue = localStorage.getItem('sync_queue');
      if (savedQueue) {
        try {
          const parsedQueue = JSON.parse(savedQueue);
          if (Array.isArray(parsedQueue) && parsedQueue.length > 0) {
            console.log('Restored queue from localStorage:', parsedQueue.length, 'items');
            setQueue(parsedQueue);
          }
        } catch (e) {
          console.error('Failed to parse saved queue:', e);
        }
      }
      initialized.current = true;
    }
  }, []);

  // Save to localStorage whenever queue changes
  useEffect(() => {
    queueRef.current = queue;
    if (typeof window !== 'undefined' && initialized.current) {
      if (queue.length > 0) {
        localStorage.setItem('sync_queue', JSON.stringify(queue));
      } else {
        localStorage.removeItem('sync_queue');
      }
    }
  }, [queue]);

  const addToQueue = (activity: Activity) => {
    setQueue(prev => [...prev, activity]);
    console.log('Activity added to queue:', activity);
  };

  const sync = async () => {
    if (queueRef.current.length === 0 || isSyncing) return;

    console.log(`Syncing ${queueRef.current.length} activities...`);
    setIsSyncing(true);
    setIsLoadingServer(true);
    
    const activitiesToSync = [...queueRef.current];
    
    // Clear items from queue that we are about to sync
    setQueue(prev => prev.slice(activitiesToSync.length));

    try {
      const response = await fetch('/api/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities: activitiesToSync }),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }
      
      console.log('Sync successful');
    } catch (error) {
      console.error('Sync error:', error);
      // Put them back at the beginning of the queue to retry
      setQueue(prev => [...activitiesToSync, ...prev]);
    } finally {
      setIsSyncing(false);
      setIsLoadingServer(false);
    }
  };

  // State to track if we need to show a loading/syncing indicator
  const [isLoadingServer, setIsLoadingServer] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      sync();
    }, 5000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  // Immediate sync on load if queue is not empty
  useEffect(() => {
    if (queue.length > 0 && initialized.current && !isSyncing) {
      sync();
    }
  }, [queue.length, initialized.current]);

  return (
    <SyncContext.Provider value={{ addToQueue, isSyncing }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error('useSync must be used within a SyncProvider');
  }
  return context;
}
