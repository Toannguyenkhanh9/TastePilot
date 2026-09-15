import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function Chip({label, selected, onPress}: {label: string; selected?: boolean; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.selected]}>
      {selected ? <View style={styles.dot} /> : null}
      <Text style={[styles.label, selected && styles.selectedLabel]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: '#f2f2f2',
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selected: {backgroundColor: '#171717'},
  dot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: '#9ee6b8',
    marginRight: 8,
  },
  label: {color: '#4f4f4f', fontWeight: '700'},
  selectedLabel: {color: '#fff'},
});
