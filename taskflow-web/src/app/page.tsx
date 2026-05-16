"use client";

import React from 'react';
import { 
  CheckCircle, 
  Calendar, 
  FileText, 
  FolderOpen, 
  Plus,
  ChevronRight,
  FileIcon,
  Circle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import Chip from '@/components/Chip';
import { useTasks } from '@/context/TaskContext';
import { useEvents } from '@/context/EventContext';
import { useNotes } from '@/context/NoteContext';
import { useDocuments } from '@/context/DocumentContext';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { tasks, toggleTask, isLoading: tasksLoading } = useTasks();
  const { events, isLoading: eventsLoading } = useEvents();
  const { notes, isLoading: notesLoading } = useNotes();
  const { documents, isLoading: docsLoading } = useDocuments();
  const router = useRouter();

  if (tasksLoading || eventsLoading || notesLoading || docsLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-on-surface"></div>
        </div>
      </DashboardLayout>
    );
  }

  const recentTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <DashboardLayout>
      <div className="px-12 pb-16 grid grid-cols-12 gap-8">
        {/* Quick Stats Grid */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div onClick={() => router.push('/tasks')} className="p-6 bg-[#E6F4FE] rounded-3xl border border-blue-50/50 cursor-pointer hover:shadow-md transition-all">
            <CheckCircle className="w-6 h-6 text-blue-600 mb-4" />
            <p className="text-[11px] font-bold tracking-widest text-blue-900/40 uppercase">Pending Tasks</p>
            <p className="text-4xl font-semibold text-blue-950 mt-1">{tasks.filter(t => !t.completed).length}</p>
          </div>
          <div onClick={() => router.push('/schedule')} className="p-6 bg-[#C9E8CB] rounded-3xl border border-green-50/50 cursor-pointer hover:shadow-md transition-all">
            <Calendar className="w-6 h-6 text-green-700 mb-4" />
            <p className="text-[11px] font-bold tracking-widest text-green-900/40 uppercase">Upcoming Events</p>
            <p className="text-4xl font-semibold text-green-950 mt-1">{events.length}</p>
          </div>
          <div onClick={() => router.push('/notes')} className="p-6 bg-[#E5EEFF] rounded-3xl border border-indigo-50/50 cursor-pointer hover:shadow-md transition-all">
            <FileText className="w-6 h-6 text-indigo-700 mb-4" />
            <p className="text-[11px] font-bold tracking-widest text-indigo-900/40 uppercase">Saved Notes</p>
            <p className="text-4xl font-semibold text-indigo-950 mt-1">{notes.length}</p>
          </div>
          <div onClick={() => router.push('/vault')} className="p-6 bg-[#E6E2DF] rounded-3xl border border-orange-50/50 cursor-pointer hover:shadow-md transition-all">
            <FolderOpen className="w-6 h-6 text-orange-900/60 mb-4" />
            <p className="text-[11px] font-bold tracking-widest text-orange-900/30 uppercase">Vault Docs</p>
            <p className="text-4xl font-semibold text-orange-950 mt-1">{documents.length}</p>
          </div>
        </div>

        {/* Left Main Column */}
        <div className="col-span-12 lg:col-span-8 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50">Daily Focus</h3>
              <button onClick={() => router.push('/tasks')} className="text-xs font-bold text-primary tracking-widest uppercase hover:underline">View All Tasks</button>
            </div>
            <div className="grid gap-4">
              {recentTasks.map(task => (
                <div key={task.id} className="flex items-start p-5 bg-white border border-gray-50 rounded-2xl hover:shadow-level2 transition-all group">
                  <div className="cursor-pointer" onClick={() => toggleTask(task.id)}>
                    {task.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-secondary mt-0.5" />
                    ) : (
                      <Circle className="w-6 h-6 text-outline mt-0.5 group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 ml-4">
                    <h3 className="text-base font-medium text-on-surface">{task.title}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-on-surface-variant opacity-60" />
                        <span className="text-sm text-on-surface-variant opacity-60">{task.time || 'No time set'}</span>
                      </div>
                      <Chip label={task.category || 'Quick'} color="#0B1C30" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Notes Section */}
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50">Knowledge Vault</h3>
              <button onClick={() => router.push('/notes')} className="text-xs font-bold text-primary tracking-widest uppercase hover:underline">Browse Notes</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.slice(0, 2).map(note => (
                <div key={note.id} onClick={() => router.push('/notes')} className="p-5 bg-white border border-gray-50 rounded-2xl hover:shadow-level2 transition-all cursor-pointer">
                  <h3 className="font-semibold text-on-surface mb-2">{note.title}</h3>
                  <p className="text-sm text-on-surface-variant line-clamp-2 leading-relaxed mb-4 opacity-70">
                    {note.excerpt || note.content || 'Empty note...'}
                  </p>
                  <div className="flex justify-between items-center text-[11px] font-bold tracking-wider text-on-surface-variant opacity-40 uppercase">
                    <span>{note.date}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="col-span-2 p-10 border border-dashed border-gray-100 rounded-2xl text-center text-on-surface-variant opacity-40">
                  No notes saved yet.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Sidebar Column */}
        <div className="col-span-12 lg:col-span-4 space-y-10">
          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50">Upcoming Schedule</h3>
              <button onClick={() => router.push('/schedule')} className="text-xs font-bold text-primary tracking-widest uppercase hover:underline">Calendar</button>
            </div>
            <div className="p-6 bg-white border border-gray-50 rounded-3xl shadow-level1 space-y-4">
              {events.slice(0, 2).map(event => (
                <div key={event.id} className="flex items-center p-4 bg-gray-50/50 rounded-xl hover:shadow-level1 transition-all cursor-pointer">
                  <div className={`w-1 h-10 rounded-full mr-4 ${event.type === 'work' ? 'bg-[#0B1C30]' : 'bg-[#4a654e]'}`} />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-on-surface">{event.title}</h3>
                    <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">{event.time}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-outline-variant" />
                </div>
              ))}
              <button className="w-full py-3 border border-dashed border-gray-200 rounded-xl text-sm font-medium text-on-surface-variant hover:border-gray-300 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Schedule Session
              </button>
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50">Recent Documents</h3>
              <button onClick={() => router.push('/vault')} className="text-xs font-bold text-primary tracking-widest uppercase hover:underline">Vault</button>
            </div>
            <Card className="p-4 space-y-2">
              {documents.slice(0, 3).map(doc => (
                <div key={doc.id} onClick={() => router.push('/vault')} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                    {doc.type === 'PDF' ? <FileText className="w-5 h-5 text-on-surface-variant" /> : <FileIcon className="w-5 h-5 text-on-surface-variant" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-on-surface truncate">{doc.name}</h4>
                    <p className="text-[11px] text-on-surface-variant opacity-50 uppercase tracking-wider">{doc.type} • {doc.date}</p>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="p-8 text-center text-xs font-bold text-on-surface-variant opacity-30 uppercase tracking-widest">
                  No documents in vault
                </div>
              )}
              <button onClick={() => router.push('/vault')} className="w-full mt-4 py-3 bg-gray-50 rounded-xl text-xs font-bold text-on-surface-variant tracking-widest hover:bg-gray-100 transition-all uppercase">
                Open Vault
              </button>
            </Card>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
