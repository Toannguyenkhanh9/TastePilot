import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {RestaurantDetails} from '../types';
import {formatDistance} from '../utils/format';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {getMealLocalArt, APP_LOCAL_BANNERS} from '../utils/localArt';
import {useApp} from '../context/AppContext';
import {LocalBanner} from '../components/LocalBanner';
import {getRestaurantDetails} from '../services/placeService';

export function RestaurantDetailScreen({route}: NativeStackScreenProps<RootStackParamList, 'RestaurantDetail'>) {
  const {t} = useTranslation();
  const {place, meal} = route.params;
  const art = getMealLocalArt(meal);
  const {addSaved, addHistory, saved, profile} = useApp();
  const [details, setDetails] = useState<RestaurantDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const displayPlace = details || place;
  const savedAlready = saved.some(item => item.id === place.id);

  useEffect(() => {
    let active = true;
    setDetailsLoading(true);
    getRestaurantDetails(place)
      .then(value => { if (active) setDetails(value); })
      .catch(() => undefined)
      .finally(() => { if (active) setDetailsLoading(false); });
    return () => { active = false; };
  }, [place]);

  const savePlace = () => {
    addSaved({
      ...displayPlace,
      savedCity: route.params.locationContext?.city,
      savedCountry: route.params.locationContext?.country,
      savedCuisine: meal.cuisine,
      savedDishName: meal.name,
      savedAt: new Date().toISOString(),
    });
  };

  const openDirections = () => {
    const destinationQuery = displayPlace.latitude != null && displayPlace.longitude != null
      ? `${displayPlace.latitude},${displayPlace.longitude}`
      : `${displayPlace.name} ${displayPlace.address}`;
    const url = displayPlace.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}&destination_place_id=${encodeURIComponent(displayPlace.id)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.maps'), t('common.couldNotOpenDirections')));
  };

  const openGoogleReviews = () => {
    const url = displayPlace.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${displayPlace.name} ${displayPlace.address}`)}&query_place_id=${encodeURIComponent(displayPlace.id)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.maps'), t('common.couldNotOpenMaps')));
  };

  const choose = () => {
    addHistory({
      id: `${Date.now()}`,
      dishName: meal.name,
      cuisine: meal.cuisine,
      mode: route.params.mode,
      restaurantName: displayPlace.name,
      city: route.params.locationContext?.city,
      country: route.params.locationContext?.country,
      currency: route.params.locationContext?.currency,
      createdAt: new Date().toISOString(),
      restaurantSnapshot: {...displayPlace},
      mealSnapshot: {...meal},
    });
    Alert.alert(t('detail.addedHistoryTitle'), t('detail.addedHistoryText', {meal: meal.name, place: displayPlace.name}));
  };

  const userReviews = details?.userReviews || [];

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.restaurant} style={styles.screen} imageStyle={styles.pageBg}>
      <View style={styles.pageOverlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <LocalBanner
          imageSource={art.hero}
          eyebrow={t('detail.heroEyebrow')}
          title={displayPlace.name}
          subtitle={t('detail.heroSubtitle', {meal: meal.name})}
          height={198}
        />

        <View style={styles.statRow}>
          <View style={styles.statCard}><Text style={styles.statValue}>⭐ {displayPlace.rating.toFixed(1)}</Text><Text style={styles.statLabel}>{t('common.rating')}</Text></View>
          <View style={styles.statCard}><Text style={styles.statValue}>{displayPlace.reviews.toLocaleString(profile.locale)}</Text><Text style={styles.statLabel}>{t('common.reviews')}</Text></View>
          <View style={[styles.statCard, styles.statCardLast]}><Text style={styles.statValue}>{displayPlace.distanceMeters != null ? formatDistance(displayPlace.distanceMeters) : '—'}</Text><Text style={styles.statLabel}>{t('common.distance')}</Text></View>
        </View>

        <View style={styles.heroCard}>
          <ImageBackground source={art.hero} style={styles.heroMedia} imageStyle={styles.heroMediaImage}>
            <View style={styles.heroTint} /><View style={styles.heroShade} />
            <View style={styles.topPills}>
              <Text style={styles.whitePill}>{meal.cuisine}</Text>
              {displayPlace.openNow != null ? <Text style={[styles.whitePill, displayPlace.openNow ? styles.openPill : styles.closedPill]}>{displayPlace.openNow ? t('common.openNow') : t('common.closed')}</Text> : null}
            </View>
            <View style={styles.heroFooter}><View style={styles.heroDishRow}><FoodAssetIcon meal={meal} size={62} /><View style={styles.heroDishCopy}><Text style={styles.heroDishName}>{meal.name}</Text><Text style={styles.heroDishReason}>{t(`foodLabels.${art.labelKey}`)}</Text></View></View></View>
          </ImageBackground>

          <View style={styles.quickActions}>
            <Pressable style={styles.smallAction} onPress={savePlace}><Text style={styles.smallActionText}>{savedAlready ? t('common.saved') : t('common.savePlace')}</Text></Pressable>
            <Pressable style={styles.smallAction} onPress={openDirections}><Text style={styles.smallActionText}>{t('common.directions')}</Text></Pressable>
            <Pressable style={[styles.bigAction, {backgroundColor: art.accent}]} onPress={choose}><Text style={styles.bigActionText}>{t('detail.choosePlace')}</Text></Pressable>
          </View>
        </View>

        <View style={[styles.panel, {backgroundColor: art.surface}]}>
          <Text style={styles.sectionTitle}>{t('detail.whyWorksTitle')}</Text>
          <Text style={styles.sectionText}>{t('detail.whyWorksText', {meal: meal.name})}</Text>
          <View style={styles.tagRow}>
            <Text style={[styles.tag, {backgroundColor: art.accentSoft, color: art.accent}]}>{t(`foodLabels.${art.labelKey}`)}</Text>
            <Text style={styles.tag}>{t('detail.goodReviewConfidence')}</Text>
            {displayPlace.priceLevel ? <Text style={styles.tag}>{displayPlace.priceLevel}</Text> : null}
          </View>
        </View>

        <View style={styles.panel}><Text style={styles.sectionTitle}>{t('detail.address')}</Text><Text style={styles.sectionText}>{displayPlace.address}</Text></View>

        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>{t('detail.recommendedDish')}</Text>
          <View style={styles.dishCard}><FoodAssetIcon meal={meal} size={68} /><View style={styles.dishCopy}><Text style={styles.dishName}>{meal.name}</Text><Text style={styles.dishCuisine}>{meal.cuisine}</Text><Text style={styles.dishReasonText}>{meal.reason}</Text></View></View>
        </View>

        <View style={styles.panel}>
          <View style={styles.reviewHeaderRow}>
            <View style={styles.reviewHeaderCopy}>
              <Text style={styles.sectionTitle}>{t('reviewsPanel.title')}</Text>
              <Text style={styles.reviewSource}>{t('reviewsPanel.source')}</Text>
            </View>
            {detailsLoading ? <ActivityIndicator size="small" color="#d95f38" /> : null}
          </View>

          {!detailsLoading && userReviews.length === 0 ? (
            <Text style={styles.sectionText}>{t('reviewsPanel.empty')}</Text>
          ) : null}

          {userReviews.slice(0, 3).map(review => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewTopRow}>
                <View style={styles.reviewAuthorCopy}>
                  <Text style={styles.reviewAuthor}>{review.authorName || t('reviewsPanel.googleUser')}</Text>
                  {review.relativeTime ? <Text style={styles.reviewTime}>{review.relativeTime}</Text> : null}
                </View>
                <Text style={styles.reviewRating}>⭐ {Number(review.rating || 0).toFixed(1)}</Text>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
            </View>
          ))}

          <Pressable style={styles.mapsReviewButton} onPress={openGoogleReviews}>
            <Text style={styles.mapsReviewButtonText}>{t('reviewsPanel.viewMore')}</Text>
          </Pressable>
          <Text style={styles.reviewDisclaimer}>{t('reviewsPanel.disclaimer')}</Text>
        </View>

        <View style={styles.panel}><Text style={styles.sectionTitle}>{t('detail.tipTitle')}</Text><Text style={styles.sectionText}>{t('detail.tipText')}</Text></View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen:{flex:1,backgroundColor:'#fff9f1'},
  pageBg:{opacity:.12},
  pageOverlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(249,246,241,0.95)'},
  container:{padding:20,paddingBottom:40},
  statRow:{flexDirection:'row',marginBottom:14},
  statCard:{flex:1,backgroundColor:'rgba(255,255,255,0.96)',borderRadius:18,borderWidth:1,borderColor:'#eadfce',padding:14,marginRight:10},
  statCardLast:{marginRight:0},
  statValue:{fontSize:16,fontWeight:'900',color:'#171717'},
  statLabel:{fontSize:12,color:'#7a7a7a',marginTop:6},
  heroCard:{backgroundColor:'#fff',borderRadius:26,borderWidth:1,borderColor:'#eadfce',overflow:'hidden',marginBottom:14},
  heroMedia:{height:230,justifyContent:'space-between',padding:16},
  heroMediaImage:{borderTopLeftRadius:26,borderTopRightRadius:26},
  heroTint:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(255,247,236,0.08)'},
  heroShade:{position:'absolute',left:0,right:0,bottom:0,height:'60%',backgroundColor:'rgba(0,0,0,0.26)'},
  topPills:{flexDirection:'row',flexWrap:'wrap'},
  whitePill:{backgroundColor:'rgba(255,255,255,0.94)',color:'#372b21',fontSize:11,fontWeight:'900',paddingHorizontal:10,paddingVertical:7,borderRadius:999,overflow:'hidden',marginRight:8,marginBottom:8},
  openPill:{backgroundColor:'#e8f8ee',color:'#176b36'},
  closedPill:{backgroundColor:'#fdecec',color:'#8b3434'},
  heroFooter:{justifyContent:'flex-end'},
  heroDishRow:{flexDirection:'row',alignItems:'center'},
  heroDishCopy:{flex:1,marginLeft:12},
  heroDishName:{fontSize:24,fontWeight:'900',color:'#fff'},
  heroDishReason:{fontSize:13,fontWeight:'700',color:'rgba(255,255,255,0.94)',marginTop:4},
  quickActions:{flexDirection:'row',padding:16},
  smallAction:{minHeight:46,borderRadius:14,backgroundColor:'#f2f2f2',alignItems:'center',justifyContent:'center',paddingHorizontal:14,marginRight:8},
  smallActionText:{fontSize:12,fontWeight:'900',color:'#333'},
  bigAction:{flex:1,minHeight:48,borderRadius:14,alignItems:'center',justifyContent:'center'},
  bigActionText:{fontSize:13,fontWeight:'900',color:'#fff'},
  panel:{backgroundColor:'rgba(255,255,255,0.96)',borderRadius:22,padding:16,marginBottom:14,borderWidth:1,borderColor:'#eadfce'},
  sectionTitle:{fontSize:16,fontWeight:'900',color:'#171717'},
  sectionText:{fontSize:14,lineHeight:22,color:'#606060',marginTop:8},
  tagRow:{flexDirection:'row',flexWrap:'wrap',marginTop:12},
  tag:{backgroundColor:'#f3f5f7',color:'#505b66',fontSize:12,fontWeight:'800',paddingHorizontal:10,paddingVertical:7,borderRadius:999,overflow:'hidden',marginRight:8,marginBottom:8},
  dishCard:{flexDirection:'row',alignItems:'center',marginTop:12},
  dishCopy:{flex:1,marginLeft:12},
  dishName:{fontSize:19,fontWeight:'900',color:'#171717'},
  dishCuisine:{fontSize:13,fontWeight:'700',color:'#7d6c62',marginTop:4},
  dishReasonText:{fontSize:13,lineHeight:20,color:'#666',marginTop:8},
  reviewHeaderRow:{flexDirection:'row',alignItems:'center',justifyContent:'space-between'},
  reviewHeaderCopy:{flex:1,paddingRight:10},
  reviewSource:{fontSize:12,color:'#777',marginTop:4},
  reviewCard:{marginTop:12,paddingTop:12,borderTopWidth:1,borderTopColor:'#eee8df'},
  reviewTopRow:{flexDirection:'row',alignItems:'flex-start',justifyContent:'space-between'},
  reviewAuthorCopy:{flex:1,paddingRight:12},
  reviewAuthor:{fontSize:14,fontWeight:'900',color:'#222'},
  reviewTime:{fontSize:11,color:'#888',marginTop:3},
  reviewRating:{fontSize:12,fontWeight:'900',color:'#6a5428'},
  reviewText:{fontSize:14,lineHeight:21,color:'#565656',marginTop:9},
  mapsReviewButton:{marginTop:14,minHeight:44,borderRadius:14,backgroundColor:'#fff0e7',alignItems:'center',justifyContent:'center'},
  mapsReviewButtonText:{fontSize:13,fontWeight:'900',color:'#d95f38'},
  reviewDisclaimer:{fontSize:10,lineHeight:15,color:'#999',marginTop:9},
});
