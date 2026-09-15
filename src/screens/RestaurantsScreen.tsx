import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {Restaurant} from '../types';
import {getCurrentLocation} from '../services/locationService';
import {getRestaurantsForMeal} from '../services/recommendationService';
import {formatDistance} from '../utils/format';
import {useApp} from '../context/AppContext';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {LocalBanner} from '../components/LocalBanner';
import {APP_LOCAL_BANNERS, getMealLocalArt} from '../utils/localArt';

type FilterMode = 'all' | 'open' | 'top' | 'nearby';
type SortMode = 'recommended' | 'rating' | 'reviews' | 'distance';

export function RestaurantsScreen({route, navigation}: NativeStackScreenProps<RootStackParamList, 'Restaurants'>) {
  const {t} = useTranslation();
  const {meal, mode, destination, locationContext} = route.params;
  const {addHistory, addSaved, saved, profile} = useApp();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('recommended');
  const art = getMealLocalArt(meal);

  const filters = [
    {key: 'all' as const, label: t('restaurants.filters.all')},
    {key: 'open' as const, label: t('restaurants.filters.open')},
    {key: 'top' as const, label: t('restaurants.filters.top')},
    {key: 'nearby' as const, label: t('restaurants.filters.nearby')},
  ];
  const sorts = [
    {key: 'recommended' as const, label: t('restaurants.sorts.recommended')},
    {key: 'rating' as const, label: t('restaurants.sorts.rating')},
    {key: 'reviews' as const, label: t('restaurants.sorts.reviews')},
    {key: 'distance' as const, label: t('restaurants.sorts.distance')},
  ];

  useEffect(() => {
    (async () => {
      try {
        let location = locationContext?.coordinates;
        if (!location && !destination) {
          try { location = await getCurrentLocation(); } catch { location = undefined; }
        }
        setRestaurants(await getRestaurantsForMeal(meal, location, destination));
      } catch (e) {
        Alert.alert(t('restaurants.errorTitle'), e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    })();
  }, [meal, destination, locationContext, t]);

  const filteredRestaurants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let list = restaurants.filter(place => {
      const matchesSearch = !normalizedQuery || [place.name, place.address, place.primaryType]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(normalizedQuery));
      if (!matchesSearch) return false;
      if (filterMode === 'open') return place.openNow === true;
      if (filterMode === 'top') return place.rating >= 4.5;
      if (filterMode === 'nearby') return place.distanceMeters != null && place.distanceMeters <= 2000;
      return true;
    });
    if (sortMode === 'rating') list = [...list].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    else if (sortMode === 'reviews') list = [...list].sort((a, b) => b.reviews - a.reviews || b.rating - a.rating);
    else if (sortMode === 'distance') list = [...list].sort((a, b) => (a.distanceMeters ?? Number.MAX_SAFE_INTEGER) - (b.distanceMeters ?? Number.MAX_SAFE_INTEGER));
    return list;
  }, [restaurants, query, filterMode, sortMode]);

  const choose = (place: Restaurant) => {
    addHistory({
      id: `${Date.now()}`,
      dishName: meal.name,
      cuisine: meal.cuisine,
      mode,
      restaurantName: place.name,
      city: locationContext?.city,
      country: locationContext?.country,
      currency: locationContext?.currency,
      createdAt: new Date().toISOString(),
      restaurantSnapshot: {...place},
      mealSnapshot: {...meal},
    });
    Alert.alert(t('restaurants.addedHistoryTitle'), t('restaurants.addedHistoryText', {meal: meal.name, place: place.name}));
  };

  const savePlace = (place: Restaurant) => addSaved({
    ...place,
    savedCity: locationContext?.city,
    savedCountry: locationContext?.country,
    savedCuisine: meal.cuisine,
    savedDishName: meal.name,
    savedAt: new Date().toISOString(),
  });

  const directions = (place: Restaurant) => {
    const destinationQuery = place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : `${place.name} ${place.address}`;
    const url = place.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}&destination_place_id=${encodeURIComponent(place.id)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.maps'), t('common.couldNotOpenMaps')));
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1d2735" /><Text style={styles.loadingText}>{t('restaurants.loading')}</Text></View>;
  }

  const areaText = destination || [locationContext?.city, locationContext?.country].filter(Boolean).join(', ');

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.restaurant} style={styles.screen} imageStyle={styles.screenBg}>
      <View style={styles.pageOverlay} />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <LocalBanner
          imageSource={APP_LOCAL_BANNERS.restaurant}
          eyebrow={t('restaurants.heroEyebrow')}
          title={meal.name}
          subtitle={t('restaurants.heroSubtitle', {area: areaText ? ` ${areaText}` : ''})}
          height={194}
        />

        <View style={styles.searchPanel}>
          <TextInput value={query} onChangeText={setQuery} placeholder={t('restaurants.searchPlaceholder')} placeholderTextColor="#9a9a9a" style={styles.searchInput} returnKeyType="search" />
          <Text style={styles.controlLabel}>{t('restaurants.filter')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {filters.map(item => <Pressable key={item.key} style={[styles.controlChip, filterMode === item.key && styles.controlChipActive]} onPress={() => setFilterMode(item.key)}><Text style={[styles.controlChipText, filterMode === item.key && styles.controlChipTextActive]}>{item.label}</Text></Pressable>)}
          </ScrollView>
          <Text style={styles.controlLabel}>{t('restaurants.sort')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
            {sorts.map(item => <Pressable key={item.key} style={[styles.sortChip, sortMode === item.key && styles.sortChipActive]} onPress={() => setSortMode(item.key)}><Text style={[styles.sortChipText, sortMode === item.key && styles.sortChipTextActive]}>{item.label}</Text></Pressable>)}
          </ScrollView>
        </View>

        <View style={styles.resultRow}>
          <Text style={styles.resultCount}>{t('restaurants.placesCount', {count: filteredRestaurants.length})}</Text>
          {(query || filterMode !== 'all' || sortMode !== 'recommended') ? <Pressable onPress={() => {setQuery(''); setFilterMode('all'); setSortMode('recommended');}}><Text style={styles.resetText}>{t('restaurants.reset')}</Text></Pressable> : null}
        </View>

        {filteredRestaurants.length === 0 ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>{t('restaurants.emptyTitle')}</Text><Text style={styles.emptyText}>{t('restaurants.emptyText')}</Text></View> : null}

        {filteredRestaurants.map(place => {
          const isSaved = saved.some(x => x.id === place.id);
          return (
            <View key={place.id} style={styles.card}>
              <Pressable onPress={() => navigation.navigate('RestaurantDetail', {place, meal, mode, locationContext})}>
                <ImageBackground source={art.hero} style={styles.hero} imageStyle={styles.heroImage}>
                  <View style={styles.heroTint} /><View style={styles.heroShade} />
                  <View style={styles.heroTopRow}>
                    <Text style={styles.ratingPill}>⭐ {place.rating.toFixed(1)} · {t('common.reviewsCount', {count: place.reviews.toLocaleString(profile.locale)})}</Text>
                    {place.openNow != null ? <Text style={[styles.statusPill, place.openNow ? styles.openPill : styles.closedPill]}>{place.openNow ? t('common.open') : t('common.closed')}</Text> : null}
                  </View>
                  <View style={styles.heroBottomRow}>
                    <View style={styles.heroDishWrap}><FoodAssetIcon meal={meal} size={58} /><View style={styles.heroDishCopy}><Text style={styles.heroDishName}>{meal.name}</Text><Text style={styles.heroDishMeta}>{meal.cuisine}</Text></View></View>
                    {place.distanceMeters != null ? <Text style={styles.distancePill}>{formatDistance(place.distanceMeters)}</Text> : null}
                  </View>
                </ImageBackground>
              </Pressable>

              <View style={styles.cardBody}>
                <View style={styles.nameRow}><View style={styles.nameCopy}><Text style={styles.name}>{place.name}</Text><Text style={styles.address} numberOfLines={2}>{place.address}</Text></View>{place.priceLevel ? <Text style={styles.pricePill}>{place.priceLevel}</Text> : null}</View>
                <View style={styles.actions}>
                  <Pressable style={styles.iconButton} onPress={() => savePlace(place)}><Text style={styles.iconButtonText}>{isSaved ? t('common.saved') : t('common.save')}</Text></Pressable>
                  <Pressable style={styles.iconButton} onPress={() => directions(place)}><Text style={styles.iconButtonText}>{t('common.directions')}</Text></Pressable>
                  <Pressable style={({pressed}) => [styles.primaryButton, {backgroundColor: art.accent}, pressed && styles.pressed]} onPress={() => choose(place)}><Text style={styles.primaryButtonText}>{t('restaurants.choose')}</Text></Pressable>
                </View>
                <Pressable onPress={() => navigation.navigate('RestaurantDetail', {place, meal, mode, locationContext})}><Text style={[styles.detailsLink, {color: art.accent}]}>{t('restaurants.viewDetails')} →</Text></Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#f8f4ef'},screenBg:{opacity:.12},pageOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(250,247,243,0.95)'},center:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#fbfaf8'},loadingText:{marginTop:14,color:'#777'},container:{padding:20,paddingBottom:36},searchPanel:{backgroundColor:'rgba(255,255,255,0.96)',borderRadius:22,padding:14,borderWidth:1,borderColor:'#eadfce'},searchInput:{height:50,borderRadius:15,borderWidth:1,borderColor:'#e1ddd8',backgroundColor:'#fff',paddingHorizontal:14,fontSize:15,color:'#171717'},controlLabel:{fontSize:12,fontWeight:'900',color:'#6c6259',marginTop:14,marginBottom:8},chipRow:{paddingRight:8},controlChip:{paddingHorizontal:12,paddingVertical:9,borderRadius:999,backgroundColor:'#f3f3f3',marginRight:8},controlChipActive:{backgroundColor:'#1d2735'},controlChipText:{fontSize:12,fontWeight:'800',color:'#5b5b5b'},controlChipTextActive:{color:'#fff'},sortChip:{paddingHorizontal:12,paddingVertical:9,borderRadius:999,backgroundColor:'#fff4e5',marginRight:8},sortChipActive:{backgroundColor:'#e6a451'},sortChipText:{fontSize:12,fontWeight:'800',color:'#916126'},sortChipTextActive:{color:'#fff'},resultRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:16,marginBottom:2},resultCount:{fontSize:15,fontWeight:'900',color:'#222'},resetText:{fontSize:13,fontWeight:'900',color:'#3568b8'},emptyCard:{backgroundColor:'#fff',borderRadius:20,borderWidth:1,borderColor:'#eadfce',padding:18,marginTop:14},emptyTitle:{fontSize:16,fontWeight:'900',color:'#222'},emptyText:{fontSize:13,lineHeight:20,color:'#777',marginTop:6},card:{borderRadius:26,overflow:'hidden',marginTop:14,backgroundColor:'#fff',borderWidth:1,borderColor:'#eadfce',shadowColor:'#000',shadowOpacity:.05,shadowRadius:12,shadowOffset:{width:0,height:8},elevation:2},hero:{height:200,justifyContent:'space-between',padding:16},heroImage:{borderTopLeftRadius:26,borderTopRightRadius:26},heroTint:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(255,245,232,0.08)'},heroShade:{position:'absolute',left:0,right:0,bottom:0,height:'62%',backgroundColor:'rgba(0,0,0,0.24)'},heroTopRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start'},ratingPill:{backgroundColor:'rgba(255,255,255,0.96)',color:'#2e261f',fontSize:11,fontWeight:'900',paddingHorizontal:10,paddingVertical:7,borderRadius:999,overflow:'hidden'},statusPill:{fontSize:10,fontWeight:'900',paddingHorizontal:10,paddingVertical:7,borderRadius:999,overflow:'hidden'},openPill:{backgroundColor:'#e6f8eb',color:'#16713d'},closedPill:{backgroundColor:'#fdecec',color:'#8b3434'},heroBottomRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-end'},heroDishWrap:{flexDirection:'row',alignItems:'center',flex:1,marginRight:8},heroDishCopy:{marginLeft:10,flex:1},heroDishName:{fontSize:22,lineHeight:26,fontWeight:'900',color:'#fff'},heroDishMeta:{fontSize:13,fontWeight:'700',color:'rgba(255,255,255,0.94)',marginTop:4},distancePill:{backgroundColor:'rgba(255,255,255,0.94)',color:'#302820',fontSize:11,fontWeight:'900',paddingHorizontal:10,paddingVertical:7,borderRadius:999,overflow:'hidden'},cardBody:{padding:16},nameRow:{flexDirection:'row',alignItems:'flex-start'},nameCopy:{flex:1,paddingRight:10},name:{fontSize:20,fontWeight:'900',color:'#171717'},address:{fontSize:13,lineHeight:19,color:'#777',marginTop:6},pricePill:{backgroundColor:'#f7f2ea',color:'#8a6848',fontSize:11,fontWeight:'900',paddingHorizontal:10,paddingVertical:6,borderRadius:999,overflow:'hidden'},actions:{flexDirection:'row',alignItems:'center',marginTop:14},iconButton:{minHeight:44,borderRadius:14,backgroundColor:'#f2f2f2',alignItems:'center',justifyContent:'center',paddingHorizontal:14,marginRight:8},iconButtonText:{fontSize:12,fontWeight:'900',color:'#333'},primaryButton:{flex:1,minHeight:46,borderRadius:14,alignItems:'center',justifyContent:'center'},primaryButtonText:{fontSize:13,fontWeight:'900',color:'#fff'},detailsLink:{marginTop:14,fontSize:13,fontWeight:'900'},pressed:{opacity:.82}
});
