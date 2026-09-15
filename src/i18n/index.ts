import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

export const SUPPORTED_LANGUAGES = [
  {code: 'en', locale: 'en-US', label: 'English', nativeName: 'English'},
  {code: 'vi', locale: 'vi-VN', label: 'Vietnamese', nativeName: 'Tiếng Việt'},
  {code: 'es', locale: 'es-ES', label: 'Spanish', nativeName: 'Español'},
  {code: 'fr', locale: 'fr-FR', label: 'French', nativeName: 'Français'},
  {code: 'ja', locale: 'ja-JP', label: 'Japanese', nativeName: '日本語'},
  {code: 'zh', locale: 'zh-CN', label: 'Chinese', nativeName: '简体中文'},
  {code: 'ko', locale: 'ko-KR', label: 'Korean', nativeName: '한국어'},
  {code: 'th', locale: 'th-TH', label: 'Thai', nativeName: 'ไทย'},
  {code: 'pt', locale: 'pt-PT', label: 'Portuguese', nativeName: 'Português'},
  {code: 'ru', locale: 'ru-RU', label: 'Russian', nativeName: 'Русский'},
  {code: 'de', locale: 'de-DE', label: 'German', nativeName: 'Deutsch'},
  {code: 'it', locale: 'it-IT', label: 'Italian', nativeName: 'Italiano'},
  {code: 'hi', locale: 'hi-IN', label: 'Hindi', nativeName: 'हिन्दी'},
  {code: 'ar', locale: 'ar-SA', label: 'Arabic', nativeName: 'العربية'},
  {code: 'id', locale: 'id-ID', label: 'Indonesian', nativeName: 'Bahasa Indonesia'},
  {code: 'ms', locale: 'ms-MY', label: 'Malay', nativeName: 'Bahasa Melayu'},
] as const;

export type SupportedLanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export function localeToLanguageCode(locale?: string): SupportedLanguageCode {
  const value = String(locale || '').toLowerCase().replace('_', '-');
  const match = SUPPORTED_LANGUAGES.find(item => value.startsWith(item.code));
  return (match?.code || 'en') as SupportedLanguageCode;
}

