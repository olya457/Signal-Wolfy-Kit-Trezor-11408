import { ContentReveal } from '../components/ContentReveal';
import { useLayout } from '../hooks/useLayout';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParams } from '../navigation/types';
import { colors, styles as s } from '../theme';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chips, Empty, Header, Screen } from '../components/UI';
import tips from '../data/tips.json';
import { useApp } from '../state/AppState';

const useNav = () =>
  useNavigation<NativeStackNavigationProp<RootStackParams>>();

type Tip = (typeof tips)[number];
const categoryColor = (category: string) =>
  category === 'Emergency'
    ? colors.pink
    : category.includes('Signal') || category === 'Morse'
    ? colors.orange
    : category === 'Compass' || category === 'Communication'
    ? colors.blue
    : colors.gold;
export function TipsScreen({ favorites = false }: { favorites?: boolean }) {
  const layout = useLayout();
  const navigation = useNav();
  const insets = useSafeAreaInsets();
  const { data, update } = useApp();
  const [category, setCategory] = useState('All');
  const [selected, setSelected] = useState<Tip | null>(null);
  const list = tips.filter(
    t =>
      (!favorites || data.favorites.includes(t.id)) &&
      (category === 'All' || category === t.category),
  );
  const toggle = (id: string) =>
    update(d => ({
      ...d,
      favorites: d.favorites.includes(id)
        ? d.favorites.filter(v => v !== id)
        : [...d.favorites, id],
    }));
  const share = (tip: Tip) =>
    Share.share({
      message: `${tip.title}\n\n${tip.intro}\n\n${tip.steps
        .map((step, i) => `${i + 1}. ${step}`)
        .join('\n')}\n\nSignal Wolfy`,
    }).catch(() => Alert.alert('Unable to share', 'Please try again.'));
  return (
    <Screen>
      {favorites ? (
        <Text style={s.section}>SAVED TIPS</Text>
      ) : (
        <>
          <Header
            title="IMPORTANT TIPS"
            eyebrow="Field-tested"
            action={
              <Pressable
                style={s.pill}
                onPress={() => navigation.navigate('Favorites')}
              >
                <Text style={{ color: colors.pink }}>
                  ♥ {data.favorites.length}
                </Text>
              </Pressable>
            }
          />
          <Chips
            items={['All', ...new Set(tips.map(t => t.category))]}
            value={category}
            onChange={setCategory}
          />
        </>
      )}
      {!list.length && (
        <Empty
          title="No favorites yet"
          body="Tap the heart on any tip to keep it here."
          action={
            <Button label="Browse tips" onPress={() => navigation.goBack()} />
          }
        />
      )}
      {list.map((tip, i) => (
        <View key={tip.id} style={[s.card, { padding: 15 }]}>
          <Pressable
            onPress={() => setSelected(tip)}
            style={[s.row, { alignItems: 'flex-start' }]}
          >
            {!favorites && (
              <View
                style={{
                  backgroundColor: `${categoryColor(tip.category)}22`,
                  padding: 12,
                  borderRadius: 16,
                }}
              >
                <Text
                  style={[
                    s.section,
                    { color: categoryColor(tip.category), fontSize: 22 },
                  ]}
                >
                  {String(i + 1).padStart(2, '0')}
                </Text>
              </View>
            )}
            <View style={{ flex: 1, gap: 5 }}>
              <Text
                style={[
                  s.eyebrow,
                  { color: categoryColor(tip.category), fontSize: 9 },
                ]}
              >
                {tip.category}
              </Text>
              <Text style={[s.text, { fontWeight: '600' }]}>{tip.title}</Text>
              <Text style={s.small} numberOfLines={favorites ? 2 : undefined}>
                {tip.intro}
              </Text>
            </View>
            {favorites && (
              <Pressable
                accessibilityLabel="Remove favorite"
                onPress={() => toggle(tip.id)}
                style={s.pill}
              >
                <Text style={{ color: colors.pink }}>♥</Text>
              </Pressable>
            )}
          </Pressable>
          {!favorites && (
            <>
              <View style={s.divider} />
              <View style={s.between}>
                <View style={s.row}>
                  <Pressable
                    onPress={() => toggle(tip.id)}
                    style={[s.pill, { paddingHorizontal: 10 }]}
                  >
                    <Text
                      style={{
                        color: data.favorites.includes(tip.id)
                          ? colors.pink
                          : colors.muted,
                        fontSize: 12,
                      }}
                    >
                      {data.favorites.includes(tip.id) ? '♥ Saved' : '♡ Like'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => share(tip)}
                    style={[s.pill, { paddingHorizontal: 10 }]}
                  >
                    <Text style={s.small}>↥ Share</Text>
                  </Pressable>
                </View>
                <Pressable onPress={() => setSelected(tip)}>
                  <Text style={{ color: colors.orange, fontSize: 12 }}>
                    Read more ›
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      ))}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            backgroundColor: '#000000B8',
          }}
        >
          <Pressable
            accessibilityLabel="Close tip"
            style={{ flex: 1, minHeight: 60 }}
            onPress={() => setSelected(null)}
          />
          <View
            style={{
              maxHeight: layout.height - insets.top - 40,
              width: '100%',
              maxWidth: 620,
              alignSelf: 'center',
              backgroundColor: '#231C51',
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingBottom: insets.bottom + 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#ffffff35',
                borderRadius: 4,
                alignSelf: 'center',
                margin: 12,
              }}
            />
            <ScrollView
              contentContainerStyle={{
                padding: layout.padding,
                paddingBottom:
                  layout.padding + (Platform.OS === 'android' ? 40 : 0),
                gap: 16,
              }}
            >
              {selected && (
                <ContentReveal animationKey={selected.id} style={{ gap: 16 }}>
                  <View style={s.between}>
                    <View style={{ flex: 1, gap: 6 }}>
                      <Text
                        style={[
                          s.eyebrow,
                          { color: categoryColor(selected.category) },
                        ]}
                      >
                        {selected.category}
                      </Text>
                      <Text style={[s.section, { fontSize: 27 }]}>
                        {selected.title.toUpperCase()}
                      </Text>
                    </View>
                    <Pressable onPress={() => setSelected(null)} style={s.pill}>
                      <Text style={s.text}>×</Text>
                    </Pressable>
                  </View>
                  <Text style={s.body}>{selected.intro}</Text>
                  {selected.steps.map((step, i) => (
                    <View
                      key={step}
                      style={[
                        s.card,
                        s.row,
                        {
                          borderWidth: 0,
                          borderRadius: 14,
                          alignItems: 'flex-start',
                        },
                      ]}
                    >
                      <Text style={{ color: colors.pink }}>
                        {String(i + 1).padStart(2, '0')}
                      </Text>
                      <Text style={[s.body, { flex: 1, fontSize: 14 }]}>
                        {step}
                      </Text>
                    </View>
                  ))}
                  <View style={s.row}>
                    <Button
                      style={{ flex: 1 }}
                      label={
                        data.favorites.includes(selected.id)
                          ? '♥ In Favorites'
                          : '♡ Add to Favorites'
                      }
                      onPress={() => toggle(selected.id)}
                    />
                    <Button
                      style={{ flex: 1 }}
                      secondary
                      label="Share"
                      onPress={() => share(selected)}
                    />
                  </View>
                </ContentReveal>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
export function FavoritesScreen() {
  return <TipsScreen favorites />;
}
