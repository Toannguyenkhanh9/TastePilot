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
    backgroundColor: '#171717',
    minHeight: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  light: {backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e4e4e4'},
  accent: {backgroundColor: '#2457a7'},
  dim: {opacity: 0.6},
  text: {color: '#fff', fontSize: 16, fontWeight: '800'},
  lightText: {color: '#171717'},
});