const resources = {
  en: {translation: {
    tabHome: 'Home', tabSaved: 'Saved', tabHistory: 'History', tabProfile: 'Profile',
    navBack: 'Back', navDailyMeal: 'Daily Meal', navTravelFood: 'Travel Food', navSuggestions: 'Suggestions', navNearbyPlaces: 'Nearby Places', navRestaurant: 'Restaurant', navLanguage: 'Language',
    commonRefresh: 'Refresh', commonDirections: 'Directions', commonRemove: 'Remove', commonSave: 'Save', commonSaved: 'Saved', commonClose: 'Close', commonChoose: 'Choose', commonCheck: 'Check', commonReset: 'Reset', commonOpenNow: 'Open now', commonClosed: 'Closed', commonUnknownError: 'Unknown error', commonReviews: 'reviews', commonDistance: 'Distance', commonRating: 'Rating', commonOther: 'Other', commonUnknownArea: 'Unknown area', commonSavedForLater: 'Saved for later', commonDaily: 'DAILY', commonTravel: 'TRAVEL',
    mapsTitle: 'Maps', mapsOpenFailed: 'Could not open maps.', directionsTitle: 'Directions', directionsUnavailable: 'This entry does not have enough place information yet.',
    locationYourArea: 'Your area', locationNotDetected: 'Location not detected yet', locationLocalCurrency: 'Local currency',
    homeKicker: 'SMART FOOD DISCOVERY', homeTitle: 'Find food you will actually want today', homeSubtitle: 'Smarter food discovery with local context, budget awareness and personalized suggestions.', homeAreaTitle: 'Last detected area', homeDailyTitle: 'What should I eat?', homeDailyPill: '5 ideas', homeDailyText: 'Get 5 meal suggestions and refresh them quickly if nothing fits your mood.', homeTravelTitle: 'Explore local food', homeTravelPill: 'Travel', homeTravelText: 'Discover local specialties and nearby restaurants wherever you go.',
    dailyEyebrow: 'DAILY MEAL', dailyTitle: 'What should I eat today?', dailySubtitle: 'Enter your budget, keep your preferences in mind, and get 5 meal suggestions without recent repetition.', dailyBudget: 'Budget', dailyInvalidBudget: 'Please enter a valid budget in {{currency}}.', dailyBudgetPlaceholder: 'Enter {{currency}} budget', dailyFormatHint: 'We format the amount automatically, so 20000 appears as 20,000.', dailyPreferences: 'Optional preferences', dailyHealthy: 'Healthy', dailyHighProtein: 'High Protein', dailyVegetarian: 'Vegetarian', dailyQuickMeal: 'Quick Meal', dailySomethingNew: 'Something New', dailyHowTitle: 'How suggestions work', dailyHowText: 'TastePilot combines your budget, recent history, preferences and local context to keep ideas varied and practical.', dailyButton: 'Find my 5 meals', dailyResultsTitle: "Today's picks", dailyErrorTitle: 'Could not load suggestions',
    travelEyebrow: 'TRAVEL FOOD', travelTitle: 'Explore local food', travelSubtitle: 'Search your current area or another destination and get richer local meal suggestions with nearby restaurant results.', travelCurrentLocation: 'Current location', travelSearchDestination: 'Search destination', travelExploring: 'You are exploring', travelCityArea: 'City or area', travelDestination: 'Destination', travelDestinationRequired: 'Enter a city or area.', travelDestinationError: 'Could not find destination', travelMealBudget: 'Meal budget', travelBudgetRequired: 'Enter your meal budget in {{currency}}.', travelRankingTitle: 'How travel ranking works', travelRankingText: 'TastePilot weighs local-specialty relevance, budget fit, restaurant quality and distance to show more useful travel picks.', travelButton: 'Explore 5 food picks', travelCurrentTitle: 'Local must-try food', travelMustTryIn: 'Must-try food in {{place}}', travelTryIn: 'Try in {{place}}', travelErrorTitle: 'Could not explore this area',
    resultsDailyEyebrow: 'DAILY PICKS', resultsTravelEyebrow: 'TRAVEL PICKS', resultsSubtitle: 'Choose one dish to find nearby places. If nothing fits, replace one dish or refresh all 5 picks.', resultsTryAnother: 'Try another 5', resultsCount: '{{count}} suggestions', resultsNoMoreTitle: 'No more ideas yet', resultsNoMoreText: 'Try changing your budget or preferences to get more meal ideas.', resultsRefreshError: 'Could not refresh suggestions', resultsNoReplacement: 'No replacement found', resultsNoReplacementText: 'TastePilot could not find a different option right now.', resultsSwapError: 'Could not swap this dish', resultsLocalPick: 'LOCAL PICK', resultsPick: 'PICK {{index}}', resultsLocalSpecialty: 'Local specialty', resultsBudgetFit: 'Smart budget fit', resultsNearbyReady: 'Nearby search ready', resultsReplace: 'Replace', resultsFindPlaces: 'Find places',
    restaurantsEyebrow: 'PLACES FOR', restaurantsSubtitle: 'Search, filter and sort nearby restaurants{{area}}.', restaurantsSearch: 'Search restaurant or address', restaurantsFilter: 'Filter', restaurantsSort: 'Sort', restaurantsFilterAll: 'All', restaurantsFilterOpen: 'Open now', restaurantsFilterTop: '4.5+ rating', restaurantsFilterNearby: 'Within 2 km', restaurantsSortRecommended: 'Recommended', restaurantsSortRating: 'Rating', restaurantsSortReviews: 'Most reviewed', restaurantsSortDistance: 'Nearest', restaurantsPlacesCount: '{{count}} places', restaurantsNoMatchTitle: 'No places match these filters', restaurantsNoMatchText: 'Try All, remove your search text, or switch the sort mode.', restaurantsLoading: 'Finding nearby places…', restaurantsError: 'Could not find restaurants', restaurantsHistoryAdded: 'Added to history', restaurantsOpen: 'OPEN', restaurantsClosed: 'CLOSED', restaurantsViewDetails: 'View restaurant details →', restaurantsChoose: 'Choose',
    restaurantDetailEyebrow: 'RESTAURANT DETAIL', restaurantDetailSubtitle: 'A cleaner detail view for {{meal}}.', restaurantSavePlace: 'Save place', restaurantChoosePlace: 'Choose this place', restaurantWhyTitle: 'Why this place works', restaurantWhyText: 'TastePilot selected this restaurant because it matches {{meal}}, balances strong reviews with practical distance, and fits your nearby search context.', restaurantConfidence: 'Good review confidence', restaurantAddress: 'Address', restaurantRecommendedDish: 'Recommended dish', restaurantTipTitle: 'TastePilot tip', restaurantTipText: 'Save this place to compare later, or choose it now to add the meal to your history and improve future suggestions.', restaurantHistoryAdded: 'Added to history',
    savedHeroEyebrow: 'SAVED', savedHeroTitle: 'Saved places', savedHeroSubtitle: 'Keep favorite restaurants grouped by city or cuisine so they are easier to browse later.', savedGroupByCity: 'By city', savedGroupByCuisine: 'By cuisine', savedEmptyTitle: 'Nothing saved yet', savedEmptyText: 'Tap Save on a restaurant card and it will show up here.', savedCountSuffix: 'saved',
    historyHeroEyebrow: 'HISTORY', historyHeroTitle: 'Meal history', historyHeroSubtitle: 'Tap a meal to see restaurant details. Like or dislike also helps TastePilot improve future suggestions.', historyTipTitle: 'Tap any history card', historyTipText: 'You can view restaurant rating, address, distance and open directions. New history entries also keep the exact restaurant snapshot.', historyEmptyTitle: 'No meals yet', historyEmptyText: 'Choose a restaurant from a recommendation and it will appear here.', historyViewDetails: 'View restaurant details', historyGoodPick: 'Was this a good pick?', historyLike: '👍 Like', historyDislike: '👎 Dislike', historyPlaceEyebrow: 'HISTORY PLACE', historyRating: 'Rating', historyReviews: 'Reviews', historyDistance: 'Distance', historyRestaurant: 'Restaurant', historyMealChosen: 'Meal chosen', historyOlderEntry: 'Older history entry', historyRestaurantUnavailable: 'Restaurant name unavailable', historyLegacyNote: 'This meal was saved before TastePilot started storing the full restaurant snapshot. Exact rating, address and distance are not available for this old entry, but Directions can still search the restaurant by name.', historyVisited: 'Visited {{date}}', historySavePlace: 'Save place',
    profileHeroEyebrow: 'PROFILE', profileHeroTitle: 'Food profile', profileHeroSubtitle: 'Used by Daily Meal and Travel Food to keep suggestions useful and personal.', profileLanguageTitle: 'App language', profileLanguageHint: 'Choose the language used in TastePilot.', profileLanguageOpen: 'Change language', profileBasics: 'Basics', profileCurrencyCode: 'Currency code', profileTypicalBudget: 'Typical meal budget', profileFoodEnjoy: 'Food you enjoy', profileRestrictions: 'Dietary restrictions', profileTipTitle: 'Profile tip', profileTipText: 'A good default budget and accurate preferences make daily ideas and nearby restaurant ranking much more relevant.', profileSave: 'Save profile', profileSavedTitle: 'Saved', profileSavedText: 'Your TastePilot profile has been updated.', profileBudgetAlertTitle: 'Budget', profileBudgetAlertText: 'Enter a valid default budget.', profileCuisineAsian: 'Asian', profileCuisineItalian: 'Italian', profileCuisineMexican: 'Mexican', profileCuisineMediterranean: 'Mediterranean', profileCuisineAmerican: 'American', profileCuisineIndian: 'Indian', profileRestrictionVegetarian: 'Vegetarian', profileRestrictionVegan: 'Vegan', profileRestrictionHalal: 'Halal', profileRestrictionGlutenFree: 'Gluten Free', profileRestrictionNoPork: 'No Pork', profileRestrictionNoBeef: 'No Beef',
    languageTitle: 'App language', languageSubtitle: 'Choose the language for menus, buttons and app guidance.', languageCurrent: 'Current language', languageApplied: 'Language updated', languageAppliedText: 'TastePilot is now using {{language}}.',
  }},
  vi: {translation: {
    tabHome: 'Trang chủ', tabSaved: 'Đã lưu', tabHistory: 'Lịch sử', tabProfile: 'Hồ sơ',
    navBack: 'Quay lại', navDailyMeal: 'Bữa ăn hôm nay', navTravelFood: 'Ẩm thực du lịch', navSuggestions: 'Gợi ý', navNearbyPlaces: 'Quán gần đây', navRestaurant: 'Nhà hàng', navLanguage: 'Ngôn ngữ',
    commonRefresh: 'Làm mới', commonDirections: 'Chỉ đường', commonRemove: 'Xóa', commonSave: 'Lưu', commonSaved: 'Đã lưu', commonClose: 'Đóng', commonChoose: 'Chọn', commonCheck: 'Kiểm tra', commonReset: 'Đặt lại', commonOpenNow: 'Đang mở', commonClosed: 'Đã đóng', commonUnknownError: 'Lỗi không xác định', commonReviews: 'lượt đánh giá', commonDistance: 'Khoảng cách', commonRating: 'Đánh giá', commonOther: 'Khác', commonUnknownArea: 'Khu vực chưa rõ', commonSavedForLater: 'Lưu để xem sau', commonDaily: 'HÀNG NGÀY', commonTravel: 'DU LỊCH',
    mapsTitle: 'Bản đồ', mapsOpenFailed: 'Không thể mở bản đồ.', directionsTitle: 'Chỉ đường', directionsUnavailable: 'Mục này chưa có đủ thông tin địa điểm.',
    locationYourArea: 'Khu vực của bạn', locationNotDetected: 'Chưa xác định được vị trí', locationLocalCurrency: 'Tiền tệ địa phương',
    homeKicker: 'KHÁM PHÁ ẨM THỰC THÔNG MINH', homeTitle: 'Tìm món bạn thật sự muốn ăn hôm nay', homeSubtitle: 'Gợi ý món thông minh hơn dựa trên vị trí, ngân sách và sở thích của bạn.', homeAreaTitle: 'Khu vực gần nhất', homeDailyTitle: 'Hôm nay ăn gì?', homeDailyPill: '5 gợi ý', homeDailyText: 'Nhận 5 gợi ý món ăn và đổi nhanh nếu chưa hợp khẩu vị.', homeTravelTitle: 'Khám phá món địa phương', homeTravelPill: 'Du lịch', homeTravelText: 'Tìm đặc sản địa phương và quán gần bạn ở bất kỳ nơi nào.',
    dailyEyebrow: 'BỮA ĂN HÔM NAY', dailyTitle: 'Hôm nay ăn gì?', dailySubtitle: 'Nhập ngân sách, giữ các sở thích của bạn và nhận 5 gợi ý món ăn không lặp lại gần đây.', dailyBudget: 'Ngân sách', dailyInvalidBudget: 'Vui lòng nhập ngân sách hợp lệ bằng {{currency}}.', dailyBudgetPlaceholder: 'Nhập ngân sách {{currency}}', dailyFormatHint: 'Số tiền được tự động định dạng, ví dụ 20000 sẽ hiển thị 20,000.', dailyPreferences: 'Sở thích tùy chọn', dailyHealthy: 'Lành mạnh', dailyHighProtein: 'Nhiều đạm', dailyVegetarian: 'Ăn chay', dailyQuickMeal: 'Ăn nhanh', dailySomethingNew: 'Thử món mới', dailyHowTitle: 'Cách gợi ý hoạt động', dailyHowText: 'TastePilot kết hợp ngân sách, lịch sử gần đây, sở thích và vị trí để đưa ra gợi ý đa dạng, thực tế.', dailyButton: 'Tìm 5 món cho tôi', dailyResultsTitle: 'Gợi ý hôm nay', dailyErrorTitle: 'Không thể tải gợi ý',
    travelEyebrow: 'ẨM THỰC DU LỊCH', travelTitle: 'Khám phá món địa phương', travelSubtitle: 'Tìm trong khu vực hiện tại hoặc điểm đến khác để nhận gợi ý món địa phương và quán gần đó.', travelCurrentLocation: 'Vị trí hiện tại', travelSearchDestination: 'Tìm điểm đến', travelExploring: 'Bạn đang khám phá', travelCityArea: 'Thành phố hoặc khu vực', travelDestination: 'Điểm đến', travelDestinationRequired: 'Hãy nhập thành phố hoặc khu vực.', travelDestinationError: 'Không tìm thấy điểm đến', travelMealBudget: 'Ngân sách bữa ăn', travelBudgetRequired: 'Nhập ngân sách bữa ăn bằng {{currency}}.', travelRankingTitle: 'Cách xếp hạng khi du lịch', travelRankingText: 'TastePilot cân nhắc đặc sản địa phương, ngân sách, chất lượng quán và khoảng cách để đưa ra gợi ý hữu ích hơn.', travelButton: 'Khám phá 5 món', travelCurrentTitle: 'Món địa phương nên thử', travelMustTryIn: 'Món nên thử tại {{place}}', travelTryIn: 'Thử món tại {{place}}', travelErrorTitle: 'Không thể khám phá khu vực này',
    resultsDailyEyebrow: 'GỢI Ý HÔM NAY', resultsTravelEyebrow: 'GỢI Ý DU LỊCH', resultsSubtitle: 'Chọn một món để tìm quán gần đó. Nếu chưa phù hợp, đổi một món hoặc làm mới cả 5.', resultsTryAnother: 'Thử 5 món khác', resultsCount: '{{count}} gợi ý', resultsNoMoreTitle: 'Chưa có thêm gợi ý', resultsNoMoreText: 'Hãy thay đổi ngân sách hoặc sở thích để nhận thêm món.', resultsRefreshError: 'Không thể làm mới gợi ý', resultsNoReplacement: 'Không tìm thấy món thay thế', resultsNoReplacementText: 'TastePilot chưa tìm được lựa chọn khác lúc này.', resultsSwapError: 'Không thể đổi món này', resultsLocalPick: 'MÓN ĐỊA PHƯƠNG', resultsPick: 'GỢI Ý {{index}}', resultsLocalSpecialty: 'Đặc sản địa phương', resultsBudgetFit: 'Hợp ngân sách', resultsNearbyReady: 'Sẵn sàng tìm quán gần', resultsReplace: 'Đổi món', resultsFindPlaces: 'Tìm quán',
    restaurantsEyebrow: 'QUÁN CHO', restaurantsSubtitle: 'Tìm kiếm, lọc và sắp xếp các quán gần bạn{{area}}.', restaurantsSearch: 'Tìm tên quán hoặc địa chỉ', restaurantsFilter: 'Bộ lọc', restaurantsSort: 'Sắp xếp', restaurantsFilterAll: 'Tất cả', restaurantsFilterOpen: 'Đang mở', restaurantsFilterTop: 'Đánh giá 4.5+', restaurantsFilterNearby: 'Trong 2 km', restaurantsSortRecommended: 'Đề xuất', restaurantsSortRating: 'Đánh giá', restaurantsSortReviews: 'Nhiều đánh giá', restaurantsSortDistance: 'Gần nhất', restaurantsPlacesCount: '{{count}} quán', restaurantsNoMatchTitle: 'Không có quán phù hợp bộ lọc', restaurantsNoMatchText: 'Hãy chọn Tất cả, xóa nội dung tìm kiếm hoặc đổi cách sắp xếp.', restaurantsLoading: 'Đang tìm quán gần bạn…', restaurantsError: 'Không thể tìm nhà hàng', restaurantsHistoryAdded: 'Đã thêm vào lịch sử', restaurantsOpen: 'ĐANG MỞ', restaurantsClosed: 'ĐÃ ĐÓNG', restaurantsViewDetails: 'Xem chi tiết quán →', restaurantsChoose: 'Chọn',
    restaurantDetailEyebrow: 'CHI TIẾT NHÀ HÀNG', restaurantDetailSubtitle: 'Thông tin rõ ràng hơn cho {{meal}}.', restaurantSavePlace: 'Lưu quán', restaurantChoosePlace: 'Chọn quán này', restaurantWhyTitle: 'Vì sao quán này phù hợp', restaurantWhyText: 'TastePilot chọn quán này vì phù hợp với {{meal}}, cân bằng giữa đánh giá tốt, khoảng cách hợp lý và vị trí tìm kiếm hiện tại.', restaurantConfidence: 'Độ tin cậy đánh giá tốt', restaurantAddress: 'Địa chỉ', restaurantRecommendedDish: 'Món đề xuất', restaurantTipTitle: 'Mẹo TastePilot', restaurantTipText: 'Lưu quán để so sánh sau, hoặc chọn ngay để thêm món vào lịch sử và cải thiện các gợi ý tiếp theo.', restaurantHistoryAdded: 'Đã thêm vào lịch sử',
    savedHeroEyebrow: 'ĐÃ LƯU', savedHeroTitle: 'Địa điểm đã lưu', savedHeroSubtitle: 'Nhóm các quán yêu thích theo thành phố hoặc ẩm thực để xem lại dễ hơn.', savedGroupByCity: 'Theo thành phố', savedGroupByCuisine: 'Theo ẩm thực', savedEmptyTitle: 'Chưa có địa điểm nào được lưu', savedEmptyText: 'Nhấn Lưu trên thẻ quán và địa điểm sẽ xuất hiện tại đây.', savedCountSuffix: 'đã lưu',
    historyHeroEyebrow: 'LỊCH SỬ', historyHeroTitle: 'Lịch sử bữa ăn', historyHeroSubtitle: 'Chạm vào món để xem chi tiết quán. Like hoặc dislike cũng giúp TastePilot gợi ý thông minh hơn.', historyTipTitle: 'Chạm vào bất kỳ thẻ lịch sử nào', historyTipText: 'Bạn có thể xem đánh giá, địa chỉ, khoảng cách và mở chỉ đường. Các mục mới cũng lưu đầy đủ thông tin quán.', historyEmptyTitle: 'Chưa có lịch sử món ăn', historyEmptyText: 'Hãy chọn một quán từ gợi ý và mục đó sẽ xuất hiện tại đây.', historyViewDetails: 'Xem chi tiết quán', historyGoodPick: 'Gợi ý này có phù hợp không?', historyLike: '👍 Thích', historyDislike: '👎 Không thích', historyPlaceEyebrow: 'ĐỊA ĐIỂM ĐÃ ĂN', historyRating: 'Đánh giá', historyReviews: 'Lượt đánh giá', historyDistance: 'Khoảng cách', historyRestaurant: 'Nhà hàng', historyMealChosen: 'Món đã chọn', historyOlderEntry: 'Mục lịch sử cũ', historyRestaurantUnavailable: 'Chưa có tên quán', historyLegacyNote: 'Món này được lưu trước khi TastePilot lưu đầy đủ thông tin quán. Vì vậy chưa có đủ điểm số, địa chỉ và khoảng cách, nhưng bạn vẫn có thể dùng Chỉ đường để tìm quán theo tên.', historyVisited: 'Đã ghé vào {{date}}', historySavePlace: 'Lưu quán',
    profileHeroEyebrow: 'HỒ SƠ', profileHeroTitle: 'Hồ sơ ẩm thực', profileHeroSubtitle: 'Được dùng cho Daily Meal và Travel Food để gợi ý hữu ích và cá nhân hóa hơn.', profileLanguageTitle: 'Ngôn ngữ ứng dụng', profileLanguageHint: 'Chọn ngôn ngữ dùng trong TastePilot.', profileLanguageOpen: 'Đổi ngôn ngữ', profileBasics: 'Thông tin cơ bản', profileCurrencyCode: 'Mã tiền tệ', profileTypicalBudget: 'Ngân sách bữa ăn thường dùng', profileFoodEnjoy: 'Món ăn bạn thích', profileRestrictions: 'Hạn chế ăn uống', profileTipTitle: 'Mẹo hồ sơ', profileTipText: 'Ngân sách mặc định hợp lý và sở thích chính xác giúp gợi ý món hằng ngày và xếp hạng quán gần bạn phù hợp hơn.', profileSave: 'Lưu hồ sơ', profileSavedTitle: 'Đã lưu', profileSavedText: 'Hồ sơ TastePilot đã được cập nhật.', profileBudgetAlertTitle: 'Ngân sách', profileBudgetAlertText: 'Hãy nhập ngân sách mặc định hợp lệ.', profileCuisineAsian: 'Món Á', profileCuisineItalian: 'Món Ý', profileCuisineMexican: 'Món Mexico', profileCuisineMediterranean: 'Địa Trung Hải', profileCuisineAmerican: 'Món Mỹ', profileCuisineIndian: 'Món Ấn', profileRestrictionVegetarian: 'Ăn chay', profileRestrictionVegan: 'Thuần chay', profileRestrictionHalal: 'Halal', profileRestrictionGlutenFree: 'Không gluten', profileRestrictionNoPork: 'Không thịt heo', profileRestrictionNoBeef: 'Không thịt bò',
    languageTitle: 'Ngôn ngữ ứng dụng', languageSubtitle: 'Chọn ngôn ngữ cho menu, nút và hướng dẫn trong app.', languageCurrent: 'Ngôn ngữ hiện tại', languageApplied: 'Đã đổi ngôn ngữ', languageAppliedText: 'TastePilot hiện đang dùng {{language}}.',
  }},
  es: {translation: {
    tabHome:'Inicio', tabSaved:'Guardados', tabHistory:'Historial', tabProfile:'Perfil', navBack:'Atrás', navDailyMeal:'Comida diaria', navTravelFood:'Comida de viaje', navSuggestions:'Sugerencias', navNearbyPlaces:'Lugares cercanos', navRestaurant:'Restaurante', navLanguage:'Idioma',
    commonRefresh:'Actualizar', commonDirections:'Cómo llegar', commonRemove:'Eliminar', commonSave:'Guardar', commonSaved:'Guardado', commonClose:'Cerrar', commonChoose:'Elegir', commonCheck:'Comprobar', commonReset:'Restablecer', commonOpenNow:'Abierto', commonClosed:'Cerrado', commonUnknownError:'Error desconocido', commonReviews:'reseñas', commonDistance:'Distancia', commonRating:'Valoración', commonOther:'Otro', commonUnknownArea:'Zona desconocida', commonSavedForLater:'Guardado para después', commonDaily:'DIARIO', commonTravel:'VIAJE', mapsTitle:'Mapas', mapsOpenFailed:'No se pudo abrir el mapa.', directionsTitle:'Cómo llegar', directionsUnavailable:'Esta entrada no tiene suficiente información del lugar.', locationYourArea:'Tu zona', locationNotDetected:'Ubicación aún no detectada', locationLocalCurrency:'Moneda local',
    homeKicker:'DESCUBRIMIENTO INTELIGENTE DE COMIDA', homeTitle:'Encuentra la comida que de verdad te apetece hoy', homeSubtitle:'Descubre comida con contexto local, presupuesto y sugerencias personalizadas.', homeAreaTitle:'Última zona detectada', homeDailyTitle:'¿Qué debería comer?', homeDailyPill:'5 ideas', homeDailyText:'Recibe 5 ideas y cámbialas rápido si no encajan contigo.', homeTravelTitle:'Explora comida local', homeTravelPill:'Viaje', homeTravelText:'Descubre especialidades locales y restaurantes cercanos donde vayas.',
    dailyEyebrow:'COMIDA DIARIA', dailyTitle:'¿Qué debería comer hoy?', dailySubtitle:'Introduce tu presupuesto y preferencias para recibir 5 sugerencias sin repetir comidas recientes.', dailyBudget:'Presupuesto', dailyInvalidBudget:'Introduce un presupuesto válido en {{currency}}.', dailyBudgetPlaceholder:'Presupuesto en {{currency}}', dailyFormatHint:'Formateamos el importe automáticamente.', dailyPreferences:'Preferencias opcionales', dailyHealthy:'Saludable', dailyHighProtein:'Alta proteína', dailyVegetarian:'Vegetariano', dailyQuickMeal:'Comida rápida', dailySomethingNew:'Algo nuevo', dailyHowTitle:'Cómo funcionan las sugerencias', dailyHowText:'TastePilot combina presupuesto, historial, preferencias y contexto local.', dailyButton:'Encontrar 5 comidas', dailyResultsTitle:'Selecciones de hoy', dailyErrorTitle:'No se pudieron cargar las sugerencias',
    travelEyebrow:'COMIDA DE VIAJE', travelTitle:'Explora comida local', travelSubtitle:'Busca en tu zona o en otro destino y encuentra comidas locales y restaurantes cercanos.', travelCurrentLocation:'Ubicación actual', travelSearchDestination:'Buscar destino', travelExploring:'Estás explorando', travelCityArea:'Ciudad o zona', travelDestination:'Destino', travelDestinationRequired:'Introduce una ciudad o zona.', travelDestinationError:'No se encontró el destino', travelMealBudget:'Presupuesto por comida', travelBudgetRequired:'Introduce tu presupuesto en {{currency}}.', travelRankingTitle:'Cómo funciona el ranking de viaje', travelRankingText:'TastePilot valora especialidad local, presupuesto, calidad y distancia.', travelButton:'Explorar 5 opciones', travelCurrentTitle:'Comida local imprescindible', travelMustTryIn:'Qué probar en {{place}}', travelTryIn:'Prueba en {{place}}', travelErrorTitle:'No se pudo explorar esta zona',
    resultsDailyEyebrow:'SELECCIONES DIARIAS', resultsTravelEyebrow:'SELECCIONES DE VIAJE', resultsSubtitle:'Elige un plato para encontrar lugares cercanos. Puedes sustituir uno o renovar los 5.', resultsTryAnother:'Probar otros 5', resultsCount:'{{count}} sugerencias', resultsNoMoreTitle:'No hay más ideas por ahora', resultsNoMoreText:'Cambia el presupuesto o las preferencias.', resultsRefreshError:'No se pudieron actualizar las sugerencias', resultsNoReplacement:'No se encontró reemplazo', resultsNoReplacementText:'TastePilot no pudo encontrar otra opción ahora.', resultsSwapError:'No se pudo cambiar este plato', resultsLocalPick:'SELECCIÓN LOCAL', resultsPick:'OPCIÓN {{index}}', resultsLocalSpecialty:'Especialidad local', resultsBudgetFit:'Ajuste al presupuesto', resultsNearbyReady:'Listo para buscar cerca', resultsReplace:'Sustituir', resultsFindPlaces:'Buscar lugares',
    restaurantsEyebrow:'LUGARES PARA', restaurantsSubtitle:'Busca, filtra y ordena restaurantes cercanos{{area}}.', restaurantsSearch:'Buscar restaurante o dirección', restaurantsFilter:'Filtro', restaurantsSort:'Ordenar', restaurantsFilterAll:'Todos', restaurantsFilterOpen:'Abiertos ahora', restaurantsFilterTop:'Valoración 4.5+', restaurantsFilterNearby:'A menos de 2 km', restaurantsSortRecommended:'Recomendados', restaurantsSortRating:'Valoración', restaurantsSortReviews:'Más reseñas', restaurantsSortDistance:'Más cercanos', restaurantsPlacesCount:'{{count}} lugares', restaurantsNoMatchTitle:'Ningún lugar coincide', restaurantsNoMatchText:'Prueba Todos, borra la búsqueda o cambia el orden.', restaurantsLoading:'Buscando lugares cercanos…', restaurantsError:'No se pudieron encontrar restaurantes', restaurantsHistoryAdded:'Añadido al historial', restaurantsOpen:'ABIERTO', restaurantsClosed:'CERRADO', restaurantsViewDetails:'Ver detalles del restaurante →', restaurantsChoose:'Elegir',
    restaurantDetailEyebrow:'DETALLE DEL RESTAURANTE', restaurantDetailSubtitle:'Una vista más clara para {{meal}}.', restaurantSavePlace:'Guardar lugar', restaurantChoosePlace:'Elegir este lugar', restaurantWhyTitle:'Por qué funciona este lugar', restaurantWhyText:'TastePilot eligió este restaurante porque encaja con {{meal}}, sus reseñas y la distancia.', restaurantConfidence:'Buena confianza en reseñas', restaurantAddress:'Dirección', restaurantRecommendedDish:'Plato recomendado', restaurantTipTitle:'Consejo de TastePilot', restaurantTipText:'Guarda este lugar para compararlo después o elígelo para mejorar futuras sugerencias.', restaurantHistoryAdded:'Añadido al historial',
    savedHeroEyebrow:'GUARDADOS', savedHeroTitle:'Lugares guardados', savedHeroSubtitle:'Agrupa tus restaurantes favoritos por ciudad o cocina.', savedGroupByCity:'Por ciudad', savedGroupByCuisine:'Por cocina', savedEmptyTitle:'Aún no hay lugares guardados', savedEmptyText:'Toca Guardar en un restaurante y aparecerá aquí.', savedCountSuffix:'guardados',
    historyHeroEyebrow:'HISTORIAL', historyHeroTitle:'Historial de comidas', historyHeroSubtitle:'Toca una comida para ver el restaurante. Tus me gusta ayudan a mejorar sugerencias.', historyTipTitle:'Toca cualquier tarjeta del historial', historyTipText:'Consulta valoración, dirección, distancia y rutas.', historyEmptyTitle:'Aún no hay comidas', historyEmptyText:'Elige un restaurante y aparecerá aquí.', historyViewDetails:'Ver detalles del restaurante', historyGoodPick:'¿Fue una buena elección?', historyLike:'👍 Me gusta', historyDislike:'👎 No me gusta', historyPlaceEyebrow:'LUGAR DEL HISTORIAL', historyRating:'Valoración', historyReviews:'Reseñas', historyDistance:'Distancia', historyRestaurant:'Restaurante', historyMealChosen:'Plato elegido', historyOlderEntry:'Entrada antigua', historyRestaurantUnavailable:'Nombre no disponible', historyLegacyNote:'Esta entrada es anterior al guardado completo del restaurante. Aún puedes buscarlo por nombre.', historyVisited:'Visitado {{date}}', historySavePlace:'Guardar lugar',
    profileHeroEyebrow:'PERFIL', profileHeroTitle:'Perfil gastronómico', profileHeroSubtitle:'Ayuda a personalizar Daily Meal y Travel Food.', profileLanguageTitle:'Idioma de la app', profileLanguageHint:'Elige el idioma de TastePilot.', profileLanguageOpen:'Cambiar idioma', profileBasics:'Datos básicos', profileCurrencyCode:'Código de moneda', profileTypicalBudget:'Presupuesto habitual', profileFoodEnjoy:'Comidas que te gustan', profileRestrictions:'Restricciones alimentarias', profileTipTitle:'Consejo de perfil', profileTipText:'Un buen presupuesto y preferencias precisas mejoran las sugerencias.', profileSave:'Guardar perfil', profileSavedTitle:'Guardado', profileSavedText:'Tu perfil se ha actualizado.', profileBudgetAlertTitle:'Presupuesto', profileBudgetAlertText:'Introduce un presupuesto válido.', profileCuisineAsian:'Asiática', profileCuisineItalian:'Italiana', profileCuisineMexican:'Mexicana', profileCuisineMediterranean:'Mediterránea', profileCuisineAmerican:'Americana', profileCuisineIndian:'India', profileRestrictionVegetarian:'Vegetariano', profileRestrictionVegan:'Vegano', profileRestrictionHalal:'Halal', profileRestrictionGlutenFree:'Sin gluten', profileRestrictionNoPork:'Sin cerdo', profileRestrictionNoBeef:'Sin ternera', languageTitle:'Idioma de la app', languageSubtitle:'Elige el idioma de menús, botones y ayuda.', languageCurrent:'Idioma actual', languageApplied:'Idioma actualizado', languageAppliedText:'TastePilot ahora usa {{language}}.',
  }},
  fr: {translation: {
    tabHome:'Accueil', tabSaved:'Enregistrés', tabHistory:'Historique', tabProfile:'Profil', navBack:'Retour', navDailyMeal:'Repas du jour', navTravelFood:'Cuisine en voyage', navSuggestions:'Suggestions', navNearbyPlaces:'À proximité', navRestaurant:'Restaurant', navLanguage:'Langue',
    commonRefresh:'Actualiser', commonDirections:'Itinéraire', commonRemove:'Supprimer', commonSave:'Enregistrer', commonSaved:'Enregistré', commonClose:'Fermer', commonChoose:'Choisir', commonCheck:'Vérifier', commonReset:'Réinitialiser', commonOpenNow:'Ouvert', commonClosed:'Fermé', commonUnknownError:'Erreur inconnue', commonReviews:'avis', commonDistance:'Distance', commonRating:'Note', commonOther:'Autre', commonUnknownArea:'Zone inconnue', commonSavedForLater:'Enregistré pour plus tard', commonDaily:'QUOTIDIEN', commonTravel:'VOYAGE', mapsTitle:'Cartes', mapsOpenFailed:"Impossible d’ouvrir la carte.", directionsTitle:'Itinéraire', directionsUnavailable:"Cette entrée ne contient pas assez d’informations sur le lieu.", locationYourArea:'Votre zone', locationNotDetected:'Localisation non détectée', locationLocalCurrency:'Devise locale',
    homeKicker:'DÉCOUVERTE CULINAIRE INTELLIGENTE', homeTitle:"Trouvez ce que vous avez vraiment envie de manger aujourd’hui", homeSubtitle:'Des suggestions plus intelligentes selon le lieu, le budget et vos préférences.', homeAreaTitle:'Dernière zone détectée', homeDailyTitle:'Que manger ?', homeDailyPill:'5 idées', homeDailyText:'Recevez 5 idées et renouvelez-les rapidement si rien ne vous convient.', homeTravelTitle:'Explorer la cuisine locale', homeTravelPill:'Voyage', homeTravelText:'Découvrez spécialités locales et restaurants proches partout où vous allez.',
    dailyEyebrow:'REPAS DU JOUR', dailyTitle:"Que manger aujourd’hui ?", dailySubtitle:'Indiquez votre budget et vos préférences pour obtenir 5 suggestions sans répétition récente.', dailyBudget:'Budget', dailyInvalidBudget:'Saisissez un budget valide en {{currency}}.', dailyBudgetPlaceholder:'Budget en {{currency}}', dailyFormatHint:'Le montant est formaté automatiquement.', dailyPreferences:'Préférences facultatives', dailyHealthy:'Sain', dailyHighProtein:'Riche en protéines', dailyVegetarian:'Végétarien', dailyQuickMeal:'Repas rapide', dailySomethingNew:'Quelque chose de nouveau', dailyHowTitle:'Comment fonctionnent les suggestions', dailyHowText:'TastePilot combine budget, historique, préférences et contexte local.', dailyButton:'Trouver 5 repas', dailyResultsTitle:'Sélections du jour', dailyErrorTitle:'Impossible de charger les suggestions',
    travelEyebrow:'CUISINE EN VOYAGE', travelTitle:'Explorer la cuisine locale', travelSubtitle:'Cherchez autour de vous ou dans une autre destination pour découvrir plats et restaurants.', travelCurrentLocation:'Position actuelle', travelSearchDestination:'Rechercher une destination', travelExploring:'Vous explorez', travelCityArea:'Ville ou zone', travelDestination:'Destination', travelDestinationRequired:'Saisissez une ville ou une zone.', travelDestinationError:'Destination introuvable', travelMealBudget:'Budget repas', travelBudgetRequired:'Saisissez votre budget en {{currency}}.', travelRankingTitle:'Comment fonctionne le classement', travelRankingText:'TastePilot évalue spécialité locale, budget, qualité et distance.', travelButton:'Explorer 5 plats', travelCurrentTitle:'Spécialités locales à tester', travelMustTryIn:'À goûter à {{place}}', travelTryIn:'À essayer à {{place}}', travelErrorTitle:"Impossible d’explorer cette zone", 
    resultsDailyEyebrow:'SÉLECTIONS DU JOUR', resultsTravelEyebrow:'SÉLECTIONS VOYAGE', resultsSubtitle:'Choisissez un plat pour trouver des lieux proches. Remplacez-en un ou renouvelez les 5.', resultsTryAnother:'Essayer 5 autres', resultsCount:'{{count}} suggestions', resultsNoMoreTitle:'Pas plus d’idées pour le moment', resultsNoMoreText:'Modifiez le budget ou les préférences.', resultsRefreshError:'Impossible d’actualiser les suggestions', resultsNoReplacement:'Aucun remplacement trouvé', resultsNoReplacementText:'TastePilot ne trouve pas d’autre option pour le moment.', resultsSwapError:'Impossible de remplacer ce plat', resultsLocalPick:'CHOIX LOCAL', resultsPick:'CHOIX {{index}}', resultsLocalSpecialty:'Spécialité locale', resultsBudgetFit:'Adapté au budget', resultsNearbyReady:'Prêt pour la recherche proche', resultsReplace:'Remplacer', resultsFindPlaces:'Trouver des lieux',
    restaurantsEyebrow:'LIEUX POUR', restaurantsSubtitle:'Recherchez, filtrez et triez les restaurants proches{{area}}.', restaurantsSearch:'Rechercher un restaurant ou une adresse', restaurantsFilter:'Filtrer', restaurantsSort:'Trier', restaurantsFilterAll:'Tous', restaurantsFilterOpen:'Ouverts', restaurantsFilterTop:'Note 4,5+', restaurantsFilterNearby:'À moins de 2 km', restaurantsSortRecommended:'Recommandés', restaurantsSortRating:'Note', restaurantsSortReviews:'Plus d’avis', restaurantsSortDistance:'Plus proches', restaurantsPlacesCount:'{{count}} lieux', restaurantsNoMatchTitle:'Aucun lieu ne correspond', restaurantsNoMatchText:'Essayez Tous, effacez la recherche ou changez le tri.', restaurantsLoading:'Recherche de lieux proches…', restaurantsError:'Impossible de trouver des restaurants', restaurantsHistoryAdded:'Ajouté à l’historique', restaurantsOpen:'OUVERT', restaurantsClosed:'FERMÉ', restaurantsViewDetails:'Voir les détails du restaurant →', restaurantsChoose:'Choisir',
    restaurantDetailEyebrow:'DÉTAIL DU RESTAURANT', restaurantDetailSubtitle:'Une vue plus claire pour {{meal}}.', restaurantSavePlace:'Enregistrer le lieu', restaurantChoosePlace:'Choisir ce lieu', restaurantWhyTitle:'Pourquoi ce lieu convient', restaurantWhyText:'TastePilot a choisi ce restaurant pour {{meal}}, ses avis et sa distance.', restaurantConfidence:'Bonne fiabilité des avis', restaurantAddress:'Adresse', restaurantRecommendedDish:'Plat recommandé', restaurantTipTitle:'Conseil TastePilot', restaurantTipText:'Enregistrez ce lieu ou choisissez-le pour améliorer les prochaines suggestions.', restaurantHistoryAdded:'Ajouté à l’historique',
    savedHeroEyebrow:'ENREGISTRÉS', savedHeroTitle:'Lieux enregistrés', savedHeroSubtitle:'Regroupez vos restaurants favoris par ville ou cuisine.', savedGroupByCity:'Par ville', savedGroupByCuisine:'Par cuisine', savedEmptyTitle:'Aucun lieu enregistré', savedEmptyText:'Touchez Enregistrer sur un restaurant et il apparaîtra ici.', savedCountSuffix:'enregistrés',
    historyHeroEyebrow:'HISTORIQUE', historyHeroTitle:'Historique des repas', historyHeroSubtitle:'Touchez un repas pour voir le restaurant. Vos avis améliorent les suggestions.', historyTipTitle:'Touchez une carte de l’historique', historyTipText:'Consultez note, adresse, distance et itinéraire.', historyEmptyTitle:'Aucun repas pour le moment', historyEmptyText:'Choisissez un restaurant et il apparaîtra ici.', historyViewDetails:'Voir les détails du restaurant', historyGoodPick:'Bon choix ?', historyLike:'👍 J’aime', historyDislike:'👎 Je n’aime pas', historyPlaceEyebrow:'LIEU DE L’HISTORIQUE', historyRating:'Note', historyReviews:'Avis', historyDistance:'Distance', historyRestaurant:'Restaurant', historyMealChosen:'Plat choisi', historyOlderEntry:'Ancienne entrée', historyRestaurantUnavailable:'Nom indisponible', historyLegacyNote:'Cette entrée est ancienne et ne contient pas toutes les données du restaurant. Vous pouvez encore le rechercher par nom.', historyVisited:'Visité le {{date}}', historySavePlace:'Enregistrer le lieu',
    profileHeroEyebrow:'PROFIL', profileHeroTitle:'Profil culinaire', profileHeroSubtitle:'Personnalise Daily Meal et Travel Food.', profileLanguageTitle:'Langue de l’app', profileLanguageHint:'Choisissez la langue de TastePilot.', profileLanguageOpen:'Changer de langue', profileBasics:'Informations de base', profileCurrencyCode:'Code devise', profileTypicalBudget:'Budget habituel', profileFoodEnjoy:'Cuisines préférées', profileRestrictions:'Restrictions alimentaires', profileTipTitle:'Conseil profil', profileTipText:'Un budget et des préférences précis améliorent les suggestions.', profileSave:'Enregistrer le profil', profileSavedTitle:'Enregistré', profileSavedText:'Votre profil a été mis à jour.', profileBudgetAlertTitle:'Budget', profileBudgetAlertText:'Saisissez un budget valide.', profileCuisineAsian:'Asiatique', profileCuisineItalian:'Italienne', profileCuisineMexican:'Mexicaine', profileCuisineMediterranean:'Méditerranéenne', profileCuisineAmerican:'Américaine', profileCuisineIndian:'Indienne', profileRestrictionVegetarian:'Végétarien', profileRestrictionVegan:'Végane', profileRestrictionHalal:'Halal', profileRestrictionGlutenFree:'Sans gluten', profileRestrictionNoPork:'Sans porc', profileRestrictionNoBeef:'Sans bœuf', languageTitle:'Langue de l’app', languageSubtitle:'Choisissez la langue des menus, boutons et aides.', languageCurrent:'Langue actuelle', languageApplied:'Langue mise à jour', languageAppliedText:'TastePilot utilise maintenant {{language}}.',
  }},
  ja: {translation: {
    tabHome:'ホーム', tabSaved:'保存済み', tabHistory:'履歴', tabProfile:'プロフィール', navBack:'戻る', navDailyMeal:'今日の食事', navTravelFood:'旅先グルメ', navSuggestions:'おすすめ', navNearbyPlaces:'近くのお店', navRestaurant:'レストラン', navLanguage:'言語',
    commonRefresh:'更新', commonDirections:'経路', commonRemove:'削除', commonSave:'保存', commonSaved:'保存済み', commonClose:'閉じる', commonChoose:'選ぶ', commonCheck:'確認', commonReset:'リセット', commonOpenNow:'営業中', commonClosed:'閉店', commonUnknownError:'不明なエラー', commonReviews:'件のレビュー', commonDistance:'距離', commonRating:'評価', commonOther:'その他', commonUnknownArea:'不明なエリア', commonSavedForLater:'あとで見る', commonDaily:'デイリー', commonTravel:'旅行', mapsTitle:'地図', mapsOpenFailed:'地図を開けませんでした。', directionsTitle:'経路', directionsUnavailable:'この履歴には場所の情報が不足しています。', locationYourArea:'現在のエリア', locationNotDetected:'位置情報はまだ取得されていません', locationLocalCurrency:'現地通貨',
    homeKicker:'スマートなグルメ探索', homeTitle:'今日、本当に食べたいものを見つけよう', homeSubtitle:'場所・予算・好みに合わせて、より賢く食事を提案します。', homeAreaTitle:'最後に検出したエリア', homeDailyTitle:'今日は何を食べる？', homeDailyPill:'5件', homeDailyText:'5つの候補を表示し、気分に合わなければすぐ更新できます。', homeTravelTitle:'ローカルフードを探す', homeTravelPill:'旅行', homeTravelText:'旅先の名物料理や近くの人気店を見つけましょう。',
    dailyEyebrow:'今日の食事', dailyTitle:'今日は何を食べる？', dailySubtitle:'予算と好みを入力すると、最近と重ならない5つの候補を提案します。', dailyBudget:'予算', dailyInvalidBudget:'{{currency}}で有効な予算を入力してください。', dailyBudgetPlaceholder:'{{currency}}の予算', dailyFormatHint:'金額は自動で読みやすく整形されます。', dailyPreferences:'好み（任意）', dailyHealthy:'ヘルシー', dailyHighProtein:'高たんぱく', dailyVegetarian:'ベジタリアン', dailyQuickMeal:'手軽な食事', dailySomethingNew:'新しいもの', dailyHowTitle:'おすすめの仕組み', dailyHowText:'TastePilotは予算、履歴、好み、周辺情報を組み合わせます。', dailyButton:'5つの料理を探す', dailyResultsTitle:'今日のおすすめ', dailyErrorTitle:'おすすめを読み込めませんでした',
    travelEyebrow:'旅先グルメ', travelTitle:'ローカルフードを探す', travelSubtitle:'現在地や別の目的地から、現地料理と近くのレストランを探せます。', travelCurrentLocation:'現在地', travelSearchDestination:'目的地を検索', travelExploring:'探索中のエリア', travelCityArea:'都市またはエリア', travelDestination:'目的地', travelDestinationRequired:'都市またはエリアを入力してください。', travelDestinationError:'目的地が見つかりません', travelMealBudget:'食事予算', travelBudgetRequired:'{{currency}}で食事予算を入力してください。', travelRankingTitle:'旅行ランキングの仕組み', travelRankingText:'名物度、予算、店の質、距離をもとに候補を順位付けします。', travelButton:'5つの料理を探す', travelCurrentTitle:'現地で食べたい料理', travelMustTryIn:'{{place}}で食べたい料理', travelTryIn:'{{place}}で試す', travelErrorTitle:'このエリアを探索できませんでした',
    resultsDailyEyebrow:'今日の候補', resultsTravelEyebrow:'旅の候補', resultsSubtitle:'料理を選ぶと近くのお店を探せます。1件だけ差し替えることも、5件すべて更新することもできます。', resultsTryAnother:'別の5件を見る', resultsCount:'{{count}}件の候補', resultsNoMoreTitle:'新しい候補がありません', resultsNoMoreText:'予算や好みを変更してみてください。', resultsRefreshError:'候補を更新できませんでした', resultsNoReplacement:'代わりの料理が見つかりません', resultsNoReplacementText:'現在は別の候補を見つけられませんでした。', resultsSwapError:'料理を変更できませんでした', resultsLocalPick:'ローカル候補', resultsPick:'候補 {{index}}', resultsLocalSpecialty:'現地名物', resultsBudgetFit:'予算に合う', resultsNearbyReady:'近くのお店を検索可能', resultsReplace:'差し替え', resultsFindPlaces:'お店を探す',
    restaurantsEyebrow:'お店を検索', restaurantsSubtitle:'近くのレストランを検索・絞り込み・並べ替えできます{{area}}。', restaurantsSearch:'店名または住所を検索', restaurantsFilter:'絞り込み', restaurantsSort:'並べ替え', restaurantsFilterAll:'すべて', restaurantsFilterOpen:'営業中', restaurantsFilterTop:'評価4.5以上', restaurantsFilterNearby:'2km以内', restaurantsSortRecommended:'おすすめ', restaurantsSortRating:'評価', restaurantsSortReviews:'レビュー数', restaurantsSortDistance:'近い順', restaurantsPlacesCount:'{{count}}件', restaurantsNoMatchTitle:'条件に合うお店がありません', restaurantsNoMatchText:'「すべて」を選ぶか、検索文字や並び順を変更してください。', restaurantsLoading:'近くのお店を探しています…', restaurantsError:'レストランを検索できませんでした', restaurantsHistoryAdded:'履歴に追加しました', restaurantsOpen:'営業中', restaurantsClosed:'閉店', restaurantsViewDetails:'レストラン詳細を見る →', restaurantsChoose:'選ぶ',
    restaurantDetailEyebrow:'レストラン詳細', restaurantDetailSubtitle:'{{meal}}に合うお店の詳細です。', restaurantSavePlace:'お店を保存', restaurantChoosePlace:'このお店を選ぶ', restaurantWhyTitle:'このお店がおすすめの理由', restaurantWhyText:'TastePilotは{{meal}}との相性、レビュー、距離をもとにこのお店を選びました。', restaurantConfidence:'レビュー信頼度が高い', restaurantAddress:'住所', restaurantRecommendedDish:'おすすめ料理', restaurantTipTitle:'TastePilotのヒント', restaurantTipText:'保存してあとで比較するか、選んで履歴に追加すると今後のおすすめが改善されます。', restaurantHistoryAdded:'履歴に追加しました',
    savedHeroEyebrow:'保存済み', savedHeroTitle:'保存したお店', savedHeroSubtitle:'お気に入りのお店を都市や料理ジャンルごとに整理できます。', savedGroupByCity:'都市別', savedGroupByCuisine:'料理別', savedEmptyTitle:'まだ保存したお店はありません', savedEmptyText:'レストランカードの「保存」を押すとここに表示されます。', savedCountSuffix:'件保存',
    historyHeroEyebrow:'履歴', historyHeroTitle:'食事履歴', historyHeroSubtitle:'料理をタップしてお店の詳細を確認できます。評価は今後の提案改善にも役立ちます。', historyTipTitle:'履歴カードをタップ', historyTipText:'評価、住所、距離、経路を確認できます。', historyEmptyTitle:'まだ履歴がありません', historyEmptyText:'おすすめからお店を選ぶとここに表示されます。', historyViewDetails:'レストラン詳細を見る', historyGoodPick:'良い候補でしたか？', historyLike:'👍 好き', historyDislike:'👎 好みではない', historyPlaceEyebrow:'履歴のお店', historyRating:'評価', historyReviews:'レビュー', historyDistance:'距離', historyRestaurant:'レストラン', historyMealChosen:'選んだ料理', historyOlderEntry:'古い履歴', historyRestaurantUnavailable:'店名なし', historyLegacyNote:'この履歴は古いため店の詳細情報が完全ではありません。店名で検索はできます。', historyVisited:'訪問: {{date}}', historySavePlace:'お店を保存',
    profileHeroEyebrow:'プロフィール', profileHeroTitle:'フードプロフィール', profileHeroSubtitle:'Daily MealとTravel Foodの提案をより自分向けにします。', profileLanguageTitle:'アプリの言語', profileLanguageHint:'TastePilotで使う言語を選択します。', profileLanguageOpen:'言語を変更', profileBasics:'基本設定', profileCurrencyCode:'通貨コード', profileTypicalBudget:'通常の食事予算', profileFoodEnjoy:'好きな料理', profileRestrictions:'食事制限', profileTipTitle:'プロフィールのヒント', profileTipText:'予算と好みを正確に設定すると提案の精度が上がります。', profileSave:'プロフィールを保存', profileSavedTitle:'保存しました', profileSavedText:'プロフィールを更新しました。', profileBudgetAlertTitle:'予算', profileBudgetAlertText:'有効な予算を入力してください。', profileCuisineAsian:'アジア料理', profileCuisineItalian:'イタリア料理', profileCuisineMexican:'メキシコ料理', profileCuisineMediterranean:'地中海料理', profileCuisineAmerican:'アメリカ料理', profileCuisineIndian:'インド料理', profileRestrictionVegetarian:'ベジタリアン', profileRestrictionVegan:'ヴィーガン', profileRestrictionHalal:'ハラール', profileRestrictionGlutenFree:'グルテンフリー', profileRestrictionNoPork:'豚肉なし', profileRestrictionNoBeef:'牛肉なし', languageTitle:'アプリの言語', languageSubtitle:'メニュー、ボタン、案内に使う言語を選択します。', languageCurrent:'現在の言語', languageApplied:'言語を変更しました', languageAppliedText:'TastePilotは{{language}}で表示されます。',
  }},
  zh: {translation: {
    tabHome:'首页', tabSaved:'已保存', tabHistory:'历史', tabProfile:'个人资料', navBack:'返回', navDailyMeal:'今日用餐', navTravelFood:'旅行美食', navSuggestions:'推荐', navNearbyPlaces:'附近餐厅', navRestaurant:'餐厅', navLanguage:'语言',
    commonRefresh:'刷新', commonDirections:'路线', commonRemove:'删除', commonSave:'保存', commonSaved:'已保存', commonClose:'关闭', commonChoose:'选择', commonCheck:'检查', commonReset:'重置', commonOpenNow:'营业中', commonClosed:'已关闭', commonUnknownError:'未知错误', commonReviews:'条评价', commonDistance:'距离', commonRating:'评分', commonOther:'其他', commonUnknownArea:'未知区域', commonSavedForLater:'稍后查看', commonDaily:'每日', commonTravel:'旅行', mapsTitle:'地图', mapsOpenFailed:'无法打开地图。', directionsTitle:'路线', directionsUnavailable:'该记录缺少足够的地点信息。', locationYourArea:'你的区域', locationNotDetected:'尚未检测到位置', locationLocalCurrency:'当地货币',
    homeKicker:'智能美食发现', homeTitle:'找到今天真正想吃的东西', homeSubtitle:'根据位置、预算和偏好提供更聪明的美食推荐。', homeAreaTitle:'最近检测区域', homeDailyTitle:'今天吃什么？', homeDailyPill:'5个建议', homeDailyText:'获得5个餐食建议，不喜欢时可快速刷新。', homeTravelTitle:'探索当地美食', homeTravelPill:'旅行', homeTravelText:'无论去哪都能发现当地特色和附近餐厅。',
    dailyEyebrow:'今日用餐', dailyTitle:'今天吃什么？', dailySubtitle:'输入预算和偏好，获得5个不重复近期餐食的建议。', dailyBudget:'预算', dailyInvalidBudget:'请输入有效的{{currency}}预算。', dailyBudgetPlaceholder:'输入{{currency}}预算', dailyFormatHint:'金额会自动格式化显示。', dailyPreferences:'可选偏好', dailyHealthy:'健康', dailyHighProtein:'高蛋白', dailyVegetarian:'素食', dailyQuickMeal:'快速餐', dailySomethingNew:'尝试新口味', dailyHowTitle:'推荐方式', dailyHowText:'TastePilot会结合预算、近期历史、偏好和当地信息。', dailyButton:'找5个餐食', dailyResultsTitle:'今日推荐', dailyErrorTitle:'无法加载推荐',
    travelEyebrow:'旅行美食', travelTitle:'探索当地美食', travelSubtitle:'搜索当前位置或其他目的地，获取当地餐食和附近餐厅推荐。', travelCurrentLocation:'当前位置', travelSearchDestination:'搜索目的地', travelExploring:'正在探索', travelCityArea:'城市或区域', travelDestination:'目的地', travelDestinationRequired:'请输入城市或区域。', travelDestinationError:'找不到目的地', travelMealBudget:'餐食预算', travelBudgetRequired:'请输入{{currency}}餐食预算。', travelRankingTitle:'旅行推荐排序方式', travelRankingText:'TastePilot会综合当地特色、预算、餐厅质量和距离。', travelButton:'探索5个美食', travelCurrentTitle:'当地必吃', travelMustTryIn:'{{place}}必吃美食', travelTryIn:'在{{place}}尝试', travelErrorTitle:'无法探索该区域',
    resultsDailyEyebrow:'今日推荐', resultsTravelEyebrow:'旅行推荐', resultsSubtitle:'选择一道菜查找附近餐厅。不喜欢时可替换一项或刷新全部5项。', resultsTryAnother:'换5个', resultsCount:'{{count}}个建议', resultsNoMoreTitle:'暂时没有更多建议', resultsNoMoreText:'可尝试修改预算或偏好。', resultsRefreshError:'无法刷新推荐', resultsNoReplacement:'没有找到替换项', resultsNoReplacementText:'TastePilot暂时找不到其他选项。', resultsSwapError:'无法替换这道菜', resultsLocalPick:'当地推荐', resultsPick:'推荐 {{index}}', resultsLocalSpecialty:'当地特色', resultsBudgetFit:'符合预算', resultsNearbyReady:'可搜索附近餐厅', resultsReplace:'替换', resultsFindPlaces:'找餐厅',
    restaurantsEyebrow:'适合这道菜的餐厅', restaurantsSubtitle:'搜索、筛选并排序附近餐厅{{area}}。', restaurantsSearch:'搜索餐厅或地址', restaurantsFilter:'筛选', restaurantsSort:'排序', restaurantsFilterAll:'全部', restaurantsFilterOpen:'营业中', restaurantsFilterTop:'评分4.5+', restaurantsFilterNearby:'2公里内', restaurantsSortRecommended:'推荐', restaurantsSortRating:'评分', restaurantsSortReviews:'评价最多', restaurantsSortDistance:'最近', restaurantsPlacesCount:'{{count}}家', restaurantsNoMatchTitle:'没有符合条件的餐厅', restaurantsNoMatchText:'尝试选择全部、清除搜索或更改排序。', restaurantsLoading:'正在寻找附近餐厅…', restaurantsError:'无法查找餐厅', restaurantsHistoryAdded:'已加入历史', restaurantsOpen:'营业中', restaurantsClosed:'已关闭', restaurantsViewDetails:'查看餐厅详情 →', restaurantsChoose:'选择',
    restaurantDetailEyebrow:'餐厅详情', restaurantDetailSubtitle:'查看适合{{meal}}的餐厅详情。', restaurantSavePlace:'保存餐厅', restaurantChoosePlace:'选择这家', restaurantWhyTitle:'为什么推荐这里', restaurantWhyText:'TastePilot根据{{meal}}匹配度、评价和距离推荐这家餐厅。', restaurantConfidence:'评价可信度高', restaurantAddress:'地址', restaurantRecommendedDish:'推荐菜品', restaurantTipTitle:'TastePilot提示', restaurantTipText:'保存后可稍后比较，选择后会加入历史并改善未来推荐。', restaurantHistoryAdded:'已加入历史',
    savedHeroEyebrow:'已保存', savedHeroTitle:'已保存餐厅', savedHeroSubtitle:'按城市或菜系整理你喜欢的餐厅。', savedGroupByCity:'按城市', savedGroupByCuisine:'按菜系', savedEmptyTitle:'还没有保存的餐厅', savedEmptyText:'点击餐厅卡片上的“保存”，它会出现在这里。', savedCountSuffix:'个已保存',
    historyHeroEyebrow:'历史', historyHeroTitle:'用餐历史', historyHeroSubtitle:'点击餐食查看餐厅详情。喜欢或不喜欢也会帮助改善推荐。', historyTipTitle:'点击任意历史卡片', historyTipText:'可查看评分、地址、距离和路线。', historyEmptyTitle:'还没有用餐记录', historyEmptyText:'从推荐中选择一家餐厅后会显示在这里。', historyViewDetails:'查看餐厅详情', historyGoodPick:'这个推荐好吗？', historyLike:'👍 喜欢', historyDislike:'👎 不喜欢', historyPlaceEyebrow:'历史餐厅', historyRating:'评分', historyReviews:'评价', historyDistance:'距离', historyRestaurant:'餐厅', historyMealChosen:'已选餐食', historyOlderEntry:'旧记录', historyRestaurantUnavailable:'暂无餐厅名称', historyLegacyNote:'这是一条较早的记录，因此缺少完整餐厅信息，但仍可按名称搜索。', historyVisited:'访问时间 {{date}}', historySavePlace:'保存餐厅',
    profileHeroEyebrow:'个人资料', profileHeroTitle:'饮食偏好', profileHeroSubtitle:'用于个性化Daily Meal和Travel Food推荐。', profileLanguageTitle:'应用语言', profileLanguageHint:'选择TastePilot使用的语言。', profileLanguageOpen:'更改语言', profileBasics:'基本设置', profileCurrencyCode:'货币代码', profileTypicalBudget:'常用餐食预算', profileFoodEnjoy:'喜欢的菜系', profileRestrictions:'饮食限制', profileTipTitle:'资料提示', profileTipText:'准确的预算和偏好能显著提升推荐质量。', profileSave:'保存资料', profileSavedTitle:'已保存', profileSavedText:'你的TastePilot资料已更新。', profileBudgetAlertTitle:'预算', profileBudgetAlertText:'请输入有效的默认预算。', profileCuisineAsian:'亚洲菜', profileCuisineItalian:'意大利菜', profileCuisineMexican:'墨西哥菜', profileCuisineMediterranean:'地中海菜', profileCuisineAmerican:'美式', profileCuisineIndian:'印度菜', profileRestrictionVegetarian:'素食', profileRestrictionVegan:'纯素', profileRestrictionHalal:'清真', profileRestrictionGlutenFree:'无麸质', profileRestrictionNoPork:'不吃猪肉', profileRestrictionNoBeef:'不吃牛肉', languageTitle:'应用语言', languageSubtitle:'选择菜单、按钮和应用提示使用的语言。', languageCurrent:'当前语言', languageApplied:'语言已更新', languageAppliedText:'TastePilot现在使用{{language}}。',
  }},
};

