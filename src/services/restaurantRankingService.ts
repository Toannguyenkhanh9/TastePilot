import {MealSuggestion, Restaurant} from '../types';

function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function parsePriceLevel(value?: string) {
  const raw = String(value || '').trim().toUpperCase();
  if (!raw) return undefined;
  if (/^\${1,4}$/.test(raw)) return raw.length;
  if (raw.includes('INEXPENSIVE') || raw.includes('FREE')) return 1;
  if (raw.includes('VERY_EXPENSIVE')) return 4;
  if (raw.includes('EXPENSIVE')) return 3;
  if (raw.includes('MODERATE')) return 2;
  const n = Number(raw); return Number.isFinite(n) && n >= 1 && n <= 4 ? n : undefined;
}
function ratingPoints(rating:number){return Number.isFinite(rating)?clamp((rating-3.2)/1.8,0,1)*28:0;}
function reviewPoints(reviews:number){return Number.isFinite(reviews)&&reviews>0?clamp(Math.log10(reviews+1)/4,0,1)*14:0;}
function distancePoints(distance?:number){if(distance==null||!Number.isFinite(distance))return 6;if(distance<=300)return 20;if(distance<=700)return 18;if(distance<=1000)return 16;if(distance<=2000)return 12;if(distance<=5000)return 7;return 2;}
function openPoints(openNow?:boolean){if(openNow===true)return 16;if(openNow===false)return -18;return 5;}
function pricePoints(place:Restaurant,meal:MealSuggestion){const p=parsePriceLevel(place.priceLevel),t=meal.priceTier;if(!p||!t)return 5;const d=Math.abs(p-t);return d===0?12:d===1?8:d===2?3:-2;}
function personalPoints(meal:MealSuggestion){const m=meal.groupMatchPercent||meal.tasteMatchPercent;if(!m)return 5;return clamp((m-45)/55,0,1)*10;}

export function formatRestaurantPriceLevel(value?: string) {
  const level = parsePriceLevel(value);
  return level ? '$'.repeat(level) : String(value || '');
}

export function smartRestaurantScore(place:Restaurant,meal:MealSuggestion){const score=ratingPoints(place.rating)+reviewPoints(place.reviews)+distancePoints(place.distanceMeters)+openPoints(place.openNow)+pricePoints(place,meal)+personalPoints(meal)+(place.primaryType==='restaurant'?2:0);return Math.round(clamp(score,0,100));}
export function rankRestaurantsForMeal(restaurants:Restaurant[],meal:MealSuggestion):Restaurant[]{return [...restaurants].map(place=>({...place,smartScore:smartRestaurantScore(place,meal)})).sort((a,b)=>(b.smartScore||0)-(a.smartScore||0)||Number(b.openNow===true)-Number(a.openNow===true)||b.rating-a.rating||b.reviews-a.reviews||(a.distanceMeters??Number.MAX_SAFE_INTEGER)-(b.distanceMeters??Number.MAX_SAFE_INTEGER));}
