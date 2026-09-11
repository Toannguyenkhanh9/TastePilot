import React from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text} from 'react-native';

export function PrimaryButton({title, onPress, loading, disabled}: {title: string; onPress: () => void; loading?: boolean; disabled?: boolean}) {
  return (
    <Pressable disabled={disabled || loading} onPress={onPress} style={({pressed}) => [styles.button, (pressed || disabled) && styles.dim]}>
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {backgroundColor: '#171717', minHeight: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center'},
  dim: {opacity: 0.6},
  text: {color: '#fff', fontSize: 16, fontWeight: '800'},
});