const extendedResources = {
  ...resources,
  ko: {translation: {...resources.en.translation, ...require('./locales/ko.json')}},
  th: {translation: {...resources.en.translation, ...require('./locales/th.json')}},
  pt: {translation: {...resources.en.translation, ...require('./locales/pt.json')}},
  ru: {translation: {...resources.en.translation, ...require('./locales/ru.json')}},
  de: {translation: {...resources.en.translation, ...require('./locales/de.json')}},
  it: {translation: {...resources.en.translation, ...require('./locales/it.json')}},
  hi: {translation: {...resources.en.translation, ...require('./locales/hi.json')}},
  ar: {translation: {...resources.en.translation, ...require('./locales/ar.json')}},
  id: {translation: {...resources.en.translation, ...require('./locales/id.json')}},
  ms: {translation: {...resources.en.translation, ...require('./locales/ms.json')}},
};


const FOOD_LABELS: Record<string, Record<string, string>> = {
  en: {noodleFavorite:'Noodle favorite',streetFavorite:'Street favorite',riceFavorite:'Rice favorite',freshPick:'Fresh pick',italianFavorite:'Italian favorite',comfortFood:'Comfort food',healthyChoice:'Healthy choice',sweetPick:'Sweet pick',chefPick:'Chef pick'},
  vi: {noodleFavorite:'Món mì được yêu thích',streetFavorite:'Món đường phố nổi bật',riceFavorite:'Món cơm được yêu thích',freshPick:'Lựa chọn tươi ngon',italianFavorite:'Món Ý được yêu thích',comfortFood:'Món ngon dễ ăn',healthyChoice:'Lựa chọn lành mạnh',sweetPick:'Món ngọt nổi bật',chefPick:'Gợi ý của bếp trưởng'},
  es: {noodleFavorite:'Favorito de fideos',streetFavorite:'Favorito callejero',riceFavorite:'Favorito de arroz',freshPick:'Elección fresca',italianFavorite:'Favorito italiano',comfortFood:'Comida reconfortante',healthyChoice:'Opción saludable',sweetPick:'Elección dulce',chefPick:'Elección del chef'},
  fr: {noodleFavorite:'Favori aux nouilles',streetFavorite:'Favori de rue',riceFavorite:'Favori au riz',freshPick:'Choix fraîcheur',italianFavorite:'Favori italien',comfortFood:'Plat réconfortant',healthyChoice:'Choix sain',sweetPick:'Choix sucré',chefPick:'Choix du chef'},
  ja: {noodleFavorite:'麺の人気メニュー',streetFavorite:'屋台の人気メニュー',riceFavorite:'ご飯の人気メニュー',freshPick:'フレッシュなおすすめ',italianFavorite:'イタリアンの人気メニュー',comfortFood:'ほっとする料理',healthyChoice:'ヘルシーな選択',sweetPick:'スイーツのおすすめ',chefPick:'シェフのおすすめ'},
  zh: {noodleFavorite:'人气面食',streetFavorite:'人气街头美食',riceFavorite:'人气米饭料理',freshPick:'新鲜之选',italianFavorite:'人气意式料理',comfortFood:'暖心美食',healthyChoice:'健康之选',sweetPick:'甜品之选',chefPick:'主厨推荐'},
  ko: {noodleFavorite:'인기 면요리',streetFavorite:'인기 길거리 음식',riceFavorite:'인기 밥요리',freshPick:'신선한 추천',italianFavorite:'인기 이탈리안',comfortFood:'편안한 한 끼',healthyChoice:'건강한 선택',sweetPick:'달콤한 추천',chefPick:'셰프 추천'},
  th: {noodleFavorite:'เมนูเส้นยอดนิยม',streetFavorite:'เมนูสตรีทฟู้ดยอดนิยม',riceFavorite:'เมนูข้าวยอดนิยม',freshPick:'ตัวเลือกสดใหม่',italianFavorite:'เมนูอิตาเลียนยอดนิยม',comfortFood:'อาหารสบายใจ',healthyChoice:'ตัวเลือกเพื่อสุขภาพ',sweetPick:'ของหวานแนะนำ',chefPick:'เชฟแนะนำ'},
  pt: {noodleFavorite:'Favorito de massas',streetFavorite:'Favorito de rua',riceFavorite:'Favorito de arroz',freshPick:'Escolha fresca',italianFavorite:'Favorito italiano',comfortFood:'Comida reconfortante',healthyChoice:'Escolha saudável',sweetPick:'Escolha doce',chefPick:'Escolha do chef'},
  ru: {noodleFavorite:'Любимая лапша',streetFavorite:'Любимая уличная еда',riceFavorite:'Любимое блюдо с рисом',freshPick:'Свежий выбор',italianFavorite:'Итальянский фаворит',comfortFood:'Комфортная еда',healthyChoice:'Полезный выбор',sweetPick:'Сладкий выбор',chefPick:'Выбор шефа'},
  de: {noodleFavorite:'Nudel-Favorit',streetFavorite:'Streetfood-Favorit',riceFavorite:'Reis-Favorit',freshPick:'Frische Empfehlung',italianFavorite:'Italienischer Favorit',comfortFood:'Wohlfühlessen',healthyChoice:'Gesunde Wahl',sweetPick:'Süße Empfehlung',chefPick:'Empfehlung des Küchenchefs'},
  it: {noodleFavorite:'Preferito di noodles',streetFavorite:'Preferito street food',riceFavorite:'Preferito di riso',freshPick:'Scelta fresca',italianFavorite:'Preferito italiano',comfortFood:'Comfort food',healthyChoice:'Scelta salutare',sweetPick:'Scelta dolce',chefPick:'Scelta dello chef'},
  hi: {noodleFavorite:'लोकप्रिय नूडल डिश',streetFavorite:'लोकप्रिय स्ट्रीट फूड',riceFavorite:'लोकप्रिय चावल डिश',freshPick:'ताज़ा पसंद',italianFavorite:'लोकप्रिय इतालवी डिश',comfortFood:'आरामदायक भोजन',healthyChoice:'स्वस्थ विकल्प',sweetPick:'मीठी पसंद',chefPick:'शेफ की पसंद'},
  ar: {noodleFavorite:'طبق نودلز مفضل',streetFavorite:'طعام شارع مفضل',riceFavorite:'طبق أرز مفضل',freshPick:'اختيار طازج',italianFavorite:'طبق إيطالي مفضل',comfortFood:'طعام مريح',healthyChoice:'خيار صحي',sweetPick:'اختيار حلو',chefPick:'اختيار الشيف'},
  id: {noodleFavorite:'Favorit mi',streetFavorite:'Favorit kaki lima',riceFavorite:'Favorit nasi',freshPick:'Pilihan segar',italianFavorite:'Favorit Italia',comfortFood:'Makanan nyaman',healthyChoice:'Pilihan sehat',sweetPick:'Pilihan manis',chefPick:'Pilihan chef'},
  ms: {noodleFavorite:'Pilihan mi popular',streetFavorite:'Makanan jalanan popular',riceFavorite:'Hidangan nasi popular',freshPick:'Pilihan segar',italianFavorite:'Pilihan Itali',comfortFood:'Makanan selesa',healthyChoice:'Pilihan sihat',sweetPick:'Pilihan manis',chefPick:'Pilihan cef'},
};


