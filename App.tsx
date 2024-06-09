import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import * as Speech from 'expo-speech';
import Icon from 'react-native-vector-icons/FontAwesome';

interface SecretScript {
  text: string;
  image_urls: string[];
}

import secretScripts from './assets/secret_scripts.json';

const DEFAULT_TEXT_SIZE = 18;

const App = () => {
  const [number, setNumber] = useState('');
  const [script, setScript] = useState<SecretScript>({ text: '', image_urls: [] });
  const [isPlaying, setIsPlaying] = useState(false);
  const [textSize, setTextSize] = useState(DEFAULT_TEXT_SIZE);

  const handleGetScript = () => {
    Keyboard.dismiss();
    const num = parseInt(number, 10);
    if (num >= 1 && num <= 1232) {
      setScript(secretScripts[num.toString()] || { text: 'There is no secret here. Did you enter the correct number?', image_urls: [] });
    } else {
      setScript({ text: 'There is no secret here. Did you enter the correct number?', image_urls: [] });
    }
  };

  const toggleSpeech = () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    } else {
      Speech.speak(script.text, {
        onDone: () => setIsPlaying(false),
        onStopped: () => setIsPlaying(false),
      });
      setIsPlaying(true);
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
