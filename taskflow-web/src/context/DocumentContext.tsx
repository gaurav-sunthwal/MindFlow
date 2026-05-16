"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  type: string;
  size: string | null;
  date: string | null;
  url: string | null;
}

interface DocumentContextType {
  documents: Document[];
  addDocument: (name: string, type: string, size?: string, url?: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('/api/documents');
      const data = await response.json();
      if (Array.isArray(data)) {
        setDocuments(data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const addDocument = async (name: string, type: string, size = '0 KB', url = '') => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, size, url }),
      });
      if (response.ok) {
        await fetchDocuments();
        toast.success('Document uploaded');
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Failed to add document:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (response.ok) {
        await fetchDocuments();
        toast.success('Document updated');
      } else {
        toast.error('Failed to update document');
      }
    } catch (error) {
      console.error('Failed to update document:', error);
      toast.error('Failed to update document');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchDocuments();
        toast.success('Document deleted');
      } else {
        toast.error('Failed to delete document');
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
      toast.error('Failed to delete document');
    }
  };

  return (
    <DocumentContext.Provider value={{ documents, addDocument, updateDocument, deleteDocument, isLoading }}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocuments() {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
}
