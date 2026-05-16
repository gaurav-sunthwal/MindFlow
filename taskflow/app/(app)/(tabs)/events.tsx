import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../../constants/Theme';
import { useEvents } from '../../../context/EventContext';
import Button from '../../../components/Button';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventsScreen() {
  const insets = useSafeAreaInsets();
  const { events, addEvent, deleteEvent, refreshEvents, isLoading } = useEvents();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshEvents();
    setRefreshing(false);
  }, [refreshEvents]);


  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const onTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleAddEvent = () => {
    if (newTitle.trim()) {
      addEvent({
        title: newTitle.trim(),
        time: formatTime(date),
        date: formatDate(date),
        type: 'work'
      });
      setIsModalVisible(false);
      setNewTitle('');
      setDate(new Date());
    }
  };

  const EventCard = ({ id, title, time, date, type }: { id: string; title: string; time: string; date: string; type: string }) => (
    <TouchableOpacity style={styles.eventCard} activeOpacity={0.7}>
      <View style={styles.eventTimeContainer}>
        <Text style={styles.eventTimeHour}>{time.split(' ')[0]}</Text>
        <Text style={styles.eventTimeAmPm}>{time.split(' ')[1]}</Text>
      </View>
      <View style={[styles.eventIndicator, { backgroundColor: type === 'work' ? '#0B1C30' : '#4a654e' }]} />
      <View style={styles.eventDetail}>
        <Text style={styles.eventTitle}>{title}</Text>
        <View style={styles.eventMeta}>
          <Ionicons name="calendar-outline" size={12} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.eventDate}>{date}</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.actionIcon}
        onPress={() => deleteEvent(id)}
      >
        <Ionicons name="trash-outline" size={18} color={Theme.colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Events</Text>
            <Text style={styles.subtitle}>Your scheduled cognitive sessions.</Text>
          </View>
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
          {events.length > 0 ? events.map(event => (
            <EventCard 
              key={event.id}
              id={event.id}
              title={event.title}
              time={event.time}
              date={event.date}
              type={event.type}
            />
          )) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-outline" size={64} color={Theme.colors.outlineVariant} />
              <Text style={styles.emptyText}>No events scheduled</Text>
            </View>
          )}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.9}
        onPress={() => setIsModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
        <Text style={styles.fabText}>Add Event</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Event</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Event Title"
              value={newTitle}
              onChangeText={setNewTitle}
              placeholderTextColor={Theme.colors.onSurfaceVariant}
            />
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={Theme.colors.primary} />
              <Text style={styles.pickerButtonText}>{formatTime(date)}</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={Theme.colors.primary} />
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
                onPress={() => setIsModalVisible(false)} 
                style={{ flex: 1 }}
              />
              <Button 
                title="Create" 
                variant="primary" 
                onPress={handleAddEvent} 
                style={{ flex: 1 }}
              />
            </View>
          </View>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollContent: {
    paddingHorizontal: Theme.spacing.marginMobile,
    paddingBottom: 120,
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    marginBottom: 16,
    ...Theme.shadows.level1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  eventTimeContainer: {
    alignItems: 'center',
    width: 60,
  },
  eventTimeHour: {
    ...Theme.typography.displaySm,
    fontSize: 18,
    color: Theme.colors.onSurface,
    fontFamily: 'Geist-SemiBold',
  },
  eventTimeAmPm: {
    ...Theme.typography.labelCaps,
    fontSize: 9,
    color: Theme.colors.onSurfaceVariant,
    marginTop: -2,
    opacity: 0.6,
  },
  eventIndicator: {
    width: 2,
    height: 40,
    borderRadius: 1,
    marginHorizontal: 16,
    opacity: 0.3,
  },
  eventDetail: {
    flex: 1,
  },
  eventTitle: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-Medium',
    color: Theme.colors.onSurface,
    marginBottom: 4,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eventDate: {
    ...Theme.typography.bodySm,
    fontSize: 12,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.6,
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.02)',
    justifyContent: 'center',
    alignItems: 'center',
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
  modalInput: {
    height: 56,
    backgroundColor: Theme.colors.background,
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
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
  modalButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
});
