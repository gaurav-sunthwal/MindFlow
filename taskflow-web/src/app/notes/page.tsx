"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  MoreVertical,
  Edit3,
  BookOpen,
  Layout
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

import { useNotes } from '@/context/NoteContext';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useNotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [isEditingContent, setIsEditingContent] = useState(false);

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const [isAdding, setIsAdding] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;
    await addNote(newNoteTitle);
    setNewNoteTitle('');
    setIsAdding(false);
  };

  const handleUpdateNote = async () => {
    if (!selectedNote) return;
    await updateNote(selectedNote.id, { 
      title: selectedNote.title, 
      content: selectedNote.content,
      excerpt: selectedNote.content?.slice(0, 100) 
    });
    setIsEditingContent(false);
  };

  return (
    <DashboardLayout>
      <div className="px-12 pb-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold text-on-surface mb-2">Knowledge Vault</h1>
            <p className="text-on-surface-variant opacity-60">Store your thoughts, research, and breakthroughs.</p>
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
              <input 
                type="text" 
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 h-12 pl-12 pr-6 bg-white border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black/5 transition-all text-sm"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="h-12 px-6 bg-black text-white rounded-2xl flex items-center gap-2 font-medium hover:scale-[1.02] transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Create Note</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-on-surface"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isAdding && (
              <div className="p-8 bg-white border-2 border-primary rounded-[40px] shadow-level2">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                  <Edit3 className="w-6 h-6 text-primary" />
                </div>
                <form onSubmit={handleAddNote}>
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Note title..."
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full text-xl font-bold text-on-surface mb-3 bg-transparent border-none focus:outline-none placeholder:opacity-30"
                  />
                  <div className="flex gap-3 mt-8">
                    <button type="button" onClick={() => setIsAdding(false)} className="text-xs font-bold text-on-surface-variant opacity-50 uppercase tracking-widest hover:opacity-100">Cancel</button>
                    <button type="submit" className="text-xs font-bold text-primary uppercase tracking-widest hover:underline">Save Note</button>
                  </div>
                </form>
              </div>
            )}

            {filteredNotes.map(note => (
              <div 
                key={note.id} 
                onClick={() => {
                  setSelectedNote(note);
                  setIsEditingContent(true);
                }}
                className="group p-8 bg-white border border-gray-50 rounded-[40px] hover:shadow-level2 transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-outline-variant hover:text-red-500" />
                  </button>
                </div>
                
                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-on-surface transition-colors">
                  <BookOpen className="w-6 h-6 text-on-surface group-hover:text-white" />
                </div>

                <h3 className="text-xl font-bold text-on-surface mb-3">{note.title}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-3 leading-relaxed mb-8 opacity-70">
                  {note.content || 'No content yet...'}
                </p>

                <div className="flex justify-between items-center pt-6 border-t border-gray-50">
                  <span className="text-xs font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{note.date}</span>
                  <div className="flex items-center gap-2 text-primary font-bold text-xs tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Edit</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}

            {/* New Note Placeholder */}
            {!isAdding && (
              <div onClick={() => setIsAdding(true)} className="p-8 border-2 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center text-center group cursor-pointer hover:border-gray-300 transition-all">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Edit3 className="w-8 h-8 text-outline-variant" />
                </div>
                <h3 className="text-lg font-bold text-on-surface mb-1">Write something new</h3>
                <p className="text-sm text-on-surface-variant opacity-50">Capture your spark of genius.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Note Editor Modal */}
      {isEditingContent && selectedNote && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] rounded-[40px] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <input 
                type="text" 
                value={selectedNote.title}
                onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                className="text-2xl font-bold bg-transparent border-none focus:outline-none flex-1"
              />
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsEditingContent(false)}
                  className="px-6 h-12 text-sm font-bold text-on-surface-variant uppercase tracking-widest hover:opacity-100 opacity-60"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdateNote}
                  className="px-8 h-12 bg-black text-white rounded-2xl text-sm font-bold uppercase tracking-widest hover:scale-[1.02] transition-all"
                >
                  Save Changes
                </button>
              </div>
            </div>
            <textarea 
              autoFocus
              value={selectedNote.content || ''}
              onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
              placeholder="Start writing your thoughts..."
              className="flex-1 p-12 text-lg leading-relaxed text-on-surface bg-transparent border-none focus:outline-none resize-none placeholder:opacity-20"
            />
            <div className="p-6 border-t border-gray-50 bg-gray-50/10 flex justify-between items-center text-[10px] font-bold text-on-surface-variant opacity-30 uppercase tracking-[0.2em]">
              <span>Last edited: {selectedNote.date}</span>
              <span>{selectedNote.content?.length || 0} characters</span>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
