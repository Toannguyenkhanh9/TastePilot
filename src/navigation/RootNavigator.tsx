import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Text} from 'react-native';
import {HomeScreen} from '../screens/HomeScreen';
import {SavedScreen} from '../screens/SavedScreen';
import {HistoryScreen} from '../screens/HistoryScreen';
import {ProfileScreen} from '../screens/ProfileScreen';
import {DailyMealScreen} from '../screens/DailyMealScreen';
import {TravelFoodScreen} from '../screens/TravelFoodScreen';
import {MealResultsScreen} from '../screens/MealResultsScreen';
import {RestaurantsScreen} from '../screens/RestaurantsScreen';
import {RestaurantDetailScreen} from '../screens/RestaurantDetailScreen';
import {MainTabParamList, RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({emoji}: {emoji: string}) {
  return <Text style={{fontSize: 18}}>{emoji}</Text>;
}

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={{headerShown: false, tabBarLabelStyle: {fontSize: 11, fontWeight: '700'}, tabBarStyle: {height: 62, paddingBottom: 7, paddingTop: 6}}}>
      <Tab.Screen name="Home" component={HomeScreen} options={{tabBarIcon: () => <TabIcon emoji="🏠" />}} />
      <Tab.Screen name="Saved" component={SavedScreen} options={{tabBarIcon: () => <TabIcon emoji="❤️" />}} />
      <Tab.Screen name="History" component={HistoryScreen} options={{tabBarIcon: () => <TabIcon emoji="🕘" />}} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{tabBarIcon: () => <TabIcon emoji="⚙️" />}} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{headerBackTitle: 'Back', headerShadowVisible: false}}>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{headerShown: false}} />
      <Stack.Screen name="DailyMeal" component={DailyMealScreen} options={{title: 'Daily Meal'}} />
      <Stack.Screen name="TravelFood" component={TravelFoodScreen} options={{title: 'Travel Food'}} />
      <Stack.Screen name="MealResults" component={MealResultsScreen} options={{title: 'Suggestions'}} />
      <Stack.Screen name="Restaurants" component={RestaurantsScreen} options={{title: 'Nearby Places'}} />
      <Stack.Screen name="RestaurantDetail" component={RestaurantDetailScreen} options={{title: 'Restaurant'}} />
    </Stack.Navigator>
  );
}
