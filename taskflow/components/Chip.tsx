import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Theme from '../constants/Theme';

interface ChipProps {
  label: string;
  color?: string;
  style?: ViewStyle;
}

export default function Chip({ 
  label, 
  color = Theme.colors.secondary, 
  style 
}: ChipProps) {
  return (
    <View style={[
      styles.chip, 
      { backgroundColor: `${color}1A` }, // 10% opacity
      style
    ]}>
      <Text style={[styles.text, { color }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.rounding.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...Theme.typography.bodySm,
    fontFamily: 'Geist-Medium',
    fontSize: 12,
  },
});
