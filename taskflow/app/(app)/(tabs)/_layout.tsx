import React, { useState } from 'react';
import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../../constants/Theme';
import { Platform, StyleSheet, View, TouchableOpacity, Modal, Text } from 'react-native';

export default function TabLayout() {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const router = useRouter();

  const QuickAction = ({ icon, label, color, route }: { icon: keyof typeof Ionicons.glyphMap, label: string, color: string, route: string }) => (
    <TouchableOpacity 
      style={styles.menuItem} 
      activeOpacity={0.8}
      onPress={() => {
        setIsMenuVisible(false);
        router.push(route as any);
      }}
    >
      <View style={[styles.menuIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="#ffffff" />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Theme.colors.onSurface,
          tabBarInactiveTintColor: Theme.colors.onSurfaceVariant,
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: 'rgba(0,0,0,0.05)',
            height: Platform.OS === 'ios' ? 88 : 68,
            paddingBottom: Platform.OS === 'ios' ? 30 : 12,
            paddingTop: 12,
            ...Theme.shadows.level2,
          },
          tabBarLabelStyle: {
            ...Theme.typography.labelCaps,
            fontSize: 10,
            marginTop: 4,
            letterSpacing: 0.5,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notes"
          options={{
            title: 'Notes',
            tabBarItemStyle: { marginRight: 20 },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'create' : 'create-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="placeholder"
          options={{
            title: '',
            tabBarButton: () => <View style={{ width: 110 }} />,
          }}
        />
        <Tabs.Screen
          name="documents"
          options={{
            title: 'Documents',
            tabBarItemStyle: { marginLeft: 20 },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'document-attach' : 'document-attach-outline'} size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
            ),
          }}
        />
        {/* Hidden Screens */}
        <Tabs.Screen
          name="tasks"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="events"
          options={{
            href: null,
          }}
        />
      </Tabs>

      {/* Central Plus Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => setIsMenuVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={32} color="#ffffff" />
      </TouchableOpacity>

      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setIsMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuGrid}>
              <QuickAction icon="checkbox-outline" label="New Task" color="#4a654e" route="/tasks" />
              <QuickAction icon="calendar-outline" label="Set Event" color="#000000" route="/events" />
              <QuickAction icon="create-outline" label="Write Note" color="#0B1C30" route="/notes" />
              <QuickAction icon="scan-outline" label="Scan Doc" color="#ba1a1a" route="/documents" />
            </View>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsMenuVisible(false)}
            >
              <Ionicons name="close" size={32} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Theme.colors.onSurface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.level2,
    zIndex: 10,
    borderWidth: 4,
    borderColor: '#ffffff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 28, 48, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 60,
  },
  menuItem: {
    width: 100,
    alignItems: 'center',
  },
  menuIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Theme.shadows.level1,
  },
  menuLabel: {
    ...Theme.typography.labelCaps,
    color: '#ffffff',
    fontSize: 11,
    letterSpacing: 1,
  },
  closeButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
