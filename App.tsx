import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import axios from 'axios';
import { Audio } from 'expo-av';

interface SecretScript {
  text: string;
}

import secretScriptsData from './assets/secret_scripts.json';

const DEFAULT_TEXT_SIZE = 18;

const App = () => {
  const [number, setNumber] = useState('');
  const [script, setScript] = useState<SecretScript>({ text: ''});
  const [isPlaying, setIsPlaying] = useState(false);
  const [textSize, setTextSize] = useState(DEFAULT_TEXT_SIZE);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const handleGetScript = async () => {
    Keyboard.dismiss();
    const num = parseInt(number, 10);
    if (num >= 1 && num <= 1232) {
      const fetchedScript: SecretScript = secretScriptsData[num.toString() as keyof typeof secretScriptsData];
      setScript(fetchedScript || { text: 'There is no secret here. Did you enter the correct number?'});
      try {
        const url = await generateSpeech(fetchedScript.text);
        setAudioUrl(url);
      } catch (error) {
        console.error('Error generating speech:', error);
      }
    } else {
      setScript({ text: 'There is no secret here. Did you enter the correct number?'});
    }
  };

  const generateSpeech = async (text: string) => {
    try {
      const response = await axios.post('http://localhost:5000/tts', {
        text: text
      });

      const url = response.data.audio_url;
      console.log('Generated audio URL:', url);
      return url;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  };

  const playSpeech = async () => {
    if (audioUrl) {
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
        setSound(sound);
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error playing speech:', error);
      }
    } else {
      console.error('No audio URL available');
    }
  };

  const toggleSpeech = async () => {
    console.log('Toggle Speech called');
    if (isPlaying) {
      console.log('Stopping speech');
      setIsPlaying(false);
      if (sound) {
        await sound.stopAsync();
      }
    } else {
      console.log('Playing speech');
      setIsPlaying(true);
      if (script.text) {
        try {
          const url = await generateSpeech(script.text);
          setAudioUrl(url);
          await playSpeech();
        } catch (error) {
          console.error('Error playing speech:', error);
          setIsPlaying(false);
        }
      } else {
        console.error('No text available to speak');
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scriptContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}># {number}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.scriptText, { fontSize: textSize }]}>
            {script.text}
          </Text>
        </View>
      </ScrollView>
      <View style={styles.fontSizeControls}>
        <TouchableOpacity onPress={() => setTextSize(textSize + 2)}>
          <Text style={styles.textSizeButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTextSize(DEFAULT_TEXT_SIZE)}>
          <Text style={styles.textSizeButtonText}>Aa</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTextSize(Math.max(DEFAULT_TEXT_SIZE, textSize - 2))}>
          <Text style={styles.textSizeButtonText}>-</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.playButton}>
        <TouchableOpacity onPress={toggleSpeech}>
          <Icon name={isPlaying ? 'pause' : 'play'} size={30} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Enter the script number"
          value={number}
          onChangeText={setNumber}
          onSubmitEditing={handleGetScript}
        />
      </View>
      <Button title="Search" onPress={handleGetScript} color="black" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  scriptContainer: {
    marginTop: 30,
    borderRadius: 30,
    padding: 20,
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  headerContainer: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scriptText: {
    lineHeight: 24,
    paddingBottom: 20,
  },
  inlineImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  fontSizeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButton: {
    margin: 'auto',
    paddingBottom: 20,
  },
  textSizeButtonText: {
    fontSize: 24,
    color: 'black',
    padding: 20,
  },
});

export default App;
