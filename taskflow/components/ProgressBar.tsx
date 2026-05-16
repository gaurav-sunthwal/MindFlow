import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Theme from '../constants/Theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  color?: string;
  style?: ViewStyle;
}

export default function ProgressBar({ 
  progress, 
  color = Theme.colors.primary, 
  style 
}: ProgressBarProps) {
  return (
    <View style={[styles.track, style]}>
      <View 
        style={[
          styles.fill, 
          { 
            width: `${Math.min(1, Math.max(0, progress)) * 100}%`,
            backgroundColor: color 
          }
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: '#F2F2F1',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
});
