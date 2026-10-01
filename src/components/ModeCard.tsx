import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

type Props = {
  emoji: string;
  title: string;
  subtitle: string;
  onPress: () => void;
};

export function ModeCard({emoji, title, subtitle, onPress}: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffdf9',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efded1',
    marginBottom: 14,
  },
  emojiWrap: {width: 56, height: 56, borderRadius: 18, backgroundColor: '#fff4de', alignItems: 'center', justifyContent: 'center'},
  emoji: {fontSize: 28},
  copy: {flex: 1, marginLeft: 13},
  title: {fontSize: 17, fontWeight: '900', color: '#171717'},
  subtitle: {fontSize: 13, lineHeight: 19, color: '#6e6e6e', marginTop: 4},
  arrow: {fontSize: 20, fontWeight: '800', color: '#d95f38', marginLeft: 10},
});
