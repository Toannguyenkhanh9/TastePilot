import {
  AllergyKey,
  GroupMember,
  GroupSession,
  LocationContext,
  MealHistoryItem,
  MealSuggestion,
  MealType,
  MoodKey,
  SpicePreference,
  UserProfile,
} from '../types';
import {getLocalRecommendations, LocalDish} from './localRecommendationService';

const CATALOG = require('../data/dishes1500_global.json') as LocalDish[];
const CATALOG_BY_ID = new Map(CATALOG.map(item => [item.id, item]));

type GroupRecommendationInput = {
  session: GroupSession;
  profile: UserProfile;
  history: MealHistoryItem[];
  locationContext?: LocationContext;
  excludeDishNames?: string[];
  limit?: number;
};

function normalize(value?: string) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function unique<T>(items:T[]){return Array.from(new Set(items));}

function sharedBudgetWindow(members: GroupMember[]) {
  const budgets=members.map(m=>Number(m.budget)).filter(v=>Number.isFinite(v)&&v>0);
  if(!budgets.length)return undefined;
  const min=Math.max(...budgets.map(v=>v*.8));
  const max=Math.min(...budgets.map(v=>v*1.2));
  return {min,max,valid:min<=max};
}
function preferenceVotes(members:GroupMember[]){const votes=new Map<string,number>();members.forEach(m=>unique((m.preferences||[]).map(normalize).filter(Boolean)).forEach(p=>votes.set(p,(votes.get(p)||0)+1)));return votes;}
function memberDishScore(member:GroupMember,dish?:LocalDish){if(!dish)return 70;const cuisine=normalize(dish.cuisine),tags=(dish.tags||[]).map(normalize),prefs=(member.preferences||[]).map(normalize);let score=72;for(const pref of prefs){if(!pref)continue;if(cuisine.includes(pref)||pref.includes(cuisine))score+=9;if(tags.some(tag=>tag.includes(pref)||pref.includes(tag)))score+=7;if(pref.includes('healthy')&&(dish.vegetarian||tags.includes('healthy')))score+=8;if(pref.includes('vegetarian')&&dish.vegetarian)score+=12;if(pref.includes('quick')&&dish.category==='snack')score+=8;}const spice=Number(dish.spicyLevel||0);if(member.spicePreference==='mild'&&spice>=3)score-=16;if(member.spicePreference==='spicy'&&spice>=2)score+=8;if(member.spicePreference==='medium'&&spice===2)score+=7;return Math.max(45,Math.min(98,Math.round(score)));}

export function getGroupBudgetWindow(session:GroupSession){return sharedBudgetWindow(session.members);}

export function getGroupRecommendations(input:GroupRecommendationInput):MealSuggestion[]{
  const members=input.session.members.filter(m=>m.name.trim());if(!members.length)return[];
  const allRestrictions=unique(members.flatMap(m=>m.restrictions||[]));
  const allAllergies=unique(members.flatMap(m=>m.allergies||[])) as AllergyKey[];
  const orderedPreferences=[...preferenceVotes(members).entries()].sort((a,b)=>b[1]-a[1]).map(([p])=>p);
  const combinedProfile:UserProfile={...input.profile,currency:input.session.currency||input.profile.currency,preferences:orderedPreferences,restrictions:allRestrictions,allergies:allAllergies,spicePreference:'any' as SpicePreference};
  const candidates=getLocalRecommendations({mode:'daily',profile:combinedProfile,history:input.history,locationContext:input.locationContext,preferences:orderedPreferences,mealType:input.session.mealType,mood:input.session.mood,excludeDishNames:input.excludeDishNames,limit:70,maxPerCuisine:3});
  const budgetWindow=sharedBudgetWindow(members);if(budgetWindow&&!budgetWindow.valid)return[];
  const scored=candidates.filter(meal=>!budgetWindow||(meal.estimatedMin>=budgetWindow.min&&meal.estimatedMax<=budgetWindow.max)).map(meal=>{const dish=meal.canonicalId?CATALOG_BY_ID.get(meal.canonicalId):undefined;const memberScores=members.map(m=>memberDishScore(m,dish));const avg=memberScores.reduce((s,v)=>s+v,0)/Math.max(1,memberScores.length);const minScore=Math.min(...memberScores);const groupMatchPercent=Math.round(Math.max(45,Math.min(98,avg+Math.max(0,minScore-60)*.22)));return{...meal,groupMatchPercent,tasteMatchPercent:groupMatchPercent};}).sort((a,b)=>(b.groupMatchPercent||0)-(a.groupMatchPercent||0));
  const limit=input.limit||5,result:MealSuggestion[]=[];const families=new Set<string>();for(const meal of scored){if(result.length>=limit)break;const fam=meal.familyId||meal.canonicalId||meal.name;if(families.has(fam))continue;families.add(fam);result.push(meal);}return result;
}

