import {
  LocationContext,
  MealHistoryItem,
  MealSuggestion,
  MealType,
  UserProfile,
} from '../types';
import {estimateRegionalDishPrice} from './regionalPriceService';

export type LocalDish = {
  id: string;
  familyId: string;
  baseName: string;
  variant: string;
  variantLabel: string;
  cuisine: string;
  countryCodes: string[];
  imageKey: string;
  tags: string[];
  category: 'main' | 'veg' | 'snack' | 'dessert';
  priceBand: 1 | 2 | 3 | 4;
  relativeCost?: number;
  popularity: number;
  vegetarian: boolean;
  vegan: boolean;
  containsPork: boolean;
  containsBeef: boolean;
  halalFriendly: boolean;
  glutenFreeFriendly: boolean;
  spicyLevel: number;
  searchKeyword: string;
  mealTypes?: MealType[];
  everydayScore?: number;
  touristScore?: number;
};

const CATALOG = require('../data/dishes1000.json') as LocalDish[];

const VARIANT_LABELS: Record<string, Record<string, string>> = {
  en: {classic:'Classic',chicken:'Chicken',beef:'Beef',seafood:'Seafood',vegetarian:'Vegetarian',spicy:'Spicy',deluxe:'Deluxe',signature:'Signature',tofu:'Tofu',mushroom:'Mushroom',extra_veg:'Extra vegetables',sesame:'Sesame',grilled:'Grilled',cheese:'Cheese',crispy:'Crispy',chocolate:'Chocolate',strawberry:'Strawberry',mango:'Mango',caramel:'Caramel',pistachio:'Pistachio',coconut:'Coconut'},
  vi: {classic:'Cổ điển',chicken:'Gà',beef:'Bò',seafood:'Hải sản',vegetarian:'Chay',spicy:'Cay',deluxe:'Đặc biệt',signature:'Đặc trưng',tofu:'Đậu hũ',mushroom:'Nấm',extra_veg:'Nhiều rau',sesame:'Mè',grilled:'Nướng',cheese:'Phô mai',crispy:'Giòn',chocolate:'Sô-cô-la',strawberry:'Dâu',mango:'Xoài',caramel:'Caramel',pistachio:'Hạt dẻ cười',coconut:'Dừa'},
  es: {classic:'Clásico',chicken:'Pollo',beef:'Ternera',seafood:'Mariscos',vegetarian:'Vegetariano',spicy:'Picante',deluxe:'Deluxe',signature:'Especialidad',tofu:'Tofu',mushroom:'Setas',extra_veg:'Extra de verduras',sesame:'Sésamo',grilled:'A la parrilla',cheese:'Queso',crispy:'Crujiente',chocolate:'Chocolate',strawberry:'Fresa',mango:'Mango',caramel:'Caramelo',pistachio:'Pistacho',coconut:'Coco'},
  fr: {classic:'Classique',chicken:'Poulet',beef:'Bœuf',seafood:'Fruits de mer',vegetarian:'Végétarien',spicy:'Épicé',deluxe:'Deluxe',signature:'Signature',tofu:'Tofu',mushroom:'Champignons',extra_veg:'Extra légumes',sesame:'Sésame',grilled:'Grillé',cheese:'Fromage',crispy:'Croustillant',chocolate:'Chocolat',strawberry:'Fraise',mango:'Mangue',caramel:'Caramel',pistachio:'Pistache',coconut:'Noix de coco'},
  ja: {classic:'定番',chicken:'チキン',beef:'ビーフ',seafood:'シーフード',vegetarian:'ベジタリアン',spicy:'スパイシー',deluxe:'デラックス',signature:'シグネチャー',tofu:'豆腐',mushroom:'きのこ',extra_veg:'野菜たっぷり',sesame:'ごま',grilled:'グリル',cheese:'チーズ',crispy:'クリスピー',chocolate:'チョコレート',strawberry:'いちご',mango:'マンゴー',caramel:'キャラメル',pistachio:'ピスタチオ',coconut:'ココナッツ'},
  zh: {classic:'经典',chicken:'鸡肉',beef:'牛肉',seafood:'海鲜',vegetarian:'素食',spicy:'香辣',deluxe:'豪华',signature:'招牌',tofu:'豆腐',mushroom:'蘑菇',extra_veg:'加量蔬菜',sesame:'芝麻',grilled:'烤制',cheese:'芝士',crispy:'香脆',chocolate:'巧克力',strawberry:'草莓',mango:'芒果',caramel:'焦糖',pistachio:'开心果',coconut:'椰子'},
  ko: {classic:'클래식',chicken:'치킨',beef:'소고기',seafood:'해산물',vegetarian:'채식',spicy:'매운맛',deluxe:'디럭스',signature:'시그니처',tofu:'두부',mushroom:'버섯',extra_veg:'야채 추가',sesame:'참깨',grilled:'구이',cheese:'치즈',crispy:'바삭',chocolate:'초콜릿',strawberry:'딸기',mango:'망고',caramel:'카라멜',pistachio:'피스타치오',coconut:'코코넛'},
  th: {classic:'สูตรดั้งเดิม',chicken:'ไก่',beef:'เนื้อ',seafood:'ซีฟู้ด',vegetarian:'มังสวิรัติ',spicy:'เผ็ด',deluxe:'พิเศษ',signature:'ซิกเนเจอร์',tofu:'เต้าหู้',mushroom:'เห็ด',extra_veg:'ผักเพิ่ม',sesame:'งา',grilled:'ย่าง',cheese:'ชีส',crispy:'กรอบ',chocolate:'ช็อกโกแลต',strawberry:'สตรอว์เบอร์รี',mango:'มะม่วง',caramel:'คาราเมล',pistachio:'พิสตาชิโอ',coconut:'มะพร้าว'},
  pt: {classic:'Clássico',chicken:'Frango',beef:'Carne bovina',seafood:'Marisco',vegetarian:'Vegetariano',spicy:'Picante',deluxe:'Deluxe',signature:'Assinatura',tofu:'Tofu',mushroom:'Cogumelos',extra_veg:'Mais legumes',sesame:'Sésamo',grilled:'Grelhado',cheese:'Queijo',crispy:'Crocante',chocolate:'Chocolate',strawberry:'Morango',mango:'Manga',caramel:'Caramelo',pistachio:'Pistácio',coconut:'Coco'},
  ru: {classic:'Классический',chicken:'Курица',beef:'Говядина',seafood:'Морепродукты',vegetarian:'Вегетарианский',spicy:'Острый',deluxe:'Делюкс',signature:'Фирменный',tofu:'Тофу',mushroom:'Грибы',extra_veg:'Больше овощей',sesame:'Кунжут',grilled:'Гриль',cheese:'Сыр',crispy:'Хрустящий',chocolate:'Шоколад',strawberry:'Клубника',mango:'Манго',caramel:'Карамель',pistachio:'Фисташка',coconut:'Кокос'},
  de: {classic:'Klassisch',chicken:'Hähnchen',beef:'Rind',seafood:'Meeresfrüchte',vegetarian:'Vegetarisch',spicy:'Scharf',deluxe:'Deluxe',signature:'Signature',tofu:'Tofu',mushroom:'Pilze',extra_veg:'Extra Gemüse',sesame:'Sesam',grilled:'Gegrillt',cheese:'Käse',crispy:'Knusprig',chocolate:'Schokolade',strawberry:'Erdbeere',mango:'Mango',caramel:'Karamell',pistachio:'Pistazie',coconut:'Kokos'},
  it: {classic:'Classico',chicken:'Pollo',beef:'Manzo',seafood:'Frutti di mare',vegetarian:'Vegetariano',spicy:'Piccante',deluxe:'Deluxe',signature:'Speciale',tofu:'Tofu',mushroom:'Funghi',extra_veg:'Verdure extra',sesame:'Sesamo',grilled:'Grigliato',cheese:'Formaggio',crispy:'Croccante',chocolate:'Cioccolato',strawberry:'Fragola',mango:'Mango',caramel:'Caramello',pistachio:'Pistacchio',coconut:'Cocco'},
  hi: {classic:'क्लासिक',chicken:'चिकन',beef:'बीफ़',seafood:'सीफ़ूड',vegetarian:'शाकाहारी',spicy:'मसालेदार',deluxe:'डीलक्स',signature:'सिग्नेचर',tofu:'टोफू',mushroom:'मशरूम',extra_veg:'अतिरिक्त सब्ज़ियाँ',sesame:'तिल',grilled:'ग्रिल्ड',cheese:'चीज़',crispy:'कुरकुरा',chocolate:'चॉकलेट',strawberry:'स्ट्रॉबेरी',mango:'आम',caramel:'कैरेमल',pistachio:'पिस्ता',coconut:'नारियल'},
  ar: {classic:'كلاسيكي',chicken:'دجاج',beef:'لحم بقري',seafood:'مأكولات بحرية',vegetarian:'نباتي',spicy:'حار',deluxe:'ديلوكس',signature:'طبق مميز',tofu:'توفو',mushroom:'فطر',extra_veg:'خضار إضافية',sesame:'سمسم',grilled:'مشوي',cheese:'جبن',crispy:'مقرمش',chocolate:'شوكولاتة',strawberry:'فراولة',mango:'مانجو',caramel:'كراميل',pistachio:'فستق',coconut:'جوز الهند'},
  id: {classic:'Klasik',chicken:'Ayam',beef:'Sapi',seafood:'Hidangan laut',vegetarian:'Vegetarian',spicy:'Pedas',deluxe:'Deluxe',signature:'Khas',tofu:'Tahu',mushroom:'Jamur',extra_veg:'Sayur ekstra',sesame:'Wijen',grilled:'Panggang',cheese:'Keju',crispy:'Renyah',chocolate:'Cokelat',strawberry:'Stroberi',mango:'Mangga',caramel:'Karamel',pistachio:'Pistachio',coconut:'Kelapa'},
  ms: {classic:'Klasik',chicken:'Ayam',beef:'Daging lembu',seafood:'Makanan laut',vegetarian:'Vegetarian',spicy:'Pedas',deluxe:'Deluxe',signature:'Istimewa',tofu:'Tauhu',mushroom:'Cendawan',extra_veg:'Sayur tambahan',sesame:'Bijan',grilled:'Panggang',cheese:'Keju',crispy:'Rangup',chocolate:'Coklat',strawberry:'Strawberi',mango:'Mangga',caramel:'Karamel',pistachio:'Pistachio',coconut:'Kelapa'},
};

