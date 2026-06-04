import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useActivities } from './ActivityContext';
import { api } from '../utils/api';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
  dueDate?: string;
  createdAt?: string;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (title: string, category?: string) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
  completedCount: number;
  pendingCount: number;
  isLoading: boolean;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addActivity } = useActivities();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshTasks = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await api.tasks.getAll();
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshTasks();
    } else {
      setTasks([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshTasks]);


  const addTask = async (title: string, category: string = 'General') => {
    try {
      const newTask = await api.tasks.create({ title, category });
      setTasks(prev => [newTask, ...prev]);
      addActivity({
        type: 'task',
        action: 'created',
        title: title
      });
    } catch (error: any) {
      console.error('Failed to add task:', error);
      alert(error.message || 'Failed to add task');
    }
  };

  const toggleTask = async (id: string) => {
    // Optimistic Update
    const taskToToggle = tasks.find(t => t.id === id);
    if (!taskToToggle) return;

    const previousTasks = [...tasks];
    const newStatus = !taskToToggle.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newStatus } : t));

    addActivity({
      type: 'task',
      action: newStatus ? 'completed' : 'updated',
      title: taskToToggle.title
    });

    try {
      await api.tasks.update(id, { completed: newStatus });
    } catch (error: any) {
      console.error('Failed to toggle task:', error);
      // Rollback on failure
      setTasks(previousTasks);
      alert(error.message || 'Failed to sync task update');
    }
  };

  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find(t => t.id === id);
    try {
      await api.tasks.delete(id);
      setTasks(prev => prev.filter(task => task.id !== id));
      if (taskToDelete) {
        addActivity({
          type: 'task',
          action: 'deleted',
          title: taskToDelete.title
        });
      }
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      alert(error.message || 'Failed to delete task');
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  return (
    <TaskContext.Provider value={{ 
      tasks, 
      addTask, 
      toggleTask, 
      deleteTask,
      refreshTasks,
      completedCount,
      pendingCount,
      isLoading
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};


