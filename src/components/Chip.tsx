import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

export function Chip({label, selected, onPress}: {label: string; selected?: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f0f0f0', marginRight: 8, marginBottom: 8},
  selected: {backgroundColor: '#171717'},
  label: {color: '#4f4f4f', fontWeight: '700'},
  selectedLabel: {color: '#fff'},
});
