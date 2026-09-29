import { checkMatches, createQuiz } from '../src/services/quiz';
import questions from '../src/data/questions.json';
import flags from '../src/data/flags.json';
import { morse } from '../src/services/morse';
test('creates ten unique tasks with four valid matches and one decoy', () => {
  const quiz = createQuiz();
  expect(quiz).toHaveLength(10);
  expect(new Set(quiz.map(q => q.id)).size).toBe(10);
  for (const q of questions) {
    expect(q.items).toHaveLength(4);
    expect(q.answers).toHaveLength(5);
    expect(new Set(q.correct).size).toBe(4);
    q.correct.forEach(v => expect(q.answers[v]).toBeTruthy());
  }
});
test('awards points only to matches correct on their first submitted attempt', () => {
  const first = checkMatches([0, 1, 3, 2], [0, 1, 2, 3], []);
  expect(first.wrong).toEqual([2, 3]);
  const second = checkMatches([0, 1, 2, 3], [0, 1, 2, 3], first.missed);
  expect(second.score).toBe(50);
  expect(second.firstTry).toBe(2);
  expect(checkMatches([0, 1, 2, 3], [0, 1, 2, 3], []).score).toBe(100);
});
test('all provided flag codes match the converter alphabet', () => {
  expect(flags).toHaveLength(36);
  for (const f of flags) {
    expect(
      f.morse.replace(/ /g, '').replace(/·/g, '.').replace(/—/g, '-'),
    ).toBe(morse[f.letter]);
  }
});
