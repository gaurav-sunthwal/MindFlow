"use client";

import React from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MoreVertical,
  Calendar as CalendarIcon
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useEvents } from '@/context/EventContext';

export default function SchedulePage() {
  const { events, addEvent, deleteEvent } = useEvents();

  return (
    <DashboardLayout>
      <div className="px-12 pb-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-on-surface mb-2">Schedule</h1>
            <p className="text-on-surface-variant opacity-60">Your cognitive roadmap for the week.</p>
          </div>

          <div className="flex gap-4">
            <div className="flex bg-white border border-gray-100 rounded-2xl p-1">
              <button className="px-6 py-2 bg-on-surface text-white rounded-xl text-sm font-medium shadow-lg">Day</button>
              <button className="px-6 py-2 text-on-surface-variant hover:bg-gray-50 rounded-xl text-sm font-medium transition-all">Week</button>
              <button className="px-6 py-2 text-on-surface-variant hover:bg-gray-50 rounded-xl text-sm font-medium transition-all">Month</button>
            </div>
            <button className="h-12 px-6 bg-black text-white rounded-2xl flex items-center gap-2 font-medium hover:scale-[1.02] transition-all shadow-lg">
              <Plus className="w-5 h-5" />
              <span>New Event</span>
            </button>
          </div>
        </div>

        {/* Quick Event Input */}
        <div className="mb-10">
          <div className="bg-white p-2 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 group focus-within:ring-2 focus-within:ring-black/5 transition-all">
            <div className="w-10 h-10 flex items-center justify-center text-on-surface-variant opacity-40">
              <Plus className="w-5 h-5" />
            </div>
            <input 
              type="text" 
              placeholder="What's happening? (Press Enter to schedule)"
              className="flex-1 h-12 bg-transparent focus:outline-none text-sm font-medium"
              onKeyDown={async (e) => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  const title = e.currentTarget.value;
                  e.currentTarget.value = '';
                  await addEvent(title);
                }
              }}
            />
            <div className="h-10 px-4 bg-gray-50 rounded-2xl flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
              <Clock className="w-3.5 h-3.5" />
              Today • 12:00 PM
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Calendar View Placeholder */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-gray-50 rounded-[40px] p-8 shadow-level1">
            <div className="flex justify-between items-center mb-10 px-4">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-on-surface">May 2026</h2>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-50 rounded-full border border-gray-100"><ChevronLeft className="w-5 h-5" /></button>
                  <button className="p-2 hover:bg-gray-50 rounded-full border border-gray-100"><ChevronRight className="w-5 h-5" /></button>
                </div>
              </div>
              <button className="text-sm font-bold text-primary tracking-widest uppercase hover:underline">Today</button>
            </div>

            <div className="space-y-6 relative pl-16">
              {/* Timeline markers */}
              {[9, 10, 11, 12, 1, 2, 3, 4].map((hour, i) => (
                <div key={i} className="relative h-24 border-t border-gray-50">
                  <span className="absolute -left-16 -top-3 text-xs font-bold text-on-surface-variant opacity-30 uppercase tracking-widest w-12 text-right">
                    {hour}:00 {i < 3 ? 'AM' : 'PM'}
                  </span>
                </div>
              ))}

              {/* Event Blocks */}
              {events.map((event, i) => (
                <div 
                  key={event.id}
                  style={{ top: i * 150 + 40 }}
                  className={`absolute left-16 right-8 p-6 rounded-3xl shadow-level1 border-l-4 transition-all hover:scale-[1.01] cursor-pointer ${
                    event.type === 'work' ? 'bg-on-surface text-white border-black' : 'bg-secondary text-white border-secondary-container'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-bold mb-1">{event.title}</h3>
                      <div className="flex items-center gap-2 opacity-60">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-medium">{event.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="p-2 hover:bg-white/20 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 opacity-40" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Panel */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="p-8 bg-[#0B1C30] rounded-[40px] text-white">
              <CalendarIcon className="w-10 h-10 mb-6 opacity-40" />
              <h3 className="text-xl font-bold mb-2">Weekly Goal</h3>
              <p className="text-blue-100/60 leading-relaxed mb-6">You've planned 12h of Deep Work this week. That's 2h more than last week!</p>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 w-3/4 rounded-full" />
              </div>
              <p className="text-[11px] font-bold tracking-[0.2em] uppercase mt-3 opacity-40">75% Achieved</p>
            </div>

            <div className="p-8 bg-white border border-gray-50 rounded-[40px] shadow-level1">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50 mb-6">Upcoming Sessions</h3>
              <div className="space-y-4">
                {events.map(event => (
                  <div key={event.id} className="flex items-center p-4 bg-gray-50/50 rounded-2xl hover:shadow-level1 transition-all cursor-pointer group">
                    <div className={`w-1 h-10 rounded-full mr-4 ${event.type === 'work' ? 'bg-[#0B1C30]' : 'bg-[#4a654e]'}`} />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-on-surface">{event.title}</h4>
                      <p className="text-xs text-on-surface-variant opacity-60 mt-0.5">{event.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
