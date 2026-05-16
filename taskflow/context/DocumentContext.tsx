import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../utils/api';
import { updateAllWidgets } from '../utils/widget-utils';

export interface Document {
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
  refreshDocuments: () => Promise<void>;
  isLoading: boolean;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshDocuments = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const data = await api.documents.getAll();
      setDocuments(data);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshDocuments();
    } else {
      setDocuments([]);
      setIsLoading(false);
    }
  }, [isAuthenticated, refreshDocuments]);

  useEffect(() => {
    if (isAuthenticated && documents.length >= 0) {
      updateAllWidgets({ documents });
    }
  }, [documents, isAuthenticated]);


  const addDocument = async (name: string, type: string, size = '0 KB', url = '') => {
    try {
      const newDoc = await api.documents.create({ name, type, size, url });
      setDocuments(prev => [newDoc, ...prev]);
    } catch (error: any) {
      console.error('Failed to add document:', error);
      alert(error.message || 'Failed to save document info');
    }
  };

  const updateDocument = async (id: string, updates: Partial<Document>) => {
    try {
      const updatedDoc = await api.documents.update(id, updates);
      setDocuments(prev => prev.map(doc => doc.id === id ? updatedDoc : doc));
    } catch (error: any) {
      console.error('Failed to update document:', error);
      alert(error.message || 'Failed to update document');
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await api.documents.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
    } catch (error: any) {
      console.error('Failed to delete document:', error);
      alert(error.message || 'Failed to delete document');
    }
  };

  return (
    <DocumentContext.Provider value={{ 
      documents, 
      addDocument, 
      updateDocument, 
      deleteDocument,
      refreshDocuments,
      isLoading 
    }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