const MEAL_TYPE_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    mealTypeTitle:'Meal time', mealTypeAuto:'Auto', mealTypeBreakfast:'Breakfast', mealTypeLunch:'Lunch', mealTypeDinner:'Dinner',
    mealTypeAutoHint:'Suggested now: {{meal}}',
    mealTypeDailyHint:'Daily Meal prioritizes everyday dishes that suit this meal.',
    mealTypeTravelHint:'Travel Food prioritizes local specialties that visitors commonly try for this meal.',
  },
  vi: {
    mealTypeTitle:'Loại bữa ăn', mealTypeAuto:'Tự động', mealTypeBreakfast:'Bữa sáng', mealTypeLunch:'Bữa trưa', mealTypeDinner:'Bữa tối',
    mealTypeAutoHint:'Theo giờ hiện tại: {{meal}}',
    mealTypeDailyHint:'Bữa ăn hằng ngày ưu tiên các món thường ăn và phù hợp với bữa này.',
    mealTypeTravelHint:'Ẩm thực du lịch ưu tiên đặc sản địa phương mà du khách thường thử trong bữa này.',
  },
  es: {
    mealTypeTitle:'Momento de la comida', mealTypeAuto:'Automático', mealTypeBreakfast:'Desayuno', mealTypeLunch:'Almuerzo', mealTypeDinner:'Cena',
    mealTypeAutoHint:'Sugerido ahora: {{meal}}',
    mealTypeDailyHint:'La comida diaria prioriza platos cotidianos apropiados para este momento.',
    mealTypeTravelHint:'En viaje se priorizan especialidades locales populares entre visitantes para esta comida.',
  },
  fr: {
    mealTypeTitle:'Moment du repas', mealTypeAuto:'Auto', mealTypeBreakfast:'Petit-déjeuner', mealTypeLunch:'Déjeuner', mealTypeDinner:'Dîner',
    mealTypeAutoHint:'Suggéré maintenant : {{meal}}',
    mealTypeDailyHint:'Le mode quotidien privilégie les plats de tous les jours adaptés à ce repas.',
    mealTypeTravelHint:'Le mode voyage privilégie les spécialités locales souvent goûtées par les visiteurs à ce repas.',
  },
  ja: {
    mealTypeTitle:'食事の時間', mealTypeAuto:'自動', mealTypeBreakfast:'朝食', mealTypeLunch:'昼食', mealTypeDinner:'夕食',
    mealTypeAutoHint:'現在のおすすめ: {{meal}}',
    mealTypeDailyHint:'日常モードでは、この時間帯に合う普段の食事を優先します。',
    mealTypeTravelHint:'旅行モードでは、この食事時間に旅行者がよく食べる現地名物を優先します。',
  },
  zh: {
    mealTypeTitle:'用餐时段', mealTypeAuto:'自动', mealTypeBreakfast:'早餐', mealTypeLunch:'午餐', mealTypeDinner:'晚餐',
    mealTypeAutoHint:'当前建议：{{meal}}',
    mealTypeDailyHint:'日常用餐优先推荐适合当前时段的家常常吃菜品。',
    mealTypeTravelHint:'旅行用餐优先推荐游客在该时段常吃的当地特色美食。',
  },
  ko: {
    mealTypeTitle:'식사 시간', mealTypeAuto:'자동', mealTypeBreakfast:'아침', mealTypeLunch:'점심', mealTypeDinner:'저녁',
    mealTypeAutoHint:'현재 추천: {{meal}}',
    mealTypeDailyHint:'일상 식사는 이 시간대에 잘 맞는 평소 메뉴를 우선합니다.',
    mealTypeTravelHint:'여행 식사는 이 시간대에 여행객이 많이 찾는 현지 대표 음식을 우선합니다.',
  },
  th: {
    mealTypeTitle:'ช่วงมื้ออาหาร', mealTypeAuto:'อัตโนมัติ', mealTypeBreakfast:'อาหารเช้า', mealTypeLunch:'อาหารกลางวัน', mealTypeDinner:'อาหารเย็น',
    mealTypeAutoHint:'แนะนำตอนนี้: {{meal}}',
    mealTypeDailyHint:'โหมดมื้อประจำวันจะเน้นอาหารที่กินได้เป็นประจำและเหมาะกับมื้อนี้',
    mealTypeTravelHint:'โหมดท่องเที่ยวจะเน้นอาหารท้องถิ่นขึ้นชื่อที่นักท่องเที่ยวนิยมกินในมื้อนี้',
  },
  pt: {
    mealTypeTitle:'Horário da refeição', mealTypeAuto:'Automático', mealTypeBreakfast:'Pequeno-almoço', mealTypeLunch:'Almoço', mealTypeDinner:'Jantar',
    mealTypeAutoHint:'Sugestão agora: {{meal}}',
    mealTypeDailyHint:'O modo diário prioriza pratos do dia a dia adequados a esta refeição.',
    mealTypeTravelHint:'O modo viagem prioriza especialidades locais que os visitantes costumam experimentar nesta refeição.',
  },
  ru: {
    mealTypeTitle:'Время приема пищи', mealTypeAuto:'Авто', mealTypeBreakfast:'Завтрак', mealTypeLunch:'Обед', mealTypeDinner:'Ужин',
    mealTypeAutoHint:'Сейчас рекомендуется: {{meal}}',
    mealTypeDailyHint:'Ежедневный режим выбирает обычные блюда, подходящие для этого приема пищи.',
    mealTypeTravelHint:'В поездке приоритет получают местные блюда, которые туристы часто пробуют в это время.',
  },
  de: {
    mealTypeTitle:'Mahlzeit', mealTypeAuto:'Automatisch', mealTypeBreakfast:'Frühstück', mealTypeLunch:'Mittagessen', mealTypeDinner:'Abendessen',
    mealTypeAutoHint:'Jetzt empfohlen: {{meal}}',
    mealTypeDailyHint:'Im Alltag werden typische Gerichte bevorzugt, die zu dieser Mahlzeit passen.',
    mealTypeTravelHint:'Auf Reisen werden lokale Spezialitäten bevorzugt, die Besucher zu dieser Mahlzeit häufig probieren.',
  },
  it: {
    mealTypeTitle:'Momento del pasto', mealTypeAuto:'Automatico', mealTypeBreakfast:'Colazione', mealTypeLunch:'Pranzo', mealTypeDinner:'Cena',
    mealTypeAutoHint:'Suggerito ora: {{meal}}',
    mealTypeDailyHint:'Il pasto quotidiano privilegia piatti comuni adatti a questo momento.',
    mealTypeTravelHint:'In viaggio vengono privilegiate specialità locali che i visitatori provano spesso in questo pasto.',
  },
  hi: {
    mealTypeTitle:'भोजन का समय', mealTypeAuto:'स्वचालित', mealTypeBreakfast:'नाश्ता', mealTypeLunch:'दोपहर का भोजन', mealTypeDinner:'रात का भोजन',
    mealTypeAutoHint:'अभी सुझाया गया: {{meal}}',
    mealTypeDailyHint:'दैनिक भोजन मोड इस समय के लिए उपयुक्त रोज़मर्रा के व्यंजनों को प्राथमिकता देता है।',
    mealTypeTravelHint:'यात्रा मोड उन स्थानीय खास व्यंजनों को प्राथमिकता देता है जिन्हें पर्यटक इस भोजन समय में अक्सर खाते हैं।',
  },
  ar: {
    mealTypeTitle:'وقت الوجبة', mealTypeAuto:'تلقائي', mealTypeBreakfast:'الإفطار', mealTypeLunch:'الغداء', mealTypeDinner:'العشاء',
    mealTypeAutoHint:'المقترح الآن: {{meal}}',
    mealTypeDailyHint:'الوضع اليومي يعطي الأولوية للأطباق المعتادة المناسبة لهذه الوجبة.',
    mealTypeTravelHint:'وضع السفر يعطي الأولوية للأطباق المحلية المميزة التي يجربها الزوار عادة في هذه الوجبة.',
  },
  id: {
    mealTypeTitle:'Waktu makan', mealTypeAuto:'Otomatis', mealTypeBreakfast:'Sarapan', mealTypeLunch:'Makan siang', mealTypeDinner:'Makan malam',
    mealTypeAutoHint:'Disarankan sekarang: {{meal}}',
    mealTypeDailyHint:'Mode harian memprioritaskan makanan sehari-hari yang cocok untuk waktu makan ini.',
    mealTypeTravelHint:'Mode wisata memprioritaskan makanan khas lokal yang umum dicoba wisatawan pada waktu makan ini.',
  },
  ms: {
    mealTypeTitle:'Waktu makan', mealTypeAuto:'Automatik', mealTypeBreakfast:'Sarapan', mealTypeLunch:'Makan tengah hari', mealTypeDinner:'Makan malam',
    mealTypeAutoHint:'Dicadangkan sekarang: {{meal}}',
    mealTypeDailyHint:'Mod harian mengutamakan hidangan biasa yang sesuai untuk waktu makan ini.',
    mealTypeTravelHint:'Mod perjalanan mengutamakan makanan istimewa tempatan yang biasa dicuba pelancong pada waktu makan ini.',
  },
};


