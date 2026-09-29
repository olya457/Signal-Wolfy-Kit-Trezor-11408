import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSignal } from '../services/SignalPlayer';
import { colors, styles as s } from '../theme';

export function SignalFeedback({ controls = false }: { controls?: boolean }) {
  const player = useSignal();
  return (
    <View style={{ gap: 10 }}>
      {controls && (
        <View style={[s.row, { flexWrap: 'wrap', gap: 6 }]}>
          {(['sound', 'haptic', 'flash'] as const).map(channel => (
            <Pressable
              key={channel}
              accessibilityRole="switch"
              accessibilityLabel={channel}
              accessibilityState={{ checked: player.settings[channel] }}
              onPress={() =>
                player.setSettings(current => ({
                  ...current,
                  [channel]: !current[channel],
                }))
              }
              style={[
                s.pill,
                { paddingHorizontal: 10, paddingVertical: 8 },
                player.settings[channel] && s.activePill,
              ]}
            >
              <Text style={s.small}>
                {channel[0].toUpperCase() + channel.slice(1)}{' '}
                {player.settings[channel] ? 'on' : 'off'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      {player.playing && (
        <View style={{ gap: 8 }}>
          <Text accessibilityLiveRegion="polite" style={s.small}>
            Playing signal… {Math.round(player.progress * 100)}%
          </Text>
          <View
            style={{
              height: 8,
              borderRadius: 4,
              backgroundColor: player.lit ? colors.gold : '#ffffff18',
            }}
          />
        </View>
      )}
      {!!player.error && (
        <Text
          accessibilityRole="alert"
          style={{ color: colors.pink, fontSize: 13, lineHeight: 20 }}
        >
          {player.error}
        </Text>
      )}
    </View>
  );
}
