import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../../constants/Theme';
import { useTasks, Task } from '../../../context/TaskContext';
import Chip from '../../../components/Chip';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { tasks, addTask, toggleTask, deleteTask, pendingCount, refreshTasks } = useTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  }, [refreshTasks]);

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      addTask(newTaskTitle.trim());
      setNewTaskTitle('');
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const renderTaskItem = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <TouchableOpacity 
        style={styles.checkboxContainer} 
        onPress={() => toggleTask(item.id)}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={item.completed ? "checkmark-circle" : "ellipse-outline"} 
          size={26} 
          color={item.completed ? Theme.colors.secondary : Theme.colors.outline} 
        />
      </TouchableOpacity>

      <View style={styles.taskContent}>
        <Text style={[
          styles.taskTitle, 
          item.completed && styles.taskTitleCompleted
        ]}>
          {item.title}
        </Text>
        <View style={styles.taskMeta}>
          <Chip 
            label={item.category} 
            color={item.completed ? Theme.colors.outlineVariant : Theme.colors.primary} 
            style={styles.chip}
          />
          {item.dueDate && (
            <Text style={styles.dueDate}>{item.dueDate}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity 
        onPress={() => deleteTask(item.id)}
        style={styles.deleteButton}
      >
        <Ionicons name="trash-outline" size={20} color={Theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tasks</Text>
            <Text style={styles.subtitle}>
              {pendingCount === 0 ? "You're all caught up!" : `You have ${pendingCount} tasks to complete`}
            </Text>
          </View>
        </View>

        <View style={styles.addBar}>
          <TextInput
            style={styles.input}
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChangeText={setNewTaskTitle}
            onSubmitEditing={handleAddTask}
            placeholderTextColor={Theme.colors.onSurfaceVariant}
          />
          <TouchableOpacity 
            style={[styles.addButton, !newTaskTitle.trim() && styles.addButtonDisabled]} 
            onPress={handleAddTask}
            disabled={!newTaskTitle.trim()}
          >
            <Ionicons name="add" size={28} color="#ffffff" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterContainer}>
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <TouchableOpacity 
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <FlatList
          data={filteredTasks}
          renderItem={renderTaskItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              tintColor={Theme.colors.primary}
              colors={[Theme.colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="clipboard-outline" size={64} color={Theme.colors.outlineVariant} />
              <Text style={styles.emptyText}>No tasks found</Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    ...Theme.typography.displayMd,
    color: Theme.colors.onSurface,
  },
  subtitle: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  addBar: {
    flexDirection: 'row',
    marginHorizontal: Theme.spacing.marginMobile,
    marginBottom: 24,
    gap: 12,
  },
  input: {
    flex: 1,
    height: 56,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    paddingHorizontal: 20,
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
    ...Theme.shadows.level1,
  },
  addButton: {
    width: 56,
    height: 56,
    backgroundColor: Theme.colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.level1,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: Theme.spacing.marginMobile,
    marginBottom: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
  },
  filterChipActive: {
    backgroundColor: Theme.colors.onSurface,
    borderColor: Theme.colors.onSurface,
  },
  filterText: {
    ...Theme.typography.labelCaps,
    fontSize: 11,
    color: Theme.colors.onSurfaceVariant,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingBottom: 100,
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    ...Theme.shadows.level1,
  },
  checkboxContainer: {
    marginRight: 16,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
    marginBottom: 6,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.6,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  dueDate: {
    ...Theme.typography.bodySm,
    color: Theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    opacity: 0.5,
  },
  emptyText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 16,
  },
});
