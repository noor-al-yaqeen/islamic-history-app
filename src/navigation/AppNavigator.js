import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TopicScreen from '../screens/TopicScreen';
import prophetData from '../../data/prophet.json';
import sahabaData from '../../data/sahaba.json';
import ghazwatData from '../../data/ghazwat.json';
import ummahatData from '../../data/ummahat.json';
import videosData from '../../data/videos.json';

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  contentStyle: { backgroundColor: '#F5F0E8' },
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Prophet" component={TopicScreen} initialParams={{ data: prophetData, type: 'prophet' }} />
        <Stack.Screen name="Sahaba" component={TopicScreen} initialParams={{ data: sahabaData, type: 'sahaba' }} />
        <Stack.Screen name="Ghazwat" component={TopicScreen} initialParams={{ data: ghazwatData, type: 'ghazwat' }} />
        <Stack.Screen name="Ummahat" component={TopicScreen} initialParams={{ data: ummahatData, type: 'ummahat' }} />
        <Stack.Screen name="Videos" component={TopicScreen} initialParams={{ data: videosData, type: 'videos' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;