import { Platform, StyleSheet } from 'react-native';
export const colors = {
  background: '#0B0920',
  panel: '#1B1930',
  border: '#ffffff25',
  text: '#FAF9FF',
  muted: '#ABA8BE',
  orange: '#FF873C',
  pink: '#FF4C7A',
  gold: '#FFC34B',
  purple: '#9658ED',
  blue: '#5885FF',
  green: '#26CA98',
};
export const heading = {
  fontFamily:
    Platform.OS === 'ios'
      ? 'AvenirNextCondensed-HeavyItalic'
      : 'sans-serif-condensed',
  fontWeight: '900' as const,
  fontStyle: 'italic' as const,
};
export const styles = StyleSheet.create({
  page: { flex: 1 },
  content: {
    padding: 20,
    paddingBottom: 30,
    gap: 16,
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
  },
  title: { ...heading, color: colors.text, fontSize: 34, lineHeight: 39 },
  section: { ...heading, color: colors.text, fontSize: 22 },
  text: { color: colors.text, fontSize: 16, lineHeight: 23 },
  body: { color: colors.muted, fontSize: 15, lineHeight: 24 },
  small: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2,
    color: colors.orange,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ffffff09',
    gap: 12,
  },
  input: {
    color: colors.text,
    fontSize: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#ffffff10',
    borderWidth: 1,
    borderColor: colors.border,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#ffffff08',
  },
  activePill: { borderColor: colors.orange, backgroundColor: '#FF873C20' },
  divider: { height: 1, backgroundColor: colors.border },
  empty: {
    padding: 34,
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    gap: 14,
  },
});
