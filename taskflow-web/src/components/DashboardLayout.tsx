"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  CheckCircle, 
  Calendar, 
  MessageSquare, 
  FolderOpen, 
  Settings, 
  User, 
  Zap, 
  Search, 
  Bell, 
  Plus,
  X,
  CheckCircle as TaskIcon,
  Calendar as EventIcon
} from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Button from './Button';
import { useTasks } from '@/context/TaskContext';
import { useEvents } from '@/context/EventContext';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'event'>('task');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [eventTime, setEventTime] = useState('10:00');
  const { addTask } = useTasks();
  const { addEvent } = useEvents();

  const [dateStr, setDateStr] = useState('');
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    if (!authLoading && !user && pathname !== '/login' && pathname !== '/register') {
      router.push('/login');
    }
  }, [user, authLoading, pathname, router]);

  useEffect(() => {
    const now = new Date();
    setDateStr(now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
    
    const hour = now.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FF] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-on-surface"></div>
      </div>
    );
  }

  if (!user && pathname !== '/login' && pathname !== '/register') return null;

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const NavItem = ({ icon: Icon, label, path }: any) => {
    const active = pathname === path;
    return (
      <div 
        onClick={() => router.push(path)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
          active ? 'bg-on-surface text-white shadow-lg' : 'text-on-surface-variant hover:bg-gray-50'
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{label}</span>
      </div>
    );
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    
    if (quickAddType === 'task') {
      addTask(newItemTitle);
    } else {
      // Format time for display
      const [hours, minutes] = eventTime.split(':');
      const h = parseInt(hours);
      const ampm = h >= 12 ? 'PM' : 'AM';
      const formattedTime = `${h % 12 || 12}:${minutes} ${ampm}`;
      
      const formattedDate = new Date(eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      addEvent(newItemTitle, formattedDate, `${formattedTime}`);
    }
    
    setNewItemTitle('');
    setIsQuickAddOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FF] font-geist">
      {/* Sidebar Navigation */}
      <aside className="w-72 border-r border-gray-100 bg-white p-8 flex flex-col hidden lg:flex fixed h-full">
        <div className="flex items-center gap-3 mb-12 px-2 cursor-pointer" onClick={() => router.push('/')}>
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-on-surface">MindFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem icon={LayoutGrid} label="Dashboard" path="/" />
          <NavItem icon={CheckCircle} label="Tasks" path="/tasks" />
          <NavItem icon={Calendar} label="Schedule" path="/schedule" />
          <NavItem icon={MessageSquare} label="Notes" path="/notes" />
          <NavItem icon={FolderOpen} label="Vault" path="/vault" />
        </nav>

        <div className="pt-8 border-t border-gray-50 space-y-2">
          <NavItem icon={Settings} label="Settings" path="/settings" />
          <NavItem icon={User} label="Profile" path="/profile" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="px-12 py-8 flex justify-between items-center sticky top-0 bg-[#F8F9FF]/80 backdrop-blur-md z-10">
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-1 opacity-50">
              {dateStr}
            </p>
            <h2 className="text-3xl font-semibold text-on-surface">
              {greeting}, <span className="text-on-surface-variant opacity-60">{displayName}</span>
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
              <input 
                type="text" 
                placeholder="Search everything..."
                className="w-80 h-12 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button className="w-12 h-12 bg-white border border-gray-100 rounded-2xl flex items-center justify-center hover:shadow-level1 transition-all">
                <Bell className="w-5 h-5 text-on-surface-variant" />
              </button>
              <button 
                onClick={() => setIsQuickAddOpen(true)}
                className="h-12 px-6 bg-black text-white rounded-2xl flex items-center gap-2 font-medium hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                <span>Quick Add</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>
      </div>

      {/* Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl p-8 relative">
            <button 
              onClick={() => setIsQuickAddOpen(false)}
              className="absolute right-6 top-6 w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h2 className="text-2xl font-bold text-on-surface mb-6">Quick Add</h2>
            
            <div className="flex bg-gray-50 p-1 rounded-2xl mb-8">
              <button 
                onClick={() => setQuickAddType('task')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  quickAddType === 'task' ? 'bg-white text-on-surface shadow-md' : 'text-on-surface-variant opacity-50'
                }`}
              >
                <TaskIcon className="w-4 h-4" />
                Task
              </button>
              <button 
                onClick={() => setQuickAddType('event')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  quickAddType === 'event' ? 'bg-white text-on-surface shadow-md' : 'text-on-surface-variant opacity-50'
                }`}
              >
                <EventIcon className="w-4 h-4" />
                Event
              </button>
            </div>

            <form onSubmit={handleQuickAdd} className="space-y-6">
              <input 
                autoFocus
                type="text" 
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder={quickAddType === 'task' ? "What needs to be done?" : "Event title..."}
                className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
              />

              {quickAddType === 'event' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block opacity-60">
                      Date
                    </label>
                    <input 
                      type="date" 
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest mb-2 block opacity-60">
                      Time
                    </label>
                    <input 
                      type="time" 
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full h-14 px-6 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <Button title="Cancel" variant="secondary" className="flex-1" onClick={() => setIsQuickAddOpen(false)} />
                <Button title={`Create ${quickAddType === 'task' ? 'Task' : 'Event'}`} variant="primary" className="flex-1" onClick={handleQuickAdd} />
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
