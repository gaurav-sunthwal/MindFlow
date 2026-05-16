import React, { useState, useCallback } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Dimensions,
  Platform,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Theme from '../../../constants/Theme';
import { useAuth } from '../../../context/AuthContext';
import { useTasks } from '../../../context/TaskContext';
import { useEvents } from '../../../context/EventContext';
import { useNotes } from '../../../context/NoteContext';
import { useDocuments } from '../../../context/DocumentContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../utils/supabase';
import { api } from '../../../utils/api';

const { width, height } = Dimensions.get('window');

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut, refreshUser } = useAuth();
  const { pendingCount, refreshTasks } = useTasks();
  const { events, refreshEvents } = useEvents();
  const { notes, refreshNotes } = useNotes();
  const { refreshDocuments } = useDocuments();
  const [refreshing, setRefreshing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  // Keep local avatar sync with user metadata updates
  React.useEffect(() => {
    if (user?.user_metadata?.avatar_url) {
      setAvatarUrl(user.user_metadata.avatar_url);
    }
  }, [user?.user_metadata?.avatar_url]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      refreshTasks(),
      refreshEvents(),
      refreshNotes(),
      refreshDocuments()
    ]);
    setRefreshing(false);
  }, [refreshTasks, refreshEvents, refreshNotes, refreshDocuments]);
 
  const handleAvatarUpload = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingAvatar(true);
        const asset = result.assets[0];
        const fileExt = asset.uri.split('.').pop();
        const fileName = `${user?.id}/avatar_${Date.now()}.${fileExt}`;
        const filePath = fileName;

        const formData = new FormData();
        formData.append('file', {
          uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
          name: fileName,
          type: `image/${fileExt}`,
        } as any);

        const { data, error: uploadError } = await supabase.storage
          .from('profile-pic')
          .upload(filePath, formData, {
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pic')
          .getPublicUrl(filePath);

        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });

        if (updateError) throw updateError;

        // ALSO update the database profiles table
        await api.profile.update({ avatarUrl: publicUrl });
        
        // Update local state for immediate feedback
        setAvatarUrl(publicUrl);
        
        // Refresh the global auth state so other screens (like Home) update too
        await refreshUser();
        
        Alert.alert('Success', 'Profile picture updated successfully!');
      }
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload profile picture');
    } finally {
      setIsUploadingAvatar(false);
    }
  };
 

  const StatItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const PreferenceItem = ({ icon, label, onPress, isDestructive = false }: { 
    icon: keyof typeof Ionicons.glyphMap; 
    label: string; 
    onPress?: () => void;
    isDestructive?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.preferenceItem} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.preferenceLeft}>
        <View style={[
          styles.iconContainer, 
          isDestructive && { backgroundColor: Theme.colors.errorContainer }
        ]}>
          <Ionicons 
            name={icon} 
            size={22} 
            color={isDestructive ? Theme.colors.error : Theme.colors.onSurfaceVariant} 
          />
        </View>
        <Text style={[
          styles.preferenceLabel, 
          isDestructive && { color: Theme.colors.error, fontFamily: 'Geist-Medium' }
        ]}>
          {label}
        </Text>
      </View>
      {!isDestructive && (
        <Ionicons name="chevron-forward" size={18} color={Theme.colors.outlineVariant} />
      )}
    </TouchableOpacity>
  );

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const userEmail = user?.email || 'No email';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={Theme.colors.primary}
            colors={[Theme.colors.primary]}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerBackground} />
          
          <View style={styles.avatarContainer}>
            {isUploadingAvatar ? (
              <View style={[styles.avatar, styles.loadingAvatar]}>
                <ActivityIndicator color={Theme.colors.primary} />
              </View>
            ) : (
              <Image 
                source={avatarUrl ? { uri: avatarUrl } : require('../../../assets/images/profile_avatar.png')} 
                style={styles.avatar}
              />
            )}
            <TouchableOpacity 
              style={styles.cameraButton} 
              activeOpacity={0.9}
              onPress={handleAvatarUpload}
              disabled={isUploadingAvatar}
            >
              <Ionicons name="camera" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
          
          <TouchableOpacity 
            style={styles.changePhotoButton} 
            activeOpacity={0.6}
            onPress={handleAvatarUpload}
            disabled={isUploadingAvatar}
          >
            <Text style={styles.changePhotoText}>{isUploadingAvatar ? 'UPLOADING...' : 'CHANGE PHOTO'}</Text>
            <View style={styles.underline} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsCard}>
          <StatItem label="NOTES" value={notes.length.toString()} />
          <View style={styles.divider} />
          <StatItem label="PENDING" value={pendingCount.toString()} />
          <View style={styles.divider} />
          <StatItem label="EVENTS" value={events.length.toString()} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          <View style={styles.card}>
            <PreferenceItem icon="person-outline" label="Account" />
            <View style={styles.itemSeparator} />
            <PreferenceItem icon="notifications-outline" label="Notifications" />
            <View style={styles.itemSeparator} />
            <PreferenceItem icon="lock-closed-outline" label="Privacy" />
            <View style={styles.itemSeparator} />
            <PreferenceItem icon="scan-outline" label="Focus Settings" />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <PreferenceItem icon="help-circle-outline" label="Support" />
            <View style={styles.itemSeparator} />
            <PreferenceItem 
              icon="log-out-outline" 
              label="Log Out" 
              onPress={signOut}
              isDestructive
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 32,
    position: 'relative',
  },
  headerBackground: {
    position: 'absolute',
    top: -height * 0.5,
    left: 0,
    right: 0,
    height: height,
    backgroundColor: '#000000',
    opacity: 0.03,
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.5 }],
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
    ...Theme.shadows.level2,
  },
  avatar: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 6,
    borderColor: '#ffffff',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#1c1c1c',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#ffffff',
    ...Theme.shadows.level1,
  },
  loadingAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  name: {
    ...Theme.typography.headlineLg,
    color: Theme.colors.onSurface,
    fontSize: 28,
    marginBottom: 4,
  },
  email: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurfaceVariant,
    opacity: 0.7,
    marginBottom: 20,
  },
  changePhotoButton: {
    paddingVertical: 4,
  },
  changePhotoText: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurface,
    letterSpacing: 2,
    fontSize: 11,
  },
  underline: {
    height: 1,
    backgroundColor: Theme.colors.onSurface,
    marginTop: 2,
    width: '100%',
    opacity: 0.2,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginHorizontal: Theme.spacing.marginMobile,
    borderRadius: 24,
    paddingVertical: 24,
    justifyContent: 'space-around',
    alignItems: 'center',
    ...Theme.shadows.level1,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurfaceVariant,
    fontSize: 10,
    marginBottom: 8,
    opacity: 0.6,
  },
  statValue: {
    ...Theme.typography.displayMd,
    fontSize: 32,
    color: Theme.colors.onSurface,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Theme.colors.outlineVariant,
    opacity: 0.3,
  },
  section: {
    marginHorizontal: Theme.spacing.marginMobile,
    marginBottom: 24,
  },
  sectionTitle: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurfaceVariant,
    fontSize: 11,
    marginBottom: 12,
    marginLeft: 8,
    letterSpacing: 1.5,
    opacity: 0.6,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    overflow: 'hidden',
    ...Theme.shadows.level1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Theme.colors.surfaceContainerLow,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preferenceLabel: {
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
    fontFamily: 'Geist-Medium',
  },
  itemSeparator: {
    height: 1,
    backgroundColor: Theme.colors.outlineVariant,
    marginLeft: 76,
    opacity: 0.2,
  },
});
