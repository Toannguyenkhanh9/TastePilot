import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';

export function ModeCard({emoji, title, subtitle, onPress}: {emoji: string; title: string; subtitle: string; onPress: () => void}) {
  return (
    <Pressable onPress={onPress} style={({pressed}) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.icon}><Text style={styles.emoji}>{emoji}</Text></View>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {backgroundColor: '#fff', borderRadius: 22, padding: 18, flexDirection: 'row', alignItems: 'center', marginBottom: 14, borderWidth: 1, borderColor: '#ececec'},
  pressed: {opacity: 0.75},
  icon: {width: 56, height: 56, borderRadius: 18, backgroundColor: '#f7f7f7', alignItems: 'center', justifyContent: 'center'},
  emoji: {fontSize: 28},
  copy: {flex: 1, paddingHorizontal: 14},
  title: {fontSize: 18, fontWeight: '800', color: '#171717'},
  subtitle: {fontSize: 13, color: '#6f6f6f', marginTop: 5, lineHeight: 18},
  arrow: {fontSize: 30, color: '#9a9a9a'},
});
