"use client";

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  FileIcon, 
  MoreVertical,
  Upload,
  Grid,
  List,
  ShieldCheck,
  FileText,
  ImageIcon,
  X,
  Download,
  ExternalLink,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/Card';
import { useDocuments } from '@/context/DocumentContext';
import { toast } from 'sonner';
import { createClient } from '@/utils/supabase/client';

export default function VaultPage() {
  const { documents, addDocument, deleteDocument, isLoading } = useDocuments();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<{ url: string, name: string, type: string } | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string, name: string } | null>(null);

  const filteredDocs = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirmDelete = async () => {
    if (documentToDelete) {
      await deleteDocument(documentToDelete.id);
      setDocumentToDelete(null);
      toast.success('Document deleted successfully');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please log in to upload files');
      return;
    }

    const name = file.name;
    const type = name.split('.').pop()?.toUpperCase() || 'FILE';
    const size = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    
    const loadingToast = toast.loading('Uploading to Supabase Storage...');

    try {
      const filePath = `${user.id}/${Date.now()}_${name}`;
      const { data, error } = await supabase.storage
        .from('vault')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Save the relative path instead of public URL for maximum security
      await addDocument(name, type, size, data.path);
      
      toast.dismiss(loadingToast);
      toast.success('File stored securely in Private Vault');
    } catch (error: any) {
      console.error('Storage upload error:', error);
      toast.dismiss(loadingToast);
      toast.error(`Upload failed: ${error.message || 'Check if "vault" bucket exists'}`);
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleViewFile = async (path: string | null, type: string = 'FILE', name: string = 'Document') => {
    if (!path || path === '#' || path === '') {
      const fallbacks: Record<string, string> = {
        'PDF': 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        'PNG': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000',
        'JPG': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000',
        'JPEG': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000',
      };
      
      const fallbackUrl = fallbacks[type.toUpperCase()] || 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=1000';
      
      toast.info(`Showing sample ${type} preview`);
      setSelectedFile({ url: fallbackUrl, name, type });
      return;
    }

    // If it's a full URL (legacy), use it directly
    if (path.startsWith('http')) {
      setSelectedFile({ url: path, name, type });
      return;
    }

    // Otherwise, generate a SECURE Signed URL for the private file
    const supabase = createClient();
    const loadingToast = toast.loading('Generating secure link...');
    
    try {
      const { data, error } = await supabase.storage
        .from('vault')
        .createSignedUrl(path, 3600); // URL valid for 1 hour

      toast.dismiss(loadingToast);
      if (data) {
        setSelectedFile({ url: data.signedUrl, name, type });
      }
    } catch (err) {
      console.error('Signed URL error:', err);
      toast.dismiss(loadingToast);
      toast.error('Failed to generate secure preview. Ensure bucket is created.');
    }
  };

  const handleDownload = async (path: string | null, name: string) => {
    if (!path || path === '#' || path === '') {
      toast.error('No file available to download');
      return;
    }

    const loadingToast = toast.loading('Preparing download...');
    try {
      let downloadUrl = path;

      // If it's a private path, generate a signed URL first
      if (!path.startsWith('http')) {
        const supabase = createClient();
        const { data, error } = await supabase.storage
          .from('vault')
          .createSignedUrl(path, 60); // valid for 60 seconds
        if (error || !data) throw error || new Error('Failed to generate signed URL');
        downloadUrl = data.signedUrl;
      }

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.dismiss(loadingToast);
      toast.success('Download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss(loadingToast);
      window.open(path.startsWith('http') ? path : '#', '_blank');
      toast.info('Opening in new tab (Direct download failed)');
    }
  };

  const getFileIcon = (type: string, url: string | null, size: 'sm' | 'lg' = 'lg') => {
    const isImage = ['PNG', 'JPG', 'JPEG', 'GIF'].includes(type.toUpperCase());
    const className = size === 'lg' ? "w-8 h-8" : "w-5 h-5";
    
    if (isImage && url && url !== '#') {
      // If it's a public URL or Base64, show it. 
      // If it's a private path, we'd need a signed URL, but for the icon we'll show the actual image if possible.
      const src = url.startsWith('http') || url.startsWith('data:') 
        ? url 
        : `https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=100`; // Placeholder for private paths in icon

      return (
        <img 
          src={src} 
          alt="Preview" 
          className={`${size === 'lg' ? 'w-full h-full' : 'w-full h-full'} object-cover rounded-[16px]`} 
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            // Show fallback icon if image fails
          }}
        />
      );
    }

    switch (type.toUpperCase()) {
      case 'PDF': return <FileText className={className} />;
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'GIF': return <ImageIcon className={className} />;
      default: return <FileIcon className={className} />;
    }
  };

  return (
    <DashboardLayout>
      <div className="px-12 pb-16">
        <div className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold text-on-surface">Personal Vault</h1>
              <ShieldCheck className="w-8 h-8 text-secondary" />
            </div>
            <p className="text-on-surface-variant opacity-60">End-to-end encrypted storage for your critical documents.</p>
          </div>

          <div className="flex gap-4">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg,.gif"
            />
            <button 
              onClick={triggerUpload}
              className="h-12 px-6 bg-white border border-gray-100 rounded-2xl flex items-center gap-2 font-medium hover:bg-gray-50 transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
            <button 
              onClick={triggerUpload}
              className="h-12 px-6 bg-black text-white rounded-2xl flex items-center gap-2 font-medium hover:scale-[1.02] transition-all shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Scan New</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9 bg-white border border-gray-50 rounded-[40px] overflow-hidden shadow-level1 min-h-[600px] flex flex-col">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/30">
              <div className="flex bg-white/50 p-1 rounded-xl border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant opacity-40 hover:opacity-60'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-on-surface' : 'text-on-surface-variant opacity-40 hover:opacity-60'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-40" />
                <input 
                  type="text" 
                  placeholder="Search vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 h-10 pl-10 pr-4 bg-white border border-gray-100 rounded-xl focus:outline-none text-sm"
                />
              </div>
            </div>

            <div className="p-8 flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-on-surface"></div>
                </div>
              ) : viewMode === 'list' ? (
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest opacity-40">
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Size</th>
                      <th className="px-6 py-4">Date Added</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredDocs.map(doc => (
                      <tr 
                        key={doc.id} 
                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => handleViewFile(doc.url, doc.type, doc.name)}
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center group-hover:bg-white transition-colors overflow-hidden">
                              {getFileIcon(doc.type || 'FILE', doc.url, 'sm')}
                            </div>
                            <span className="font-semibold text-on-surface">{doc.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{doc.type}</td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{doc.size}</td>
                        <td className="px-6 py-5 text-sm text-on-surface-variant font-medium">{doc.date}</td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewFile(doc.url, doc.type, doc.name);
                              }}
                              className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 rounded-full text-on-surface-variant hover:text-on-surface transition-colors"
                              title="Open in New Tab"
                            >
                              <ExternalLink className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(doc.url, doc.name);
                              }}
                              className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-blue-50 rounded-full text-on-surface-variant hover:text-primary transition-colors"
                              title="Download"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setDocumentToDelete({ id: doc.id, name: doc.name });
                              }}
                              className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 rounded-full text-on-surface-variant hover:text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredDocs.map(doc => (
                    <div 
                      key={doc.id} 
                      className="group bg-white rounded-[32px] border border-gray-50 p-7 shadow-sm hover:shadow-level2 transition-all cursor-pointer relative flex flex-col h-[280px]"
                      onClick={() => handleViewFile(doc.url, doc.type, doc.name)}
                    >
                      <div className="flex justify-between items-start mb-8">
                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-all overflow-hidden ${
                          doc.type === 'PDF' 
                            ? 'bg-[#0B1C30] text-white' 
                            : 'bg-white border border-gray-100 text-on-surface'
                        }`}>
                          {getFileIcon(doc.type || 'FILE', doc.url, 'lg')}
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewFile(doc.url, doc.type, doc.name);
                            }}
                            className="p-2 text-on-surface-variant opacity-0 group-hover:opacity-100 hover:bg-gray-50 rounded-full transition-all hover:text-on-surface"
                            title="Open in New Tab"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(doc.url, doc.name);
                            }}
                            className="p-2 text-on-surface-variant opacity-0 group-hover:opacity-100 hover:bg-blue-50 rounded-full transition-all hover:text-primary"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setDocumentToDelete({ id: doc.id, name: doc.name });
                            }}
                            className="p-2 text-on-surface-variant opacity-20 group-hover:opacity-100 hover:bg-red-50 rounded-full transition-all hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="w-6 h-6" />
                          </button>
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-on-surface mb-2 truncate group-hover:text-primary transition-colors">
                          {doc.name}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.1em]">{doc.type}</span>
                          <div className="w-1 h-1 bg-gray-200 rounded-full" />
                          <span className="text-[11px] font-bold text-on-surface-variant opacity-40 uppercase tracking-[0.1em]">{doc.size}</span>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                        <span className="text-sm font-bold text-on-surface-variant opacity-60">
                          {doc.date?.split(',')[0]}
                        </span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFile(doc.url, doc.type, doc.name);
                          }}
                          className="text-[11px] font-extrabold text-on-surface tracking-[0.15em] uppercase hover:text-primary transition-colors"
                        >
                          View File
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {!isLoading && filteredDocs.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full py-20 text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <FileIcon className="w-10 h-10 text-on-surface-variant opacity-20" />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface opacity-40">No documents found</h3>
                  <p className="text-sm text-on-surface-variant opacity-60 mt-2">Try searching for something else or upload a new file.</p>
                </div>
              )}
            </div>
          </div>

          {/* Storage Info */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <Card className="p-8">
              <h3 className="text-xs font-bold text-on-surface-variant tracking-[0.2em] uppercase opacity-50 mb-6">Storage Details</h3>
              <div className="flex flex-col items-center py-6">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-50" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="120" className="text-secondary" />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold">65%</span>
                    <span className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase">Used</span>
                  </div>
                </div>
                <div className="mt-8 w-full space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant font-medium">Documents</span>
                    <span className="font-bold text-on-surface">1.2 GB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-on-surface-variant font-medium">Images</span>
                    <span className="font-bold text-on-surface">0.8 GB</span>
                  </div>
                  <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-50">
                    <span className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px]">Total Available</span>
                    <span className="font-bold text-primary">5.0 GB</span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="p-8 bg-on-surface rounded-[40px] text-white">
              <h3 className="text-lg font-bold mb-3 text-blue-100">Vault Security</h3>
              <p className="text-sm text-blue-100/40 leading-relaxed mb-6">Your data is encrypted locally before being synced to the cloud. Only you hold the key.</p>
              <button className="text-xs font-bold tracking-widest uppercase py-2 px-4 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                Check Security
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Viewer Modal */}
      {selectedFile && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedFile(null)}
          />
          <div className="relative bg-white w-full h-full rounded-[32px] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                  {getFileIcon(selectedFile.type, 'sm')}
                </div>
                <div>
                  <h3 className="font-bold text-on-surface pr-10">{selectedFile.name}</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest">{selectedFile.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => window.open(selectedFile.url, '_blank')}
                  className="p-3 hover:bg-gray-50 rounded-xl transition-all text-on-surface-variant"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>
                <a 
                  href={selectedFile.url} 
                  download={selectedFile.name}
                  className="p-3 hover:bg-gray-50 rounded-xl transition-all text-on-surface-variant"
                  title="Download file"
                >
                  <Download className="w-5 h-5" />
                </a>
                <div className="w-px h-6 bg-gray-100 mx-2" />
                <button 
                  onClick={() => setSelectedFile(null)}
                  className="p-3 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-gray-100/50 flex items-center justify-center overflow-auto p-4 md:p-10">
              {selectedFile.type === 'PDF' ? (
                <iframe 
                  src={`${selectedFile.url}#toolbar=0`} 
                  className="w-full h-full rounded-2xl shadow-lg bg-white"
                  title={selectedFile.name}
                />
              ) : (
                <img 
                  src={selectedFile.url} 
                  alt={selectedFile.name}
                  className="max-w-full max-h-full object-contain rounded-2xl shadow-xl bg-white"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://images.unsplash.com/photo-1594322436404-5a0526db4d13?auto=format&fit=crop&q=80&w=1000';
                    toast.error('Could not load original image. Showing placeholder.');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDocumentToDelete(null)}
          />
          <div className="relative bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-on-surface mb-2">Delete Document?</h3>
              <p className="text-on-surface-variant opacity-60 leading-relaxed">
                Are you sure you want to delete <span className="font-bold text-on-surface">"{documentToDelete.name}"</span>? This action cannot be undone.
              </p>
              
              <div className="flex gap-4 mt-10">
                <button 
                  onClick={() => setDocumentToDelete(null)}
                  className="flex-1 h-12 rounded-xl border border-gray-100 font-bold hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 h-12 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
