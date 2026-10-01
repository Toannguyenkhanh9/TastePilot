import React, {useMemo, useState} from 'react';
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
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
import {useApp} from '../context/AppContext';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {APP_LOCAL_BANNERS} from '../utils/localArt';
import {
  buildFreeTextSearchMeal,
  catalogDishToMealSuggestion,
  searchCatalogDishes,
} from '../services/foodSearchService';

export function FoodSearchScreen({navigation}: NativeStackScreenProps<RootStackParamList, 'FoodSearch'>) {
  const {t} = useTranslation();
  const {profile, locationContext} = useApp();
  const [query, setQuery] = useState('');

  const results = useMemo(
    () => searchCatalogDishes(query, profile.locale, 24),
    [query, profile.locale],
  );

  const openMeal = (meal: ReturnType<typeof catalogDishToMealSuggestion>) => {
    navigation.navigate('Restaurants', {
      meal,
      mode: 'daily',
      locationContext: locationContext || undefined,
    });
  };

  const searchFreeText = () => {
    const clean = query.trim();
    if (!clean) return;
    navigation.navigate('Restaurants', {
      meal: buildFreeTextSearchMeal(clean),
      mode: 'daily',
      locationContext: locationContext || undefined,
    });
  };

  return (
    <ImageBackground source={APP_LOCAL_BANNERS.home} style={styles.screen} imageStyle={styles.bgImage}>
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled">
          <View style={styles.heroCard}>
            <Text style={styles.kicker}>{t('foodSearch.kicker')}</Text>
            <Text style={styles.title}>{t('foodSearch.title')}</Text>
            <Text style={styles.subtitle}>{t('foodSearch.subtitle')}</Text>
          </View>

          <View style={styles.searchCard}>
            <View style={styles.inputRow}>
              <Text style={styles.searchEmoji}>🔎</Text>
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder={t('foodSearch.placeholder')}
                placeholderTextColor="#9a9a9a"
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={searchFreeText}
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10}>
                  <Text style={styles.clear}>✕</Text>
                </Pressable>
              ) : null}
            </View>
            <Text style={styles.hint}>{t('foodSearch.hint')}</Text>
          </View>

          {query.trim() ? (
            <>
              <View style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{t('foodSearch.catalogMatches')}</Text>
                <Text style={styles.count}>{results.length}</Text>
              </View>

              {results.map(dish => {
                const meal = catalogDishToMealSuggestion(dish, profile.locale);
                return (
                  <Pressable
                    key={dish.id}
                    style={({pressed}) => [styles.resultCard, pressed && styles.pressed]}
                    onPress={() => openMeal(meal)}>
                    <View style={styles.iconShell}>
                      <FoodAssetIcon meal={meal} size={76} />
                    </View>
                    <View style={styles.resultCopy}>
                      <Text style={styles.resultName}>{meal.name}</Text>
                      <Text style={styles.resultCuisine}>{meal.cuisine}</Text>
                      <Text style={styles.resultKeyword} numberOfLines={1}>{dish.searchKeyword}</Text>
                    </View>
                    <Text style={styles.arrow}>→</Text>
                  </Pressable>
                );
              })}

              <Pressable
                style={({pressed}) => [styles.freeSearchButton, pressed && styles.pressed]}
                onPress={searchFreeText}>
                <Text style={styles.freeSearchTitle}>{t('foodSearch.searchNearby', {query: query.trim()})}</Text>
                <Text style={styles.freeSearchText}>{t('foodSearch.freeTextHint')}</Text>
              </Pressable>

              {results.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>{t('foodSearch.noCatalogMatch')}</Text>
                  <Text style={styles.emptyText}>{t('foodSearch.noCatalogMatchText')}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>{t('foodSearch.startTitle')}</Text>
              <Text style={styles.emptyText}>{t('foodSearch.startText')}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex:{flex:1},
  screen:{flex:1,backgroundColor:'#fff9f1'},
  bgImage:{opacity:.28},
  overlay:{...StyleSheet.absoluteFillObject,backgroundColor:'rgba(255,248,238,0.84)'},
  container:{padding:20,paddingBottom:42},
  heroCard:{backgroundColor:'rgba(255,255,255,.95)',borderRadius:26,padding:20,borderWidth:1,borderColor:'#eadfce'},
  kicker:{fontSize:12,fontWeight:'900',letterSpacing:1.4,color:'#8a6949'},
  title:{fontSize:32,lineHeight:38,fontWeight:'900',color:'#171717',marginTop:8},
  subtitle:{fontSize:15,lineHeight:22,color:'#666',marginTop:10},
  searchCard:{backgroundColor:'#fff',borderRadius:22,padding:14,borderWidth:1,borderColor:'#eadfce',marginTop:16},
  inputRow:{minHeight:54,borderRadius:16,borderWidth:1,borderColor:'#dedbd6',backgroundColor:'#fff',flexDirection:'row',alignItems:'center',paddingHorizontal:14},
  searchEmoji:{fontSize:20,marginRight:10},
  input:{flex:1,fontSize:16,color:'#171717',paddingVertical:0},
  clear:{fontSize:18,color:'#777',fontWeight:'800',paddingLeft:10},
  hint:{fontSize:12,lineHeight:18,color:'#777',marginTop:10},
  sectionRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:20,marginBottom:8},
  sectionTitle:{fontSize:18,fontWeight:'900',color:'#1b1b1b'},
  count:{fontSize:12,fontWeight:'900',color:'#d95f38',backgroundColor:'#fff0e7',paddingHorizontal:10,paddingVertical:6,borderRadius:999,overflow:'hidden'},
  resultCard:{backgroundColor:'#fff',borderRadius:20,borderWidth:1,borderColor:'#eadfce',padding:12,marginTop:10,flexDirection:'row',alignItems:'center'},
  iconShell:{width:86,height:86,borderRadius:20,backgroundColor:'#fff7ea',alignItems:'center',justifyContent:'center'},
  resultCopy:{flex:1,marginLeft:14},
  resultName:{fontSize:18,fontWeight:'900',color:'#171717'},
  resultCuisine:{fontSize:13,fontWeight:'700',color:'#7d6c62',marginTop:4},
  resultKeyword:{fontSize:12,color:'#888',marginTop:6},
  arrow:{fontSize:24,fontWeight:'900',color:'#9a9a9a',marginLeft:8},
  freeSearchButton:{backgroundColor:'#c95332',borderRadius:20,padding:16,marginTop:14},
  freeSearchTitle:{fontSize:16,fontWeight:'900',color:'#fff'},
  freeSearchText:{fontSize:12,lineHeight:18,color:'rgba(255,255,255,.82)',marginTop:5},
  emptyCard:{backgroundColor:'rgba(255,255,255,.92)',borderRadius:20,borderWidth:1,borderColor:'#eadfce',padding:18,marginTop:16},
  emptyTitle:{fontSize:16,fontWeight:'900',color:'#222'},
  emptyText:{fontSize:13,lineHeight:20,color:'#777',marginTop:6},
  pressed:{opacity:.84,transform:[{scale:.995}]},
});
