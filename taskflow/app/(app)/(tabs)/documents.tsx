import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import Theme from '../../../constants/Theme';
import { useDocuments, Document } from '../../../context/DocumentContext';
import { api } from '../../../utils/api';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { documents, refreshDocuments, isLoading } = useDocuments();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, name: string, type: string } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshDocuments();
    setRefreshing(false);
  }, [refreshDocuments]);

  const handleViewDoc = async (doc: Document) => {
    if (!doc.url || doc.url === '#') {
      Alert.alert('Error', 'No file content available for this document.');
      return;
    }

    try {
      setIsPreviewLoading(true);
      let previewUrl = doc.url;

      // If it's a private path (not a full URL), generate a signed URL
      if (!doc.url.startsWith('http')) {
        previewUrl = await api.documents.getSignedUrl(doc.url);
      }

      setSelectedDoc({ url: previewUrl, name: doc.name, type: doc.type });
    } catch (error: any) {
      console.error('Preview error:', error);
      Alert.alert('Error', 'Failed to generate a secure preview for this document.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleShare = async () => {
    if (!selectedDoc) return;
    
    try {
      const fileUri = `${FileSystem.cacheDirectory}${selectedDoc.name}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        selectedDoc.url,
        fileUri
      );
      
      const result = await downloadResumable.downloadAsync();
      if (result) {
        await Sharing.shareAsync(result.uri);
      }
    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Error', 'Failed to share this document.');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const DocumentCard = ({ doc }: { doc: Document }) => (
    <TouchableOpacity 
      style={styles.docCard} 
      activeOpacity={0.7}
      onPress={() => handleViewDoc(doc)}
    >
      <View style={styles.docIconContainer}>
        <Ionicons 
          name={doc.type.toLowerCase().includes('pdf') ? "document-attach-outline" : "image-outline"} 
          size={28} 
          color={Theme.colors.primary} 
        />
      </View>
      <View style={styles.docInfo}>
        <Text style={styles.docTitle}>{doc.name}</Text>
        <View style={styles.docMeta}>
          <Text style={styles.docType}>{doc.type.toUpperCase()}</Text>
          <Text style={styles.docDot}>•</Text>
          <Text style={styles.docDate}>{doc.date || 'Synced'}</Text>
        </View>
      </View>
      <Ionicons name="eye-outline" size={20} color={Theme.colors.outlineVariant} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {isPreviewLoading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.overlayLoadingText}>Opening Securely...</Text>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Documents</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Theme.colors.onSurfaceVariant} />
          <TextInput 
            placeholder="Search documents..." 
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Theme.colors.onSurfaceVariant}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
        >
          <View style={styles.contentList}>
            {filteredDocuments.length > 0 ? filteredDocuments.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            )) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-attach-outline" size={64} color={Theme.colors.outlineVariant} />
                <Text style={styles.emptyText}>No documents found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* Document Viewer Modal */}
      <Modal
        visible={!!selectedDoc}
        animationType="slide"
        onRequestClose={() => setSelectedDoc(null)}
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setSelectedDoc(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={28} color={Theme.colors.onSurface} />
            </TouchableOpacity>
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalDocTitle} numberOfLines={1}>{selectedDoc?.name}</Text>
              <Text style={styles.modalDocSub}>{selectedDoc?.type}</Text>
            </View>
            <TouchableOpacity 
              onPress={handleShare}
              style={styles.shareButton}
            >
              <Ionicons name="share-outline" size={24} color={Theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {selectedDoc && (
            <WebView 
              source={{ uri: selectedDoc.url }} 
              style={styles.webview}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.webviewLoading}>
                  <ActivityIndicator size="large" color={Theme.colors.primary} />
                </View>
              )}
            />
          )}
        </View>
      </Modal>

      <TouchableOpacity style={styles.fab} activeOpacity={0.9}>
        <Ionicons name="scan-outline" size={24} color="#ffffff" />
        <Text style={styles.fabText}>Scan Doc</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.onSurface,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 48,
    ...Theme.shadows.level1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    ...Theme.typography.bodyMd,
    color: Theme.colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingBottom: 100,
  },
  contentList: {
    gap: 12,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    ...Theme.shadows.level1,
  },
  docIconContainer: {
    width: 56,
    height: 56,
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  docInfo: {
    flex: 1,
  },
  docTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
    marginBottom: 4,
  },
  docMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docType: {
    ...Theme.typography.labelCaps,
    fontSize: 10,
    color: Theme.colors.primary,
  },
  docDot: {
    fontSize: 12,
    color: Theme.colors.outlineVariant,
  },
  docDate: {
    ...Theme.typography.bodySm,
    fontSize: 12,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.6,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: Theme.colors.onSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    gap: 10,
    ...Theme.shadows.level2,
  },
  fabText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-SemiBold',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 80,
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 16,
  },
  overlayLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayLoadingText: {
    ...Theme.typography.bodyMd,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 12,
    fontFamily: 'Geist-Medium',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.outlineVariant,
  },
  closeButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalDocTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-SemiBold',
    color: Theme.colors.onSurface,
  },
  modalDocSub: {
    ...Theme.typography.labelCaps,
    fontSize: 10,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.6,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

