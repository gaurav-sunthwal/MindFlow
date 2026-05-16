import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Dimensions,
  Modal,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../../constants/Theme';
import { useNotes, Note } from '../../../context/NoteContext';
import Button from '../../../components/Button';

const { width } = Dimensions.get('window');

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const { notes, addNote, updateNote, deleteNote, refreshNotes, isLoading } = useNotes();
  const [search, setSearch] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshNotes();
    setRefreshing(false);
  }, [refreshNotes]);

  const openEditor = (note?: Note) => {
    if (note) {
      setEditingNote(note);
      setNoteTitle(note.title);
      setNoteContent(note.content);
    } else {
      setEditingNote(null);
      setNoteTitle('');
      setNoteContent('');
    }
    setIsModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) {
      setIsModalVisible(false);
      return;
    }

    if (editingNote) {
      await updateNote(editingNote.id, { title: noteTitle, content: noteContent });
    } else {
      await addNote(noteTitle || 'Untitled Note', noteContent);
    }
    setIsModalVisible(false);
  };

  const handleDeleteNote = async () => {
    if (editingNote) {
      await deleteNote(editingNote.id);
      setIsModalVisible(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  const NoteCard = ({ note }: { note: Note }) => (
    <TouchableOpacity 
      style={styles.noteCard} 
      activeOpacity={0.7}
      onPress={() => openEditor(note)}
    >
      <Text style={styles.noteTitle}>{note.title}</Text>
      <Text style={styles.noteExcerpt} numberOfLines={4}>
        {note.content}
      </Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteDate}>{note.date || 'Synced'}</Text>
        <Ionicons name="pencil-outline" size={12} color={Theme.colors.outlineVariant} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Notes</Text>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Theme.colors.onSurfaceVariant} />
          <TextInput 
            placeholder="Search notes..." 
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
          <View style={styles.contentGrid}>
            {filteredNotes.length > 0 ? filteredNotes.map(note => (
              <NoteCard key={note.id} note={note} />
            )) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color={Theme.colors.outlineVariant} />
                <Text style={styles.emptyText}>No notes found</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9}
        onPress={() => openEditor()}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
        <Text style={styles.fabText}>New Note</Text>
      </TouchableOpacity>

      {/* FULL SCREEN EDITOR */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        onRequestClose={handleSaveNote}
      >
        <View style={[styles.editorContainer, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.editorHeader}>
            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.editorAction}>
              <Ionicons name="chevron-back" size={24} color={Theme.colors.onSurface} />
            </TouchableOpacity>
            
            <View style={styles.editorActions}>
              {editingNote && (
                <TouchableOpacity onPress={handleDeleteNote} style={styles.editorAction}>
                  <Ionicons name="trash-outline" size={22} color={Theme.colors.error} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleSaveNote} style={styles.saveButton}>
                <Text style={styles.saveButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView 
            style={styles.editorScroll}
            keyboardShouldPersistTaps="handled"
          >
            <TextInput
              style={styles.editorTitleInput}
              placeholder="Title"
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholderTextColor={Theme.colors.onSurfaceVariant + '80'}
              multiline
            />
            <TextInput
              style={styles.editorContentInput}
              placeholder="Start typing..."
              value={noteContent}
              onChangeText={setNoteContent}
              multiline
              autoFocus={!editingNote}
              placeholderTextColor={Theme.colors.onSurfaceVariant + '40'}
            />
          </ScrollView>
        </View>
      </Modal>
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
  contentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  noteCard: {
    width: (width - Theme.spacing.marginMobile * 2 - 16) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 8,
    marginBottom: 16,
    ...Theme.shadows.level1,
  },
  noteTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
    marginBottom: 8,
  },
  noteExcerpt: {
    ...Theme.typography.bodySm,
    color: Theme.colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 12,
    opacity: 0.7,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
    paddingTop: 8,
  },
  noteDate: {
    ...Theme.typography.labelCaps,
    fontSize: 9,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.5,
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
    width: width - Theme.spacing.marginMobile * 2,
    padding: 40,
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 12,
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  editorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editorActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editorAction: {
    padding: 8,
  },
  saveButton: {
    backgroundColor: Theme.colors.onSurface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  saveButtonText: {
    ...Theme.typography.labelLarge,
    color: '#ffffff',
    fontFamily: 'Geist-SemiBold',
  },
  editorScroll: {
    flex: 1,
    paddingHorizontal: 24,
  },
  editorTitleInput: {
    ...Theme.typography.displaySm,
    color: Theme.colors.onSurface,
    fontSize: 28,
    marginBottom: 16,
    fontFamily: 'Geist-SemiBold',
    paddingTop: 16,
  },
  editorContentInput: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
    fontSize: 18,
    lineHeight: 28,
    paddingBottom: 100,
    textAlignVertical: 'top',
  },
});

