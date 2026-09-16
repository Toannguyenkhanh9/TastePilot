import {localeToLanguageCode, SupportedLanguageCode} from '../i18n';

const DISH_NAMES: Record<SupportedLanguageCode, Record<string,string>> = {
  en: require('../data/dish-names/en.json'),
  vi: require('../data/dish-names/vi.json'),
  es: require('../data/dish-names/es.json'),
  fr: require('../data/dish-names/fr.json'),
  ja: require('../data/dish-names/ja.json'),
  zh: require('../data/dish-names/zh.json'),
  ko: require('../data/dish-names/ko.json'),
  th: require('../data/dish-names/th.json'),
  pt: require('../data/dish-names/pt.json'),
  ru: require('../data/dish-names/ru.json'),
  de: require('../data/dish-names/de.json'),
  it: require('../data/dish-names/it.json'),
  hi: require('../data/dish-names/hi.json'),
  ar: require('../data/dish-names/ar.json'),
  id: require('../data/dish-names/id.json'),
  ms: require('../data/dish-names/ms.json'),
};

const CUISINES = require('../data/cuisine-localizations.json') as
  Record<SupportedLanguageCode, Record<string,string>>;

export function localizeDishName(
  dishId: string | undefined,
  canonicalName: string,
  locale?: string,
) {
  const lang = localeToLanguageCode(locale);
  if (!dishId) return canonicalName;
  return DISH_NAMES[lang]?.[dishId] || DISH_NAMES.en?.[dishId] || canonicalName;
}

export function localizeCuisine(canonicalCuisine: string, locale?: string) {
  const lang = localeToLanguageCode(locale);
  return CUISINES[lang]?.[canonicalCuisine] || canonicalCuisine;
}

export function canonicalDishName(
  dishId: string | undefined,
  fallback: string,
) {
  if (!dishId) return fallback;
  return DISH_NAMES.en?.[dishId] || fallback;
}
