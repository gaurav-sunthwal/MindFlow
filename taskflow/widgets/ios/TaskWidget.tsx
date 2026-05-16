import React from 'react';
import { Widget, Text, Stack, Spacer } from 'expo-widgets';

// Note: expo-widgets uses a subset of components that map to SwiftUI
// This is specifically for iOS

export function TaskWidgetIOS({ tasks = [] }) {
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <Widget>
      <Stack style={{ padding: 16, backgroundColor: '#f8f9ff' }}>
        <Stack direction="horizontal" style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#0b1c30' }}>
            Tasks
          </Text>
          <Spacer />
          <Text style={{ fontSize: 12, color: '#4a654e' }}>
            {pendingTasks.length} pending
          </Text>
        </Stack>
        
        <Spacer size={8} />

        {pendingTasks.map((task, index) => (
          <Stack 
            key={task.id} 
            style={{ 
              backgroundColor: '#ffffff', 
              borderRadius: 8, 
              padding: 8, 
              marginBottom: 4 
            }}
          >
            <Text style={{ fontSize: 14, color: '#0b1c30' }} numberOfLines={1}>
              {task.title}
            </Text>
          </Stack>
        ))}
        
        {pendingTasks.length === 0 && (
          <Text style={{ fontSize: 12, color: '#444748', textAlign: 'center' }}>
            All tasks completed!
          </Text>
        )}
      </Stack>
    </Widget>
  );
}
