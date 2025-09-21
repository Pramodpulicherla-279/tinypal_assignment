/**
 * Sample React Native App - Modified to show Ads like WhatsApp status
 * Based on /did_you_know and /flashcard API responses
 */

import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
  Linking,
  ScrollView,
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const stylesDidYouKnow = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#462a45ff',
    },
    image: {
      position: 'absolute',
      top: 100,
      left: 0,
      width: '100%',
      height: 330,
      resizeMode: 'cover',
      borderRadius: 40,
    },
    title: {
      color: '#fff',
      fontSize: 24,
      fontWeight: 'bold',
      marginTop: 50,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    text: {
      color: '#fff',
      fontSize: 17,
      marginTop: 50,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });

  const stylesFlashcard = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#100e3fff',
    },
    image: {
      position: 'absolute',
      top: 100,
      left: 0,
      width: '100%',
      height: 330,
      resizeMode: 'cover',
      borderRadius: 40,
      borderWidth: 2,
      // borderColor: '#ffb84d',
    },
    title: {
      color: '#fff',
      fontSize: 22,
      fontWeight: 'bold',
      marginTop: 20,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
    text: {
      color: '#fff',
      fontSize: 16,
      marginTop: 80,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });




  // Fetch both API endpoints
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [didYouKnowRes, flashcardRes] = await Promise.all([
          fetch('https://genai-images-4ea9c0ca90c8.herokuapp.com/did_you_know').then((r) => r.json()),
          fetch('https://genai-images-4ea9c0ca90c8.herokuapp.com/flashcard').then((r) => r.json()),
        ]);
        console.log('Fetched data:', { didYouKnowRes: didYouKnowRes.image_url, flashcardRes: flashcardRes.image_url });


        // Normalize data into a common structure
        const formattedData = [
          {
            type: 'did_you_know',
            image: 'https://genai-images-4ea9c0ca90c8.herokuapp.com/' + didYouKnowRes.image_url,
            title: didYouKnowRes.title,
            content: didYouKnowRes.content,
            citation: didYouKnowRes.citation,
            cause_and_effect: didYouKnowRes.cause_and_effect,
          },
          {
            type: 'flashcard',
            image: 'https://genai-images-4ea9c0ca90c8.herokuapp.com/' + flashcardRes.image_url,
            title: flashcardRes.title,
            content: flashcardRes.content,
          },
        ];
        console.log('Formatted data:', formattedData);

        setAds(formattedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const showNext = () => {
    if (currentIndex < ads.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // loop back
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (ads.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>No ads available</Text>
      </View>
    );
  }

  const currentAd = ads[currentIndex];
  const adStyles = currentAd.type === 'did_you_know' ? stylesDidYouKnow : stylesFlashcard;

  const headerBgColor = currentAd.type === 'did_you_know' ? '#ce8ecdff' : '#6764b7ff';

  return (
    <TouchableOpacity
      style={[adStyles.container, { paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }]}
      onPress={showNext}
      activeOpacity={1}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <TouchableOpacity>
          <Image source={require('./assets/images/back.png')} style={{ width: 28, height: 28 }} />
        </TouchableOpacity>
        {/* Divider line */}
        <View style={{ width: 1, height: 32, backgroundColor: '#fff', marginHorizontal: 12 }} />
        <View style={{ marginLeft: 12 }}>
          <Text style={{ color: '#fff', fontSize: 20 }}>
            {currentAd.type === 'did_you_know' ? 'UNLEARN OLD PATTERNS' : 'UNLEARN OLD PATTERNS'}
          </Text>
          <Text style={{ color: '#fff', fontSize: 12, marginTop: 2 }}>
            {currentAd.type === 'did_you_know' ? 'Distraction = No No!' : 'Distractions 101'}
          </Text>
        </View>
      </View>
      {/* Status Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
        {[0, 1].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              marginHorizontal: 4,
              borderRadius: 2,
              backgroundColor: currentIndex === i ? '#fff' : 'rgba(255,255,255,0.3)',
              opacity: currentIndex === i ? 1 : 0.5,
            }}
          />
        ))}
      </View>
      {/* Content */}
      <Image source={{ uri: currentAd.image }} style={adStyles.image} />

      {currentAd.type === 'did_you_know' && (
        <Image
          source={require('./assets/images/img1.png')}
          style={{
            width: 180,
            height: 130,
            alignSelf: 'center',
            marginTop: 290,
            zIndex: 1,
            position: 'absolute',
            resizeMode: 'contain'
          }}
        />
      )}

      <MaskedView
        style={{ flex: 1, marginTop: 250, paddingTop: 0, }}
        maskElement={
          <Svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <Path
              d="M0,10 Q50,-10 100,10 L100,100 L0,100 Z"
              fill="black"
            />
          </Svg>
        }
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            backgroundColor: headerBgColor,
            padding: 20,
          }}
        >
          <Text style={adStyles.title}>{currentAd.title}</Text>

          {currentAd.type === 'did_you_know' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
              {/* Cause Box */}
              <View style={[styles.extraBox, { flex: 1, height: 120, alignItems: 'center', backgroundColor: '#dbaad9ff', borderRadius: 12, marginRight: 8, paddingVertical: 12, borderColor: '#fff', borderWidth: 1.5, justifyContent: 'center' }]}>
                <Text style={[styles.extraText, { color: '#fff' }]}>
                  {currentAd.cause_and_effect?.cause}
                </Text>
              </View>
              {/* Center Image */}
              <Image
                source={require('./assets/images/curved-arrow.png')}
                style={{
                  width: 40,
                  height: 40,
                  transform: [{ scaleY: -1 }, { rotate: '-10deg' }],

                  // marginHorizontal: 10,

                }}
              />
              {/* Effect Box */}
              <View style={[styles.extraBox, { flex: 1, height: 120, alignItems: 'center', backgroundColor: '#dbaad9ff', borderRadius: 12, marginLeft: 8, paddingVertical: 12,  borderColor: '#fff', borderWidth: 1.5, justifyContent: 'center' }]}>
                <Text style={[styles.extraText, { color: '#fff' }]}>
                  {currentAd.cause_and_effect?.effect}
                </Text>
              </View>
            </View>
          )}
          
          <Text style={adStyles.text}>{currentAd.content}</Text>

          {/* Citation link below the row */}
          {currentAd.type === 'did_you_know' && currentAd.citation?.label && (
            <Text
              style={[styles.extraText, { color: '#ffbb4dff', textDecorationLine: 'underline', textAlign: 'center', marginTop: 140, fontSize: 18 }]}
              onPress={() => Linking.openURL(currentAd.citation?.url)}
            >
              {currentAd.citation?.label}
            </Text>
          )}
        </ScrollView>
      </MaskedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  image: {
    width: '100%',
    height: 'auto',
    resizeMode: 'cover',

  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  text: {
    color: '#ddd',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  extraBox: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  extraText: {
    color: '#bbb',
    fontSize: 16,
    marginBottom: 5,
  },
});


export default App;
