"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Circle, 
  CheckCircle,
  CheckCircle2, 
  Clock, 
  Trash2,
  Filter,
  MoreVertical
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Chip from '@/components/Chip';
import { useTasks } from '@/context/TaskContext';

export default function TasksPage() {
  const { tasks, toggleTask, deleteTask, addTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = tasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="px-12 pb-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-on-surface mb-2">Daily Focus</h1>
            <p className="text-on-surface-variant opacity-60">You have {tasks.filter(t => !t.completed).length} pending tasks today.</p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
              <input 
                type="text" 
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-12 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
              />
            </div>
            <button className="h-12 px-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 font-medium hover:bg-gray-50 transition-all">
              <Filter className="w-4 h-4 text-on-surface-variant" />
              <span>Filter</span>
            </button>
          </div>
        </div>

        {/* Quick Task Input */}
        <div className="mb-10 max-w-4xl">
          <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-2 group focus-within:ring-2 focus-within:ring-black/5 transition-all">
            <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant opacity-40">
              <Plus className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="Add a new task..."
              className="flex-1 h-12 bg-transparent focus:outline-none text-sm font-medium"
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const title = e.currentTarget.value;
                  e.currentTarget.value = '';
                  await addTask(title);
                }
              }}
            />
            <div className="px-4 py-2 bg-gray-50 rounded-2xl text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              Press Enter
            </div>
          </div>
        </div>

        <div className="grid gap-4 max-w-4xl">
          {filteredTasks.length > 0 ? filteredTasks.map(task => (
            <div key={task.id} className="flex items-start p-6 bg-white border border-gray-50 rounded-3xl hover:shadow-level2 transition-all group">
              <div className="cursor-pointer" onClick={() => toggleTask(task.id)}>
                {task.completed ? (
                  <CheckCircle2 className="w-7 h-7 text-secondary mt-0.5" />
                ) : (
                  <Circle className="w-7 h-7 text-outline mt-0.5 group-hover:text-primary transition-colors" />
                )}
              </div>
              <div className="flex-1 ml-6">
                <div className="flex justify-between items-start">
                  <h3 className={`text-lg font-semibold ${task.completed ? 'text-on-surface-variant line-through opacity-50' : 'text-on-surface'}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteTask(task.id)} className="p-2 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-xl text-outline-variant">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-on-surface-variant opacity-60" />
                    <span className="text-sm text-on-surface-variant opacity-60">{task.time}</span>
                  </div>
                  <Chip label={task.category ?? "General"} color={task.completed ? "#c4c7c7" : "#0B1C30"} />
                </div>
              </div>
            </div>
          )) : (
            <div className="p-20 text-center bg-white rounded-[40px] border border-dashed border-gray-200">
              <CheckCircle className="w-12 h-12 text-outline-variant mx-auto mb-4 opacity-20" />
              <p className="text-on-surface-variant opacity-60">No tasks found. Time to focus on something else!</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
