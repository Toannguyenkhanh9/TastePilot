import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';

type Props = {
  eyebrow?: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badges?: string[];
  height?: number;
};

export function ProductionBanner({eyebrow, title, subtitle, imageUrl, badges = [], height = 244}: Props) {
  return (
    <ImageBackground source={{uri: imageUrl}} style={[styles.wrap, {height}]} imageStyle={styles.image}>
      <View style={styles.overlay} />
      <View style={styles.glow} />
      <View style={styles.content}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {badges.length ? (
          <View style={styles.badges}>
            {badges.map(badge => (
              <Text key={badge} style={styles.badge}>{badge}</Text>
            ))}
          </View>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 30,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    marginBottom: 18,
  },
  image: {borderRadius: 30},
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  glow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -30,
    right: -20,
  },
  content: {padding: 22},
  eyebrow: {fontSize: 12, color: '#ffffff', fontWeight: '900', letterSpacing: 1.3, opacity: 0.95},
  title: {fontSize: 30, lineHeight: 36, fontWeight: '900', color: '#fff', marginTop: 8},
  subtitle: {fontSize: 14, lineHeight: 21, color: 'rgba(255,255,255,0.92)', marginTop: 8, maxWidth: '92%'},
  badges: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 14},
  badge: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
});
