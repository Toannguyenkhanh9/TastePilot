import React, {useMemo, useState} from 'react';
import {
  Alert,
  ImageBackground,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useApp} from '../context/AppContext';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {LocalBanner} from '../components/LocalBanner';
import {APP_LOCAL_BANNERS} from '../utils/localArt';
import {formatDistance} from '../utils/format';
import {Restaurant} from '../types';

type GroupMode = 'city' | 'cuisine';

export function SavedScreen() {
  const {t} = useTranslation();
  const {saved, removeSaved, profile} = useApp();
  const [groupMode, setGroupMode] = useState<GroupMode>('city');

  const fallbackCity = (address: string) => {
    const parts = String(address || '').split(',').map(x => x.trim()).filter(Boolean);
    if (parts.length >= 2) return parts[parts.length - 2];
    return parts[0] || t('saved.unknownArea');
  };

  const grouped = useMemo(() => {
    const map = new Map<string, Restaurant[]>();
    for (const place of saved) {
      const key = groupMode === 'city'
        ? place.savedCity || fallbackCity(place.address)
        : place.savedCuisine || place.primaryType || t('saved.other');
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(place);
    }

    return [...map.entries()]
      .map(([label, items]) => ({
        label,
        items: [...items].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [saved, groupMode, t]);

  const openDirections = (place: Restaurant) => {
    const destinationQuery = place.latitude != null && place.longitude != null
      ? `${place.latitude},${place.longitude}`
      : `${place.name} ${place.address}`;
    const url = place.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationQuery)}&destination_place_id=${encodeURIComponent(place.id)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.maps'), t('common.couldNotOpenMaps')));
  };

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.home} style={styles.screen} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <LocalBanner
          imageSource={APP_LOCAL_BANNERS.daily}
          eyebrow={t('saved.heroEyebrow')}
          title={t('saved.heroTitle')}
          subtitle={t('saved.heroSubtitle')}
          height={198}
        />

        <View style={styles.segment}>
          <Pressable
            style={[styles.segmentItem, groupMode === 'city' && styles.segmentActive]}
            onPress={() => setGroupMode('city')}>
            <Text style={[styles.segmentText, groupMode === 'city' && styles.segmentTextActive]}>{t('saved.byCity')}</Text>
          </Pressable>
          <Pressable
            style={[styles.segmentItem, groupMode === 'cuisine' && styles.segmentActive]}
            onPress={() => setGroupMode('cuisine')}>
            <Text style={[styles.segmentText, groupMode === 'cuisine' && styles.segmentTextActive]}>{t('saved.byCuisine')}</Text>
          </Pressable>
        </View>

        {saved.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('saved.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('saved.emptyText')}</Text>
          </View>
        ) : (
          grouped.map(group => (
            <View key={group.label} style={styles.groupBlock}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.label}</Text>
                <Text style={styles.groupCount}>{t('saved.savedCount', {count: group.items.length})}</Text>
              </View>

              {group.items.map(place => (
                <View key={place.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.iconWrap}>
                      <FoodAssetIcon meal={{name: place.savedDishName || place.name, cuisine: place.savedCuisine || ''}} size={58} />
                    </View>
                    <View style={styles.headerCopy}>
                      <Text style={styles.name}>{place.name}</Text>
                      <Text style={styles.meta}>⭐ {place.rating.toFixed(1)} · {t('common.reviewsCount', {count: place.reviews.toLocaleString(profile.locale)})}</Text>
                      <Text style={styles.address} numberOfLines={2}>{place.address}</Text>
                    </View>
                  </View>

                  <View style={styles.pillsRow}>
                    {place.savedDishName ? <Text style={styles.pill}>{place.savedDishName}</Text> : null}
                    {place.distanceMeters != null ? <Text style={styles.pill}>{formatDistance(place.distanceMeters)}</Text> : null}
                    {place.priceLevel ? <Text style={styles.pill}>{place.priceLevel}</Text> : null}
                    <Text style={styles.pillMuted}>{place.savedCuisine || t('saved.savedForLater')}</Text>
                  </View>

                  <View style={styles.actions}>
                    <Pressable style={styles.secondaryButton} onPress={() => removeSaved(place.id)}>
                      <Text style={styles.secondaryText}>{t('common.remove')}</Text>
                    </Pressable>
                    <Pressable style={styles.primaryButton} onPress={() => openDirections(place)}>
                      <Text style={styles.primaryText}>{t('common.directions')}</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff9f1'},
  bgImage: {opacity: 0.28},
  overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,248,238,0.80)'},
  container: {padding: 20, paddingBottom: 40, flexGrow: 1},
  segment: {flexDirection: 'row', backgroundColor: 'rgba(241,241,241,0.92)', borderRadius: 18, padding: 4, marginBottom: 16},
  segmentItem: {flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: 'center'},
  segmentActive: {backgroundColor: '#fff'},
  segmentText: {fontSize: 13, fontWeight: '800', color: '#777'},
  segmentTextActive: {color: '#171717'},
  emptyCard: {backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: '#eadfce', borderRadius: 22, padding: 20},
  emptyTitle: {fontSize: 18, fontWeight: '900', color: '#171717'},
  emptyText: {marginTop: 8, fontSize: 14, lineHeight: 21, color: '#666'},
  groupBlock: {marginBottom: 18},
  groupHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10},
  groupTitle: {fontSize: 18, fontWeight: '900', color: '#222'},
  groupCount: {fontSize: 12, fontWeight: '800', color: '#8a7d70'},
  card: {backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 24, borderWidth: 1, borderColor: '#eadfce', padding: 16, marginBottom: 12},
  cardHeader: {flexDirection: 'row', alignItems: 'center'},
  iconWrap: {width: 74, height: 74, borderRadius: 22, backgroundColor: '#fff6ea', alignItems: 'center', justifyContent: 'center', marginRight: 14},
  headerCopy: {flex: 1},
  name: {fontSize: 17, fontWeight: '900', color: '#222'},
  meta: {fontSize: 13, color: '#666', marginTop: 5},
  address: {fontSize: 13, lineHeight: 19, color: '#7a7a7a', marginTop: 5},
  pillsRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 12},
  pill: {backgroundColor: '#fff3e1', color: '#94612c', fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, overflow: 'hidden', marginRight: 8, marginBottom: 8},
  pillMuted: {backgroundColor: '#f3f5f8', color: '#5f6672', fontSize: 12, fontWeight: '800', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, overflow: 'hidden', marginRight: 8, marginBottom: 8},
  actions: {flexDirection: 'row', marginTop: 6},
  secondaryButton: {flex: 1, minHeight: 46, borderRadius: 14, backgroundColor: '#f2f2f2', alignItems: 'center', justifyContent: 'center', marginRight: 10},
  secondaryText: {fontSize: 13, fontWeight: '900', color: '#444'},
  primaryButton: {flex: 1, minHeight: 46, borderRadius: 14, backgroundColor: '#d95f38', alignItems: 'center', justifyContent: 'center'},
  primaryText: {fontSize: 13, fontWeight: '900', color: '#fff'},
});
