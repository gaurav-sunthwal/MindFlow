import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
import { requestWidgetUpdate } from 'react-native-android-widget';
import { TaskWidget } from '../widgets/android/TaskWidget';
import { DocWidget } from '../widgets/android/DocWidget';
import { EventWidget } from '../widgets/android/EventWidget';
import { NoteWidget } from '../widgets/android/NoteWidget';
import React from 'react';

export const updateAllWidgets = async (data: {
  tasks?: any[];
  documents?: any[];
  events?: any[];
  notes?: any[];
}) => {
  // Update Android Widgets
  if (Platform.OS === 'android') {
    try {
      if (data.tasks) {
        await requestWidgetUpdate({
          widgetName: 'TaskWidget',
          renderWidget: () => <TaskWidget tasks={data.tasks} />,
          widgetIndex: 0,
        });
      }
      if (data.documents) {
        await requestWidgetUpdate({
          widgetName: 'DocWidget',
          renderWidget: () => <DocWidget documents={data.documents} />,
          widgetIndex: 0,
        });
      }
      if (data.events) {
        await requestWidgetUpdate({
          widgetName: 'EventWidget',
          renderWidget: () => <EventWidget events={data.events} />,
          widgetIndex: 0,
        });
      }
      if (data.notes) {
        await requestWidgetUpdate({
          widgetName: 'NoteWidget',
          renderWidget: () => <NoteWidget notes={data.notes} />,
          widgetIndex: 0,
        });
      }
      console.log('Android widgets updated with live data');
    } catch (error) {
      console.error('Error updating Android widgets:', error);
    }
  }

  // Update iOS Widgets
  if (Platform.OS === 'ios' && !isExpoGo) {
    try {
      const { taskWidget, docWidget, eventWidget, noteWidget } = require('../widgets/ios/index');
      
      if (data.tasks) {
        taskWidget.updateSnapshot({ tasks: data.tasks });
      }
      if (data.documents) {
        docWidget.updateSnapshot({ documents: data.documents });
      }
      if (data.events) {
        eventWidget.updateSnapshot({ events: data.events });
      }
      if (data.notes) {
        noteWidget.updateSnapshot({ notes: data.notes });
      }
      console.log('iOS widgets updated with live data');
    } catch (error) {
      console.error('Error updating iOS widgets:', error);
    }
  }
};
