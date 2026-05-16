import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface Document {
  id: string;
  name: string;
  type: string;
}

interface DocWidgetProps {
  documents?: Document[];
}

export function DocWidget({ documents = [] }: DocWidgetProps) {
  const recentDocs = documents.slice(0, 3);

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
      <TextWidget
        text="Recent Docs"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#0b1c30',
          marginBottom: 8,
        }}
      />

      {recentDocs.length > 0 ? (
        recentDocs.map((doc) => (
          <FlexWidget
            key={doc.id}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 8,
              marginBottom: 4,
            }}
          >
            <TextWidget
              text={doc.type === 'pdf' ? '📄' : '🖼️'}
              style={{ fontSize: 16, marginRight: 8 }}
            />
            <TextWidget
              text={doc.name}
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
            text="No documents yet"
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
