import React, { useContext } from 'react';
import { HeaderHeightContext } from '@react-navigation/elements';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  useSafeAreaInsets,
  SafeAreaView,
} from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { ContentReveal } from './ContentReveal';
import { useLayout } from '../hooks/useLayout';
import { colors, styles as s } from '../theme';
export function Screen({
  children,
  scroll = true,
  style,
  animationKey,
  extraBottomPadding = 0,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  animationKey?: string | number;
  extraBottomPadding?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const layout = useLayout();
  const headerHeight = useContext(HeaderHeightContext) ?? 0;
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.page, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={headerHeight ? ['left', 'right'] : ['top', 'left', 'right']}
        style={s.page}
      >
        <KeyboardAvoidingView
          style={s.page}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={headerHeight}
        >
          {scroll ? (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }}
              keyboardDismissMode="on-drag"
            >
              <ContentReveal
                animationKey={animationKey}
                style={[
                  s.content,
                  {
                    padding: layout.padding,
                    gap: layout.compact ? 12 : 16,
                    paddingBottom:
                      Math.max(24, insets.bottom) + extraBottomPadding,
                  },
                  style,
                ]}
              >
                {children}
              </ContentReveal>
            </ScrollView>
          ) : (
            <ContentReveal animationKey={animationKey} style={[s.page, style]}>
              {children}
            </ContentReveal>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  style,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { compact } = useLayout();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
          minHeight: 48,
          minWidth: 44,
          flexShrink: 0,
          justifyContent: 'center',
          borderRadius: 16,
          overflow: 'hidden',
        },
        secondary && ui.secondary,
        style,
      ]}
    >
      {!secondary && (
        <LinearGradient
          pointerEvents="none"
          colors={[colors.orange, colors.pink, colors.purple]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <View style={[ui.button, compact && { paddingHorizontal: 12 }]}>
        <Text style={ui.buttonText}>{label}</Text>
      </View>
    </Pressable>
  );
}
export function Header({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  const { compact } = useLayout();
  return (
    <View style={s.between}>
      <View style={{ flex: 1, gap: 5 }}>
        <Text style={s.eyebrow}>{eyebrow}</Text>
        <Text style={[s.title, compact && { fontSize: 29, lineHeight: 34 }]}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
}
export function Chips({
  items,
  value,
  onChange,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
    >
      {items.map(item => (
        <Pressable
          key={item}
          accessibilityRole="button"
          accessibilityState={{ selected: value === item }}
          onPress={() => onChange(item)}
          style={[s.pill, item === value && s.activePill]}
        >
          <Text style={{ color: colors.text, fontSize: 13 }}>{item}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
export function Empty({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <View style={s.empty}>
      <Icon name="heart" color={colors.pink} size={32} />
      <Text style={s.text}>{title}</Text>
      <Text style={[s.small, { textAlign: 'center' }]}>{body}</Text>
      {action}
    </View>
  );
}
export function Icon({
  name,
  color = colors.muted,
  size = 24,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.8}
    >
      {name === 'Morse' ? (
        <>
          <Circle cx="5" cy="12" r="2" fill={color} />
          <Line
            x1="12"
            y1="12"
            x2="21"
            y2="12"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </>
      ) : name === 'Flags' ? (
        <>
          <Path d="M5 22V3M5 4h15l-4 5 4 5H5" fill={color} />
        </>
      ) : name === 'Guide' ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Path d="m16 8-3 5-5 3 3-5Z" fill={color} />
        </>
      ) : name === 'Train' ? (
        <>
          <Circle cx="12" cy="12" r="9" />
          <Circle cx="12" cy="12" r="5" />
          <Circle cx="12" cy="12" r="1" fill={color} />
        </>
      ) : name === 'heart' ? (
        <Path d="M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13Z" />
      ) : (
        <Path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill={color} />
      )}
    </Svg>
  );
}
export function Back({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{ paddingVertical: 8, minHeight: 44 }}
    >
      <Text style={{ color: colors.orange, fontSize: 17 }}>‹ {title}</Text>
    </Pressable>
  );
}
const ui = StyleSheet.create({
  button: {
    paddingHorizontal: 22,
    paddingVertical: 14,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ffffff08',
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
    flexShrink: 0,
  },
});
