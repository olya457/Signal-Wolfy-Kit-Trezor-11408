import questions from '../data/questions.json';
export function createQuiz() {
  const result = [...questions];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.slice(0, 10);
}
export function checkMatches(
  answers: number[],
  correct: number[],
  missed: number[],
) {
  const wrong = correct.flatMap((value, index) =>
    answers[index] !== value ? [index] : [],
  );
  const nextMissed = [...new Set([...missed, ...wrong])];
  return {
    wrong,
    missed: nextMissed,
    score: wrong.length ? 0 : (4 - nextMissed.length) * 25,
    firstTry: 4 - nextMissed.length,
  };
}
export const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
