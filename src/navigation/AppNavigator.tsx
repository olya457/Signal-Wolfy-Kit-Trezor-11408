import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParams, TabParams } from './types';
import { Icon } from '../components/UI';
import { colors } from '../theme';
import { MorseScreen, SavedScreen } from '../screens/MorseScreen';
import { FlagsScreen, FlagScreen } from '../screens/FlagsScreen';
import { GuideScreen, ArticleScreen } from '../screens/GuideScreen';
import { TipsScreen, FavoritesScreen } from '../screens/TipsScreen';
import { QuizScreen, TrainScreen } from '../screens/TrainScreens';
import { useSignal } from '../services/SignalPlayer';
import flags from '../data/flags.json';
import articles from '../data/articles.json';
const Stack = createNativeStackNavigator<RootStackParams>();
const Tab = createBottomTabNavigator<TabParams>();
function Tabs() {
  const insets = useSafeAreaInsets();
  const isAndroid = Platform.OS === 'android';
  return (
    <Tab.Navigator
      safeAreaInsets={isAndroid ? { bottom: 0 } : undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: '#ffffff15',
          paddingTop: 9,
          ...(isAndroid && {
            height: 64,
            paddingBottom: 8,
            marginHorizontal: 20,
            marginBottom: insets.bottom + 20,
            borderRadius: 24,
            borderTopWidth: 0,
            elevation: 8,
          }),
        },
        tabBarLabelStyle: { fontSize: 10, paddingBottom: 3 },
        tabBarIcon: ({ color }) => (
          <Icon name={route.name} color={color} size={23} />
        ),
      })}
    >
      <Tab.Screen name="Morse" component={MorseScreen} />
      <Tab.Screen name="Flags" component={FlagsScreen} />
      <Tab.Screen name="Guide" component={GuideScreen} />
      <Tab.Screen name="Train" component={TrainScreen} />
      <Tab.Screen name="Tips" component={TipsScreen} />
    </Tab.Navigator>
  );
}
export function AppNavigator() {
  const signal = useSignal();
  return (
    <NavigationContainer
      theme={{
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          background: colors.background,
          card: colors.panel,
          text: colors.text,
          primary: colors.orange,
          border: colors.border,
        },
      }}
      onStateChange={signal.stop}
    >
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.panel },
          headerTintColor: colors.orange,
          headerTitleStyle: {
            color: colors.text,
            fontSize: 16,
            fontWeight: '500',
          },
          headerTitleAlign: 'center',
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Main"
          component={Tabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Saved"
          component={SavedScreen}
          options={{ title: 'Saved Results', headerBackTitle: 'Morse' }}
        />
        <Stack.Screen
          name="Flag"
          component={FlagScreen}
          options={({ route }) => ({
            title: flags.find(f => f.id === route.params.id)?.name,
            headerBackTitle: 'Flags',
          })}
        />
        <Stack.Screen
          name="Article"
          component={ArticleScreen}
          options={({ route }) => ({
            title: articles.find(a => a.id === route.params.id)?.category,
            headerBackTitle: 'Guide',
          })}
        />
        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ title: 'Favorites', headerBackTitle: 'Tips' }}
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false, gestureEnabled: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