const BASE64='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
function utf8Bytes(value:string){const bytes:number[]=[];for(let i=0;i<value.length;i++){let code=value.charCodeAt(i);if(code>=0xd800&&code<=0xdbff&&i+1<value.length){const next=value.charCodeAt(++i);code=0x10000+((code-0xd800)<<10)+(next-0xdc00);}if(code<=0x7f)bytes.push(code);else if(code<=0x7ff)bytes.push(0xc0|(code>>6),0x80|(code&0x3f));else if(code<=0xffff)bytes.push(0xe0|(code>>12),0x80|((code>>6)&0x3f),0x80|(code&0x3f));else bytes.push(0xf0|(code>>18),0x80|((code>>12)&0x3f),0x80|((code>>6)&0x3f),0x80|(code&0x3f));}return bytes;}
function bytesToBase64(bytes:number[]){let out='';for(let i=0;i<bytes.length;i+=3){const a=bytes[i],b=i+1<bytes.length?bytes[i+1]:0,c=i+2<bytes.length?bytes[i+2]:0,triple=(a<<16)|(b<<8)|c;out+=BASE64[(triple>>18)&63]+BASE64[(triple>>12)&63]+(i+1<bytes.length?BASE64[(triple>>6)&63]:'=')+(i+2<bytes.length?BASE64[triple&63]:'=');}return out;}
function base64ToBytes(value:string){let clean=value.replace(/-/g,'+').replace(/_/g,'/');while(clean.length%4)clean+='=';const bytes:number[]=[];for(let i=0;i<clean.length;i+=4){const c1=BASE64.indexOf(clean[i]),c2=BASE64.indexOf(clean[i+1]),c3=clean[i+2]==='='?-1:BASE64.indexOf(clean[i+2]),c4=clean[i+3]==='='?-1:BASE64.indexOf(clean[i+3]);if(c1<0||c2<0)continue;const triple=(c1<<18)|(c2<<12)|((c3<0?0:c3)<<6)|(c4<0?0:c4);bytes.push((triple>>16)&0xff);if(c3>=0)bytes.push((triple>>8)&0xff);if(c4>=0)bytes.push(triple&0xff);}return bytes;}
function decodeUtf8(bytes:number[]){let out='';for(let i=0;i<bytes.length;){const first=bytes[i++];let code=first;if((first&0xe0)===0xc0)code=((first&0x1f)<<6)|(bytes[i++]&0x3f);else if((first&0xf0)===0xe0)code=((first&0x0f)<<12)|((bytes[i++]&0x3f)<<6)|(bytes[i++]&0x3f);else if((first&0xf8)===0xf0)code=((first&0x07)<<18)|((bytes[i++]&0x3f)<<12)|((bytes[i++]&0x3f)<<6)|(bytes[i++]&0x3f);if(code<=0xffff)out+=String.fromCharCode(code);else{code-=0x10000;out+=String.fromCharCode(0xd800+((code>>10)&0x3ff),0xdc00+(code&0x3ff));}}return out;}

type SharePayload={v:1;n:string;c:string;mt:MealType;mo?:MoodKey;m:Array<{n:string;b?:number;p:string[];r:string[];a:AllergyKey[];s:SpicePreference}>};
export function encodeGroupSession(session:GroupSession){const payload:SharePayload={v:1,n:session.name,c:session.currency,mt:session.mealType,mo:session.mood,m:session.members.map(m=>({n:m.name,b:m.budget,p:m.preferences,r:m.restrictions,a:m.allergies,s:m.spicePreference}))};const base64=bytesToBase64(utf8Bytes(JSON.stringify(payload))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,'');return`TPG1.${base64}`;}
export function decodeGroupSession(raw:string):GroupSession{const input=String(raw||'').trim();let code=input;const q=input.indexOf('code=');if(q>=0)code=decodeURIComponent(input.slice(q+5).split(/[&#]/)[0]);if(!code.startsWith('TPG1.'))throw new Error('INVALID_GROUP_CODE');const payload=JSON.parse(decodeUtf8(base64ToBytes(code.slice(5)))) as SharePayload;if(payload.v!==1||!Array.isArray(payload.m))throw new Error('INVALID_GROUP_CODE');return{id:`group:${Date.now()}`,name:payload.n||'TastePilot Group',currency:payload.c||'USD',mealType:payload.mt||'lunch',mood:payload.mo,createdAt:new Date().toISOString(),members:payload.m.slice(0,8).map((m,i)=>({id:`member:${Date.now()}:${i}`,name:m.n||`Member ${i+1}`,budget:Number(m.b)>0?Number(m.b):undefined,preferences:Array.isArray(m.p)?m.p:[],restrictions:Array.isArray(m.r)?m.r:[],allergies:Array.isArray(m.a)?m.a:[],spicePreference:m.s||'any'}))};}
export function groupShareLink(session:GroupSession){const code=encodeGroupSession(session);return{code,link:`tastepilot://group?code=${encodeURIComponent(code)}`};}
