import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle} from 'react-native';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'dark' | 'light' | 'accent';
  style?: ViewStyle;
};

export function PrimaryButton({title, onPress, loading, disabled, variant = 'dark', style}: Props) {
  return (
    <Pressable
      disabled={disabled || loading}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'light' && styles.light,
        variant === 'accent' && styles.accent,
        (pressed || disabled) && styles.dim,
        style,
      ]}>
      {loading ? <ActivityIndicator color={variant === 'light' ? '#171717' : '#fff'} /> : (
        <Text style={[styles.text, variant === 'light' && styles.lightText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#d95f38',
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  light: {backgroundColor: '#fffdf9', borderWidth: 1, borderColor: '#efd8ca'},
  accent: {backgroundColor: '#d95f38'},
  dim: {opacity: 0.6},
  text: {color: '#fff', fontSize: 16, fontWeight: '800'},
  lightText: {color: '#7f3f2c'},
});
