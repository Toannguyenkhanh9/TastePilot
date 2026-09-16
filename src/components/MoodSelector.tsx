import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Chip} from './Chip';
import {MoodKey} from '../types';

export const MOOD_DEFS: Array<{id: MoodKey; icon: string; key: string}> = [
  {id: 'quick', icon: '⚡', key: 'moodQuick'},
  {id: 'healthy', icon: '🥗', key: 'moodHealthy'},
  {id: 'comfort', icon: '🍲', key: 'moodComfort'},
  {id: 'date_night', icon: '💛', key: 'moodDateNight'},
  {id: 'family', icon: '👨‍👩‍👧‍👦', key: 'moodFamily'},
  {id: 'late_night', icon: '🌙', key: 'moodLateNight'},
  {id: 'hot', icon: '♨️', key: 'moodHot'},
  {id: 'light', icon: '🌿', key: 'moodLight'},
];

type Props = {
  value?: MoodKey;
  onChange: (value?: MoodKey) => void;
  compact?: boolean;
};

export function MoodSelector({value, onChange, compact = false}: Props) {
  const {t} = useTranslation();
  return (
    <View style={[styles.wrap, compact && styles.wrapCompact]}>
      <Text style={styles.title}>{t('moodTitle')}</Text>
      <Text style={styles.subtitle}>{t('moodSubtitle')}</Text>
      <View style={styles.chips}>
        <Chip label={t('moodAny')} selected={!value} onPress={() => onChange(undefined)} />
        {MOOD_DEFS.map(item => (
          <Chip
            key={item.id}
            label={`${item.icon} ${t(item.key)}`}
            selected={value === item.id}
            onPress={() => onChange(value === item.id ? undefined : item.id)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap:{backgroundColor:'#fff8ed',borderRadius:20,padding:15,borderWidth:1,borderColor:'#efdfc9',marginTop:8,marginBottom:14},
  wrapCompact:{marginTop:12},
  title:{fontSize:14,fontWeight:'900',color:'#2b2b2b'},
  subtitle:{fontSize:12,lineHeight:18,color:'#756b61',marginTop:4},
  chips:{flexDirection:'row',flexWrap:'wrap',marginTop:9},
});
