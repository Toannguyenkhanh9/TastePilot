import React from 'react';
import {
  BottomTabBar,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import type {BottomTabBarProps} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {HomeScreen} from '../screens/HomeScreen';
import {SavedScreen} from '../screens/SavedScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {DailyMealScreen} from '../screens/DailyMealScreen';
import {TravelFoodScreen} from '../screens/TravelFoodScreen';
import {MealResultsScreen} from '../screens/MealResultsScreen';
import {RestaurantsScreen} from '../screens/RestaurantsScreen';
import {RestaurantDetailScreen} from '../screens/RestaurantDetailScreen';
import {GroupModeScreen} from '../screens/GroupModeScreen';
import {WeeklyPlannerScreen} from '../screens/WeeklyPlannerScreen';
import {SurpriseMeScreen} from '../screens/SurpriseMeScreen';
import {FoodSearchScreen} from '../screens/FoodSearchScreen';
import {PremiumScreen} from '../screens/PremiumScreen';
import {SplashScreen} from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import type {MainTabParamList, RootStackParamList} from './types';
import {ProductionErrorBoundary} from '../components/ProductionErrorBoundary';
import {MonetizationBanner} from '../components/MonetizationBanner';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({emoji, focused}: {emoji: string; focused: boolean}) {
  return (
    <View style={{width: 32, height: 28, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: focused ? '#ffe6da' : 'transparent'}}>
      <Text style={{fontSize: 18}}>{emoji}</Text>
    </View>
  );
}

function TastePilotTabBar(props: BottomTabBarProps) {
  return (
    <View>
      <MonetizationBanner />
      <BottomTabBar {...props} />
    </View>
  );
}

function MainTabs() {
  const {t} = useTranslation();

  return (
    <Tab.Navigator
      tabBar={props => <TastePilotTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {fontSize: 11, fontWeight: '700'},
        tabBarActiveTintColor: '#d95f38',
        tabBarInactiveTintColor: '#8b817b',
        tabBarStyle: {
          height: 64,
          paddingBottom: 7,
          paddingTop: 6,
          backgroundColor: '#fffdf9',
          borderTopColor: '#efded1',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{tabBarLabel: t('tabs.home'), tabBarIcon: ({focused}) => <TabIcon emoji="🏠" focused={focused} />}}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{tabBarLabel: t('tabs.saved'), tabBarIcon: ({focused}) => <TabIcon emoji="❤️" focused={focused} />}}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{tabBarLabel: t('tabs.history'), tabBarIcon: ({focused}) => <TabIcon emoji="🕘" focused={focused} />}}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: t('tabs.profile'), tabBarIcon: ({focused}) => <TabIcon emoji="⚙️" focused={focused} />}}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const {t} = useTranslation();

  return (
    <ProductionErrorBoundary
      title={t('productionErrorTitle')}
      message={t('productionErrorMessage')}
      retry={t('productionErrorRetry')}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerBackTitle: t('common.back'),
          headerShadowVisible: false,
          headerStyle: {backgroundColor: '#fff9f1'},
          headerTintColor: '#35231c',
          headerTitleStyle: {fontWeight: '800'},
          contentStyle: {backgroundColor: '#fff9f1'},
        }}>
      <Stack.Screen name="Splash" component={SplashScreen} options={{headerShown: false, animation: "none"}} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{headerShown: false, animation: "fade"}} />
      <Stack.Screen name="MainTabs" component={MainTabs} options={{headerShown: false}} />
      <Stack.Screen name="DailyMeal" component={DailyMealScreen} options={{title: t('screens.dailyMeal')}} />
      <Stack.Screen name="TravelFood" component={TravelFoodScreen} options={{title: t('screens.travelFood')}} />
      <Stack.Screen name="GroupMode" component={GroupModeScreen} options={{title: t('groupTitle')}} />
      <Stack.Screen name="WeeklyPlanner" component={WeeklyPlannerScreen} options={{title: t('plannerTitle')}} />
      <Stack.Screen
        name="SurpriseMe"
        component={SurpriseMeScreen}
        options={{
          title: t('surpriseTitle'),
          headerStyle: {backgroundColor: '#fff9f1'},
          headerTintColor: '#281d18',
          headerTitleStyle: {fontWeight: '800'},
        }}
      />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} options={{title: t('foodSearch.title')}} />
      <Stack.Screen name="Premium" component={PremiumScreen} options={{title: t('premiumTitle')}} />
      <Stack.Screen name="MealResults" component={MealResultsScreen} options={{title: t('screens.suggestions')}} />
      <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{title: t('screens.nearbyPlaces')}} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{title: t('screens.restaurant')}} />
      </Stack.Navigator>
    </ProductionErrorBoundary>
  );
}

export default RootNavigator;
