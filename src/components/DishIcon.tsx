import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {getMealTheme} from '../utils/foodArt';
import {MealSuggestion} from '../types';

export function DishIcon({meal, size = 46}: {meal?: Partial<MealSuggestion>; size?: number}) {
  const theme = getMealTheme(meal);
  return (
    <View style={[styles.wrap, {width: size, height: size, borderRadius: size / 2, backgroundColor: theme.accentSoft}]}> 
      <Text style={[styles.emoji, {fontSize: size * 0.5}]}>{theme.emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {textAlign: 'center'},
});
