import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Theme from '../constants/Theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: Theme.rounding.lg, // 16px
    padding: Theme.spacing.gutter,
    ...Theme.shadows.level1,
  },
});
