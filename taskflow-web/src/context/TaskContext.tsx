"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSync } from './SyncContext';

interface Task {
  id: string;
  title: string;
  time: string | null;
  category: string | null;
  completed: boolean;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { addToQueue } = useSync();

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (title: string) => {
    const tempId = Math.random().toString(36).substr(2, 9);
    const newTask: Task = {
      id: tempId,
      title,
      time: null,
      category: 'Quick',
      completed: false
    };

    // Optimistic Update
    setTasks(prev => [newTask, ...prev]);
    toast.success('Task added (locally)');

    addToQueue({
      type: 'task',
      action: 'create',
      tempId,
      data: { title, category: 'Quick' }
    });
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newStatus = !task.completed;

    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newStatus } : t));
    toast.success(`Task ${newStatus ? 'completed' : 'uncompleted'} (locally)`);

    addToQueue({
      type: 'task',
      action: 'update',
      id,
      data: { completed: newStatus }
    });
  };

  const deleteTask = async (id: string) => {
    // Optimistic Update
    setTasks(prev => prev.filter(t => t.id !== id));
    toast.success('Task deleted (locally)');

    addToQueue({
      type: 'task',
      action: 'delete',
      id
    });
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, toggleTask, deleteTask, isLoading }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