const REASONS: Record<string, {local:string; general:string}> = {
  en:{local:'A popular local choice that fits your budget and preferences.',general:'A well-matched option based on your budget, preferences and recent meals.'},
  vi:{local:'Một lựa chọn địa phương phổ biến, phù hợp với ngân sách và sở thích của bạn.',general:'Một lựa chọn phù hợp dựa trên ngân sách, sở thích và các bữa ăn gần đây.'},
  es:{local:'Una opción local popular que encaja con tu presupuesto y preferencias.',general:'Una opción bien ajustada a tu presupuesto, preferencias y comidas recientes.'},
  fr:{local:'Un choix local populaire adapté à votre budget et à vos préférences.',general:'Une option bien adaptée à votre budget, vos préférences et vos repas récents.'},
  ja:{local:'予算と好みに合う人気のローカル料理です。',general:'予算・好み・最近の食事履歴に合ったおすすめです。'},
  zh:{local:'这是符合你的预算和偏好的热门当地美食。',general:'这是根据你的预算、偏好和近期用餐记录匹配出的选择。'},
  ko:{local:'예산과 취향에 잘 맞는 인기 현지 메뉴입니다.',general:'예산, 취향, 최근 식사 기록을 바탕으로 잘 맞는 메뉴입니다.'},
  th:{local:'เมนูท้องถิ่นยอดนิยมที่เข้ากับงบประมาณและความชอบของคุณ',general:'ตัวเลือกที่เหมาะกับงบประมาณ ความชอบ และมื้อล่าสุดของคุณ'},
  pt:{local:'Uma escolha local popular que combina com o seu orçamento e preferências.',general:'Uma opção bem ajustada ao seu orçamento, preferências e refeições recentes.'},
  ru:{local:'Популярное местное блюдо, подходящее под ваш бюджет и предпочтения.',general:'Хороший вариант с учетом бюджета, предпочтений и недавних блюд.'},
  de:{local:'Eine beliebte lokale Wahl, die zu Budget und Vorlieben passt.',general:'Eine passende Wahl auf Basis von Budget, Vorlieben und letzten Mahlzeiten.'},
  it:{local:'Una scelta locale popolare adatta al tuo budget e alle tue preferenze.',general:'Una scelta adatta in base a budget, preferenze e pasti recenti.'},
  hi:{local:'एक लोकप्रिय स्थानीय विकल्प जो आपके बजट और पसंद के अनुरूप है।',general:'आपके बजट, पसंद और हाल के भोजन के आधार पर उपयुक्त विकल्प।'},
  ar:{local:'خيار محلي شائع يناسب ميزانيتك وتفضيلاتك.',general:'خيار مناسب بناءً على ميزانيتك وتفضيلاتك ووجباتك الأخيرة.'},
  id:{local:'Pilihan lokal populer yang sesuai dengan anggaran dan preferensi Anda.',general:'Pilihan yang cocok berdasarkan anggaran, preferensi, dan makanan terbaru Anda.'},
  ms:{local:'Pilihan tempatan popular yang sesuai dengan bajet dan pilihan anda.',general:'Pilihan yang sesuai berdasarkan bajet, pilihan dan hidangan terkini anda.'},
};


