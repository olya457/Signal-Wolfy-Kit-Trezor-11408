export const morse: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
};
const reverse = Object.fromEntries(
  Object.entries(morse).map(([k, v]) => [v, k]),
);
export function encode(text: string) {
  const unsupported = [
    ...new Set([...text.toUpperCase()].filter(c => !morse[c] && !/\s/.test(c))),
  ];
  return {
    value: text
      .trim()
      .toUpperCase()
      .split(/\s+/)
      .map(word => [...word].map(c => morse[c] || '�').join(' '))
      .join(' / '),
    error: unsupported.length
      ? `Unsupported characters: ${unsupported.join(' ')}`
      : '',
  };
}
export function decode(text: string) {
  const clean = text.trim().replace(/[·•]/g, '.').replace(/[—–]/g, '-');
  const unknown: string[] = [];
  const value = clean
    .split(/\s*\/\s*|\s{3,}/)
    .map(word =>
      word
        .split(/\s+/)
        .map(code => {
          if (!code) return '';
          if (!reverse[code]) unknown.push(code);
          return reverse[code] || '�';
        })
        .join(''),
    )
    .join(' ');
  return {
    value,
    error: unknown.length ? `Unrecognized Morse: ${unknown.join(', ')}` : '',
  };
}
export function signalTimeline(code: string, unit: number) {
  const events: { on: boolean; duration: number }[] = [];
  code
    .trim()
    .split(/\s*\/\s*/)
    .forEach((word, wi) => {
      if (wi) events.push({ on: false, duration: unit * 7 });
      word
        .trim()
        .split(/\s+/)
        .forEach((letter, li) => {
          if (li) events.push({ on: false, duration: unit * 3 });
          [...letter].forEach((symbol, si) => {
            if (si) events.push({ on: false, duration: unit });
            events.push({
              on: true,
              duration: unit * (symbol === '-' ? 3 : 1),
            });
          });
        });
    });
  return events;
}
