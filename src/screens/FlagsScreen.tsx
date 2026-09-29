import { SignalFeedback } from '../components/SignalFeedback';
import { useLayout } from '../hooks/useLayout';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { colors, styles as s } from '../theme';
import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { RootProps } from '../navigation/types';
import { Button, Chips, Empty, Header, Screen } from '../components/UI';
import { flagImages } from '../data/assets';
import flags from '../data/flags.json';
import { morse } from '../services/morse';
import { useSignal } from '../services/SignalPlayer';

const useNav = () =>
  useNavigation<NativeStackNavigationProp<RootStackParams>>();

export function FlagsScreen() {
  const layout = useLayout();
  const navigation = useNav();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const list = flags.filter(f => {
    const group =
      category === 'All' ||
      (category === 'Emergency'
        ? 'FJLOUVWY'.includes(f.letter)
        : category === 'Maneuvering'
        ? 'DEIKLMSX'.includes(f.letter)
        : category === 'Harbour'
        ? 'ABGHPQZ'.includes(f.letter)
        : /\d/.test(f.letter));
    return (
      group &&
      `${f.letter} ${f.name} ${f.meaning} ${f.category}`
        .toLowerCase()
        .includes(query.trim().toLowerCase())
    );
  });
  return (
    <Screen>
      <Header title="SIGNAL FLAGS" eyebrow="International code" />
      <View style={s.row}>
        <TextInput
          accessibilityLabel="Search flags"
          value={query}
          onChangeText={setQuery}
          placeholder="Search letter, name or meaning"
          placeholderTextColor={colors.muted}
          style={[s.input, { flex: 1 }]}
          clearButtonMode="while-editing"
        />
      </View>
      <Chips
        items={['All', 'Emergency', 'Maneuvering', 'Harbour', 'Numbers']}
        value={category}
        onChange={setCategory}
      />
      <View style={s.between}>
        <Text style={s.section}>
          {query ? 'RESULTS' : category.toUpperCase()}
        </Text>
        <Text style={s.small}>{list.length} flags</Text>
      </View>
      {!list.length ? (
        <Empty
          title="No flags match"
          body="Try a different letter, name or meaning."
        />
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {list.map(f => (
            <Pressable
              key={f.id}
              onPress={() => navigation.navigate('Flag', { id: f.id })}
              style={[
                s.card,
                { width: layout.gridWidth(layout.columns), padding: 13 },
              ]}
            >
              <View
                style={{
                  height: 102,
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#25204455',
                  borderRadius: 12,
                }}
              >
                <Text
                  style={[
                    s.section,
                    { position: 'absolute', left: 4, top: 2, fontSize: 18 },
                  ]}
                >
                  {f.letter}
                </Text>
                <Image
                  source={flagImages[f.letter]}
                  resizeMode="contain"
                  style={{ width: 94, height: 82 }}
                />
              </View>
              <View style={s.between}>
                <Text
                  style={[s.text, { fontSize: 14, fontWeight: '600', flex: 1 }]}
                >
                  {f.name}
                </Text>
                <Text style={{ color: colors.gold, fontSize: 11 }}>
                  {morse[f.letter]}
                </Text>
              </View>
              <Text numberOfLines={3} style={s.small}>
                {f.meaning.replace(/[“”]/g, '')}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}
export function FlagScreen({ route }: RootProps<'Flag'>) {
  const layout = useLayout();
  const f = flags.find(v => v.id === route.params.id)!;
  const player = useSignal();
  return (
    <Screen>
      <View
        style={[
          s.card,
          {
            alignItems: 'center',
            backgroundColor: player.lit ? '#775431' : '#27215B80',
            paddingVertical: layout.compact ? 22 : 34,
            gap: 20,
          },
        ]}
      >
        <Text
          style={[
            s.title,
            {
              position: 'absolute',
              left: 24,
              top: 12,
              fontSize: 100,
              lineHeight: 120,
              opacity: 0.08,
            },
          ]}
        >
          {f.letter}
        </Text>
        <Image
          source={flagImages[f.letter]}
          resizeMode="contain"
          style={{ width: 160, height: 130 }}
        />
        <Text style={[s.title, { fontSize: layout.compact ? 26 : 30 }]}>
          {f.letter} — {f.name.toUpperCase()}
        </Text>
        <View style={[s.row, { flexWrap: 'wrap', justifyContent: 'center' }]}>
          <Text style={[s.pill, s.small]}>{f.category}</Text>
          <Text style={{ color: colors.gold }}>{f.morse}</Text>
        </View>
        <Button
          label={player.playing ? '■ Stop' : `▶ Play Morse “ ${f.letter} ”`}
          secondary
          onPress={() =>
            player.playing
              ? player.stop()
              : player.play(morse[f.letter], f.letter)
          }
        />
      </View>
      <SignalFeedback />
      <View
        style={[
          s.card,
          { borderColor: '#FF873C80', backgroundColor: '#FF873C10' },
        ]}
      >
        <Text style={s.eyebrow}>Official meaning</Text>
        <Text style={s.text}>{f.meaning}</Text>
      </View>
      <View style={s.row}>
        {[
          ['Phonetic', f.name],
          ['Single hoist', f.hoist],
        ].map(([label, value]) => (
          <View key={label} style={[s.card, { flex: 1 }]}>
            <Text style={s.eyebrow}>{label}</Text>
            <Text style={s.text}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.section}>COMMON USAGE</Text>
        <Text style={s.body}>{f.usage}</Text>
        <View style={s.divider} />
        <Text style={s.section}>INDIVIDUAL SIGNAL</Text>
        <Text style={s.body}>{f.individual}</Text>
      </View>
      {f.combination && (
        <View style={s.card}>
          <Text style={s.section}>COMBINATIONS</Text>
          <Text style={s.body}>{f.combination}</Text>
        </View>
      )}
      <View style={[s.card, { borderColor: '#5885FF80' }]}>
        <Text style={[s.eyebrow, { color: colors.blue }]}>Example</Text>
        <Text style={s.body}>{f.example}</Text>
      </View>
    </Screen>
  );
}