const BUDGET_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    budgetTargetTitle:'Target price', budgetOptional:'Optional', budgetUse:'Use budget', budgetNoLimit:'No budget',
    budgetPlaceholder:'Enter {{currency}} amount', budgetWindowHint:'Meal estimates must stay within ±20% of the amount you enter.',
    budgetNoLimitTitle:'No budget filter', budgetNoLimitHint:'TastePilot will ignore price when choosing meal ideas.',
    budgetNoMatchTitle:'No meals found in this price range', budgetNoMatchText:'Try another amount, switch off the budget filter, or broaden your preferences.'
  },
  vi: {
    budgetTargetTitle:'Mức giá mong muốn', budgetOptional:'Không bắt buộc', budgetUse:'Có ngân sách', budgetNoLimit:'Không cần giá',
    budgetPlaceholder:'Nhập số tiền {{currency}}', budgetWindowHint:'Giá ước tính của món chỉ được lệch tối đa ±20% so với số tiền bạn nhập.',
    budgetNoLimitTitle:'Không giới hạn ngân sách', budgetNoLimitHint:'TastePilot sẽ bỏ qua giá khi chọn món ăn phù hợp.',
    budgetNoMatchTitle:'Không tìm thấy món trong khoảng giá này', budgetNoMatchText:'Hãy thử số tiền khác, tắt giới hạn ngân sách hoặc mở rộng sở thích.'
  },
  es: {
    budgetTargetTitle:'Precio objetivo', budgetOptional:'Opcional', budgetUse:'Usar presupuesto', budgetNoLimit:'Sin presupuesto',
    budgetPlaceholder:'Introduce importe en {{currency}}', budgetWindowHint:'El precio estimado debe quedar dentro de ±20% del importe indicado.',
    budgetNoLimitTitle:'Sin filtro de presupuesto', budgetNoLimitHint:'TastePilot ignorará el precio al elegir platos.',
    budgetNoMatchTitle:'No hay platos en este rango de precio', budgetNoMatchText:'Prueba otro importe, desactiva el presupuesto o amplía tus preferencias.'
  },
  fr: {
    budgetTargetTitle:'Prix cible', budgetOptional:'Facultatif', budgetUse:'Utiliser le budget', budgetNoLimit:'Sans budget',
    budgetPlaceholder:'Saisissez un montant en {{currency}}', budgetWindowHint:'Le prix estimé doit rester dans une marge de ±20 % autour du montant saisi.',
    budgetNoLimitTitle:'Aucun filtre de budget', budgetNoLimitHint:'TastePilot ignorera le prix lors du choix des plats.',
    budgetNoMatchTitle:'Aucun plat dans cette fourchette de prix', budgetNoMatchText:'Essayez un autre montant, désactivez le budget ou élargissez vos préférences.'
  },
  ja: {
    budgetTargetTitle:'希望価格', budgetOptional:'任意', budgetUse:'予算を使う', budgetNoLimit:'予算なし',
    budgetPlaceholder:'{{currency}} の金額を入力', budgetWindowHint:'推定価格は入力金額の±20%以内に絞り込みます。',
    budgetNoLimitTitle:'予算フィルターなし', budgetNoLimitHint:'TastePilotは価格を条件にせず料理を選びます。',
    budgetNoMatchTitle:'この価格帯の料理が見つかりません', budgetNoMatchText:'金額を変更するか、予算フィルターをオフにするか、条件を広げてください。'
  },
  zh: {
    budgetTargetTitle:'目标价格', budgetOptional:'可选', budgetUse:'使用预算', budgetNoLimit:'不限预算',
    budgetPlaceholder:'输入 {{currency}} 金额', budgetWindowHint:'菜品预估价格必须控制在你输入金额的±20%以内。',
    budgetNoLimitTitle:'不按预算筛选', budgetNoLimitHint:'TastePilot选择菜品时将忽略价格。',
    budgetNoMatchTitle:'该价格区间没有合适菜品', budgetNoMatchText:'请尝试其他金额、关闭预算限制或放宽偏好。'
  },
  ko: {
    budgetTargetTitle:'희망 가격', budgetOptional:'선택 사항', budgetUse:'예산 사용', budgetNoLimit:'예산 없음',
    budgetPlaceholder:'{{currency}} 금액 입력', budgetWindowHint:'예상 가격은 입력한 금액의 ±20% 이내로 제한됩니다.',
    budgetNoLimitTitle:'예산 필터 없음', budgetNoLimitHint:'TastePilot이 가격을 제외하고 메뉴를 추천합니다.',
    budgetNoMatchTitle:'이 가격대의 메뉴를 찾지 못했습니다', budgetNoMatchText:'다른 금액을 입력하거나 예산 필터를 끄거나 조건을 넓혀 보세요.'
  },
  th: {
    budgetTargetTitle:'ราคาเป้าหมาย', budgetOptional:'ไม่บังคับ', budgetUse:'ใช้งบประมาณ', budgetNoLimit:'ไม่จำกัดงบ',
    budgetPlaceholder:'กรอกจำนวนเงิน {{currency}}', budgetWindowHint:'ราคาประเมินของอาหารจะอยู่ภายใน ±20% ของจำนวนเงินที่คุณกรอก',
    budgetNoLimitTitle:'ไม่กรองตามงบประมาณ', budgetNoLimitHint:'TastePilot จะไม่ใช้ราคาเป็นเงื่อนไขในการเลือกอาหาร',
    budgetNoMatchTitle:'ไม่พบอาหารในช่วงราคานี้', budgetNoMatchText:'ลองเปลี่ยนจำนวนเงิน ปิดตัวกรองงบประมาณ หรือขยายความชอบของคุณ'
  },
  pt: {
    budgetTargetTitle:'Preço alvo', budgetOptional:'Opcional', budgetUse:'Usar orçamento', budgetNoLimit:'Sem orçamento',
    budgetPlaceholder:'Introduza o valor em {{currency}}', budgetWindowHint:'O preço estimado deve ficar dentro de ±20% do valor introduzido.',
    budgetNoLimitTitle:'Sem filtro de orçamento', budgetNoLimitHint:'O TastePilot ignorará o preço ao escolher pratos.',
    budgetNoMatchTitle:'Nenhum prato neste intervalo de preço', budgetNoMatchText:'Experimente outro valor, desligue o orçamento ou amplie as preferências.'
  },
  ru: {
    budgetTargetTitle:'Целевая цена', budgetOptional:'Необязательно', budgetUse:'Учитывать бюджет', budgetNoLimit:'Без бюджета',
    budgetPlaceholder:'Введите сумму в {{currency}}', budgetWindowHint:'Оценочная цена блюда должна быть в пределах ±20% от введенной суммы.',
    budgetNoLimitTitle:'Без фильтра по бюджету', budgetNoLimitHint:'TastePilot не будет учитывать цену при выборе блюд.',
    budgetNoMatchTitle:'Нет блюд в этом ценовом диапазоне', budgetNoMatchText:'Попробуйте другую сумму, отключите бюджет или расширьте предпочтения.'
  },
  de: {
    budgetTargetTitle:'Zielpreis', budgetOptional:'Optional', budgetUse:'Budget verwenden', budgetNoLimit:'Ohne Budget',
    budgetPlaceholder:'Betrag in {{currency}} eingeben', budgetWindowHint:'Der geschätzte Preis muss innerhalb von ±20% des eingegebenen Betrags liegen.',
    budgetNoLimitTitle:'Kein Budgetfilter', budgetNoLimitHint:'TastePilot ignoriert den Preis bei der Auswahl der Gerichte.',
    budgetNoMatchTitle:'Keine Gerichte in diesem Preisbereich', budgetNoMatchText:'Versuche einen anderen Betrag, deaktiviere das Budget oder erweitere deine Vorlieben.'
  },
  it: {
    budgetTargetTitle:'Prezzo obiettivo', budgetOptional:'Facoltativo', budgetUse:'Usa budget', budgetNoLimit:'Senza budget',
    budgetPlaceholder:'Inserisci importo in {{currency}}', budgetWindowHint:'Il prezzo stimato deve restare entro ±20% dell\'importo inserito.',
    budgetNoLimitTitle:'Nessun filtro budget', budgetNoLimitHint:'TastePilot ignorerà il prezzo nella scelta dei piatti.',
    budgetNoMatchTitle:'Nessun piatto in questa fascia di prezzo', budgetNoMatchText:'Prova un altro importo, disattiva il budget o amplia le preferenze.'
  },
  hi: {
    budgetTargetTitle:'लक्षित कीमत', budgetOptional:'वैकल्पिक', budgetUse:'बजट उपयोग करें', budgetNoLimit:'बिना बजट',
    budgetPlaceholder:'{{currency}} राशि दर्ज करें', budgetWindowHint:'अनुमानित कीमत आपकी दर्ज राशि से अधिकतम ±20% तक ही अलग होगी।',
    budgetNoLimitTitle:'बजट फ़िल्टर नहीं', budgetNoLimitHint:'TastePilot भोजन चुनते समय कीमत को नज़रअंदाज़ करेगा।',
    budgetNoMatchTitle:'इस कीमत सीमा में भोजन नहीं मिला', budgetNoMatchText:'दूसरी राशि आज़माएँ, बजट बंद करें या पसंद को थोड़ा व्यापक करें।'
  },
  ar: {
    budgetTargetTitle:'السعر المستهدف', budgetOptional:'اختياري', budgetUse:'استخدام الميزانية', budgetNoLimit:'بدون ميزانية',
    budgetPlaceholder:'أدخل المبلغ بـ {{currency}}', budgetWindowHint:'يجب أن يبقى السعر التقديري ضمن ±20% من المبلغ الذي تدخله.',
    budgetNoLimitTitle:'بدون فلتر للميزانية', budgetNoLimitHint:'سيتجاهل TastePilot السعر عند اختيار الأطباق.',
    budgetNoMatchTitle:'لا توجد أطباق ضمن هذا النطاق السعري', budgetNoMatchText:'جرّب مبلغًا آخر أو عطّل الميزانية أو وسّع تفضيلاتك.'
  },
  id: {
    budgetTargetTitle:'Harga target', budgetOptional:'Opsional', budgetUse:'Gunakan anggaran', budgetNoLimit:'Tanpa anggaran',
    budgetPlaceholder:'Masukkan nominal {{currency}}', budgetWindowHint:'Perkiraan harga harus berada dalam ±20% dari nominal yang Anda masukkan.',
    budgetNoLimitTitle:'Tanpa filter anggaran', budgetNoLimitHint:'TastePilot akan mengabaikan harga saat memilih makanan.',
    budgetNoMatchTitle:'Tidak ada makanan di kisaran harga ini', budgetNoMatchText:'Coba nominal lain, matikan anggaran, atau perluas preferensi Anda.'
  },
  ms: {
    budgetTargetTitle:'Harga sasaran', budgetOptional:'Pilihan', budgetUse:'Guna bajet', budgetNoLimit:'Tanpa bajet',
    budgetPlaceholder:'Masukkan jumlah {{currency}}', budgetWindowHint:'Anggaran harga mesti berada dalam ±20% daripada jumlah yang anda masukkan.',
    budgetNoLimitTitle:'Tiada penapis bajet', budgetNoLimitHint:'TastePilot akan mengabaikan harga semasa memilih hidangan.',
    budgetNoMatchTitle:'Tiada hidangan dalam julat harga ini', budgetNoMatchText:'Cuba jumlah lain, matikan bajet atau luaskan pilihan anda.'
  },
};

