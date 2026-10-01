import React, {useMemo, useState} from 'react';
import {
  Alert,
  ImageBackground,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useApp} from '../context/AppContext';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {APP_LOCAL_BANNERS, getMealLocalArt} from '../utils/localArt';
import {LocalBanner} from '../components/LocalBanner';
import {MealHistoryItem} from '../types';
import {formatDistance} from '../utils/format';

export function HistoryScreen() {
  const {t} = useTranslation();
  const {history, updateHistoryFeedback, addSaved, profile} = useApp();
  const [selected, setSelected] = useState<MealHistoryItem | null>(null);

  const setFeedback = (
    id: string,
    current: 'love' | 'ok' | 'dislike' | undefined,
    next: 'love' | 'dislike',
  ) => {
    updateHistoryFeedback(id, current === next ? undefined : next);
  };

  const openDirections = (item: MealHistoryItem) => {
    const place = item.restaurantSnapshot;
    const fallbackQuery = [item.restaurantName, item.city, item.country].filter(Boolean).join(', ');
    const destinationQuery =
      place?.latitude != null && place?.longitude != null
        ? `${place.latitude},${place.longitude}`
        : place
          ? `${place.name} ${place.address}`
          : fallbackQuery;

    if (!destinationQuery) {
      Alert.alert(t('common.directions'), t('history.directionsUnavailable'));
      return;
    }

    const url = place?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destinationQuery)}`;
    Linking.openURL(url).catch(() => Alert.alert(t('common.maps'), t('common.couldNotOpenMaps')));
  };

  const selectedPlace = selected?.restaurantSnapshot;
  const selectedMeal = selected?.mealSnapshot || (selected ? {
    id: selected.id,
    name: selected.dishName,
    cuisine: selected.cuisine,
    estimatedMin: 0,
    estimatedMax: 0,
    reason: '',
    searchKeyword: selected.dishName,
  } : undefined);
  const art = selectedMeal ? getMealLocalArt(selectedMeal) : undefined;
  const selectedArea = useMemo(
    () => selected ? [selected.city, selected.country].filter(Boolean).join(', ') : '',
    [selected],
  );

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.home} style={styles.screen} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <ScrollView contentContainerStyle={styles.container}>
        <LocalBanner
          imageSource={APP_LOCAL_BANNERS.travel}
          eyebrow={t('history.heroEyebrow')}
          title={t('history.heroTitle')}
          subtitle={t('history.heroSubtitle')}
          height={198}
        />

        <View style={styles.feedbackInfo}>
          <Text style={styles.feedbackInfoTitle}>{t('history.tipTitle')}</Text>
          <Text style={styles.feedbackInfoText}>{t('history.tipText')}</Text>
        </View>

        {history.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{t('history.emptyTitle')}</Text>
            <Text style={styles.emptyText}>{t('history.emptyText')}</Text>
          </View>
        ) : (
          history.map(item => {
            const area = [item.city, item.country].filter(Boolean).join(', ');
            const liked = item.feedback === 'love';
            const disliked = item.feedback === 'dislike';
            const place = item.restaurantSnapshot;

            return (
              <View key={item.id} style={styles.card}>
                <Pressable style={styles.tapArea} onPress={() => setSelected(item)}>
                  <View style={styles.topRow}>
                    <View style={styles.iconWrap}>
                      <FoodAssetIcon meal={{name: item.dishName, cuisine: item.cuisine}} size={56} />
                    </View>
                    <View style={styles.copy}>
                      <View style={styles.titleRow}>
                        <Text style={styles.name}>{item.dishName}</Text>
                        <Text style={[styles.modePill, item.mode === 'travel' ? styles.modeTravel : styles.modeDaily]}>
                          {item.mode === 'travel' ? t('history.travelMode') : t('history.dailyMode')}
                        </Text>
                      </View>
                      <Text style={styles.meta}>{item.restaurantName || item.cuisine}</Text>
                      {place ? (
                        <Text style={styles.placeMeta}>
                          ⭐ {place.rating.toFixed(1)} · {t('common.reviewsCount', {count: place.reviews.toLocaleString(profile.locale)})}
                          {place.distanceMeters != null ? ` · ${formatDistance(place.distanceMeters)}` : ''}
                        </Text>
                      ) : null}
                      {area ? <Text style={styles.area}>📍 {area}</Text> : null}
                      <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString(profile.locale)}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>
                  <Text style={styles.viewDetails}>{t('history.viewDetails')}</Text>
                </Pressable>

                <View style={styles.feedbackRow}>
                  <Text style={styles.feedbackLabel}>{t('history.goodPick')}</Text>
                  <View style={styles.feedbackButtons}>
                    <Pressable
                      style={[styles.feedbackButton, liked && styles.likeActive]}
                      onPress={() => setFeedback(item.id, item.feedback, 'love')}>
                      <Text style={[styles.feedbackButtonText, liked && styles.likeActiveText]}>{t('history.like')}</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.feedbackButton, disliked && styles.dislikeActive]}
                      onPress={() => setFeedback(item.id, item.feedback, 'dislike')}>
                      <Text style={[styles.feedbackButtonText, disliked && styles.dislikeActiveText]}>{t('history.dislike')}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <ScrollView contentContainerStyle={styles.modalContent}>
              {selectedMeal ? (
                <View style={styles.modalHeroRow}>
                  <View style={[styles.modalIconWrap, {backgroundColor: art?.accentSoft || '#fff4e6'}]}>
                    <FoodAssetIcon meal={selectedMeal} size={72} />
                  </View>
                  <View style={styles.modalHeroCopy}>
                    <Text style={styles.modalEyebrow}>{t('history.placeEyebrow')}</Text>
                    <Text style={styles.modalTitle}>{selected?.restaurantName || selected?.dishName}</Text>
                    <Text style={styles.modalSubtitle}>{selected?.dishName} · {selected?.cuisine}</Text>
                  </View>
                </View>
              ) : null}

              {selectedPlace ? (
                <>
                  <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>⭐ {selectedPlace.rating.toFixed(1)}</Text>
                      <Text style={styles.statLabel}>{t('common.rating')}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{selectedPlace.reviews.toLocaleString(profile.locale)}</Text>
                      <Text style={styles.statLabel}>{t('common.reviews')}</Text>
                    </View>
                    <View style={styles.statCard}>
                      <Text style={styles.statValue}>{selectedPlace.distanceMeters != null ? formatDistance(selectedPlace.distanceMeters) : '—'}</Text>
                      <Text style={styles.statLabel}>{t('common.distance')}</Text>
                    </View>
                  </View>

                  <View style={styles.infoPanel}>
                    <Text style={styles.infoTitle}>{t('common.restaurant')}</Text>
                    <Text style={styles.infoPrimary}>{selectedPlace.name}</Text>
                    <Text style={styles.infoText}>{selectedPlace.address}</Text>
                    <View style={styles.pillRow}>
                      {selectedPlace.openNow != null ? (
                        <Text style={[styles.infoPill, selectedPlace.openNow ? styles.openPill : styles.closedPill]}>
                          {selectedPlace.openNow ? t('common.openNow') : t('common.closed')}
                        </Text>
                      ) : null}
                      {selectedPlace.priceLevel ? <Text style={styles.infoPill}>{selectedPlace.priceLevel}</Text> : null}
                    </View>
                  </View>

                  <View style={styles.infoPanel}>
                    <Text style={styles.infoTitle}>{t('history.mealChosen')}</Text>
                    <Text style={styles.infoPrimary}>{selected?.dishName}</Text>
                    {selected?.mealSnapshot?.reason ? <Text style={styles.infoText}>{selected.mealSnapshot.reason}</Text> : null}
                  </View>
                </>
              ) : (
                <View style={styles.infoPanel}>
                  <Text style={styles.infoTitle}>{t('history.olderEntry')}</Text>
                  <Text style={styles.infoPrimary}>{selected?.restaurantName || t('history.restaurantUnavailable')}</Text>
                  {selectedArea ? <Text style={styles.infoText}>📍 {selectedArea}</Text> : null}
                  <Text style={styles.legacyNote}>{t('history.legacyNote')}</Text>
                </View>
              )}

              <Text style={styles.visitDate}>
                {t('history.visited', {date: selected ? new Date(selected.createdAt).toLocaleString(profile.locale) : ''})}
              </Text>

              <View style={styles.modalActions}>
                <Pressable style={styles.secondaryAction} onPress={() => setSelected(null)}>
                  <Text style={styles.secondaryActionText}>{t('common.close')}</Text>
                </Pressable>
                {selectedPlace ? (
                  <Pressable
                    style={styles.secondaryAction}
                    onPress={() => addSaved({
                      ...selectedPlace,
                      savedCity: selected?.city,
                      savedCountry: selected?.country,
                      savedCuisine: selected?.cuisine,
                      savedDishName: selected?.dishName,
                      savedAt: new Date().toISOString(),
                    })}>
                    <Text style={styles.secondaryActionText}>{t('common.savePlace')}</Text>
                  </Pressable>
                ) : null}
                <Pressable
                  style={[styles.primaryAction, {backgroundColor: art?.accent || '#d95f38'}]}
                  onPress={() => selected && openDirections(selected)}>
                  <Text style={styles.primaryActionText}>{t('common.directions')}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#fff9f1'},
  bgImage: {opacity: 0.28},
  overlay: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,248,238,0.80)'},
  container: {padding: 20, paddingBottom: 42, flexGrow: 1},
  feedbackInfo: {backgroundColor: '#fff0e7', borderRadius: 20, padding: 16, marginBottom: 16},
  feedbackInfoTitle: {fontSize: 14, fontWeight: '900', color: '#8a4d32'},
  feedbackInfoText: {fontSize: 13, lineHeight: 20, color: '#8a6958', marginTop: 6},
  emptyCard: {backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: '#eadfce', borderRadius: 22, padding: 20},
  emptyTitle: {fontSize: 18, fontWeight: '900', color: '#171717'},
  emptyText: {marginTop: 8, fontSize: 14, lineHeight: 21, color: '#666'},
  card: {backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 24, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#eadfce'},
  tapArea: {paddingBottom: 4},
  topRow: {flexDirection: 'row', alignItems: 'center'},
  iconWrap: {width: 72, height: 72, borderRadius: 22, backgroundColor: '#fff6ea', alignItems: 'center', justifyContent: 'center', marginRight: 14},
  copy: {flex: 1},
  titleRow: {flexDirection: 'row', alignItems: 'center'},
  name: {fontSize: 17, fontWeight: '900', color: '#222', flex: 1, paddingRight: 8},
  modePill: {fontSize: 10, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden'},
  modeDaily: {backgroundColor: '#fff0e7', color: '#d95f38'},
  modeTravel: {backgroundColor: '#fff2df', color: '#9a6a2a'},
  meta: {fontSize: 14, color: '#666', marginTop: 4},
  placeMeta: {fontSize: 12, color: '#5f6672', marginTop: 5},
  area: {fontSize: 12, color: '#7d6c62', marginTop: 5},
  date: {fontSize: 12, color: '#999', marginTop: 5},
  chevron: {fontSize: 30, color: '#a28f7b', marginLeft: 8},
  viewDetails: {fontSize: 12, fontWeight: '900', color: '#c5522f', marginTop: 10, marginLeft: 86},
  feedbackRow: {borderTopWidth: 1, borderTopColor: '#eee8e0', marginTop: 12, paddingTop: 12},
  feedbackLabel: {fontSize: 12, fontWeight: '800', color: '#68625b'},
  feedbackButtons: {flexDirection: 'row', marginTop: 9},
  feedbackButton: {flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: '#f3f3f3', alignItems: 'center', justifyContent: 'center', marginRight: 8, borderWidth: 1, borderColor: 'transparent'},
  feedbackButtonText: {fontSize: 13, fontWeight: '900', color: '#555'},
  likeActive: {backgroundColor: '#e8f8ee', borderColor: '#b9e3c7'},
  likeActiveText: {color: '#19733d'},
  dislikeActive: {backgroundColor: '#fdecec', borderColor: '#f1c4c4'},
  dislikeActiveText: {color: '#9a3434'},
  modalBackdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.38)', justifyContent: 'flex-end'},
  modalSheet: {maxHeight: '88%', backgroundColor: '#fff9f1', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden'},
  modalHandle: {width: 46, height: 5, borderRadius: 3, backgroundColor: '#d5cec5', alignSelf: 'center', marginTop: 10},
  modalContent: {padding: 20, paddingBottom: 32},
  modalHeroRow: {flexDirection: 'row', alignItems: 'center'},
  modalIconWrap: {width: 88, height: 88, borderRadius: 26, alignItems: 'center', justifyContent: 'center', marginRight: 14},
  modalHeroCopy: {flex: 1},
  modalEyebrow: {fontSize: 11, fontWeight: '900', letterSpacing: 1.1, color: '#8a6949'},
  modalTitle: {fontSize: 24, lineHeight: 29, fontWeight: '900', color: '#171717', marginTop: 5},
  modalSubtitle: {fontSize: 13, color: '#6f6f6f', marginTop: 5},
  statsRow: {flexDirection: 'row', marginTop: 18},
  statCard: {flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 13, borderWidth: 1, borderColor: '#eadfce', marginRight: 8},
  statValue: {fontSize: 15, fontWeight: '900', color: '#171717'},
  statLabel: {fontSize: 11, color: '#888', marginTop: 4},
  infoPanel: {backgroundColor: '#fff', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#eadfce', marginTop: 14},
  infoTitle: {fontSize: 12, fontWeight: '900', color: '#8a6949', letterSpacing: 0.7},
  infoPrimary: {fontSize: 17, fontWeight: '900', color: '#171717', marginTop: 7},
  infoText: {fontSize: 14, lineHeight: 21, color: '#666', marginTop: 6},
  legacyNote: {fontSize: 13, lineHeight: 20, color: '#8a6f58', marginTop: 10},
  pillRow: {flexDirection: 'row', flexWrap: 'wrap', marginTop: 10},
  infoPill: {backgroundColor: '#f3f5f7', color: '#59626d', fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, overflow: 'hidden', marginRight: 8, marginBottom: 8},
  openPill: {backgroundColor: '#e8f8ee', color: '#176b36'},
  closedPill: {backgroundColor: '#fdecec', color: '#8b3434'},
  visitDate: {fontSize: 12, color: '#999', textAlign: 'center', marginTop: 14},
  modalActions: {flexDirection: 'row', marginTop: 18},
  secondaryAction: {minHeight: 48, paddingHorizontal: 14, borderRadius: 15, backgroundColor: '#f1f1f1', alignItems: 'center', justifyContent: 'center', marginRight: 8},
  secondaryActionText: {fontSize: 12, fontWeight: '900', color: '#3b3b3b'},
  primaryAction: {flex: 1, minHeight: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center'},
  primaryActionText: {fontSize: 13, fontWeight: '900', color: '#fff'},
});
