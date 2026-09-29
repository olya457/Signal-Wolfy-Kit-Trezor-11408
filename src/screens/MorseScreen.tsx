import { SignalFeedback } from '../components/SignalFeedback';
import { useLayout } from '../hooks/useLayout';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  CompositeNavigationProp,
  RouteProp,
  useRoute,
  useNavigation,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams, RootProps, TabParams } from '../navigation/types';
import { Button, Chips, Empty, Header, Screen } from '../components/UI';
import { colors, styles as s } from '../theme';
import { decode, encode, morse } from '../services/morse';
import { useSignal } from '../services/SignalPlayer';
import { useApp } from '../state/AppState';
import flags from '../data/flags.json';
export function MorseScreen() {
  const layout = useLayout();
  const navigation =
    useNavigation<
      CompositeNavigationProp<
        BottomTabNavigationProp<TabParams, 'Morse'>,
        NativeStackNavigationProp<RootStackParams>
      >
    >();
  const { data, update } = useApp();
  const player = useSignal();
  const route = useRoute<RouteProp<TabParams, 'Morse'>>();
  const [tab, setTab] = useState('Alphabet');
  useEffect(() => {
    if (route.params?.mode) {
      setTab(route.params.mode);
      navigation.setParams({ mode: undefined });
    }
  }, [route.params?.mode, navigation]);
  const [direction, setDirection] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const conversion = direction === 'encode' ? encode(input) : decode(input);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const changeInput = (value: string) => {
    player.stop();
    setCopied(false);
    setInput(value);
  };
  const save = async () => {
    if (!conversion.value || conversion.error || saving) return;
    setSaving(true);
    const saved = await update(d => ({
      ...d,
      saved: [
        {
          id: `${Date.now()}-${Math.random()}`,
          input,
          result: conversion.value,
          direction,
          createdAt: new Date().toISOString(),
        },
        ...d.saved,
      ],
    }));
    setSaving(false);
    if (saved) Alert.alert('Saved', 'The conversion is now in Saved Results.');
  };
  return (
    <Screen animationKey={tab}>
      <Header
        eyebrow="Signal toolkit"
        title="MORSE"
        action={
          <Pressable
            onPress={() => navigation.navigate('Saved')}
            style={s.pill}
          >
            <Text style={{ color: colors.gold }}>♧ {data.saved.length}</Text>
          </Pressable>
        }
      />
      <View
        style={[
          s.row,
          { backgroundColor: '#ffffff10', padding: 4, borderRadius: 12 },
        ]}
      >
        {['Alphabet', 'Converter'].map(t => (
          <Button
            key={t}
            label={t}
            secondary={tab !== t}
            onPress={() => {
              player.stop();
              setTab(t);
            }}
            style={{ flex: 1, minHeight: 40 }}
          />
        ))}
      </View>
      {tab === 'Alphabet' ? (
        <>
          <View style={[s.card, s.row, { backgroundColor: '#38225270' }]}>
            <View
              style={{
                width: layout.compact ? 60 : 76,
                height: layout.compact ? 60 : 76,
                borderRadius: 38,
                borderWidth: 2,
                borderColor: colors.gold,
                backgroundColor: player.lit ? colors.orange : '#17132E',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: player.lit ? '0 0 30px #ffae45' : 'none',
              }}
            >
              <Text style={[s.section, { fontSize: 32 }]}>
                {player.lit ? '' : player.active || 'S'}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Text style={[s.text, { fontWeight: '600' }]}>Signal Lamp</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
                {(['sound', 'haptic', 'flash'] as const).map(k => (
                  <Pressable
                    key={k}
                    style={[
                      s.pill,
                      { paddingHorizontal: 8, paddingVertical: 6 },
                      player.settings[k] && s.activePill,
                    ]}
                    onPress={() =>
                      player.setSettings(v => ({ ...v, [k]: !v[k] }))
                    }
                  >
                    <Text style={{ fontSize: 10, color: colors.text }}>
                      {k === 'sound'
                        ? '♫ Sound'
                        : k === 'haptic'
                        ? '◉ Haptic'
                        : 'ϟ Flash'}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={s.row}>
                {['Slow', 'Normal', 'Fast'].map(speed => (
                  <Pressable
                    key={speed}
                    onPress={() => player.setSettings(v => ({ ...v, speed }))}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color:
                          player.settings.speed === speed
                            ? colors.text
                            : colors.muted,
                      }}
                    >
                      {speed}
                    </Text>
                  </Pressable>
                ))}
                {player.playing && (
                  <Pressable onPress={player.stop}>
                    <Text style={{ color: colors.pink }}>■</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </View>
          <SignalFeedback />
          {['LETTERS A–Z', 'NUMBERS 0–9'].map((title, section) => (
            <View key={title} style={{ gap: 12 }}>
              <View style={s.between}>
                <Text style={s.section}>{title}</Text>
                <Text style={s.small}>• dit ▰ dah</Text>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 9 }}>
                {flags
                  .filter(f =>
                    section ? /\d/.test(f.letter) : /[A-Z]/.test(f.letter),
                  )
                  .map(f => (
                    <Pressable
                      accessibilityLabel={`Play ${f.name}`}
                      key={f.id}
                      onPress={() =>
                        player.active === f.letter && player.playing
                          ? player.stop()
                          : player.play(morse[f.letter], f.letter)
                      }
                      style={[
                        s.card,
                        {
                          width: layout.gridWidth(
                            section
                              ? layout.largeText
                                ? 1
                                : 2
                              : layout.letterColumns,
                            9,
                          ),
                          padding: 12,
                          borderRadius: 18,
                          minHeight: section ? 67 : 112,
                          gap: 4,
                        },
                        player.active === f.letter &&
                          player.playing && {
                            borderColor: colors.orange,
                            backgroundColor: '#FF873C30',
                          },
                      ]}
                    >
                      <View style={s.between}>
                        <Text style={[s.section, { fontSize: 25 }]}>
                          {f.letter}
                        </Text>
                        <Text style={{ color: colors.muted }}>▶</Text>
                      </View>
                      {!section && (
                        <Text style={[s.small, { fontSize: 10 }]}>
                          {f.name}
                        </Text>
                      )}
                      <Text
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        style={{
                          color: colors.orange,
                          fontSize: 22,
                          fontWeight: '900',
                          letterSpacing: 1,
                        }}
                      >
                        {morse[f.letter].replace(/\./g, '•').replace(/-/g, '━')}
                      </Text>
                    </Pressable>
                  ))}
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          <View style={[s.between, { gap: 6 }]}>
            <Text
              style={[
                s.pill,
                s.text,
                {
                  flex: 1,
                  textAlign: 'center',
                  paddingHorizontal: 6,
                  fontSize: 14,
                },
              ]}
            >
              From {direction === 'encode' ? 'Text' : 'Morse'}
            </Text>
            <Button
              label="⇅"
              onPress={() => {
                player.stop();
                setDirection(direction === 'encode' ? 'decode' : 'encode');
                setInput(conversion.error ? '' : conversion.value);
              }}
            />
            <Text
              style={[
                s.pill,
                s.text,
                {
                  flex: 1,
                  textAlign: 'center',
                  paddingHorizontal: 6,
                  fontSize: 14,
                },
              ]}
            >
              To {direction === 'encode' ? 'Morse' : 'Text'}
            </Text>
          </View>
          <View style={s.card}>
            <View style={s.between}>
              <Text style={s.eyebrow}>
                {direction === 'encode' ? 'Text' : 'Morse'} input
              </Text>
              <Pressable
                onPress={() => {
                  setInput('');
                  player.stop();
                }}
              >
                <Text style={{ color: colors.orange }}>Clear</Text>
              </Pressable>
            </View>
            <TextInput
              multiline
              maxLength={1000}
              accessibilityLabel="Message to convert"
              placeholder={
                direction === 'encode'
                  ? 'Type a message…'
                  : 'Type dots and dashes…'
              }
              placeholderTextColor="#79748D"
              value={input}
              onChangeText={changeInput}
              style={{
                color: colors.text,
                minHeight: 100,
                fontSize: 17,
                textAlignVertical: 'top',
              }}
              autoCapitalize="characters"
            />
            <View style={s.between}>
              <Text style={s.small}>{input.length} characters</Text>
              <Text style={s.small}>
                {direction === 'encode'
                  ? 'A–Z · 0–9 · punctuation'
                  : 'space = letter · / = word'}
              </Text>
            </View>
            {direction === 'decode' && (
              <View style={s.row}>
                {['.', '-', ' ', '/', '⌫'].map(k => (
                  <Pressable
                    key={k}
                    onPress={() =>
                      changeInput(
                        k === '⌫'
                          ? input.slice(0, -1)
                          : (input + k).slice(0, 1000),
                      )
                    }
                    style={[
                      s.pill,
                      { flex: 1, paddingHorizontal: 5, alignItems: 'center' },
                    ]}
                  >
                    <Text style={s.text}>{k === ' ' ? '␣' : k}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          <View
            style={[
              s.card,
              { borderColor: '#9658ED70', backgroundColor: '#22174B80' },
            ]}
          >
            <Text style={[s.eyebrow, { color: colors.gold }]}>
              {direction === 'encode' ? 'Morse' : 'Text'} result
            </Text>
            <Text
              selectable
              style={{
                color: conversion.value ? colors.gold : colors.muted,
                fontFamily: 'Courier',
                fontSize: 19,
                lineHeight: 30,
                minHeight: 70,
              }}
            >
              {conversion.value || 'Result appears here'}
            </Text>
            {!!conversion.error && (
              <Text style={{ color: colors.pink }}>{conversion.error}</Text>
            )}
            <View style={s.row}>
              <Button
                style={{ flex: 1 }}
                secondary
                label={player.playing ? '■ Stop' : '▶ Play'}
                disabled={!conversion.value || !!conversion.error}
                onPress={() =>
                  player.playing
                    ? player.stop()
                    : player.play(
                        direction === 'encode'
                          ? conversion.value
                          : encode(conversion.value).value,
                      )
                }
              />
              <Button
                style={{ flex: 1 }}
                secondary
                label={copied ? 'Copied' : 'Copy'}
                disabled={!conversion.value || !!conversion.error}
                onPress={() => {
                  Clipboard.setString(conversion.value);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              />
              <Button
                style={{ flex: 1 }}
                secondary
                label={saving ? 'Saving…' : 'Save'}
                disabled={!conversion.value || !!conversion.error || saving}
                onPress={save}
              />
            </View>
            <SignalFeedback controls />
          </View>
          <Text style={s.eyebrow}>Try an example</Text>
          <Chips
            items={['SOS', 'HELP NEEDED', 'WOLFY', 'ALL CLEAR']}
            value=""
            onChange={v =>
              changeInput(direction === 'encode' ? v : encode(v).value)
            }
          />
          <Pressable
            style={[s.card, s.between]}
            onPress={() => navigation.navigate('Saved')}
          >
            <View>
              <Text style={s.text}>♧ Saved Results</Text>
              <Text style={s.small}>
                {data.saved.length} conversions stored on device
              </Text>
            </View>
            <Text style={s.text}>›</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}
export function SavedScreen({ navigation }: RootProps<'Saved'>) {
  const { data, update } = useApp();
  return (
    <Screen>
      <Text style={s.section}>{data.saved.length} CONVERSIONS</Text>
      {!data.saved.length ? (
        <Empty
          title="No saved results"
          body="Conversions you save from the Converter appear here."
          action={
            <Button
              label="Open Converter"
              onPress={() =>
                navigation.popTo('Main', {
                  screen: 'Morse',
                  params: { mode: 'Converter' },
                })
              }
            />
          }
        />
      ) : (
        data.saved.map(item => (
          <View key={item.id} style={s.card}>
            <View style={s.between}>
              <Text style={[s.small, { color: colors.orange }]}>
                {item.direction === 'encode' ? 'Text → Morse' : 'Morse → Text'}
              </Text>
              <Text
                style={[s.small, { flex: 1, textAlign: 'right', fontSize: 10 }]}
              >
                {new Date(item.createdAt).toLocaleString()}
              </Text>
            </View>
            <Text style={s.eyebrow}>Input</Text>
            <Text selectable style={s.text}>
              {item.input}
            </Text>
            <View style={s.divider} />
            <Text style={s.eyebrow}>Result</Text>
            <Text
              selectable
              style={{
                color: colors.gold,
                fontSize: 16,
                fontFamily: 'Courier',
                lineHeight: 25,
              }}
            >
              {item.result}
            </Text>
            <View style={[s.row, { justifyContent: 'flex-end' }]}>
              <Button
                label="Copy"
                secondary
                onPress={() => {
                  Clipboard.setString(item.result);
                  Alert.alert('Copied');
                }}
              />
              <Button
                label="Delete"
                secondary
                onPress={() =>
                  Alert.alert(
                    'Delete this result?',
                    'This conversion will be permanently removed from Saved Results.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () =>
                          update(d => ({
                            ...d,
                            saved: d.saved.filter(v => v.id !== item.id),
                          })),
                      },
                    ],
                  )
                }
              />
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}
