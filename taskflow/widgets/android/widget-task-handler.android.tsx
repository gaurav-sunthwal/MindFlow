import { WidgetTaskHandlerProps, registerWidgetTaskHandler } from 'react-native-android-widget';
import { TaskWidget } from './TaskWidget';
import { DocWidget } from './DocWidget';
import { EventWidget } from './EventWidget';
import { NoteWidget } from './NoteWidget';
import React from 'react';

export const widgetTaskHandler = async (props: WidgetTaskHandlerProps) => {
  const { widgetName, widgetAction } = props;

  // In a real app, you would fetch data from shared storage or an API here
  // For now, we'll use placeholder data or try to read from a shared file if available
  const mockTasks = [
    { id: '1', title: 'Complete Widget implementation', completed: false, category: 'Work' },
    { id: '2', title: 'Review PRs', completed: false, category: 'Work' },
  ];

  const mockDocs = [
    { id: '1', name: 'Invoice_May.pdf', type: 'pdf' },
    { id: '2', name: 'Profile_Pic.png', type: 'image' },
  ];

  const mockEvents = [
    { id: '1', title: 'Design Sync', time: '10:00 AM', date: 'May 16' },
  ];

  const mockNotes = [
    { id: '1', title: 'Ideas for v2', content: 'Add more widgets and dark mode support.' },
  ];

  switch (widgetName) {
    case 'TaskWidget':
      props.renderWidget(<TaskWidget tasks={mockTasks} />);
      break;
    case 'DocWidget':
      props.renderWidget(<DocWidget documents={mockDocs} />);
      break;
    case 'EventWidget':
      props.renderWidget(<EventWidget events={mockEvents} />);
      break;
    case 'NoteWidget':
      props.renderWidget(<NoteWidget notes={mockNotes} />);
      break;
  }
};
