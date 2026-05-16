import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface Note {
  id: string;
  title: string;
  content: string;
}

interface NoteWidgetProps {
  notes?: Note[];
}

export function NoteWidget({ notes = [] }: NoteWidgetProps) {
  const latestNote = notes[0];

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#fdfdfd',
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5eeff',
      }}
    >
      <TextWidget
        text="Quick Notes"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#0b1c30',
          marginBottom: 8,
        }}
      />

      {latestNote ? (
        <FlexWidget
          style={{
            flex: 1,
            backgroundColor: '#ffffff',
            borderRadius: 8,
            padding: 8,
          }}
        >
          <TextWidget
            text={latestNote.title}
            style={{
              fontSize: 13,
              fontWeight: 'bold',
              color: '#0b1c30',
              marginBottom: 4,
            }}
            maxLines={1}
          />
          <TextWidget
            text={latestNote.content}
            style={{
              fontSize: 12,
              color: '#444748',
            }}
            maxLines={3}
          />
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="Tap to add a note"
            style={{
              fontSize: 12,
              color: '#444748',
            }}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
