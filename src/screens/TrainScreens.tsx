import { ContentReveal } from '../components/ContentReveal';
import { useLayout } from '../hooks/useLayout';
import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  BackHandler,
  ImageBackground,
  Modal,
  ScrollView,
  Pressable,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootProps, RootStackParams } from '../navigation/types';
import { Button, Header, Screen } from '../components/UI';
import { assets } from '../data/assets';
import tips from '../data/tips.json';
import { colors, styles as s } from '../theme';
import { useApp } from '../state/AppState';
import { checkMatches, createQuiz, formatTime } from '../services/quiz';
const matchColors = [colors.orange, colors.blue, colors.purple, colors.gold];
export function TrainScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParams>>();
  const { data } = useApp();
  const day = new Date();
  const dayIndex = Math.floor(
    Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()) / 86400000,
  );
  const tip = tips[dayIndex % tips.length];
  const best = Math.max(0, ...data.history.map(h => h.score));
  return (
    <Screen>
      <Header title="TRAIN" eyebrow="Daily training" />
      <View
        style={[
          s.card,
          { padding: 0, overflow: 'hidden', backgroundColor: colors.panel },
        ]}
      >
        <ImageBackground
          source={assets.feature}
          style={{ height: 165, padding: 16 }}
        >
          <Text
            style={[
              s.eyebrow,
              {
                color: colors.gold,
                backgroundColor: '#00000080',
                padding: 8,
                borderRadius: 10,
                alignSelf: 'flex-start',
              },
            ]}
          >
            ✦ Daily tip ·{' '}
            {day.toLocaleDateString('en', { month: 'short', day: 'numeric' })}
          </Text>
        </ImageBackground>
        <View style={{ padding: 16, gap: 14 }}>
          <Text style={s.section}>{tip.title.toUpperCase()}</Text>
          <Text style={s.body}>{tip.intro}</Text>
          <Button
            label="▶ Start Match Quiz"
            onPress={() => navigation.navigate('Quiz')}
          />
        </View>
      </View>
      <View style={s.row}>
        {[
          ['Best', String(best)],
          ['Last', data.history.length ? String(data.history[0].score) : '—'],
          ['Max', '1000'],
        ].map(([label, value]) => (
          <View
            key={label}
            style={[s.card, { flex: 1, padding: 14, borderRadius: 17 }]}
          >
            <Text style={s.eyebrow}>{label}</Text>
            <Text
              style={[
                s.section,
                { color: label === 'Best' ? colors.gold : colors.text },
              ]}
            >
              {value}
            </Text>
          </View>
        ))}
      </View>
      <View style={s.card}>
        <Text style={s.section}>HOW IT WORKS</Text>
        {[
          ['4', 'Each task shows four items to match.'],
          ['5', 'Five answers — one is a decoy.'],
          ['10', 'Ten tasks. 25 points per first-try match.'],
        ].map(([n, text], i) => (
          <View key={n} style={s.row}>
            <Text
              style={{
                backgroundColor: `${matchColors[i]}25`,
                color: matchColors[i],
                padding: 9,
                borderRadius: 10,
              }}
            >
              {n}
            </Text>
            <Text style={[s.body, { flex: 1, fontSize: 14 }]}>{text}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
export function QuizScreen({ navigation }: RootProps<'Quiz'>) {
  const layout = useLayout();
  const { data, update } = useApp();
  const [tasks, setTasks] = useState(createQuiz);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(0);
  const [answers, setAnswers] = useState<number[]>([-1, -1, -1, -1]);
  const [wrong, setWrong] = useState<number[]>([]);
  const [missed, setMissed] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [paused, setPaused] = useState(false);
  const [complete, setComplete] = useState(false);
  const [finished, setFinished] = useState(false);
  const [earned, setEarned] = useState(0);
  const written = useRef(false);
  const submitted = useRef(false);
  const task = tasks[index];
  const best = Math.max(0, ...data.history.map(h => h.score));
  const priorBest = useRef(best);
  useEffect(() => {
    if (paused || complete || finished) return;
    const timer = setInterval(() => setSeconds(v => v + 1), 1000);
    return () => clearInterval(timer);
  }, [paused, complete, finished]);
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state !== 'active') setPaused(true);
    });
    const back = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!finished) {
        setPaused(true);
        return true;
      }
      return false;
    });
    return () => {
      sub.remove();
      back.remove();
    };
  }, [finished]);
  const restart = () => {
    setTasks(createQuiz());
    setIndex(0);
    setSelected(0);
    setAnswers([-1, -1, -1, -1]);
    setWrong([]);
    setMissed([]);
    setScore(0);
    setCorrectCount(0);
    setSeconds(0);
    setPaused(false);
    setComplete(false);
    setFinished(false);
    written.current = false;
    submitted.current = false;
    priorBest.current = best;
  };
  const check = () => {
    if (submitted.current) return;
    const result = checkMatches(answers, task.correct, missed);
    setWrong(result.wrong);
    setMissed(result.missed);
    if (!result.wrong.length) {
      submitted.current = true;
      setEarned(result.score);
      setScore(v => v + result.score);
      setCorrectCount(v => v + result.firstTry);
      setComplete(true);
    }
  };
  const next = () => {
    submitted.current = false;
    setComplete(false);
    if (index === 9) {
      setFinished(true);
      if (!written.current) {
        written.current = true;
        update(d => ({
          ...d,
          history: [
            {
              score,
              correct: correctCount,
              seconds,
              createdAt: new Date().toISOString(),
            },
            ...d.history,
          ].slice(0, 100),
        }));
      }
    } else {
      setIndex(v => v + 1);
      setAnswers([-1, -1, -1, -1]);
      setSelected(0);
      setWrong([]);
      setMissed([]);
    }
  };
  if (finished)
    return (
      <Screen
        animationKey="result"
        style={{
          flexGrow: 1,
          justifyContent: 'center',
          gap: 25,
          paddingBottom: 45,
        }}
      >
        <View style={{ alignItems: 'center', gap: 7 }}>
          <Text style={[s.eyebrow, { color: colors.gold }]}>Quiz complete</Text>
          <Text style={s.title}>
            {score >= 750
              ? 'SHARP OPERATOR'
              : score >= 400
              ? 'STEADY EXPLORER'
              : 'KEEP EXPLORING'}
          </Text>
        </View>
        <View
          style={{
            padding: 45,
            backgroundColor: colors.panel,
            borderRadius: 45,
            alignSelf: 'center',
            alignItems: 'center',
            marginVertical: 24,
          }}
        >
          <Text style={[s.title, { fontSize: 55, lineHeight: 65 }]}>
            {score}
          </Text>
          <Text style={s.small}>of 1000 pts</Text>
        </View>
        {score > priorBest.current && (
          <Text style={{ color: colors.gold, textAlign: 'center' }}>
            ✦ New best score
          </Text>
        )}
        <View style={s.row}>
          {[
            ['Correct', `${correctCount}/40`],
            ['Best', `${Math.max(best, score)}`],
            ['Time', formatTime(seconds)],
          ].map(([label, value]) => (
            <View
              key={label}
              style={[s.card, { flex: 1, padding: 12, alignItems: 'center' }]}
            >
              <Text style={s.small}>{label}</Text>
              <Text style={s.section}>{value}</Text>
            </View>
          ))}
        </View>
        <Button label="Restart Quiz" onPress={restart} />
        <Button
          label="Back to Train"
          secondary
          onPress={() => navigation.goBack()}
        />
      </Screen>
    );
  return (
    <Screen animationKey={`task-${index}`}>
      <View style={s.between}>
        <Pressable
          accessibilityLabel="Pause and exit quiz"
          onPress={() => setPaused(true)}
          style={s.pill}
        >
          <Text style={s.text}>‹</Text>
        </Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={s.eyebrow}>Match quiz</Text>
          <Text style={s.text}>Task {index + 1} of 10</Text>
        </View>
        <Pressable
          accessibilityLabel="Pause quiz"
          onPress={() => setPaused(true)}
          style={s.pill}
        >
          <Text style={s.text}>Ⅱ</Text>
        </Pressable>
      </View>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {tasks.map((_, i) => (
          <View
            key={i}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 4,
              backgroundColor: i <= index ? matchColors[i % 4] : '#ffffff20',
            }}
          />
        ))}
      </View>
      <View style={s.between}>
        <Text style={s.small}>◷ {formatTime(seconds)}</Text>
        <Text style={{ color: colors.gold }}>{score} pts</Text>
      </View>
      <View
        style={[
          s.card,
          { backgroundColor: colors.panel, borderColor: '#9658ED80' },
        ]}
      >
        <Text style={[s.eyebrow, { color: colors.purple }]}>Match & learn</Text>
        <Text style={s.section}>{task.title.toUpperCase()}</Text>
        <Text style={s.small}>
          Tap an item, then its answer. One answer is extra.
        </Text>
      </View>
      <View style={{ gap: 9 }}>
        {task.items.map((item, i) => (
          <Pressable
            key={item}
            onPress={() => setSelected(i)}
            style={[
              s.card,
              s.between,
              {
                borderRadius: 14,
                padding: 12,
                borderColor: wrong.includes(i)
                  ? colors.pink
                  : selected === i
                  ? matchColors[i]
                  : colors.border,
                backgroundColor: wrong.includes(i) ? '#FF4C7A15' : '#ffffff08',
              },
            ]}
          >
            <View style={[s.row, { flex: 1 }]}>
              <Text
                style={{
                  backgroundColor: matchColors[i],
                  color: colors.background,
                  paddingHorizontal: 9,
                  paddingVertical: 5,
                  borderRadius: 8,
                  fontWeight: '700',
                }}
              >
                {i + 1}
              </Text>
              <Text style={[s.text, { fontSize: 14, flex: 1 }]}>{item}</Text>
            </View>
            <Text
              style={{
                color: answers[i] === -1 ? colors.muted : matchColors[i],
                fontSize: 12,
                maxWidth: '48%',
                textAlign: 'right',
              }}
            >
              {answers[i] === -1
                ? selected === i
                  ? 'Pick an answer ↓'
                  : 'Tap to select'
                : task.answers[answers[i]]}
            </Text>
          </Pressable>
        ))}
      </View>
      <Text style={[s.eyebrow, { marginTop: 6 }]}>Answers</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {task.answers.map((answer, i) => {
          const owner = answers.indexOf(i);
          return (
            <Pressable
              key={`${answer}-${i}`}
              style={[
                s.pill,
                { borderRadius: 12, padding: 12 },
                owner !== -1 && { borderColor: matchColors[owner] },
              ]}
              onPress={() => {
                setAnswers(current =>
                  current.map((v, j) =>
                    j === selected ? i : v === i ? -1 : v,
                  ),
                );
                setWrong(current => current.filter(v => v !== selected));
                const nextEmpty = answers.findIndex(
                  (v, j) => j !== selected && v === -1,
                );
                if (nextEmpty !== -1) setSelected(nextEmpty);
              }}
            >
              <Text style={{ color: colors.text, fontSize: 13 }}>
                {owner !== -1 ? `${owner + 1}  ` : ''}
                {answer}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {!!wrong.length && (
        <Text style={{ color: colors.pink, fontSize: 13 }}>
          {wrong.length} match(es) incorrect — fix the red items and check
          again.
        </Text>
      )}
      <Button
        label="Check matches"
        disabled={answers.includes(-1)}
        onPress={check}
      />
      <Modal
        transparent
        visible={paused || complete}
        animationType="fade"
        onRequestClose={() => {
          if (paused) setPaused(false);
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: `${colors.background}E8`,
            justifyContent: 'center',
            paddingVertical: 24,
            paddingHorizontal: layout.padding,
          }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          >
            <ContentReveal
              animationKey={`${paused}-${complete}`}
              style={{ width: '100%', maxWidth: 580, alignSelf: 'center' }}
            >
              {complete ? (
                <View
                  style={[
                    s.card,
                    {
                      padding: 25,
                      backgroundColor: colors.panel,
                      gap: 20,
                      alignItems: 'center',
                    },
                  ]}
                >
                  <View
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 35,
                      backgroundColor: colors.green,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: 'white', fontSize: 40 }}>✓</Text>
                  </View>
                  <Text
                    style={[
                      s.title,
                      { textAlign: 'center' },
                      layout.compact && { fontSize: 28, lineHeight: 33 },
                    ]}
                  >
                    TASK {index + 1} COMPLETE
                  </Text>
                  <Text style={[s.body, { textAlign: 'center' }]}>
                    {earned === 100
                      ? 'Perfect — all four matched on the first try.'
                      : 'All matched. Keep building your knowledge.'}
                  </Text>
                  <Text style={{ color: colors.gold }}>
                    {earned} pts · {score} total
                  </Text>
                  <Button
                    style={{ alignSelf: 'stretch' }}
                    label={index === 9 ? 'See results' : 'Next task'}
                    onPress={next}
                  />
                </View>
              ) : (
                <View style={{ gap: 18, alignItems: 'stretch' }}>
                  <Text
                    style={[s.title, { textAlign: 'center', fontSize: 50 }]}
                  >
                    Ⅱ
                  </Text>
                  <Text style={[s.title, { textAlign: 'center' }]}>PAUSED</Text>
                  <Text style={[s.small, { textAlign: 'center' }]}>
                    Task {index + 1} of 10 · {score} pts · {formatTime(seconds)}
                  </Text>
                  <Button label="Resume" onPress={() => setPaused(false)} />
                  <Button label="Restart quiz" secondary onPress={restart} />
                  <Pressable
                    onPress={() => navigation.goBack()}
                    style={{ padding: 16 }}
                  >
                    <Text style={{ color: colors.pink, textAlign: 'center' }}>
                      Quit to Train
                    </Text>
                  </Pressable>
                </View>
              )}
            </ContentReveal>
          </ScrollView>
        </View>
      </Modal>
    </Screen>
  );
}