function langFromLocale(locale?: string) {
  const code = String(locale || 'en')
    .toLowerCase()
    .split(/[-_]/)[0];

  return VARIANT_LABELS[code] ? code : 'en';
}

function normalize(value?: string) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function hardRestrictionMatch(dish: LocalDish, restrictions: string[]) {
  const r = restrictions.map(normalize);
  if (r.some(x => x.includes('vegetarian') || x.includes('an chay') || x.includes('ăn chay')) && !dish.vegetarian) return false;
  if (r.some(x => x.includes('vegan') || x.includes('thuan chay') || x.includes('thuần chay')) && !dish.vegan) return false;
  if (r.some(x => x.includes('halal')) && !dish.halalFriendly) return false;
  if (r.some(x => x.includes('gluten')) && !dish.glutenFreeFriendly) return false;
  if (r.some(x => x.includes('no pork') || x.includes('khong thit heo') || x.includes('không thịt heo')) && dish.containsPork) return false;
  if (r.some(x => x.includes('no beef') || x.includes('khong thit bo') || x.includes('không thịt bò')) && dish.containsBeef) return false;
  return true;
}

function displayName(dish: LocalDish, locale?: string) {
  const lang = langFromLocale(locale);
  if (dish.variant === 'classic') return dish.baseName;
  const label = VARIANT_LABELS[lang][dish.variant] || dish.variantLabel;
  return `${dish.baseName} · ${label}`;
}

