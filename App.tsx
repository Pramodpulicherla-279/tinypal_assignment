/**
 * Sample React Native App - Modified to show Ads like WhatsApp status
 * Based on /did_you_know and /flashcard API responses
 * Fully responsive for all mobile screen sizes
 */

import React, { useEffect, useState, useRef } from 'react';
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
  Dimensions,
  Animated,
  Easing
} from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';
import FlashcardMaskSvg from './assets/images/flashcard.svg';
import LinearGradient from 'react-native-linear-gradient';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced responsive scaling utilities
const baseWidth = 375; // iPhone X width as base
const baseHeight = 812; // iPhone X height as base

// Scale function for width-based elements
const scale = (size: number) => (screenWidth / baseWidth) * size;

// Vertical scale for height-based elements
const verticalScale = (size: number) => (screenHeight / baseHeight) * size;

// Moderate scale with factor - more controlled scaling
const moderateScale = (size: number, factor = 0.5) => {
  return size + (scale(size) - size) * factor;
};

// Responsive font scaling with min/max limits
const responsiveFont = (size: number, minSize?: number, maxSize?: number) => {
  const scaledSize = moderateScale(size, 0.3);
  if (minSize && scaledSize < minSize) return minSize;
  if (maxSize && scaledSize > maxSize) return maxSize;
  return scaledSize;
};