const LOCALE_LABELS: Record<string, string> = {
  en:'Locale', vi:'Khu vực/ngôn ngữ', es:'Configuración regional', fr:'Paramètres régionaux', ja:'ロケール', zh:'区域设置', ko:'로케일', th:'ภูมิภาคและภาษา', pt:'Região', ru:'Локаль', de:'Gebietsschema', it:'Impostazioni locali', hi:'लोकेल', ar:'الإعدادات المحلية', id:'Lokal', ms:'Lokal',
};

function withAliases(base: Record<string, any>, code: string) {
  return {
    ...base,
    ...(MEAL_TYPE_TRANSLATIONS[code] || MEAL_TYPE_TRANSLATIONS.en),
    ...(BUDGET_TRANSLATIONS[code] || BUDGET_TRANSLATIONS.en),
    tabs: {home: base.tabHome, saved: base.tabSaved, history: base.tabHistory, profile: base.tabProfile},
    screens: {dailyMeal: base.navDailyMeal, travelFood: base.navTravelFood, suggestions: base.navSuggestions, nearbyPlaces: base.navNearbyPlaces, restaurant: base.navRestaurant},
    common: {
      back: base.navBack,
      budget: base.dailyBudget,
      refresh: base.commonRefresh,
      localCurrency: base.locationLocalCurrency,
      check: base.commonCheck,
      destination: base.travelCityArea,
      currentLocation: base.travelCurrentLocation,
      searchDestination: base.travelSearchDestination,
      locationNotDetected: base.locationNotDetected,
      loadingDots: '…',
      maps: base.mapsTitle,
      couldNotOpenMaps: base.mapsOpenFailed,
      couldNotOpenDirections: base.mapsOpenFailed,
      directions: base.commonDirections,
      remove: base.commonRemove,
      save: base.commonSave,
      saved: base.commonSaved,
      close: base.commonClose,
      openNow: base.commonOpenNow,
      open: base.restaurantsOpen,
      closed: base.commonClosed,
      rating: base.commonRating,
      reviews: base.commonReviews,
      reviewsCount: `{{count}} ${base.commonReviews}`,
      distance: base.commonDistance,
      restaurant: base.historyRestaurant || base.navRestaurant,
      savePlace: base.restaurantSavePlace || base.historySavePlace,
    },
    home: {
      brand:'TastePilot', kicker:base.homeKicker, title:base.homeTitle, subtitle:base.homeSubtitle, lastDetectedArea:base.homeAreaTitle,
      dailyCardTitle:base.homeDailyTitle, dailyCardBadge:base.homeDailyPill, dailyCardText:base.homeDailyText,
      travelCardTitle:base.homeTravelTitle, travelCardBadge:base.homeTravelPill, travelCardText:base.homeTravelText,
    },
    daily: {
      heroEyebrow:base.dailyEyebrow, heroTitle:base.dailyTitle, heroSubtitle:base.dailySubtitle, yourArea:base.locationYourArea,
      optionalPreferences:base.dailyPreferences, howItWorksTitle:base.dailyHowTitle, howItWorksText:base.dailyHowText, button:base.dailyButton,
      invalidBudgetTitle:base.dailyBudget, invalidBudgetText:base.dailyInvalidBudget, currencyHint:base.dailyFormatHint, routeTitle:base.dailyResultsTitle,
      prefs:{healthy:base.dailyHealthy, highProtein:base.dailyHighProtein, vegetarian:base.dailyVegetarian, quickMeal:base.dailyQuickMeal, somethingNew:base.dailySomethingNew},
    },
    travel: {
      heroEyebrow:base.travelEyebrow, heroTitle:base.travelTitle, heroSubtitle:base.travelSubtitle, exploringTitle:base.travelExploring,
      destinationTitle:base.travelDestination, destinationPlaceholder:'Osaka, Japan', mealBudget:`${base.travelMealBudget} ({{currency}})`,
      rankingTitle:base.travelRankingTitle, rankingText:base.travelRankingText, button:base.travelButton,
      enterDestinationTitle:base.travelDestination, enterDestinationText:base.travelDestinationRequired, invalidBudgetTitle:base.dailyBudget,
      invalidBudgetText:base.travelBudgetRequired, couldNotFindDestination:base.travelDestinationError, couldNotExploreArea:base.travelErrorTitle,
      localMustTryFood:base.travelCurrentTitle, mustTryIn:base.travelMustTryIn?.replace('{{place}}','{{area}}'), tryIn:base.travelTryIn?.replace('{{place}}','{{area}}'),
    },
    mealResults: {
      heroEyebrowDaily:base.resultsDailyEyebrow, heroEyebrowTravel:base.resultsTravelEyebrow, heroSubtitle:base.resultsSubtitle,
      tryAnother5:base.resultsTryAnother, suggestionsCount:base.resultsCount, noMoreIdeasTitle:base.resultsNoMoreTitle, noMoreIdeasText:base.resultsNoMoreText,
      couldNotRefreshTitle:base.resultsRefreshError, noReplacementTitle:base.resultsNoReplacement, noReplacementText:base.resultsNoReplacementText,
      couldNotSwapTitle:base.resultsSwapError, localPick:base.resultsLocalPick, pickNumber:base.resultsPick?.replace('{{index}}','{{number}}'),
      localSpecialty:base.resultsLocalSpecialty, smartBudgetFit:base.resultsBudgetFit, nearbySearchReady:base.resultsNearbyReady, replace:base.resultsReplace, findPlaces:base.resultsFindPlaces,
    },
    saved: {
      heroEyebrow:base.savedHeroEyebrow, heroTitle:base.savedHeroTitle, heroSubtitle:base.savedHeroSubtitle, byCity:base.savedGroupByCity, byCuisine:base.savedGroupByCuisine,
      emptyTitle:base.savedEmptyTitle, emptyText:base.savedEmptyText, savedCount:`{{count}} ${base.savedCountSuffix}`, unknownArea:base.commonUnknownArea, other:base.commonOther, savedForLater:base.commonSavedForLater,
    },
    history: {
      heroEyebrow:base.historyHeroEyebrow, heroTitle:base.historyHeroTitle, heroSubtitle:base.historyHeroSubtitle, tipTitle:base.historyTipTitle, tipText:base.historyTipText,
      emptyTitle:base.historyEmptyTitle, emptyText:base.historyEmptyText, viewDetails:base.historyViewDetails, goodPick:base.historyGoodPick, like:base.historyLike, dislike:base.historyDislike,
      placeEyebrow:base.historyPlaceEyebrow, dailyMode:base.commonDaily, travelMode:base.commonTravel, directionsUnavailable:base.directionsUnavailable,
      mealChosen:base.historyMealChosen, olderEntry:base.historyOlderEntry, restaurantUnavailable:base.historyRestaurantUnavailable, legacyNote:base.historyLegacyNote, visited:base.historyVisited,
    },
    profile: {
      heroEyebrow:base.profileHeroEyebrow, heroTitle:base.profileHeroTitle, heroSubtitle:base.profileHeroSubtitle,
      languageTitle:base.profileLanguageTitle, languageHint:base.profileLanguageHint, basics:base.profileBasics, currencyCode:base.profileCurrencyCode,
      locale:LOCALE_LABELS[code] || 'Locale', typicalBudget:base.profileTypicalBudget, foodEnjoy:base.profileFoodEnjoy, dietaryRestrictions:base.profileRestrictions,
      tipTitle:base.profileTipTitle, tipText:base.profileTipText, save:base.profileSave, savedTitle:base.profileSavedTitle, savedText:base.profileSavedText,
      invalidBudgetTitle:base.profileBudgetAlertTitle, invalidBudgetText:base.profileBudgetAlertText,
      cuisines:{asian:base.profileCuisineAsian, italian:base.profileCuisineItalian, mexican:base.profileCuisineMexican, mediterranean:base.profileCuisineMediterranean, american:base.profileCuisineAmerican, indian:base.profileCuisineIndian},
      restrictionsList:{vegetarian:base.profileRestrictionVegetarian, vegan:base.profileRestrictionVegan, halal:base.profileRestrictionHalal, glutenFree:base.profileRestrictionGlutenFree, noPork:base.profileRestrictionNoPork, noBeef:base.profileRestrictionNoBeef},
    },
    restaurants: {
      heroEyebrow:base.restaurantsEyebrow, heroSubtitle:base.restaurantsSubtitle, searchPlaceholder:base.restaurantsSearch, filter:base.restaurantsFilter, sort:base.restaurantsSort,
      filters:{all:base.restaurantsFilterAll, open:base.restaurantsFilterOpen, top:base.restaurantsFilterTop, nearby:base.restaurantsFilterNearby},
      sorts:{recommended:base.restaurantsSortRecommended, rating:base.restaurantsSortRating, reviews:base.restaurantsSortReviews, distance:base.restaurantsSortDistance},
      placesCount:base.restaurantsPlacesCount, emptyTitle:base.restaurantsNoMatchTitle, emptyText:base.restaurantsNoMatchText, loading:base.restaurantsLoading,
      errorTitle:base.restaurantsError, addedHistoryTitle:base.restaurantsHistoryAdded, addedHistoryText:base.restaurantHistoryAdded ? `${base.restaurantHistoryAdded}: {{meal}} · {{place}}` : '{{meal}} · {{place}}',
      reset:base.commonReset, choose:base.restaurantsChoose, viewDetails:base.restaurantsViewDetails,
    },
    detail: {
      heroEyebrow:base.restaurantDetailEyebrow, heroSubtitle:base.restaurantDetailSubtitle, addedHistoryTitle:base.restaurantHistoryAdded,
      addedHistoryText:`{{meal}} · {{place}}`, choosePlace:base.restaurantChoosePlace, whyWorksTitle:base.restaurantWhyTitle, whyWorksText:base.restaurantWhyText,
      goodReviewConfidence:base.restaurantConfidence, address:base.restaurantAddress, recommendedDish:base.restaurantRecommendedDish, tipTitle:base.restaurantTipTitle, tipText:base.restaurantTipText,
    },
    foodLabels: FOOD_LABELS[code] || FOOD_LABELS.en,
  };
}

const aliasedResources = Object.fromEntries(
  Object.entries(extendedResources).map(([code, value]: [string, any]) => [
    code,
    {translation: withAliases(value.translation, code)},
  ]),
);


i18n.use(initReactI18next).init({
  resources: aliasedResources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {escapeValue: false},
});

export default i18n;
