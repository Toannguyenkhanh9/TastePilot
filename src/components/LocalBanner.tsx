import React from 'react';
import {
  ImageBackground,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  imageSource: ImageSourcePropType;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badges?: string[];
  height?: number;
};

export function LocalBanner({
  imageSource,
  eyebrow,
  title,
  subtitle,
  badges = [],
  height = 188,
}: Props) {
  const resolvedHeight = Math.max(height, 188);

  return (
    <ImageBackground
      source={imageSource}
      style={[styles.wrap, {height: resolvedHeight}]}
      imageStyle={styles.image}>
      <View style={styles.imageTint} />
      <View style={styles.imageShade} />

      <View style={styles.panel}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

        {badges.length ? (
          <View style={styles.badges}>
            {badges.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.badge}>
                {item}
              </Text>
            ))}
          </View>
        ) : null}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 18,
    justifyContent: 'center',
    backgroundColor: '#eddccf',
  },
  image: {
    borderRadius: 28,
  },
  imageTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 246, 236, 0.18)',
  },
  imageShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(45, 28, 16, 0.10)',
  },
  panel: {
    marginLeft: 16,
    width: '58%',
    maxWidth: 340,
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: 'rgba(255, 248, 241, 0.80)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#8e5734',
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: '900',
    color: '#22150f',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 19,
    color: '#49362b',
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
  },
  badge: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(243, 120, 64, 0.10)',
    color: '#8e5734',
    fontSize: 11,
    fontWeight: '900',
  },
});
