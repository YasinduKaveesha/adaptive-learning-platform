import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/poppins';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from './src/constants/theme';
import FeedbackScreen from './src/screens/FeedbackScreen';
import Game1ResultsScreen from './src/screens/Game1ResultsScreen';
import Game1Screen from './src/screens/Game1Screen';
import GameIntroScreen from './src/screens/GameIntroScreen';
import MatchShadowScreen from './src/screens/MatchShadowScreen';
import PatternTrainScreen from './src/screens/PatternTrainScreen';
import PlaygroundHubScreen from './src/screens/PlaygroundHubScreen';
import TreasurePathScreen from './src/screens/TreasurePathScreen';
import InstructionsScreen from './src/screens/InstructionsScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ScreeningScreen from './src/screens/ScreeningScreen';
import TaskScreen from './src/screens/TaskScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import type { RootStackParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const linking = {
  prefixes: ['http://localhost:8081'],
  config: {
    screens: {
      Welcome: '',
      Instructions: 'instructions',
      Task: 'task',
      Feedback: 'feedback',
      Progress: 'progress',
      Results: 'results',
      GameIntro: 'game-intro',
      Game1: 'game1',
      Game1Results: 'game1-results',
      PlaygroundHub: 'playground-hub',
      TreasurePath: 'treasure-path',
      PatternTrain: 'pattern-train',
      MatchShadow: 'match-shadow',
      Screening: 'screening',
      Grade5Screening: 'grade5-screening',
      Grade5Results: 'grade5-results',
    },
  },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0FBF1' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer linking={linking}>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: COLORS.background },
            animation: 'default',
            gestureEnabled: true,
          }}
        >
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Instructions" component={InstructionsScreen} />
          <Stack.Screen name="Task" component={TaskScreen} />
          <Stack.Screen name="Feedback" component={FeedbackScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="GameIntro" component={GameIntroScreen} />
          <Stack.Screen name="Game1" component={Game1Screen} />
          <Stack.Screen name="Game1Results" component={Game1ResultsScreen} />
          <Stack.Screen name="PlaygroundHub" component={PlaygroundHubScreen} options={{ animation: 'fade' }} />
          <Stack.Screen name="TreasurePath" component={TreasurePathScreen} />
          <Stack.Screen name="PatternTrain" component={PatternTrainScreen} />
          <Stack.Screen name="MatchShadow" component={MatchShadowScreen} />

          <Stack.Screen name="Screening" component={ScreeningScreen} />
          <Stack.Screen
            name="Grade5Screening"
            component={TaskScreen}
            options={{ title: 'Grade 5 Assessment' }}
          />
          <Stack.Screen
            name="Grade5Results"
            component={ResultsScreen}
            options={{ title: 'Results' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
