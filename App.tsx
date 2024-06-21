import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Keyboard } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Audio } from 'expo-av';

// Import your secret scripts data (assuming it's structured properly)
import secretScriptsData from './assets/secret_scripts.json';

// Import the audio files mapping
import audioFiles from './audioFiles';

const DEFAULT_TEXT_SIZE = 18;

const App = () => {
  const [number, setNumber] = useState('');
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
    console.log('Entered script number:', num);
    if (num >= 1 && num <= 1232) {
      setScript(`Loading script ${num}...`);
      try {
        const scriptData = secretScriptsData[num.toString()];
        console.log('Fetched script data:', scriptData);

        if (scriptData && scriptData.text) {
          const scriptText = scriptData.text;
          setScript(scriptText);

          const audioFile = audioFiles[num];
          console.log('Audio file for script:', audioFile);

          if (audioFile) {
            try {
              const { sound } = await Audio.Sound.createAsync(audioFile);
              setSound(sound);
              setIsPlaying(false); // Ensure isPlaying is false initially
            } catch (err) {
              console.error('Error loading audio:', err);
              setScript(scriptText + '\n\nAudio not found for this script.');
            }
          } else {
            setScript(scriptText + '\n\nAudio not found for this script.');
          }
        } else {
          setScript('Script not found');
        }
      } catch (error) {
        console.error('Error loading or playing audio:', error);
        setScript('Error loading or playing audio');
      }
    } else {
      setScript('Invalid script number. Please enter a number between 1 and 1232.');
    }
  };

  const restartAudio = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.setPositionAsync(0);
        await sound.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('Error restarting audio:', error);
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
          <Text style={styles.headerText}># {number}</Text>
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
