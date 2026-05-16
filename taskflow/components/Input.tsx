import React, { useState } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TextInputProps,
  Pressable 
} from 'react-native';
import Theme from '../constants/Theme';

interface InputProps extends TextInputProps {
  label?: string;
  containerStyle?: ViewStyle;
}

const Input = React.forwardRef<TextInput, InputProps>(({ 
  label, 
  containerStyle, 
  style, 
  onFocus,
  onBlur,
  ...props 
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const internalRef = React.useRef<TextInput>(null);

  // Sync the forwarded ref with our internal ref
  React.useImperativeHandle(ref, () => internalRef.current!);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable 
        onPress={() => internalRef.current?.focus()}
        style={[
          styles.inputWrapper,
          isFocused && styles.inputFocused
        ]}
      >
        <TextInput
          ref={internalRef}
          style={[styles.input, style]}
          placeholderTextColor={Theme.colors.onSurfaceVariant}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
      </Pressable>
    </View>
  );
});

export default Input;

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.gutter,
  },
  label: {
    ...Theme.typography.labelCaps,
    color: Theme.colors.onSurfaceVariant,
    marginBottom: Theme.spacing.base,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#F2F2F1',
    borderRadius: Theme.rounding.md,
    height: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  inputFocused: {
    backgroundColor: '#ffffff',
    ...Theme.shadows.level1,
  },
  input: {
    flex: 1,
    ...Theme.typography.bodyLg,
    color: Theme.colors.onSurface,
    height: '100%',
  },
});
