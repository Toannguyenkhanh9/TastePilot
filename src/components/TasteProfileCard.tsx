import React, {useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useApp} from '../context/AppContext';
import {buildTasteProfile} from '../services/tasteProfileService';
import {localizeCuisine} from '../services/dishLocalizationService';

type Props = {
  compact?: boolean;
  appearance?: 'default' | 'home';
};

export function TasteProfileCard({compact = false, appearance = 'default'}: Props) {
  const {t} = useTranslation();
  const {history, profile} = useApp();
  const learned = useMemo(() => buildTasteProfile(history), [history]);
  const topCuisines = learned.topCuisines
    .map(item => localizeCuisine(item, profile.locale))
    .join(' · ');

  return (
    <View style={[styles.card, compact && styles.cardCompact, appearance === 'home' && styles.cardHome]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBubble, appearance === 'home' && styles.iconBubbleHome]}>
          <Text style={styles.icon}>🧠</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, appearance === 'home' && styles.titleHome]}>{t('smartTasteTitle')}</Text>
          <Text style={styles.subtitle}>{t('smartTasteSubtitle')}</Text>
        </View>
        {learned.historyCount > 0 ? (
          <View style={styles.confidencePill}>
            <Text style={styles.confidenceText}>
              {Math.round(learned.confidence * 100)}%
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={styles.status}>
        {learned.historyCount === 0
          ? t('smartTasteLearning')
          : t('smartTasteLearned', {
              count: learned.historyCount,
              feedback: learned.feedbackCount,
            })}
      </Text>

      {topCuisines ? (
        <Text style={[styles.topLine, appearance === 'home' && styles.topLineHome]}>
          {t('smartTasteTopCuisines', {cuisines: topCuisines})}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#efd9cc',
    marginTop: 14,
    marginBottom: 14,
  },
  cardCompact: {
    marginTop: 16,
    marginBottom: 0,
  },
  cardHome: {backgroundColor: '#fff8f2', borderColor: '#f1d7c7', shadowColor: '#b86645', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: {width: 0, height: 5}, elevation: 2},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ffe9df',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  iconBubbleHome: {backgroundColor: '#ffe4d8'},
  icon: {fontSize: 21},
  headerCopy: {flex: 1},
  title: {fontSize: 15, fontWeight: '900', color: '#171717'},
  titleHome: {color: '#382018'},
  subtitle: {fontSize: 12, lineHeight: 17, color: '#667085', marginTop: 2},
  confidencePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#e8f6ec',
  },
  confidenceText: {fontSize: 12, fontWeight: '900', color: '#237a43'},
  status: {fontSize: 13, lineHeight: 20, color: '#4f5662', marginTop: 12},
  topLine: {fontSize: 12, lineHeight: 18, fontWeight: '800', color: '#c5522f', marginTop: 7},
  topLineHome: {color: '#c45231'},
});
