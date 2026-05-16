import React from 'react';
import { FlexWidget, TextWidget, SvgWidget } from 'react-native-android-widget';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: string;
}

interface TaskWidgetProps {
  tasks?: Task[];
}

export function TaskWidget({ tasks = [] }: TaskWidgetProps) {
  const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#f8f9ff',
        borderRadius: 16,
        padding: 12,
      }}
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <TextWidget
          text="Pending Tasks"
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: '#0b1c30',
          }}
        />
        <TextWidget
          text={`${pendingTasks.length}`}
          style={{
            fontSize: 12,
            color: '#4a654e',
            backgroundColor: '#c9e8cb',
            paddingHorizontal: 6,
            paddingVertical: 2,
            borderRadius: 8,
          }}
        />
      </FlexWidget>

      {pendingTasks.length > 0 ? (
        pendingTasks.map((task) => (
          <FlexWidget
            key={task.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 8,
              marginBottom: 4,
            }}
          >
            <FlexWidget
              style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#747878',
                marginRight: 8,
              }}
            />
            <TextWidget
              text={task.title}
              style={{
                fontSize: 13,
                color: '#0b1c30',
                flex: 1,
              }}
              maxLines={1}
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
            text="All caught up! 🎉"
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
