import React, {useMemo, useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Share, StyleSheet, Text, TextInput, View} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {RootStackParamList} from '../navigation/types';
import {useApp} from '../context/AppContext';
import {Chip} from '../components/Chip';
import {PrimaryButton} from '../components/PrimaryButton';
import {MoodSelector} from '../components/MoodSelector';
import {LocationSummary} from '../components/LocationSummary';
import {getCurrentLocation} from '../services/locationService';
import {resolveCurrentLocation} from '../services/placeService';
import {decodeGroupSession, encodeGroupSession, getGroupBudgetWindow, getGroupRecommendations, groupShareLink} from '../services/groupRecommendationService';
import {AllergyKey, GroupMember, GroupSession, MealType, MoodKey, SpicePreference} from '../types';
import {formatBudgetInput, parseBudgetInput} from '../utils/budgetInput';
import {groupMemberLimit} from '../services/usageQuotaService';
import {isFreeLaunchMode} from '../config/monetizationConfig';

type Props = NativeStackScreenProps<RootStackParamList, 'GroupMode'>;
const preferenceDefs = ['Healthy','High Protein','Vegetarian','Quick Meal'];
const restrictionDefs = ['Vegetarian','Vegan','Halal','Gluten Free','No Pork','No Beef'];
const allergyDefs: AllergyKey[] = ['Peanuts','Shellfish','Dairy','Egg','Sesame'];
const spiceDefs: SpicePreference[] = ['any','mild','medium','spicy'];
const makeId=(prefix:string)=>`${prefix}:${Date.now()}:${Math.random().toString(36).slice(2,7)}`;
const toggle=(list:string[],value:string)=>list.includes(value)?list.filter(x=>x!==value):[...list,value];

