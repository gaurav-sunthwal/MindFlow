import React, { useState, useCallback, useEffect } from 'react';
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
  Platform,
  Image
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Sharing from 'expo-sharing';
import { downloadAsync, cacheDirectory } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Theme from '../../../constants/Theme';
import { useDocuments, Document } from '../../../context/DocumentContext';
import { api } from '../../../utils/api';
import { supabase } from '../../../utils/supabase';
import { useAuth } from '../../../context/AuthContext';

export default function DocumentsScreen() {
  const insets = useSafeAreaInsets();
  const { documents, refreshDocuments, addDocument, deleteDocument, isLoading } = useDocuments();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<{ url: string, originalUrl: string, name: string, type: string } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [renamingDoc, setRenamingDoc] = useState<Document | null>(null);
  const [newName, setNewName] = useState('');

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

      const originalSignedUrl = previewUrl;

      // Android WebView doesn't support PDF viewing natively, use Google Docs Viewer
      if (Platform.OS === 'android' && (doc.type.toLowerCase().includes('pdf') || previewUrl.toLowerCase().includes('.pdf'))) {
        previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(previewUrl)}&embedded=true`;
      }

      setSelectedDoc({ url: previewUrl, originalUrl: originalSignedUrl, name: doc.name, type: doc.type });
    } catch (error: any) {
      console.error('Preview error:', error);
      Alert.alert('Error', 'Failed to generate a secure preview for this document.');
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const uploadToSupabase = async (uri: string, fileName: string, mimeType: string) => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to upload files.');
      return null;
    }

    try {
      setIsUploading(true);
      const filePath = `${user.id}/${Date.now()}_${fileName}`;
      
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
        name: fileName,
        type: mimeType,
      } as any);

      const { data, error } = await supabase.storage
        .from('vault')
        .upload(filePath, formData, {
          upsert: false
        });

      if (error) throw error;
      return data.path;
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.message || 'Could not upload file to storage');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleScan = async () => {
    if (isPicking) return;
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Camera scanning is only available on physical mobile devices.');
      return;
    }

    try {
      setIsPicking(true);
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required to scan documents.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `scan_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';
        
        const path = await uploadToSupabase(asset.uri, fileName, mimeType);
        if (path) {
          await addDocument(fileName, 'IMAGE', '0.5 MB', path);
          Alert.alert('Success', 'Document scanned and stored in Private Vault');
        }
      }
    } catch (error: any) {
      console.error('Scan error:', error);
    } finally {
      setIsPicking(false);
    }
  };

  const handleUpload = async () => {
    if (isPicking) return;
    try {
      setIsPicking(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.name;
        const mimeType = asset.mimeType || 'application/octet-stream';
        const size = asset.size ? `${(asset.size / (1024 * 1024)).toFixed(1)} MB` : '0.1 MB';
        const type = mimeType.includes('pdf') ? 'PDF' : 'IMAGE';

        const path = await uploadToSupabase(asset.uri, fileName, mimeType);
        if (path) {
          await addDocument(fileName, type, size, path);
          Alert.alert('Success', 'File uploaded and stored securely');
        }
      }
    } catch (error) {
      console.error('Picker error:', error);
    } finally {
      setIsPicking(false);
    }
  };
  const handleShare = async () => {
    if (!selectedDoc) return;

    try {
      setIsSharing(true);
      
      if (!selectedDoc.originalUrl) {
        throw new Error('Document URL is missing');
      }

      const fileName = selectedDoc.name.replace(/\s+/g, '_');
      const fileUri = `${cacheDirectory}${fileName}`;
      
      console.log('Downloading for share:', selectedDoc.originalUrl);
      
      const downloadResult = await downloadAsync(
        selectedDoc.originalUrl,
        fileUri
      );
      
      if (!downloadResult || !downloadResult.uri) {
        throw new Error('Download failed');
      }
      
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: selectedDoc.type,
        dialogTitle: `Share ${selectedDoc.name}`
      });
    } catch (error) {
      console.error('Sharing error:', error);
      Alert.alert('Error', 'Failed to prepare the document for sharing.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleRename = (doc: Document) => {
    setRenamingDoc(doc);
    setNewName(doc.name);
    setRenameModalVisible(true);
  };

  const submitRename = async () => {
    if (!renamingDoc || !newName.trim()) return;
    try {
      await updateDocument(renamingDoc.id, { name: newName.trim() });
      setRenameModalVisible(false);
      setRenamingDoc(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to rename document');
    }
  };

  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  const DocumentCard = ({ doc }: { doc: Document }) => {
    const isImage = doc.type.toLowerCase().includes('image');
    const [thumbUrl, setThumbUrl] = useState<string | null>(null);

    useEffect(() => {
      if (isImage && doc.url && !doc.url.startsWith('http')) {
        api.documents.getSignedUrl(doc.url).then(setThumbUrl).catch(() => {});
      } else if (isImage && doc.url?.startsWith('http')) {
        setThumbUrl(doc.url);
      }
    }, [doc.url, doc.type]);

    const handleDelete = () => {
      Alert.alert(
        'Delete Document',
        `Are you sure you want to delete "${doc.name}"? This action cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => deleteDocument(doc.id)
          },
        ]
      );
    };

    const ACTION_OFFSET = wp('45%');

    const renderRightActions = (
      _progress: SharedValue<number>,
      dragX: SharedValue<number>
    ) => {
      const styleAnimation = useAnimatedStyle(() => {
        return {
          transform: [{ translateX: dragX.value + ACTION_OFFSET }],
        };
      });

      return (
        <View style={styles.rightActionsRow}>
          <Reanimated.View style={[styles.actionButtonContainer, { backgroundColor: '#FFCC00' }, styleAnimation]}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => handleRename(doc)}
            >
              <Ionicons name="pencil-outline" size={22} color="#ffffff" />
              <Text style={styles.actionButtonText}>Rename</Text>
            </TouchableOpacity>
          </Reanimated.View>
          
          <Reanimated.View style={[styles.actionButtonContainer, { backgroundColor: '#FF3B30' }, styleAnimation]}>
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={22} color="#ffffff" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          </Reanimated.View>
        </View>
      );
    };

    return (
      <ReanimatedSwipeable
        renderRightActions={renderRightActions}
        friction={2}
        rightThreshold={40}
        containerStyle={styles.swipeableContainer}
        overshootRight={false}
      >
        <TouchableOpacity 
          style={styles.docCard} 
          activeOpacity={0.7}
          onPress={() => handleViewDoc(doc)}
        >
          <View style={styles.docIconContainer}>
            {thumbUrl ? (
              <Image source={{ uri: thumbUrl }} style={styles.thumbnail} />
            ) : (
              <Ionicons 
                name={doc.type.toLowerCase().includes('pdf') ? "document-attach-outline" : "image-outline"} 
                size={28} 
                color={Theme.colors.primary} 
              />
            )}
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
      </ReanimatedSwipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
      {isPreviewLoading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.overlayLoadingText}>Opening Securely...</Text>
        </View>
      )}

      {isUploading && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.overlayLoadingText}>Uploading to Vault...</Text>
        </View>
      )}

      {isSharing && (
        <View style={styles.overlayLoading}>
          <ActivityIndicator size="large" color={Theme.colors.primary} />
          <Text style={styles.overlayLoadingText}>Preparing Document...</Text>
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

      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <View style={styles.menuHandle} />
              <Text style={styles.menuTitle}>Add Document</Text>
            </View>

            <View style={styles.menuOptions}>
              <TouchableOpacity 
                style={styles.menuOption} 
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(handleUpload, 400); // Wait for modal to close
                }}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#E6F4FE' }]}>
                  <Ionicons name="cloud-upload" size={24} color="#007AFF" />
                </View>
                <View style={styles.menuOptionInfo}>
                  <Text style={styles.menuOptionTitle}>Upload File</Text>
                  <Text style={styles.menuOptionSub}>PDF, Images or Documents</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Theme.colors.outlineVariant} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.menuOption} 
                onPress={() => {
                  setShowMenu(false);
                  setTimeout(handleScan, 400); // Wait for modal to close
                }}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#F0F0F0' }]}>
                  <Ionicons name="camera" size={24} color="#000000" />
                </View>
                <View style={styles.menuOptionInfo}>
                  <Text style={styles.menuOptionTitle}>Scan Document</Text>
                  <Text style={styles.menuOptionSub}>Digitize using your camera</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Theme.colors.outlineVariant} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.menuCancel} 
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.menuCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
          
            <View style={styles.previewContent}>
              {selectedDoc && selectedDoc.type.toLowerCase().includes('image') ? (
                <Image 
                  source={{ uri: selectedDoc.url }} 
                  style={styles.imagePreview} 
                  resizeMode="contain" 
                />
              ) : selectedDoc && (
                <WebView 
                  source={{ uri: selectedDoc.url }} 
                  style={styles.webview}
                  startInLoadingState={true}
                  scalesPageToFit={true}
                  originWhitelist={['*']}
                  renderLoading={() => (
                    <View style={styles.webviewLoading}>
                      <ActivityIndicator size="large" color={Theme.colors.primary} />
                    </View>
                  )}
                />
              )}
            </View>
        </View>
      </Modal>

      <Modal
        visible={renameModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setRenameModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.renameOverlay} 
          activeOpacity={1} 
          onPress={() => setRenameModalVisible(false)}
        >
          <View style={styles.renameContent}>
            <Text style={styles.renameTitle}>Rename Document</Text>
            <TextInput
              style={styles.renameInput}
              value={newName}
              onChangeText={setNewName}
              autoFocus={true}
              selectTextOnFocus={true}
            />
            <View style={styles.renameButtons}>
              <TouchableOpacity 
                style={[styles.renameBtn, { backgroundColor: '#f0f0f0' }]} 
                onPress={() => setRenameModalVisible(false)}
              >
                <Text style={[styles.renameBtnText, { color: '#666' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.renameBtn, { backgroundColor: Theme.colors.primary }]} 
                onPress={submitRename}
              >
                <Text style={[styles.renameBtnText, { color: '#fff' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity 
        style={styles.mainFab} 
        activeOpacity={0.9}
        onPress={() => setShowMenu(true)}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>
    </View>
  </GestureHandlerRootView>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: wp('5%'),
    paddingTop: hp('2.5%'),
    paddingBottom: hp('3%'),
  },
  title: {
    ...Theme.typography.displayMd,
    fontSize: wp('9%'),
    color: Theme.colors.onSurface,
    marginBottom: hp('2%'),
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: wp('4%'),
    paddingHorizontal: wp('4%'),
    height: hp('6%'),
    ...Theme.shadows.level1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    ...Theme.typography.bodyMd,
    color: Theme.colors.onSurface,
  },
  scrollContent: {
    paddingHorizontal: wp('5%'),
    paddingBottom: hp('12%'),
  },
  contentList: {
    gap: hp('1.5%'),
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    ...Theme.shadows.level2,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  docIconContainer: {
    width: wp('14%'),
    height: wp('14%'),
    backgroundColor: Theme.colors.surfaceContainerLow,
    borderRadius: wp('4%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp('4%'),
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
  mainFab: {
    position: 'absolute',
    bottom: 30,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.onSurface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.level3,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  menuContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Theme.shadows.level3,
  },
  menuHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  menuHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 16,
  },
  menuTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Bold',
    color: Theme.colors.onSurface,
  },
  menuOptions: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 24,
  },
  menuOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 20,
    gap: 16,
  },
  menuIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuOptionInfo: {
    flex: 1,
  },
  menuOptionTitle: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-SemiBold',
    color: Theme.colors.onSurface,
  },
  menuOptionSub: {
    ...Theme.typography.bodySm,
    fontSize: 12,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.6,
    marginTop: 2,
  },
  menuCancel: {
    marginHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f3f5',
  },
  menuCancelText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-Bold',
    color: Theme.colors.onSurfaceVariant,
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
  previewContent: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  imagePreview: {
    flex: 1,
    width: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  webviewLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeableContainer: {
    marginBottom: hp('1.5%'),
  },
  rightActionsRow: {
    flexDirection: 'row',
    height: '100%',
    paddingLeft: wp('4%'),
    backgroundColor: 'transparent',
  },
  actionButtonContainer: {
    width: wp('20%'),
    height: '100%',
    borderRadius: wp('5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp('2%'),
    ...Theme.shadows.level1,
  },
  actionButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: wp('2.8%'),
    fontFamily: 'Geist-Medium',
    marginTop: 4,
  },
  renameOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  renameContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    ...Theme.shadows.level3,
  },
  renameTitle: {
    ...Theme.typography.titleMd,
    marginBottom: 16,
  },
  renameInput: {
    height: 56,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
    marginBottom: 20,
  },
  renameButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  renameBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  renameBtnText: {
    fontFamily: 'Geist-Bold',
    fontSize: 14,
  }
});