function stringHash(value: string) {
  let h = 2166136261;
  for (let i=0;i<value.length;i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function deterministicJitter(id: string, salt: string) {
  return (stringHash(`${id}|${salt}`) % 1000) / 1000;
}

function scoreDish(
  dish: LocalDish,
  mode: 'daily'|'travel',
  budget: number | undefined,
  currency: string,
  preferences: string[],
  history: MealHistoryItem[],
  locationContext?: LocationContext,
  mealType: MealType = 'lunch',
) {
  const country = String(locationContext?.countryCode || '').toUpperCase();
  const isLocal = !!country && dish.countryCodes.includes(country);
  const prefs = preferences.map(normalize);
  const recent = history.slice(0,30);
  const estimate = estimateRegionalDishPrice({
    relativeCost: dish.relativeCost,
    priceBand: dish.priceBand,
    currency,
    locationContext,
  });

  let score = dish.popularity * 0.12;

  if (isLocal) score += mode === 'travel' ? 48 : 18;
  else if (mode === 'travel' && country) score -= 90;

  const matchesMealType = (dish.mealTypes || ['lunch','dinner']).includes(mealType);
  if (matchesMealType) score += mode === 'travel' ? 24 : 32;
  else score -= mode === 'travel' ? 35 : 55;

  // Daily mode favors food people commonly eat as a normal meal.
  // Travel mode favors iconic/local dishes that visitors commonly try.
  if (mode === 'daily') {
    score += (dish.everydayScore || 60) * 0.34;
    if (dish.category === 'dessert') score -= 80;
  } else {
    score += (dish.touristScore || 50) * 0.42;
  }

  const cuisine = normalize(dish.cuisine);
  const tags = dish.tags.map(normalize);
  for (const pref of prefs) {
    if (!pref) continue;
    if (cuisine.includes(pref) || pref.includes(cuisine)) score += 16;
    if (tags.some(t => t.includes(pref) || pref.includes(t))) score += 10;
    if (pref.includes('healthy') && (dish.vegetarian || tags.includes('healthy'))) score += 10;
    if (pref.includes('high protein') && ['chicken','beef','seafood','pork','eggs','lentils'].some(x => tags.includes(x))) score += 10;
    if (pref.includes('vegetarian') && dish.vegetarian) score += 18;
    if (pref.includes('quick') && dish.category === 'snack') score += 8;
  }

  // When a target budget is enabled, only dishes inside the hard ±20% window
  // survive the later filter. Ranking here simply prefers estimates closest to
  // the exact target. With no budget, price does not affect ranking.
  if (budget && budget > 0) {
    const distanceRatio = Math.abs(estimate.midpoint - budget) / budget;
    score += Math.max(0, 24 - distanceRatio * 80);
  }

  for (const h of recent) {
    const hn = normalize(h.dishName);
    const hc = normalize(h.cuisine);
    if (h.feedback === 'love') {
      if (hc && hc === cuisine) score += 6;
      if (hn.includes(normalize(dish.baseName))) score += 3;
    }
    if (h.feedback === 'dislike') {
      if (hn.includes(normalize(dish.baseName))) score -= 120;
      else if (hc && hc === cuisine) score -= 10;
    }
  }

  return {score,isLocal,estimate};
}

export type LocalRecommendationInput = {
  mode: 'daily' | 'travel';
  budget?: number;
  preferences?: string[];
  locationContext?: LocationContext;
  history?: MealHistoryItem[];
  profile: UserProfile;
  mealType?: MealType;
  excludeDishNames?: string[];
  limit?: number;
};

function isInsideBudgetWindow(estimate: {min:number; max:number}, budget?: number) {
  if (!budget || budget <= 0) return true;
  const minAllowed = budget * 0.80;
  const maxAllowed = budget * 1.20;
  return estimate.min >= minAllowed && estimate.max <= maxAllowed;
}

export function getLocalRecommendations(input: LocalRecommendationInput): MealSuggestion[] {
  const history = input.history || [];
  const preferences = input.preferences || [];
  const restrictions = input.profile.restrictions || [];
  const currency = input.profile.currency || input.locationContext?.currency || 'USD';
  const lang = langFromLocale(input.profile.locale);
  const mealType: MealType = input.mealType || 'lunch';
  const country = String(input.locationContext?.countryCode || '').toUpperCase();
  const excluded = (input.excludeDishNames || []).map(normalize);
  const recentNames = history.slice(0,8).map(x => normalize(x.dishName));
  const salt = `${input.mode}|${input.locationContext?.countryCode || ''}|${input.budget || 'none'}|${history.length}|${excluded.join('|')}|${new Date().toISOString().slice(0,13)}`;

  const scored = CATALOG
    .filter(d => hardRestrictionMatch(d, restrictions))
    .filter(d => (d.mealTypes || ['lunch','dinner']).includes(mealType))
    .filter(d => {
      if (input.mode === 'daily') {
        return (d.everydayScore || 60) >= 48 && d.category !== 'dessert';
      }

      // Travel mode is intentionally destination-first:
      // only return dishes originating from the resolved country.
      // If fewer than 5 survive, recommendationService will invoke Gemini fallback.
      if (country) {
        return d.countryCodes.includes(country) && (d.touristScore || 50) >= 58;
      }
      return (d.touristScore || 50) >= 70;
    })
    .filter(d => {
      const candidateName = normalize(displayName(d,input.profile.locale));
      const base = normalize(d.baseName);
      if (excluded.some(x => x && (candidateName === x || x.includes(base) || candidateName.includes(x)))) return false;
      return true;
    })
    .map(d => {
      const base = scoreDish(d,input.mode,input.budget,currency,preferences,history,input.locationContext,mealType);
      const recentFamily = recentNames.some(x => x.includes(normalize(d.baseName)));
      return {
        dish:d,
        isLocal:base.isLocal,
        score:base.score - (recentFamily ? 46 : 0) + deterministicJitter(d.id,salt) * 5,
        estimate:base.estimate,
      };
    })
    .filter(item => isInsideBudgetWindow(item.estimate, input.budget))
    .sort((a,b) => b.score-a.score);

  const limit = input.limit || 5;
  const selected: typeof scored = [];
  const usedFamilies = new Set<string>();
  const usedCuisines = new Map<string,number>();

  for (const item of scored) {
    if (selected.length >= limit) break;
    if (usedFamilies.has(item.dish.familyId)) continue;
    const cuisineCount = usedCuisines.get(item.dish.cuisine) || 0;
    if (cuisineCount >= 2 && scored.length > limit * 2) continue;
    selected.push(item);
    usedFamilies.add(item.dish.familyId);
    usedCuisines.set(item.dish.cuisine,cuisineCount+1);
  }

  return selected.map(({dish,isLocal,estimate}) => ({
    id:`local:${dish.id}`,
    canonicalId:dish.id,
    familyId:dish.familyId,
    name:displayName(dish,input.profile.locale),
    cuisine:dish.cuisine,
    estimatedMin:estimate.min,
    estimatedMax:estimate.max,
    reason:(REASONS[lang] || REASONS.en)[isLocal ? 'local' : 'general'],
    searchKeyword:dish.searchKeyword,
    localSpecialty:isLocal,
    imageKey:dish.imageKey,
    recommendationSource:'local',
    priceTier:estimate.priceTier,
    priceEstimateSource:estimate.source,
    priceConfidence:estimate.confidence,
    regionalPriceProfileVersion:estimate.profileVersion,
    mealType,
    touristPopular:input.mode === 'travel' && isLocal && (dish.touristScore || 0) >= 70,
  }));
}

export function getLocalCatalogStats() {
  const families = new Set(CATALOG.map(x => x.familyId));
  const cuisines = new Set(CATALOG.map(x => x.cuisine));
  const countries = new Set(CATALOG.flatMap(x => x.countryCodes));
  return {dishes:CATALOG.length,families:families.size,cuisines:cuisines.size,countries:countries.size};
}
