import { decode, encode, morse, signalTimeline } from '../src/services/morse';
test('round-trips every supported letter, digit and punctuation', () => {
  const text = Object.keys(morse).join('');
  expect(decode(encode(text).value)).toEqual({ value: text, error: '' });
});
test('normalizes words and supports pasted Unicode Morse', () => {
  expect(encode('  sos\n wolfy  ').value).toBe(
    '... --- ... / .-- --- .-.. ..-. -.--',
  );
  expect(decode('··· ——— ··· / ·—— ——— ·—·· ··—· —·——').value).toBe(
    'SOS WOLFY',
  );
});
test('reports unsupported input rather than silently losing characters', () => {
  expect(encode('Hi 😀').error).toContain('😀');
  expect(decode('......').error).toContain('......');
  expect(encode('').value).toBe('');
  expect(decode('').value).toBe('');
});
test('uses exact Morse element, letter and word timing', () => {
  expect(signalTimeline('.- . / -', 100)).toEqual([
    { on: true, duration: 100 },
    { on: false, duration: 100 },
    { on: true, duration: 300 },
    { on: false, duration: 300 },
    { on: true, duration: 100 },
    { on: false, duration: 700 },
    { on: true, duration: 300 },
  ]);
});
