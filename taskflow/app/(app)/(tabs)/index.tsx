import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Image,
  Platform,
  RefreshControl
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Theme from '../../../constants/Theme';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import Chip from '../../../components/Chip';
import { useTheme } from '../../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';
import { useTasks } from '../../../context/TaskContext';
import { useEvents } from '../../../context/EventContext';
import { useNotes } from '../../../context/NoteContext';
import { useDocuments } from '../../../context/DocumentContext';
import { useActivities } from '../../../context/ActivityContext';
import { Modal, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function Index() {
  const { user } = useAuth();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const { tasks, toggleTask, pendingCount, completedCount, refreshTasks } = useTasks();
  const { events, addEvent, refreshEvents } = useEvents();
  const { notes, refreshNotes } = useNotes();
  const { documents, refreshDocuments } = useDocuments();
  const { activities } = useActivities();

  const [refreshing, setRefreshing] = useState(false);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshTasks(),
      refreshEvents(),
      refreshNotes(),
      refreshDocuments()
    ]);
    setRefreshing(false);
  }, [refreshTasks, refreshEvents, refreshNotes, refreshDocuments]);


  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).toUpperCase();

  const hour = now.getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 17) greeting = 'Good afternoon';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';


  const recentTasks = tasks.filter(t => !t.completed).slice(0, 3);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <ScrollView 
        contentContainerStyle={styles.container}
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
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.dateLabel}>{dateStr}</Text>
              <Text style={styles.title}>{greeting},</Text>
              <Text style={styles.subtitle} numberOfLines={1}>{userName}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
            >
              <Image 
                source={user?.user_metadata?.avatar_url ? { uri: user.user_metadata.avatar_url } : require('../../../assets/images/profile_avatar.png')} 
                style={styles.headerAvatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Focus ({pendingCount})</Text>
            <TouchableOpacity onPress={() => router.push('/tasks')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTasks.length > 0 ? recentTasks.map(task => (
            <TouchableOpacity 
              key={task.id}
              style={styles.taskItem}
              onPress={() => toggleTask(task.id)}
            >
              <Ionicons name="ellipse-outline" size={24} color={theme.colors.outline} />
              <View style={styles.taskDetail}>
                <View style={styles.taskMainRow}>
                  <Text style={styles.taskTitle}>{task.title}</Text>
                </View>
                
                <View style={styles.taskMetaRow}>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={14} color={theme.colors.onSurfaceVariant} />
                    <Text style={styles.timeText}>{task.dueDate || 'Today'}</Text>
                  </View>
                  <View style={styles.taskChips}>
                    <Chip label={task.category} color={theme.colors.primary} style={styles.taskChip} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>
                {tasks.length > 0 ? "All tasks completed! Great job." : "No tasks yet. Start by adding one!"}
              </Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.addTaskButton}
            onPress={() => router.push('/tasks')}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.addTaskText}>Add Task</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Events</Text>
            <TouchableOpacity onPress={() => router.push('/events')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          {events.length > 0 ? events.map(event => (
            <TouchableOpacity 
              key={event.id} 
              style={styles.eventItem}
              onPress={() => router.push('/events')}
            >
              <View style={styles.eventTimeContainer}>
                <Text style={styles.eventTimeHour}>{event.time.split(' ')[0]}</Text>
                <Text style={styles.eventTimeAmPm}>{event.time.split(' ')[1]}</Text>
              </View>
              <View style={[styles.eventIndicator, { backgroundColor: event.type === 'work' ? '#0B1C30' : '#4a654e' }]} />
              <View style={styles.eventDetail}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <Text style={styles.eventDateText}>{event.date}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.colors.outlineVariant} />
            </TouchableOpacity>
          )) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>No upcoming events.</Text>
            </View>
          )}

          <TouchableOpacity 
            style={styles.addEventButton}
            onPress={() => setIsEventModalVisible(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.addEventText}>Schedule Event</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.grid}>
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/tasks')}
              activeOpacity={0.7}
            >
              <Card style={styles.overviewCard}>
                <View style={[styles.iconContainer, { backgroundColor: '#E6F4FE' }]}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#4a654e" />
                </View>
                <Text style={styles.overviewLabel}>Pending</Text>
                <Text style={styles.overviewValue}>{pendingCount}</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/tasks')}
              activeOpacity={0.7}
            >
              <Card style={styles.overviewCard}>
                <View style={[styles.iconContainer, { backgroundColor: '#C9E8CB' }]}>
                  <Ionicons name="flag-outline" size={24} color="#4a654e" />
                </View>
                <Text style={styles.overviewLabel}>Completed</Text>
                <Text style={styles.overviewValue}>{completedCount}</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/notes')}
              activeOpacity={0.7}
            >
              <Card style={styles.overviewCard}>
                <View style={[styles.iconContainer, { backgroundColor: '#E5EEFF' }]}>
                  <Ionicons name="document-text-outline" size={24} color="#0B1C30" />
                </View>
                <Text style={styles.overviewLabel}>Notes</Text>
                <Text style={styles.overviewValue}>{notes.length}</Text>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.gridItem}
              onPress={() => router.push('/documents')}
              activeOpacity={0.7}
            >
              <Card style={styles.overviewCard}>
                <View style={[styles.iconContainer, { backgroundColor: '#E6E2DF' }]}>
                  <Ionicons name="document-attach-outline" size={24} color="#1C1B1A" />
                </View>
                <Text style={styles.overviewLabel}>Vault</Text>
                <Text style={styles.overviewValue}>{documents.length}</Text>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          {activities.length > 0 ? activities.map(activity => (
            <View key={activity.id} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: activity.type === 'task' ? '#E6F4FE' : '#F5F5F5' }]}>
                <Ionicons 
                  name={activity.type === 'task' ? "checkbox-outline" : "document-text-outline"} 
                  size={16} 
                  color={Theme.colors.primary} 
                />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityAction}>{activity.action} </Text>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                </Text>
                <Text style={styles.activityTime}>
                  {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyTasks}>
              <Text style={styles.emptyTasksText}>No recent activity.</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <View style={styles.buttonRow}>
            <Button 
              title="New Task" 
              variant="secondary" 
              onPress={() => router.push('/tasks')} 
              style={{ flex: 1 }}
            />
            <Button 
              title="New Event" 
              variant="primary" 
              onPress={() => setIsEventModalVisible(true)} 
              style={{ flex: 1 }}
            />
          </View>
        </View>

        <Modal
          visible={isEventModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsEventModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>New Event</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Event Title"
                value={newEventTitle}
                onChangeText={setNewEventTitle}
                placeholderTextColor={theme.colors.onSurfaceVariant}
              />
              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.pickerButtonText}>{formatTime(date)}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.pickerButton} 
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.pickerButtonText}>{formatDate(date)}</Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                />
              )}

              {showTimePicker && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onTimeChange}
                />
              )}
              <View style={styles.modalButtons}>
                <Button 
                  title="Cancel" 
                  variant="secondary" 
                  onPress={() => setIsEventModalVisible(false)} 
                  style={{ flex: 1 }}
                />
                <Button 
                  title="Create" 
                  variant="primary" 
                  onPress={() => {
                    addEvent({ 
                      title: newEventTitle, 
                      time: formatTime(date), 
                      date: formatDate(date), 
                      type: 'work' 
                    });
                    setIsEventModalVisible(false);
                    setNewEventTitle('');
                    setDate(new Date());
                  }} 
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    padding: wp('5%'),
    paddingTop: hp('2%'),
  },
  header: {
    marginBottom: hp('4%'),
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerAvatar: {
    width: wp('14%'),
    height: wp('14%'),
    borderRadius: wp('7%'),
    borderWidth: 3,
    borderColor: '#ffffff',
    ...Theme.shadows.level1,
  },
  dateLabel: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurfaceVariant,
    marginBottom: hp('1%'),
    fontSize: wp('3%'),
  },
  title: {
    ...Theme.typography.displayLg,
    fontSize: wp('8%'),
    color: Theme.colors.onSurface,
    lineHeight: wp('9.5%'),
  },
  subtitle: {
    ...Theme.typography.displayLg,
    fontSize: wp('8%'),
    color: Theme.colors.onSurfaceVariant,
    marginTop: hp('-0.5%'),
    lineHeight: wp('9.5%'),
  },
  headerTextContainer: {
    flex: 1,
    marginRight: wp('3%'),
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurfaceVariant,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAllText: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.primary,
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridItem: {
    width: '50%',
    padding: 8,
  },
  overviewCard: {
    padding: wp('5%'),
  },
  iconContainer: {
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('3%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  overviewLabel: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurfaceVariant,
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  overviewValue: {
    ...Theme.typography.headlineLg,
    color: Theme.colors.onSurface,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: Theme.rounding.lg,
    marginBottom: 12,
    ...Theme.shadows.level1,
  },
  taskDetail: {
    flex: 1,
    marginLeft: 16,
  },
  taskMainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
    flex: 1,
  },
  taskMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.onSurfaceVariant,
  },
  taskChips: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
  },
  taskChip: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  emptyTasks: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderRadius: Theme.rounding.lg,
    alignItems: 'center',
    ...Theme.shadows.level1,
  },
  emptyTasksText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    textAlign: 'center',
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 8,
  },
  viewMoreText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.primary,
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: Theme.rounding.lg,
    marginBottom: 12,
    ...Theme.shadows.level1,
  },
  eventTimeContainer: {
    alignItems: 'center',
    width: 50,
  },
  eventTimeHour: {
    ...Theme.typography.bodyLg,
    fontSize: 16,
    color: Theme.colors.onSurface,
    fontFamily: 'Geist-SemiBold',
  },
  eventTimeAmPm: {
    ...Theme.typography.labelCaps,
    fontSize: 8,
    color: Theme.colors.onSurfaceVariant,
    marginTop: -2,
    opacity: 0.6,
  },
  eventIndicator: {
    width: 2,
    height: 32,
    borderRadius: 1,
    marginHorizontal: 12,
    opacity: 0.3,
  },
  eventDetail: {
    flex: 1,
  },
  eventTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
  },
  eventDateText: {
    ...Theme.typography.bodySm,
    color: Theme.colors.onSurfaceVariant,
    marginTop: 2,
    opacity: 0.6,
  },
  addEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderStyle: 'dashed',
    borderRadius: Theme.rounding.lg,
  },
  addEventText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.primary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
    ...Theme.shadows.level1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityText: {
    flex: 1,
    marginRight: 8,
  },
  activityAction: {
    ...Theme.typography.bodySm,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurfaceVariant,
    textTransform: 'capitalize',
  },
  activityTitle: {
    ...Theme.typography.bodySm,
    color: Theme.colors.onSurface,
    fontFamily: 'Geist-SemiBold',
  },
  activityTime: {
    ...Theme.typography.labelCaps,
    fontSize: 9,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.5,
  },
  addTaskButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Theme.colors.outlineVariant,
    borderStyle: 'dashed',
    borderRadius: Theme.rounding.lg,
  },
  addTaskText: {
    ...Theme.typography.bodyMd,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 32,
    paddingBottom: Platform.OS === 'ios' ? 48 : 32,
  },
  modalTitle: {
    ...Theme.typography.headlineLg,
    color: Theme.colors.onSurface,
    marginBottom: 24,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 64,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...Theme.shadows.level1,
  },
  pickerButtonText: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
    fontFamily: 'Geist-Medium',
  },
  modalInput: {
    height: 56,
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
});
