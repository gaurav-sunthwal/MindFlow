import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator 
} from 'react-native';
import Theme from '../constants/Theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary && styles.primaryButton,
        isSecondary && styles.secondaryButton,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? Theme.colors.onPrimary : Theme.colors.primary} />
      ) : (
        <Text
          style={[
            styles.text,
            isPrimary && styles.primaryText,
            isSecondary && styles.secondaryText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52, // Substantial feel (min 48px)
    borderRadius: Theme.rounding.lg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.gutter,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    // High-end secondary has subtle shadow on interaction in the spec
    // but here we keep it clean.
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...Theme.typography.bodyLg,
    fontFamily: 'Geist-SemiBold',
    fontSize: 16,
  },
  primaryText: {
    color: Theme.colors.onPrimary,
  },
  secondaryText: {
    color: Theme.colors.primary,
  },
});
