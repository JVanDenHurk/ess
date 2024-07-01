import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import secretScriptsData from './assets/secret_scripts.json';
import audioFiles from './audioFiles';

const DEFAULT_TEXT_SIZE = 18;

const App = () => {
  const [number, setNumber] = useState('');
  const [currentNumber, setCurrentNumber] = useState<number | null>(null); // Track the current script number
  const [script, setScript] = useState<string>(''); // Store script text as string
  const [isPlaying, setIsPlaying] = useState(false);
  const [textSize, setTextSize] = useState(DEFAULT_TEXT_SIZE);
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
      setCurrentNumber(num); // Update the current script number
      setScript(`Loading script ${num}...`);
      try {
        const scriptData = secretScriptsData[num.toString()];

        if (scriptData && scriptData.text) {
          const scriptText = scriptData.text;
          setScript(scriptText);

          const audioFile = audioFiles[num];

          if (audioFile) {
            try {
              const { sound } = await Audio.Sound.createAsync(audioFile);
              setSound(sound);
              setIsPlaying(false); // Ensure isPlaying is false initially
            } catch (err) {
              setScript(scriptText + '\n\nAudio not found for this script.');
            }
          } else {
            setScript(scriptText + '\n\nAudio not found for this script.');
          }
        } else {
          setScript('Script not found');
        }
      } catch (error) {
        setScript('Error loading or playing audio');
      }
    } else {
      setScript('Invalid script number. Please enter a number between 1 and 1232.');
    }

    // Clear the input field
    setNumber('');
  };

  const restartAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        setScript('Error restarting audio');
      }
    }
  };

  const toggleSpeech = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (sound) {
        await sound.pauseAsync();
      }
    } else {
      setIsPlaying(true);
      if (sound) {
        await sound.playAsync();
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scriptContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerText}># {currentNumber !== null ? currentNumber : ''}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.scriptText, { fontSize: textSize }]}>
            {script}
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
      <View style={styles.mediaButtons}>
        <TouchableOpacity onPress={restartAudio} style={styles.restartButton}>
          <Icon name="refresh" size={30} color="black" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSpeech} style={styles.playButton}>
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
  fontSizeControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  playButton: {
    paddingLeft: 30,
  },
  mediaButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
  },
  restartButton: {
    paddingRight: 30,
  },
  textSizeButtonText: {
    fontSize: 24,
    color: 'black',
    padding: 20,
  },
});

export default App;
