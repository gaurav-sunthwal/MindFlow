import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
}

interface EventWidgetProps {
  events?: Event[];
}

export function EventWidget({ events = [] }: EventWidgetProps) {
  const upcomingEvents = events.slice(0, 2);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0b1c30', // Darker theme for events
        borderRadius: 16,
        padding: 12,
      }}
    >
      <TextWidget
        text="Upcoming Events"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#ffffff',
          marginBottom: 8,
        }}
      />

      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event) => (
          <FlexWidget
            key={event.id}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: 8,
              marginBottom: 4,
            }}
          >
            <TextWidget
              text={event.title}
              style={{
                fontSize: 13,
                fontWeight: 'bold',
                color: '#ffffff',
              }}
              maxLines={1}
            />
            <TextWidget
              text={`${event.time} • ${event.date}`}
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.7)',
              }}
            />
          </FlexWidget>
        ))
      ) : (
        <FlexWidget
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <TextWidget
            text="Clear schedule"
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.5)',
            }}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
