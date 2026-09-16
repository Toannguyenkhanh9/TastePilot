import React from 'react';
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTranslation} from 'react-i18next';
import {useApp} from '../context/AppContext';
import {LocationSummary} from '../components/LocationSummary';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {APP_LOCAL_BANNERS} from '../utils/localArt';
import {TasteProfileCard} from '../components/TasteProfileCard';
import {isFreeLaunchMode} from '../config/monetizationConfig';

const sampleDailyMeal = {
  id: 'sample-daily',
  name: 'Pho',
  cuisine: 'Vietnamese',
  estimatedMin: 0,
  estimatedMax: 0,
  reason: '',
  localSpecialty: true,
};

const sampleTravelMeal = {
  id: 'sample-travel',
  name: 'Sushi',
  cuisine: 'Japanese',
  estimatedMin: 0,
  estimatedMax: 0,
  reason: '',
  localSpecialty: true,
};

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const {t} = useTranslation();
  const {locationContext, isPremium} = useApp();

  return (
    <ImageBackground
      source={APP_LOCAL_BANNERS.home}
      style={styles.screen}
      imageStyle={styles.backgroundImage}>
      <View style={styles.backgroundOverlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.brand}>{t('home.brand')}</Text>

        <View style={styles.introCard}>
          <Text style={styles.kicker}>{t('home.kicker')}</Text>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.section}>
          <LocationSummary value={locationContext || null} title={t('home.lastDetectedArea')} />
        </View>

        <TasteProfileCard compact />

        <Pressable
          style={({pressed}) => [styles.surpriseCard, pressed && styles.surprisePressed]}
          onPress={() => navigation.navigate('SurpriseMe')}>
          <View style={styles.surpriseIcon}><Text style={styles.surpriseEmoji}>✨</Text></View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.surpriseTitle}>{t('homeSurpriseTitle')}</Text>
              <View style={styles.surprisePill}><Text style={styles.surprisePillText}>{t('homeSurpriseBadge')}</Text></View>
            </View>
            <Text style={styles.surpriseText}>{t('homeSurpriseText')}</Text>
          </View>
          <Text style={styles.surpriseArrow}>→</Text>
        </Pressable>

        <Pressable style={styles.entryCard} onPress={() => navigation.navigate('DailyMeal')}>
          <View style={styles.iconBox}>
            <FoodAssetIcon meal={sampleDailyMeal as any} size={58} />
          </View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.entryTitle}>{t('home.dailyCardTitle')}</Text>
              <View style={styles.smallPill}><Text style={styles.smallPillText}>{t('home.dailyCardBadge')}</Text></View>
            </View>
            <Text style={styles.entryText}>{t('home.dailyCardText')}</Text>
          </View>
          <Text style={styles.entryArrow}>→</Text>
        </Pressable>

        <Pressable style={styles.entryCard} onPress={() => navigation.navigate('TravelFood')}>
          <View style={styles.iconBox}>
            <FoodAssetIcon meal={sampleTravelMeal as any} size={58} />
          </View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.entryTitle}>{t('home.travelCardTitle')}</Text>
              <View style={styles.smallPillAlt}><Text style={styles.smallPillTextAlt}>{t('home.travelCardBadge')}</Text></View>
            </View>
            <Text style={styles.entryText}>{t('home.travelCardText')}</Text>
          </View>
          <Text style={styles.entryArrow}>→</Text>
        </Pressable>

        <Pressable style={styles.entryCard} onPress={() => navigation.navigate('GroupMode')}>
          <View style={styles.featureIconBox}><Text style={styles.featureEmoji}>👥</Text></View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.entryTitle}>{t('homeGroupTitle')}</Text>
              <View style={styles.smallPill}><Text style={styles.smallPillText}>{t('homeGroupBadge')}</Text></View>
            </View>
            <Text style={styles.entryText}>{t('homeGroupText')}</Text>
          </View>
          <Text style={styles.entryArrow}>→</Text>
        </Pressable>

        <Pressable style={styles.entryCard} onPress={() => navigation.navigate('WeeklyPlanner')}>
          <View style={styles.featureIconBox}><Text style={styles.featureEmoji}>🗓️</Text></View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.entryTitle}>{t('homePlannerTitle')}</Text>
              <View style={styles.smallPillAlt}><Text style={styles.smallPillTextAlt}>{t('homePlannerBadge')}</Text></View>
            </View>
            <Text style={styles.entryText}>{t('homePlannerText')}</Text>
          </View>
          <Text style={styles.entryArrow}>→</Text>
        </Pressable>

        {!isFreeLaunchMode() && !isPremium ? (
          <Pressable style={styles.premiumCard} onPress={() => navigation.navigate('Premium')}>
            <View style={styles.premiumIcon}><Text style={styles.premiumEmoji}>👑</Text></View>
            <View style={styles.entryCopy}>
              <Text style={styles.premiumTitle}>{t('homePremiumTitle')}</Text>
              <Text style={styles.premiumText}>{t('homePremiumText')}</Text>
            </View>
            <Text style={styles.premiumArrow}>→</Text>
          </Pressable>
        ) : null}

      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f7f2ea',
  },
  backgroundImage: {
    opacity: 0.24,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(248, 244, 237, 0.86)',
  },
  container: {
    padding: 20,
    paddingBottom: 34,
  },
  brand: {
    fontSize: 17,
    fontWeight: '900',
    color: '#325ea8',
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  introCard: {
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderWidth: 1,
    borderColor: '#eadfce',
    borderRadius: 28,
    padding: 22,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#8a6949',
  },
  title: {
    marginTop: 10,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '900',
    color: '#171717',
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: '#5d5d5d',
  },
  section: {
    marginTop: 18,
  },
  surpriseCard: {
    marginTop: 16,
    minHeight: 108,
    backgroundColor: '#1f3f75',
    borderRadius: 26,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#17315c',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  surprisePressed: {opacity: 0.88, transform: [{scale: 0.995}]},
  surpriseIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  surpriseEmoji: {fontSize: 34},
  surpriseTitle: {flex: 1, fontSize: 20, fontWeight: '900', color: '#fff', paddingRight: 8},
  surpriseText: {marginTop: 8, fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.84)'},
  surprisePill: {backgroundColor: '#ffd98a', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6},
  surprisePillText: {fontSize: 11, fontWeight: '900', color: '#63420d'},
  surpriseArrow: {marginLeft: 10, fontSize: 28, fontWeight: '900', color: '#fff'},
  premiumCard: {marginTop:16,backgroundColor:'#fff7df',borderRadius:22,padding:16,borderWidth:1,borderColor:'#e8d49a',flexDirection:'row',alignItems:'center'},
  premiumIcon: {width:52,height:52,borderRadius:16,backgroundColor:'#ffe7a6',alignItems:'center',justifyContent:'center',marginRight:12},
  premiumEmoji: {fontSize:25},
  premiumTitle: {fontSize:16,fontWeight:'900',color:'#5f4611'},
  premiumText: {fontSize:12,lineHeight:18,color:'#786334',marginTop:4},
  premiumArrow: {fontSize:24,fontWeight:'900',color:'#9b7b2e',marginLeft:8},
  entryCard: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ebdfcf',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  featureIconBox:{width:78,height:78,borderRadius:22,backgroundColor:'#eef4ff',alignItems:'center',justifyContent:'center',marginRight:14},
  featureEmoji:{fontSize:34},
  iconBox: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#fff5e5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  entryCopy: {
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: '900',
    color: '#171717',
    paddingRight: 8,
  },
  smallPill: {
    backgroundColor: '#eef4ff',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#325ea8',
  },
  smallPillAlt: {
    backgroundColor: '#fff1df',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallPillTextAlt: {
    fontSize: 12,
    fontWeight: '800',
    color: '#a86821',
  },
  entryText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: '#666',
  },
  entryArrow: {
    marginLeft: 12,
    fontSize: 28,
    fontWeight: '900',
    color: '#999',
  },
});