export function GroupModeScreen({navigation}:Props){
  const {t}=useTranslation();
  const {profile,history,locationContext,setLocationContext,isPremium}=useApp();
  const [members,setMembers]=useState<GroupMember[]>([{id:makeId('me'),name:t('groupYou'),budget:(!locationContext || locationContext.currency===profile.currency)?profile.defaultBudget:undefined,preferences:[...(profile.preferences||[])],restrictions:[...(profile.restrictions||[])],allergies:[...(profile.allergies||[])],spicePreference:profile.spicePreference||'any'}]);
  const [groupName,setGroupName]=useState(t('groupDefaultName'));
  const [mealType,setMealType]=useState<MealType>('lunch');
  const [mood,setMood]=useState<MoodKey|undefined>();
  const [shareCode,setShareCode]=useState('');
  const [importCode,setImportCode]=useState('');
  const [loading,setLoading]=useState(false);
  const currency=locationContext?.currency||profile.currency;
  const session=useMemo<GroupSession>(()=>({id:makeId('group'),name:groupName.trim()||t('groupDefaultName'),currency,mealType,mood,members,createdAt:new Date().toISOString()}),[groupName,currency,mealType,mood,members,t]);
  const updateMember=(id:string,patch:Partial<GroupMember>)=>setMembers(curr=>curr.map(m=>m.id===id?{...m,...patch}:m));
  const addMember=()=>{
    const limit=groupMemberLimit(isPremium);
    if(members.length>=limit){
      if(!isFreeLaunchMode()&&!isPremium){
        return Alert.alert(t('freeLimitTitle'),t('freeLimitGroupText',{count:limit}),[
          {text:t('freeLimitGoPremium'),onPress:()=>navigation.navigate('Premium')},
          {text:t('common.cancel'),style:'cancel'},
        ]);
      }
      return Alert.alert(t('groupLimitTitle'),t('groupLimitText'));
    }
    setMembers(curr=>[...curr,{id:makeId('member'),name:t('groupMemberName',{number:curr.length+1}),preferences:[],restrictions:[],allergies:[],spicePreference:'any'}]);
  };
  const removeMember=(id:string)=>setMembers(curr=>curr.filter(m=>m.id!==id));
  const ensureLocation=async()=>{if(locationContext?.source==='current')return locationContext;const coordinates=await getCurrentLocation();const resolved=await resolveCurrentLocation(coordinates,profile.currency);setLocationContext(resolved);return resolved;};
  const recommend=async()=>{const window=getGroupBudgetWindow(session);if(window&&!window.valid)return Alert.alert(t('groupBudgetTitle'),t('groupBudgetNoOverlap'));setLoading(true);try{const loc=await ensureLocation().catch(()=>locationContext||null);const p={...profile,currency:loc?.currency||currency};const s={...session,currency:p.currency};const suggestions=getGroupRecommendations({session:s,profile:p,history,locationContext:loc||undefined,limit:5});if(!suggestions.length)return Alert.alert(t('groupNoMatchTitle'),t('groupNoMatchText'));navigation.navigate('MealResults',{mode:'daily',title:t('groupResultsTitle',{count:members.length}),suggestions,currency:p.currency,locale:profile.locale,locationContext:loc||undefined,requestContext:{mode:'daily',location:loc?.coordinates,locationContext:loc||undefined,history,profile:p,mealType,mood,groupSession:s,groupMode:true}});}finally{setLoading(false);}};
  const share=async()=>{const {code,link}=groupShareLink(session);setShareCode(code);await Share.share({message:`${t('groupShareMessage')}\n${link}\n\n${t('groupShareCodeLabel')}: ${code}`}).catch(()=>undefined);};
  const importGroup=()=>{try{const imported=decodeGroupSession(importCode);setGroupName(imported.name);setMembers(imported.members);setMealType(imported.mealType);setMood(imported.mood);setShareCode(encodeGroupSession(imported));Alert.alert(t('groupImportedTitle'),t('groupImportedText'));}catch{Alert.alert(t('groupInvalidCodeTitle'),t('groupInvalidCodeText'));}};
  const prefLabel=(pref:string)=>t(pref==='Healthy'?'daily.prefs.healthy':pref==='High Protein'?'daily.prefs.highProtein':pref==='Vegetarian'?'daily.prefs.vegetarian':'daily.prefs.quickMeal');
  const allergyLabel=(a:AllergyKey)=>t(a==='Peanuts'?'allergyPeanuts':a==='Shellfish'?'allergyShellfish':a==='Dairy'?'allergyDairy':a==='Egg'?'allergyEgg':'allergySesame');
  const spiceLabel=(s:SpicePreference)=>t(s==='any'?'smartSpiceAny':s==='mild'?'smartSpiceMild':s==='medium'?'smartSpiceMedium':'smartSpiceSpicy');
  return <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS==='ios'?'padding':'height'}><ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
    <Text style={styles.kicker}>{t('groupEyebrow')}</Text><Text style={styles.title}>{t('groupTitle')}</Text><Text style={styles.subtitle}>{t('groupSubtitle')}</Text>
    <LocationSummary value={locationContext} title={t('groupArea')} />
    <View style={styles.panel}><Text style={styles.label}>{t('groupName')}</Text><TextInput value={groupName} onChangeText={setGroupName} style={styles.input}/><Text style={styles.label}>{t('groupMealType')}</Text><View style={styles.chips}>{(['breakfast','lunch','dinner'] as MealType[]).map(x=><Chip key={x} label={t(x==='breakfast'?'mealTypeBreakfast':x==='dinner'?'mealTypeDinner':'mealTypeLunch')} selected={mealType===x} onPress={()=>setMealType(x)}/>)}</View></View>
    <MoodSelector value={mood} onChange={setMood} compact />
    <Text style={styles.sectionTitle}>{t('groupMembers',{count:members.length})}</Text>
    {members.map((member,index)=><View style={styles.memberCard} key={member.id}>
      <View style={styles.memberTop}><Text style={styles.memberIndex}>#{index+1}</Text>{index>0?<Pressable onPress={()=>removeMember(member.id)}><Text style={styles.remove}>{t('groupRemove')}</Text></Pressable>:null}</View>
      <TextInput value={member.name} onChangeText={name=>updateMember(member.id,{name})} style={styles.input}/>
      <Text style={styles.smallLabel}>{t('groupBudgetPerPerson',{currency})}</Text><TextInput value={member.budget?formatBudgetInput(member.budget,profile.locale):''} onChangeText={v=>updateMember(member.id,{budget:parseBudgetInput(v)||undefined})} style={styles.input} keyboardType="numeric" placeholder={t('groupNoBudget')}/>
      <Text style={styles.smallLabel}>{t('groupPreferences')}</Text><View style={styles.chips}>{preferenceDefs.map(pref=><Chip key={pref} label={prefLabel(pref)} selected={member.preferences.includes(pref)} onPress={()=>updateMember(member.id,{preferences:toggle(member.preferences,pref)})}/>)}</View>
      <Text style={styles.smallLabel}>{t('groupRestrictions')}</Text><View style={styles.chips}>{restrictionDefs.map(rule=><Chip key={rule} label={t(rule==='Vegetarian'?'profile.restrictionsList.vegetarian':rule==='Vegan'?'profile.restrictionsList.vegan':rule==='Halal'?'profile.restrictionsList.halal':rule==='Gluten Free'?'profile.restrictionsList.glutenFree':rule==='No Pork'?'profile.restrictionsList.noPork':'profile.restrictionsList.noBeef')} selected={member.restrictions.includes(rule)} onPress={()=>updateMember(member.id,{restrictions:toggle(member.restrictions,rule)})}/>)}</View>
      <Text style={styles.smallLabel}>{t('groupAllergies')}</Text><View style={styles.chips}>{allergyDefs.map(a=><Chip key={a} label={allergyLabel(a)} selected={member.allergies.includes(a)} onPress={()=>updateMember(member.id,{allergies:toggle(member.allergies,a) as AllergyKey[]})}/>)}</View>
      <Text style={styles.smallLabel}>{t('smartSpiceTitle')}</Text><View style={styles.chips}>{spiceDefs.map(spice=><Chip key={spice} label={spiceLabel(spice)} selected={member.spicePreference===spice} onPress={()=>updateMember(member.id,{spicePreference:spice})}/>)}</View>
    </View>)}
    <Pressable style={styles.addButton} onPress={addMember}><Text style={styles.addButtonText}>＋ {t('groupAddMember')}</Text></Pressable>
    <View style={styles.sharePanel}><Text style={styles.shareTitle}>{t('groupInviteTitle')}</Text><Text style={styles.shareText}>{t('groupInviteText')}</Text><Pressable style={styles.shareButton} onPress={share}><Text style={styles.shareButtonText}>{t('groupCreateShare')}</Text></Pressable>{shareCode?<Text selectable style={styles.codeText}>{shareCode}</Text>:null}<Text style={styles.smallLabel}>{t('groupJoinByCode')}</Text><TextInput value={importCode} onChangeText={setImportCode} style={[styles.input,styles.codeInput]} multiline placeholder={t('groupPasteCode')}/><Pressable style={styles.importButton} onPress={importGroup}><Text style={styles.importButtonText}>{t('groupImport')}</Text></Pressable></View>
    <View style={styles.note}><Text style={styles.noteText}>ℹ️ {t('groupSafetyNote')}</Text></View>
    <PrimaryButton title={t('groupRecommendButton')} onPress={recommend} loading={loading}/>
  </ScrollView></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({flex:{flex:1,backgroundColor:'#fbfaf8'},container:{padding:20,paddingBottom:80},kicker:{fontSize:12,fontWeight:'900',color:'#8a6949'},title:{fontSize:32,fontWeight:'900',color:'#171717',marginTop:8},subtitle:{fontSize:14,lineHeight:21,color:'#666',marginTop:8,marginBottom:16},panel:{backgroundColor:'#fff',borderRadius:22,padding:15,borderWidth:1,borderColor:'#eadfce',marginTop:12},label:{fontSize:13,fontWeight:'900',color:'#333',marginTop:8,marginBottom:7},smallLabel:{fontSize:12,fontWeight:'900',color:'#555',marginTop:13,marginBottom:7},input:{minHeight:48,borderWidth:1,borderColor:'#e2ddd7',backgroundColor:'#fff',borderRadius:14,paddingHorizontal:13,fontSize:14,color:'#171717'},chips:{flexDirection:'row',flexWrap:'wrap'},sectionTitle:{fontSize:17,fontWeight:'900',color:'#222',marginTop:16},memberCard:{backgroundColor:'#fff',borderRadius:22,padding:15,borderWidth:1,borderColor:'#e8e1d9',marginTop:12},memberTop:{flexDirection:'row',justifyContent:'space-between',marginBottom:8},memberIndex:{fontWeight:'900',color:'#8a6949'},remove:{fontWeight:'900',color:'#b04f4f'},addButton:{minHeight:48,borderRadius:16,borderWidth:1,borderStyle:'dashed',borderColor:'#9bb7e5',alignItems:'center',justifyContent:'center',marginTop:12},addButtonText:{fontWeight:'900',color:'#3568b8'},sharePanel:{backgroundColor:'#eef5ff',borderRadius:22,padding:15,marginTop:16},shareTitle:{fontSize:15,fontWeight:'900',color:'#263c61'},shareText:{fontSize:12,lineHeight:18,color:'#62728c',marginTop:5},shareButton:{minHeight:44,backgroundColor:'#3568b8',borderRadius:14,alignItems:'center',justifyContent:'center',marginTop:12},shareButtonText:{color:'#fff',fontWeight:'900'},codeText:{fontSize:10,lineHeight:15,color:'#53657f',backgroundColor:'#fff',borderRadius:10,padding:10,marginTop:10},codeInput:{minHeight:72,textAlignVertical:'top'},importButton:{minHeight:42,borderRadius:13,backgroundColor:'#fff',borderWidth:1,borderColor:'#aac0e4',alignItems:'center',justifyContent:'center',marginTop:8},importButtonText:{fontWeight:'900',color:'#3568b8'},note:{backgroundColor:'#fff5ef',borderRadius:16,padding:12,marginVertical:14},noteText:{fontSize:11,lineHeight:17,color:'#86523e',fontWeight:'700'}});
