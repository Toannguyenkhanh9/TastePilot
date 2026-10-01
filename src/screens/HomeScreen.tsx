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
        <View style={styles.brandRow}>
          <View style={styles.brandMark}><Text style={styles.brandMarkText}>T</Text></View>
          <Text style={styles.brand}>{t('home.brand')}</Text>
          <View style={styles.brandLeaf}><Text style={styles.brandLeafText}>🌿</Text></View>
        </View>

        <View style={styles.introCard}>
          <View style={styles.heroBlobOne} />
          <View style={styles.heroBlobTwo} />
          <Text style={styles.kicker}>{t('home.kicker')}</Text>
          <View style={styles.heroRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.title}>{t('home.title')}</Text>
              <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
            </View>
            <View style={styles.heroFood}>
              <View style={styles.heroFoodRing}>
                <FoodAssetIcon meal={sampleDailyMeal as any} size={108} />
              </View>
              <Text style={styles.heroSpark}>✦</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <LocationSummary value={locationContext || null} title={t('home.lastDetectedArea')} appearance="home" />
        </View>

        <TasteProfileCard compact appearance="home" />

        <Pressable
          style={({pressed}) => [styles.surpriseCard, pressed && styles.surprisePressed]}
          onPress={() => navigation.navigate('SurpriseMe')}>
          <View style={styles.surpriseIcon}>
            <FoodAssetIcon meal={sampleDailyMeal as any} size={70} />
          </View>
          <View style={styles.entryCopy}>
            <View style={styles.cardTopRow}>
              <Text style={styles.surpriseTitle}>{t('homeSurpriseTitle')}</Text>
              <View style={styles.surprisePill}><Text style={styles.surprisePillText}>{t('homeSurpriseBadge')}</Text></View>
            </View>
            <Text style={styles.surpriseText}>{t('homeSurpriseText')}</Text>
          </View>
          <Text style={styles.surpriseArrow}>→</Text>
        </Pressable>

        <View style={styles.featureGrid}>
          <Pressable style={[styles.featureCard, styles.searchFeature]} onPress={() => navigation.navigate('FoodSearch')}>
            <View style={[styles.featureIconBox, styles.searchIcon]}><Text style={styles.featureEmoji}>🔎</Text></View>
            <View style={styles.featureBody}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{t('homeSearchTitle')}</Text>
                <Text style={styles.featureArrow}>›</Text>
              </View>
              <Text style={styles.featureText}>{t('homeSearchText')}</Text>
              <View style={styles.searchBadge}><Text style={styles.searchBadgeText}>{t('homeSearchBadge')}</Text></View>
            </View>
          </Pressable>

          <Pressable style={[styles.featureCard, styles.dailyFeature]} onPress={() => navigation.navigate('DailyMeal')}>
            <View style={[styles.featureIconBox, styles.dailyIcon]}>
              <FoodAssetIcon meal={sampleDailyMeal as any} size={48} />
            </View>
            <View style={styles.featureBody}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{t('home.dailyCardTitle')}</Text>
                <Text style={[styles.featureArrow, styles.dailyArrow]}>›</Text>
              </View>
              <Text style={styles.featureText}>{t('home.dailyCardText')}</Text>
              <View style={styles.dailyBadge}><Text style={styles.dailyBadgeText}>{t('home.dailyCardBadge')}</Text></View>
            </View>
          </Pressable>

          <Pressable style={[styles.featureCard, styles.travelFeature]} onPress={() => navigation.navigate('TravelFood')}>
            <View style={[styles.featureIconBox, styles.travelIcon]}>
              <FoodAssetIcon meal={sampleTravelMeal as any} size={48} />
            </View>
            <View style={styles.featureBody}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{t('home.travelCardTitle')}</Text>
                <Text style={[styles.featureArrow, styles.travelArrow]}>›</Text>
              </View>
              <Text style={styles.featureText}>{t('home.travelCardText')}</Text>
              <View style={styles.travelBadge}><Text style={styles.travelBadgeText}>{t('home.travelCardBadge')}</Text></View>
            </View>
          </Pressable>

          <Pressable style={[styles.featureCard, styles.groupFeature]} onPress={() => navigation.navigate('GroupMode')}>
            <View style={[styles.featureIconBox, styles.groupIcon]}><Text style={styles.featureEmoji}>👥</Text></View>
            <View style={styles.featureBody}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{t('homeGroupTitle')}</Text>
                <Text style={[styles.featureArrow, styles.groupArrow]}>›</Text>
              </View>
              <Text style={styles.featureText}>{t('homeGroupText')}</Text>
              <View style={styles.groupBadge}><Text style={styles.groupBadgeText}>{t('homeGroupBadge')}</Text></View>
            </View>
          </Pressable>

          <Pressable style={[styles.featureCard, styles.plannerFeature]} onPress={() => navigation.navigate('WeeklyPlanner')}>
            <View style={[styles.featureIconBox, styles.plannerIcon]}><Text style={styles.featureEmoji}>🗓️</Text></View>
            <View style={styles.featureBody}>
              <View style={styles.featureTitleRow}>
                <Text style={styles.featureTitle}>{t('homePlannerTitle')}</Text>
                <Text style={[styles.featureArrow, styles.plannerArrow]}>›</Text>
              </View>
              <Text style={styles.featureText}>{t('homePlannerText')}</Text>
              <View style={styles.plannerBadge}><Text style={styles.plannerBadgeText}>{t('homePlannerBadge')}</Text></View>
            </View>
          </Pressable>
        </View>

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
    backgroundColor: '#fff4e8',
  },
  backgroundImage: {
    opacity: 0.48,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 238, 0.70)',
  },
  container: {
    padding: 20,
    paddingBottom: 34,
  },
  brandRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 14},
  brandMark: {width: 34, height: 34, borderRadius: 12, backgroundColor: '#d95f38', alignItems: 'center', justifyContent: 'center', marginRight: 9, shadowColor: '#b84528', shadowOpacity: 0.18, shadowRadius: 7, shadowOffset: {width: 0, height: 3}, elevation: 3},
  brandMarkText: {fontSize: 19, fontWeight: '900', color: '#fff'},
  brand: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#2c1c16',
    letterSpacing: 0.4,
  },
  brandLeaf: {width: 34, height: 34, borderRadius: 17, backgroundColor: '#edf5df', alignItems: 'center', justifyContent: 'center'},
  brandLeafText: {fontSize: 17},
  introCard: {
    backgroundColor: 'rgba(255,252,245,0.94)',
    borderWidth: 1,
    borderColor: '#f1d7c2',
    borderRadius: 30,
    padding: 20,
    overflow: 'hidden',
    shadowColor: '#9d5639',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 7},
    elevation: 3,
  },
  heroBlobOne: {position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: '#ffe7c2', right: -70, top: -65},
  heroBlobTwo: {position: 'absolute', width: 90, height: 90, borderRadius: 45, backgroundColor: '#e9f2d6', left: -52, bottom: -48},
  kicker: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.4,
    color: '#c5522f',
  },
  heroRow: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
  heroCopy: {flex: 1, paddingRight: 12},
  title: {
    fontSize: 31,
    lineHeight: 36,
    fontWeight: '900',
    color: '#281813',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 21,
    color: '#75645b',
  },
  heroFood: {width: 116, alignItems: 'center', justifyContent: 'center'},
  heroFoodRing: {width: 114, height: 114, borderRadius: 38, backgroundColor: '#fff0db', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#f3d1ae', overflow: 'hidden'},
  heroSpark: {position: 'absolute', right: -1, top: -8, fontSize: 25, color: '#e49a32'},
  section: {
    marginTop: 18,
  },
  surpriseCard: {
    marginTop: 16,
    minHeight: 108,
    backgroundColor: '#d95f38',
    borderRadius: 26,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#a83d23',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
    elevation: 4,
  },
  surprisePressed: {opacity: 0.88, transform: [{scale: 0.995}]},
  surpriseIcon: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#fff0db',
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
  premiumCard: {marginTop:16,backgroundColor:'#fff2c9',borderRadius:22,padding:16,borderWidth:1,borderColor:'#e8c969',flexDirection:'row',alignItems:'center',shadowColor:'#9b6d20',shadowOpacity:.07,shadowRadius:10,shadowOffset:{width:0,height:4},elevation:2},
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
    backgroundColor: '#fff0e7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  smallPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#c5522f',
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
  featureGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8},
  featureCard: {width: '48.5%', minHeight: 184, borderRadius: 22, padding: 14, marginTop: 10, borderWidth: 1, shadowColor: '#7d4a32', shadowOpacity: 0.06, shadowRadius: 9, shadowOffset: {width: 0, height: 4}, elevation: 2},
  featureBody: {flex: 1, marginTop: 10},
  featureTitleRow: {flexDirection: 'row', alignItems: 'flex-start'},
  featureTitle: {flex: 1, fontSize: 15, lineHeight: 19, fontWeight: '900', color: '#38231b', paddingRight: 3},
  featureText: {fontSize: 11, lineHeight: 16, color: '#75665d', marginTop: 5},
  featureArrow: {fontSize: 24, lineHeight: 23, fontWeight: '700', color: '#b96b2a'},
  featureIconBox: {width: 54, height: 54, borderRadius: 17, alignItems: 'center', justifyContent: 'center'},
  featureEmoji: {fontSize: 26},
  searchFeature: {backgroundColor: '#fff2c9', borderColor: '#eed58a'},
  searchIcon: {backgroundColor: '#ffd86e'},
  dailyFeature: {backgroundColor: '#ffe9df', borderColor: '#f2cabc'},
  dailyIcon: {backgroundColor: '#ffd9c9', overflow: 'hidden'},
  dailyArrow: {color: '#c95533'},
  travelFeature: {backgroundColor: '#edf5df', borderColor: '#d5e6b9'},
  travelIcon: {backgroundColor: '#dceec1', overflow: 'hidden'},
  travelArrow: {color: '#5b853b'},
  groupFeature: {backgroundColor: '#ffe8e8', borderColor: '#f0c7cb'},
  groupIcon: {backgroundColor: '#ffd2d7'},
  groupArrow: {color: '#bd4e5c'},
  plannerFeature: {width: '100%', minHeight: 158, backgroundColor: '#f4efd1', borderColor: '#e4da9d'},
  plannerIcon: {backgroundColor: '#e6dfa4'},
  plannerArrow: {color: '#7b7532'},
  searchBadge: {alignSelf:'flex-start',backgroundColor:'#ffe19a',borderRadius:999,paddingHorizontal:8,paddingVertical:4,marginTop:9},
  searchBadgeText: {fontSize:9,fontWeight:'900',color:'#875b12'},
  dailyBadge: {alignSelf:'flex-start',backgroundColor:'#ffd4c4',borderRadius:999,paddingHorizontal:8,paddingVertical:4,marginTop:9},
  dailyBadgeText: {fontSize:9,fontWeight:'900',color:'#a74629'},
  travelBadge: {alignSelf:'flex-start',backgroundColor:'#d9edbf',borderRadius:999,paddingHorizontal:8,paddingVertical:4,marginTop:9},
  travelBadgeText: {fontSize:9,fontWeight:'900',color:'#4d7834'},
  groupBadge: {alignSelf:'flex-start',backgroundColor:'#ffd2d7',borderRadius:999,paddingHorizontal:8,paddingVertical:4,marginTop:9},
  groupBadgeText: {fontSize:9,fontWeight:'900',color:'#9f3f4a'},
  plannerBadge: {alignSelf:'flex-start',backgroundColor:'#e9df9c',borderRadius:999,paddingHorizontal:8,paddingVertical:4,marginTop:9},
  plannerBadgeText: {fontSize:9,fontWeight:'900',color:'#6b6526'},
});
