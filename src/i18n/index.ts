import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

const resources = {
  en: {
    translation: {
      homeTitle: 'What are you looking for?',
      dailyTitle: 'What should I eat?',
      dailySubtitle: "Personalized picks for today's budget",
      travelTitle: 'Explore Local Food',
      travelSubtitle: 'Discover highly rated food while traveling',
      findMeal: 'Find my meal',
      budget: 'Budget',
      currentLocation: 'Use current location',
      destination: 'City or area',
      explore: 'Explore food',
      saved: 'Saved',
      history: 'History',
      profile: 'Profile',
      home: 'Home',
    },
  },
  vi: {
    translation: {
      homeTitle: 'Bạn đang muốn tìm gì?',
      dailyTitle: 'Hôm nay ăn gì?',
      dailySubtitle: 'Gợi ý theo ngân sách và thói quen của bạn',
      travelTitle: 'Khám phá món địa phương',
      travelSubtitle: 'Tìm món ngon được đánh giá cao khi đi du lịch',
      findMeal: 'Gợi ý món cho tôi',
      budget: 'Ngân sách',
      currentLocation: 'Dùng vị trí hiện tại',
      destination: 'Thành phố hoặc khu vực',
      explore: 'Khám phá món ăn',
      saved: 'Đã lưu',
      history: 'Lịch sử',
      profile: 'Hồ sơ',
      home: 'Trang chủ',
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {escapeValue: false},
});

export default i18n;
