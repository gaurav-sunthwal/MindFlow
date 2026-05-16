'widget';

import { createWidget } from 'expo-widgets';
import { Text, VStack, HStack, Spacer } from '@expo/ui/swift-ui';

// iOS Widgets using expo-widgets and @expo/ui
// Rewritten as named functions to avoid Babel parsing issues

// 1. Task Widget
function TaskWidgetComponent(props: { tasks?: any[] }) {
  const tasks = props.tasks || [];
  return (
    <VStack style={{ flex: 1, padding: 16, backgroundColor: '#f8f9ff', gap: 8 }}>
      <HStack>
        <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0b1c30' }}>Tasks</Text>
        <Spacer />
        <Text style={{ fontSize: 12, color: '#4a654e' }}>{tasks.length} pending</Text>
      </HStack>
      
      {tasks.slice(0, 3).map((task: any, i: number) => (
        <VStack key={i} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 8 }}>
          <Text style={{ fontSize: 13, color: '#0b1c30' }}>{task.title}</Text>
        </VStack>
      ))}
      
      {tasks.length === 0 && (
        <Text style={{ fontSize: 12, color: '#444748', textAlign: 'center' }}>All caught up!</Text>
      )}
    </VStack>
  );
}
export const taskWidget = createWidget('TaskWidget', TaskWidgetComponent);

// 2. Doc Widget
function DocWidgetComponent(props: { documents?: any[] }) {
  const docs = props.documents || [];
  return (
    <VStack style={{ flex: 1, padding: 16, backgroundColor: '#e5eeff', gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0b1c30' }}>Vault</Text>
      {docs.slice(0, 3).map((doc: any, i: number) => (
        <HStack key={i} style={{ backgroundColor: '#ffffff', borderRadius: 8, padding: 8, gap: 8 }}>
          <Text>{doc.type === 'pdf' ? '📄' : '🖼️'}</Text>
          <Text style={{ fontSize: 13, color: '#0b1c30' }}>{doc.name}</Text>
        </HStack>
      ))}
    </VStack>
  );
}
export const docWidget = createWidget('DocWidget', DocWidgetComponent);

// 3. Event Widget
function EventWidgetComponent(props: { events?: any[] }) {
  const events = props.events || [];
  return (
    <VStack style={{ flex: 1, padding: 16, backgroundColor: '#0b1c30', gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#ffffff' }}>Events</Text>
      {events.slice(0, 2).map((event: any, i: number) => (
        <VStack key={i} style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 8 }}>
          <Text style={{ fontSize: 13, color: '#ffffff', fontWeight: 'bold' }}>{event.title}</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{event.time} • {event.date}</Text>
        </VStack>
      ))}
    </VStack>
  );
}
export const eventWidget = createWidget('EventWidget', EventWidgetComponent);

// 4. Note Widget
function NoteWidgetComponent(props: { notes?: any[] }) {
  const notes = props.notes || [];
  const latestNote = notes[0];
  return (
    <VStack style={{ flex: 1, padding: 16, backgroundColor: '#ffffff', gap: 8 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0b1c30' }}>Notes</Text>
      {latestNote ? (
        <VStack style={{ backgroundColor: '#f8f9ff', borderRadius: 8, padding: 10 }}>
          <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#0b1c30' }}>{latestNote.title}</Text>
          <Text style={{ fontSize: 12, color: '#444748' }}>{latestNote.content}</Text>
        </VStack>
      ) : (
        <Text style={{ fontSize: 12, color: '#444748' }}>No notes yet</Text>
      )}
    </VStack>
  );
}
export const noteWidget = createWidget('NoteWidget', NoteWidgetComponent);