// Device type detection
const isSmallDevice = screenWidth < 250;
const isLargeDevice = screenWidth > 414;
const isVeryTallDevice = screenHeight > 900;

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [ads, setAds] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [barWidth, setBarWidth] = useState(0);

  // ⏳ Animated progress value
  const progress = useRef(new Animated.Value(0)).current;
  const duration = 5000; // 5 seconds

  const stylesDidYouKnow = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#462a45ff',
    },
    image: {
      position: 'absolute',
      top: verticalScale(60) + (isSmallDevice ? 60 : 0),
      left: 0,
      width: '100%',
      height: verticalScale(330) + (isSmallDevice ? -30 : isLargeDevice ? 20 : 0),
      resizeMode: 'cover',
      borderRadius: moderateScale(40),
    },
    title: {
      color: '#fff',
      fontSize: responsiveFont(24, 20, 28),
      fontWeight: 'bold',
      marginTop: verticalScale(50),
      textAlign: 'center',
      paddingHorizontal: scale(20),
      lineHeight: responsiveFont(30, 24, 36),
    },
    text: {
      color: '#fff',
      fontSize: responsiveFont(16, 14, 18),
      marginTop: verticalScale(36),
      textAlign: 'center',
      paddingHorizontal: scale(20),
      lineHeight: responsiveFont(22, 18, 26),
    },
  });

  const stylesFlashcard = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#100e3fff',
    },
    image: {
      position: 'absolute',
      top: verticalScale(60) + (isSmallDevice ? -10 : 0),
      left: 0,
      width: '100%',
      height: verticalScale(330) + (isSmallDevice ? -30 : isLargeDevice ? 20 : 0),
      resizeMode: 'cover',
      borderRadius: moderateScale(40),
      borderWidth: 2,
    },
    title: {
      color: '#fff',
      fontSize: responsiveFont(24, 20, 32),
      fontWeight: 'bold',
      marginTop: 0,
      textAlign: 'left',
      paddingHorizontal: scale(20),
      zIndex: 10000,
      lineHeight: responsiveFont(30, 24, 40),
    },
    text: {
      color: '#ffffffc1',
      fontSize: responsiveFont(16, 14, 18),
      marginTop: verticalScale(30),
      textAlign: 'left',
      paddingHorizontal: scale(20),
      lineHeight: responsiveFont(24, 20, 28),
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

  // 👉 Start animation when ad changes
useEffect(() => {
  if (ads.length > 0) {
    progress.setValue(0);

    // Run progress bar animation (visual only)
    Animated.timing(progress, {
      toValue: 1,
      duration,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    // 🔥 Trigger next screen exactly at `duration`
    const timer = setTimeout(() => {
      showNext();   // instant switch
    }, duration);

    return () => clearTimeout(timer);
  }
}, [currentIndex, ads]);

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
        <Text style={{ color: '#fff', fontSize: responsiveFont(16) }}>No ads available</Text>
      </View>
    );
  }

  const currentAd = ads[currentIndex];
  const adStyles = currentAd.type === 'did_you_know' ? stylesDidYouKnow : stylesFlashcard;

  const headerBgColor = currentAd.type === 'did_you_know' ? '#ce8ecdff' : '#6764b7ff';

  // Responsive positioning calculations
  const flashcardContentTopPosition = verticalScale(450) + (isSmallDevice ? -60 : isLargeDevice ? 40 : 0);
  const didYouKnowMaskMargin = verticalScale(210) + (isSmallDevice ? -30 : isLargeDevice ? 20 : 0);

  // Mask for 'did_you_know' with an upward curve
  const DidYouKnowMask = (
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
  );

  return (
    <TouchableOpacity
      style={[adStyles.container, { paddingTop: safeAreaInsets.top, paddingBottom: safeAreaInsets.bottom }]}
      onPress={showNext}
      activeOpacity={1}
    >
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
        paddingHorizontal: scale(16)
      }}>
        <TouchableOpacity>
          <Image
            source={require('./assets/images/back.png')}
            style={{
              width: scale(22),
              height: scale(22),
              minWidth: 18,
              minHeight: 18
            }}
          />
        </TouchableOpacity>
        {/* Divider line */}
        <View style={{
          width: 2,
          height: verticalScale(32),
          backgroundColor: '#9d9d9dff',
          marginHorizontal: scale(12),
          minHeight: 24
        }} />
        <View style={{ marginLeft: scale(0), flex: 1 }}>
          <Text style={{
            color: '#fff',
            fontSize: responsiveFont(14, 12, 16),
            fontWeight: '600'
          }}>
            UNLEARN OLD PATTERNS
          </Text>
          <Text style={{
            color: '#9d9d9dff',
            fontSize: responsiveFont(12, 10, 14),
            marginTop: 2
          }}>
            {currentAd.type === 'did_you_know' ? 'Distraction = No No!' : 'Distractions 101'}
          </Text>
        </View>
      </View>

      {/* Status Bar */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: verticalScale(26) + (isSmallDevice ? -8 : 0),
        zIndex: 10000,
        marginBottom: verticalScale(8),
        paddingHorizontal: scale(0)
      }}>
        {[0, 1].map((i) => {
          const barWidth = progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 100], // percent width
          });
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: verticalScale(4),
                marginHorizontal: scale(4),
                borderRadius: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                minHeight: 3,
              }}
            >
              {currentIndex === i && (
                <Animated.View
                  style={{
                    height: '100%',
                    // ✅ use numeric width instead of percentage string
                    width: progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, screenWidth], // full device width
                    }),
                    backgroundColor: '#fff',
                  }}
                />
              )}
              {currentIndex > i && (
                <View
                  style={{
                    height: '100%',
                    width: '100%',
                    backgroundColor: '#fff',
                  }}
                />
              )}
            </View>

          );
        })}
      </View>

      {/* Content */}
      <Image source={{ uri: currentAd.image }} style={adStyles.image} />

      {currentAd.type === 'did_you_know' && (
        <View style={styles.imageShadow}>
          <Image
            source={require('./assets/images/img1.png')}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
            }}
          />
        </View>
      )}

      {/* Different rendering approach for flashcard vs did_you_know */}
      {currentAd.type === 'flashcard' ? (
        <View style={{
          position: 'absolute',
          top: verticalScale(-60) + (isSmallDevice ? 20 : 0),
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
        }}>
          {/* The SVG now acts as a background shape for the text content. */}
          <View style={{
            position: 'absolute',
            top: verticalScale(60),
            left: scale(-10),
            right: scale(-10),
            bottom: 0,
            width: screenWidth + scale(20),
            alignSelf: 'center'
          }}>
            <FlashcardMaskSvg
              width="100%"
              height={isVeryTallDevice ? "120%" : "130%"}
              preserveAspectRatio="none"
            />
          </View>

          {/* This container holds the text and is centered on the SVG. */}
          <View style={{
            flex: 1,
            justifyContent: 'flex-start',
            paddingTop: flashcardContentTopPosition,
            paddingHorizontal: scale(40) + (isSmallDevice ? -8 : isLargeDevice ? 8 : 0),
            width: '100%',
          }}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{
                width: scale(4),
                backgroundColor: 'white',
                marginRight: scale(12),
                borderRadius: 1.5,
                height: verticalScale(220) + (isSmallDevice ? -40 : isLargeDevice ? 40 : 0),
                marginTop: verticalScale(0),
                minWidth: 3,
                minHeight: 120
              }} />
              <View style={{ flex: 1 }}>
                <Text style={[adStyles.title, {
                  color: '#fff',
                  fontSize: responsiveFont(28, 22, 36),
                  fontWeight: 'bold'
                }]}>
                  {currentAd.title}
                </Text>
                <Text style={[adStyles.text, {
                  color: '#ffffffc1',
                  fontSize: responsiveFont(16, 14, 18),
                  marginTop: verticalScale(20)
                }]}>
                  {currentAd.content}
                </Text>
              </View>
            </View>
          </View>
        </View>
      ) : (
        // For did_you_know: use MaskedView as before
        <MaskedView
          style={{
            flex: 1,
            marginTop: didYouKnowMaskMargin,
            paddingTop: 0
          }}
          maskElement={DidYouKnowMask}
        >
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              zIndex: 1000,
              minHeight: screenHeight * 0.4,
            }}
            showsVerticalScrollIndicator={false}
          >
            <LinearGradient
              colors={['#ce8ecdff', '#955e93ff']} // top → bottom colors
              style={{
                flex: 1,
                padding: scale(20),
                borderRadius: 0,
                minHeight: screenHeight * 0.4,
              }}
            >
              {/* Your inner content goes here */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: verticalScale(30) + (isSmallDevice ? -10 : 0),
                flexWrap: isSmallDevice ? 'wrap' : 'nowrap'
              }}>
                {/* Cause Box */}
                <View style={[styles.extraBox, {
                  flex: isSmallDevice ? undefined : 1,
                  width: isSmallDevice ? '100%' : undefined,
                  height: verticalScale(100) + (isSmallDevice ? -20 : 0),
                  alignItems: 'center',
                  backgroundColor: '#dbaad9ff',
                  borderRadius: 12,
                  marginRight: isSmallDevice ? 0 : scale(8),
                  marginBottom: isSmallDevice ? scale(12) : 0,
                  paddingVertical: verticalScale(12),
                  borderColor: '#fff',
                  borderWidth: 1.5,
                  justifyContent: 'center',
                  minHeight: 80
                }]}>
                  <Text style={[styles.extraText, { color: '#fff' }]}>
                    {currentAd.cause_and_effect?.cause}
                  </Text>
                </View>

                {/* Center Image - only show if not small device */}
                {!isSmallDevice && (
                  <Image
                    source={require('./assets/images/curved-arrow.png')}
                    style={{
                      width: scale(40),
                      height: scale(40),
                      transform: [{ scaleY: -1 }, { rotate: '-10deg' }],
                      minWidth: 30,
                      minHeight: 30
                    }}
                  />
                )}

                {/* Effect Box */}
                <View style={[styles.extraBox, {
                  flex: isSmallDevice ? undefined : 1,
                  width: isSmallDevice ? '100%' : undefined,
                  height: verticalScale(100) + (isSmallDevice ? -20 : 0),
                  alignItems: 'center',
                  backgroundColor: '#dbaad9ff',
                  borderRadius: 12,
                  marginLeft: isSmallDevice ? 0 : scale(8),
                  paddingVertical: verticalScale(12),
                  borderColor: '#fff',
                  borderWidth: 1.5,
                  justifyContent: 'center',
                  minHeight: 80
                }]}>
                  <Text style={[styles.extraText, { color: '#fff' }]}>
                    {currentAd.cause_and_effect?.effect}
                  </Text>
                </View>
              </View>

              <Text style={[adStyles.text, {
                marginTop: verticalScale(30) + (isSmallDevice ? -10 : 0)
              }]}>
                {currentAd.content}
              </Text>

              {/* Citation link below the row */}
              {/* Citation fixed at bottom */}
              {currentAd.citation?.label && (
                <Text
                  style={{
                    position: 'absolute',
                    bottom: verticalScale(50), // <- keep 50px from bottom
                    left: 0,
                    right: 0,
                    color: '#ffbb4dff',
                    textDecorationLine: 'underline',
                    textAlign: 'center',
                    fontSize: responsiveFont(18, 16, 20),
                    zIndex: 2000,
                  }}
                  onPress={() => Linking.openURL(currentAd.citation?.url)}
                >
                  {currentAd.citation?.label}
                </Text>
              )}
            </LinearGradient>
          </ScrollView>
        </MaskedView>
      )}
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
    fontSize: responsiveFont(22),
    fontWeight: 'bold',
    marginTop: verticalScale(20),
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  text: {
    color: '#ddd',
    fontSize: responsiveFont(16),
    marginTop: verticalScale(10),
    textAlign: 'center',
    paddingHorizontal: scale(20),
  },
  extraBox: {
    marginTop: verticalScale(20),
    paddingHorizontal: scale(20),
  },
  extraText: {
    color: '#bbb',
    fontSize: responsiveFont(14, 12, 16),
    marginBottom: 5,
    textAlign: 'center',
    lineHeight: responsiveFont(18, 16, 22),
  },
  imageShadow: {
    width: scale(180) + (isSmallDevice ? -30 : isLargeDevice ? 20 : 0),
    height: verticalScale(120) + (isSmallDevice ? -20 : isLargeDevice ? 10 : 0),
    alignSelf: 'center',
    marginTop: verticalScale(250) + (isSmallDevice ? -40 : isLargeDevice ? 20 : 0),
    zIndex: 1,
    position: 'absolute',
    minWidth: 120,
    minHeight: 80,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    // Android shadow
    elevation: 5,
  },
});

export default App;