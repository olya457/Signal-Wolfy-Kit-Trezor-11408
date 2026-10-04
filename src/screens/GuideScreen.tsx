import { useLayout } from '../hooks/useLayout';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { colors, styles as s } from '../theme';
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';
import { RootProps } from '../navigation/types';
import { Chips, Header, Screen } from '../components/UI';
import { assets } from '../data/assets';
import articles from '../data/articles.json';

const useNav = () =>
  useNavigation<NativeStackNavigationProp<RootStackParams>>();

export function GuideScreen() {
  const layout = useLayout();
  const navigation = useNav();
  const [category, setCategory] = useState('All');
  const list = articles.filter(
    a => category === 'All' || a.category === category,
  );
  const featured = articles[5];
  return (
    <Screen>
      <Header title="FIELD GUIDE" eyebrow="Navigation & knowledge" />
      <Chips
        items={['All', ...new Set(articles.map(a => a.category))]}
        value={category}
        onChange={setCategory}
      />
      {category === 'All' && (
        <Pressable
          onPress={() => navigation.navigate('Article', { id: featured.id })}
        >
          <ImageBackground
            source={assets.feature}
            resizeMode="cover"
            imageStyle={{ borderRadius: 24 }}
            style={{
              minHeight: layout.compact ? 230 : 250,
              justifyContent: 'space-between',
              padding: 18,
            }}
          >
            <Text
              style={[
                s.eyebrow,
                {
                  color: colors.gold,
                  backgroundColor: '#00000080',
                  alignSelf: 'flex-start',
                  padding: 8,
                  borderRadius: 10,
                },
              ]}
            >
              Featured
            </Text>
            <View>
              <Text style={[s.eyebrow, { color: colors.gold }]}>
                Orientation
              </Text>
              <Text style={[s.section, { fontSize: 26, lineHeight: 29 }]}>
                FINDING YOUR BEARINGS{'\n'}IN UNFAMILIAR TERRAIN
              </Text>
              <Text style={s.small}>
                A calm, repeatable routine for working out where you are —
                before you take another step.
              </Text>
            </View>
          </ImageBackground>
        </Pressable>
      )}
      <Text style={s.section}>ALL ARTICLES</Text>
      {list.map(a => (
        <Pressable
          key={a.id}
          onPress={() => navigation.navigate('Article', { id: a.id })}
          style={[s.card, s.row, { padding: 12 }]}
        >
          <Image
            source={assets.compass}
            style={{
              width: layout.compact ? 64 : 86,
              height: layout.compact ? 76 : 92,
            }}
            resizeMode="contain"
          />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[s.eyebrow, { color: colors.gold, fontSize: 9 }]}>
              {a.category}
            </Text>
            <Text
              style={[
                s.text,
                { fontWeight: '600', fontSize: 15, lineHeight: 20 },
              ]}
            >
              {a.title}
            </Text>
            <Text style={s.small} numberOfLines={2}>
              {a.intro}
            </Text>
            <Text style={s.small}>
              ◷{' '}
              {Math.max(
                2,
                Math.ceil(JSON.stringify(a).split(' ').length / 160),
              )}{' '}
              min · {a.level}
            </Text>
          </View>
        </Pressable>
      ))}
    </Screen>
  );
}
export function ArticleScreen({ route }: RootProps<'Article'>) {
  const layout = useLayout();
  const a = articles.find(v => v.id === route.params.id)!;
  return (
    <Screen extraBottomPadding={Platform.OS === 'android' ? 40 : 0}>
      <Text style={[s.eyebrow, { color: colors.blue }]}>{a.category}</Text>
      <Text
        style={[s.title, layout.compact && { fontSize: 29, lineHeight: 34 }]}
      >
        {a.title.toUpperCase()}
      </Text>
      <Text style={[s.pill, s.small, { alignSelf: 'flex-start' }]}>
        {a.level}
      </Text>
      <Text
        style={[s.text, { fontSize: 18, lineHeight: 28, marginVertical: 5 }]}
      >
        {a.intro}
      </Text>
      {a.sections.map((section, i) => (
        <View key={section.title} style={{ gap: 12, marginTop: 4 }}>
          <View style={s.row}>
            <Text
              style={{
                color: colors.orange,
                backgroundColor: '#FF873C22',
                padding: 8,
                borderRadius: 9,
              }}
            >
              {i + 1}
            </Text>
            <Text
              style={[s.text, { fontSize: 19, fontWeight: '600', flex: 1 }]}
            >
              {section.title}
            </Text>
          </View>
          <Text style={[s.body, { fontSize: 16, lineHeight: 27 }]}>
            {section.body}
          </Text>
        </View>
      ))}
      <View
        style={[
          s.card,
          {
            borderColor: '#FFC34B80',
            backgroundColor: '#FFC34B10',
            marginTop: 8,
          },
        ]}
      >
        <Text style={[s.section, { color: colors.gold }]}>KEY TAKEAWAYS</Text>
        {a.takeaways.split(/(?<=\.)\s+(?=[A-Z])/).map(t => (
          <View key={t} style={[s.row, { alignItems: 'flex-start' }]}>
            <Text style={{ color: colors.gold }}>●</Text>
            <Text style={[s.text, { flex: 1, fontSize: 14 }]}>{t}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
