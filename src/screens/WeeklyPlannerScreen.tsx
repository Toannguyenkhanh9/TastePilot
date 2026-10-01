import React, {useState} from 'react';
import {Alert, Pressable, ScrollView, StyleSheet, Text, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {Chip} from '../components/Chip';
import {MoodSelector} from '../components/MoodSelector';
import {PrimaryButton} from '../components/PrimaryButton';
import {FoodAssetIcon} from '../components/FoodAssetIcon';
import {formatMoney} from '../utils/format';
import {createWeeklyPlan, replaceWeeklyPlanDay} from '../services/weeklyPlannerService';
import {MealType, MoodKey} from '../types';
import {canUseSevenDinnerPlanner} from '../services/usageQuotaService';

type Props=NativeStackScreenProps<RootStackParamList,'WeeklyPlanner'>;
export function WeeklyPlannerScreen({navigation}:Props){
  const {t}=useTranslation();const {profile,history,locationContext,weeklyPlan,setWeeklyPlan,isPremium}=useApp();
  const [count,setCount]=useState<5|7>(weeklyPlan?.count||5);const [mealType,setMealType]=useState<MealType>(weeklyPlan?.mealType||'lunch');const [mood,setMood]=useState<MoodKey|undefined>(weeklyPlan?.mood);const [loading,setLoading]=useState(false);const [swapping,setSwapping]=useState<string|null>(null);
  const create=()=>{setLoading(true);try{const p=createWeeklyPlan({count,mealType,mood,profile:{...profile,currency:locationContext?.currency||profile.currency},history,locationContext:locationContext||undefined});if(p.days.length<count)Alert.alert(t('plannerLimitedTitle'),t('plannerLimitedText',{count:p.days.length}));setWeeklyPlan(p);}finally{setLoading(false);}};
  const swap=(id:string)=>{if(!weeklyPlan)return;setSwapping(id);try{setWeeklyPlan(replaceWeeklyPlanDay({plan:weeklyPlan,dayId:id,profile:{...profile,currency:locationContext?.currency||profile.currency},history,locationContext:locationContext||undefined}));}finally{setSwapping(null);}};
  return <ScrollView contentContainerStyle={styles.container}><Text style={styles.kicker}>{t('plannerEyebrow')}</Text><Text style={styles.title}>{t('plannerTitle')}</Text><Text style={styles.subtitle}>{t('plannerSubtitle')}</Text>
    <View style={styles.panel}><Text style={styles.label}>{t('plannerPlanSize')}</Text><View style={styles.chips}><Chip label={t('plannerFiveLunches')} selected={count===5&&mealType==='lunch'} onPress={()=>{setCount(5);setMealType('lunch');}}/><Chip label={t('plannerSevenDinners')} selected={count===7&&mealType==='dinner'} onPress={()=>{
      if(!canUseSevenDinnerPlanner(isPremium)){
        Alert.alert(t('freeLimitTitle'),t('freeLimitPlannerText'),[
          {text:t('freeLimitGoPremium'),onPress:()=>navigation.navigate('Premium')},
          {text:t('common.cancel'),style:'cancel'},
        ]);
        return;
      }
      setCount(7);setMealType('dinner');
    }}/></View><Text style={styles.helper}>{t('plannerCuisineHint')}</Text></View>
    <MoodSelector value={mood} onChange={setMood} compact/><PrimaryButton title={weeklyPlan?t('plannerRebuild'):t('plannerCreate')} onPress={create} loading={loading}/>
    {weeklyPlan?<><View style={styles.planHeader}><Text style={styles.planHeaderTitle}>{t('plannerSavedPlan')}</Text><Pressable onPress={()=>setWeeklyPlan(null)}><Text style={styles.clear}>{t('plannerClear')}</Text></Pressable></View>{weeklyPlan.days.map(day=>{const date=new Date(day.dateISO);const dateLabel=date.toLocaleDateString(profile.locale,{weekday:'short',month:'short',day:'numeric'});const meal=day.meal;return <View style={styles.card} key={day.id}><View style={styles.dayBadge}><Text style={styles.dayBadgeText}>{dateLabel}</Text></View><View style={styles.mealRow}><View style={styles.iconShell}><FoodAssetIcon meal={meal} size={72}/></View><View style={styles.mealCopy}><Text style={styles.mealName}>{meal.name}</Text><Text style={styles.cuisine}>{meal.cuisine}</Text><Text style={styles.price}>{formatMoney(meal.estimatedMin,profile.locale,weeklyPlan.currency)} – {formatMoney(meal.estimatedMax,profile.locale,weeklyPlan.currency)}</Text></View></View><View style={styles.actions}><Pressable style={styles.secondary} onPress={()=>swap(day.id)} disabled={swapping===day.id}><Text style={styles.secondaryText}>{swapping===day.id?t('plannerReplacing'):t('plannerReplace')}</Text></Pressable><Pressable style={styles.primary} onPress={()=>navigation.navigate('Restaurants',{meal,mode:'daily',locationContext:locationContext||undefined})}><Text style={styles.primaryText}>{t('mealResults.findPlaces')}</Text></Pressable></View></View>;})}</>:<View style={styles.empty}><Text style={styles.emptyTitle}>{t('plannerEmptyTitle')}</Text><Text style={styles.emptyText}>{t('plannerEmptyText')}</Text></View>}
  </ScrollView>;
}
const styles=StyleSheet.create({container:{padding:20,paddingBottom:60,backgroundColor:'#fff9f1',flexGrow:1},kicker:{fontSize:12,fontWeight:'900',color:'#8a6949'},title:{fontSize:32,fontWeight:'900',color:'#171717',marginTop:8},subtitle:{fontSize:14,lineHeight:21,color:'#666',marginTop:8,marginBottom:14},panel:{backgroundColor:'#fff',borderRadius:22,padding:15,borderWidth:1,borderColor:'#eadfce'},label:{fontSize:13,fontWeight:'900',color:'#333'},chips:{flexDirection:'row',flexWrap:'wrap',marginTop:8},helper:{fontSize:12,lineHeight:18,color:'#777',marginTop:8},planHeader:{flexDirection:'row',justifyContent:'space-between',marginTop:20},planHeaderTitle:{fontSize:17,fontWeight:'900'},clear:{fontSize:12,fontWeight:'900',color:'#b04f4f'},card:{backgroundColor:'#fff',borderRadius:24,padding:15,borderWidth:1,borderColor:'#eadfce',marginTop:12},dayBadge:{alignSelf:'flex-start',backgroundColor:'#fff0e7',borderRadius:999,paddingHorizontal:10,paddingVertical:6},dayBadgeText:{fontSize:11,fontWeight:'900',color:'#d95f38'},mealRow:{flexDirection:'row',alignItems:'center',marginTop:12},iconShell:{width:88,height:88,borderRadius:22,backgroundColor:'#fff6e8',alignItems:'center',justifyContent:'center'},mealCopy:{flex:1,paddingLeft:13},mealName:{fontSize:19,fontWeight:'900'},cuisine:{fontSize:13,fontWeight:'800',color:'#666',marginTop:4},price:{fontSize:12,color:'#8a6949',fontWeight:'800',marginTop:6},actions:{flexDirection:'row',marginTop:14},secondary:{flex:1,minHeight:44,borderRadius:14,backgroundColor:'#f2f2f2',alignItems:'center',justifyContent:'center',marginRight:8},secondaryText:{fontSize:12,fontWeight:'900'},primary:{flex:1,minHeight:44,borderRadius:14,backgroundColor:'#d95f38',alignItems:'center',justifyContent:'center'},primaryText:{fontSize:12,fontWeight:'900',color:'#fff'},empty:{backgroundColor:'#fff',borderRadius:22,padding:20,borderWidth:1,borderColor:'#eadfce',marginTop:18},emptyTitle:{fontSize:15,fontWeight:'900'},emptyText:{fontSize:13,lineHeight:20,color:'#777',marginTop:6}});
