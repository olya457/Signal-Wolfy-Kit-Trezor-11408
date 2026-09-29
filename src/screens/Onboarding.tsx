import { ContentReveal } from '../components/ContentReveal';
import { useLayout } from '../hooks/useLayout';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, {
  Defs,
  LinearGradient as SvgGradient,
  Stop,
  Path,
} from 'react-native-svg';
import { assets } from '../data/assets';
import { Button, Screen } from '../components/UI';
import { colors, styles as s } from '../theme';
import { useApp } from '../state/AppState';
const loader = `<html><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;display:grid;place-items:center;background:transparent;height:100vh}.ring{position:absolute;width:112px;height:112px;border:5px solid #ffc34b;border-radius:46% 54% 48% 52%;animation:spin 2s linear infinite}.ring:nth-child(2){width:90px;height:90px;animation-direction:reverse}.ring:nth-child(3){width:66px;height:66px}.ring:nth-child(4){width:42px;height:42px;animation-direction:reverse}@keyframes spin{to{transform:rotate(360deg)}}</style><body><div class="ring"></div><div class="ring"></div><div class="ring"></div><div class="ring"></div><script>setTimeout(()=>window.ReactNativeWebView.postMessage('finished'),4000)</script></body></html>`;
export function Splash({ onDone }: { onDone: () => void }) {
  const [failed, setFailed] = useState(false);
  const { height, width } = useWindowDimensions();
  const scale = Math.min(height / 852, width / 393, 1.25);
  useEffect(() => {
    if (failed) {
      const timer = setTimeout(onDone, 4000);
      return () => clearTimeout(timer);
    }
  }, [failed, onDone]);
  return (
    <ImageBackground source={assets.background} style={{ flex: 1 }}>
      <ContentReveal
        style={{ flex: 1, alignItems: 'center', paddingTop: height * 0.297 }}
      >
        <Svg
          pointerEvents="none"
          width={130 * scale}
          height={215 * scale}
          viewBox="0 0 130 215"
          style={{ position: 'absolute', left: 0, top: height * 0.49 }}
        >
          <Defs>
            <SvgGradient id="gold" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#ffc34b" />
              <Stop offset="1" stopColor="#ffc34b" stopOpacity="0" />
            </SvgGradient>
          </Defs>
          <Path d="M0 0C60-15 61 70 126 130L0 215Z" fill="url(#gold)" />
        </Svg>
        <Image
          source={assets.logo}
          style={{
            width: 212 * scale,
            height: 212 * scale,
            borderRadius: 106 * scale,
          }}
        />
        <Text
          style={[
            s.title,
            {
              fontSize: 44 * scale,
              marginTop: 52 * scale,
              lineHeight: 54 * scale,
            },
          ]}
        >
          SIGNAL WOLFY
        </Text>
        <Text
          style={{
            color: colors.gold,
            fontSize: 27 * scale,
            letterSpacing: 6,
            marginTop: 16 * scale,
          }}
        >
          ••• ▰ ▰ • ▰
        </Text>
        <View
          style={{
            height: 160 * scale,
            width: 180 * scale,
            marginTop: 38 * scale,
          }}
        >
          <WebView
            source={{ html: loader }}
            scrollEnabled={false}
            style={{ backgroundColor: 'transparent' }}
            onMessage={() => onDone()}
            onError={() => setFailed(true)}
          />
        </View>
      </ContentReveal>
    </ImageBackground>
  );
}
const slides = [
  {
    image: assets.compass,
    label: 'Welcome aboard',
    title: 'YOUR FIELD KIT\nFOR SIGNALS',
    body: 'Morse, maritime flags, navigation and survival know-how — one toolkit that works wherever you are.',
  },
  {
    image: assets.signals,
    label: 'Morse & flags',
    title: 'SPEAK IN DOTS,\nDASHES & FLAGS',
    body: 'Play every letter as light, sound, and haptics. Convert text both ways and explore International Code flags.',
  },
  {
    image: assets.learn,
    label: 'Learn & train',
    title: 'KNOW IT. TRAIN\nIT. TRUST IT.',
    body: 'Practical field articles, important tips and daily match quizzes that turn knowledge into instinct.',
  },
];
export function Onboarding() {
  const layout = useLayout();
  const [step, setStep] = useState(0);
  const { update } = useApp();
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const slide = slides[step];
  const finish = () => update(d => ({ ...d, onboarded: true }));
  return (
    <Screen
      animationKey={step}
      style={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 16) }}
    >
      <View style={{ alignItems: 'flex-end', minHeight: 36 }}>
        {step < 2 && (
          <Pressable
            accessibilityRole="button"
            onPress={finish}
            style={[
              s.pill,
              { minHeight: 36, paddingVertical: 8, justifyContent: 'center' },
            ]}
          >
            <Text style={[s.text, { fontSize: 14, lineHeight: 20 }]}>Skip</Text>
          </Pressable>
        )}
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: layout.short ? 140 : 200,
        }}
      >
        <Image
          source={slide.image}
          resizeMode="contain"
          style={{
            width: Math.min(layout.contentWidth, 360),
            height: Math.min(height * (layout.short ? 0.3 : 0.43), 360),
          }}
        />
      </View>
      <View style={{ gap: 10, marginTop: layout.short ? 8 : 22 }}>
        <Text style={s.eyebrow}>{slide.label}</Text>
        <Text
          style={[
            s.title,
            {
              fontSize: layout.compact ? 30 : 36,
              lineHeight: layout.compact ? 34 : 39,
            },
          ]}
        >
          {slide.title}
        </Text>
        <Text style={[s.body, { marginTop: 8 }]}>{slide.body}</Text>
      </View>
      <View style={[s.between, { marginTop: 10, flexWrap: 'wrap' }]}>
        <View style={s.row}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                height: 7,
                width: i === step ? 24 : 7,
                borderRadius: 5,
                backgroundColor: i === step ? colors.pink : '#ffffff40',
              }}
            />
          ))}
        </View>
        <View style={[s.row, { flexShrink: 0, marginLeft: 'auto' }]}>
          {step > 0 && (
            <Button
              label="‹"
              secondary
              style={{ minWidth: 54, minHeight: 54, borderRadius: 27 }}
              onPress={() => setStep(step - 1)}
            />
          )}
          <Button
            style={{
              minWidth: step === 2 ? 150 : 104,
              minHeight: 54,
              borderRadius: 27,
            }}
            label={step === 2 ? 'Get Started ›' : 'Next ›'}
            onPress={() => (step === 2 ? finish() : setStep(step + 1))}
          />
        </View>
      </View>
    </Screen>
  );
}
