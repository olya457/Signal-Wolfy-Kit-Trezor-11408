const vm = jest.requireActual('node:vm');
import { SignalClock } from '../src/services/signalClock';
import { signalTimeline } from '../src/services/morse';
import { signalAudioSource } from '../src/services/signalAudio';

afterEach(() => jest.useRealTimers());

test('plays the full signal without treating its initial reset as completion', () => {
  jest.useFakeTimers();
  const clock = new SignalClock();
  const event = jest.fn();
  const done = jest.fn();
  clock.start(signalTimeline('- . ... -', 100), event, done);
  expect(event.mock.calls[0][0]).toEqual({ on: true, duration: 300 });
  expect(done).not.toHaveBeenCalled();
  jest.runAllTimers();
  expect(event.mock.calls.filter(([value]) => value.on)).toHaveLength(6);
  expect(done).toHaveBeenCalledTimes(1);
});

test('stop cancels pending flashes, and replacing playback cannot finish the new signal', () => {
  jest.useFakeTimers();
  const clock = new SignalClock();
  const oldDone = jest.fn();
  const nextDone = jest.fn();
  const nextEvent = jest.fn();
  clock.start(signalTimeline('---', 100), jest.fn(), oldDone);
  jest.advanceTimersByTime(50);
  clock.start(signalTimeline('.', 100), nextEvent, nextDone);
  jest.runAllTimers();
  expect(oldDone).not.toHaveBeenCalled();
  expect(nextDone).toHaveBeenCalledTimes(1);
  clock.start(signalTimeline('...', 100), nextEvent, nextDone);
  clock.stop();
  const count = nextEvent.mock.calls.length;
  jest.runAllTimers();
  expect(nextEvent).toHaveBeenCalledTimes(count);
  expect(nextDone).toHaveBeenCalledTimes(1);
});

function audioHarness(resumeFails = false) {
  const messages: { type: string; id?: number; message?: string }[] = [];
  const gain = {
    value: 0,
    setValueAtTime: jest.fn(),
    linearRampToValueAtTime: jest.fn(),
    cancelScheduledValues: jest.fn(),
  };
  class AudioContext {
    currentTime = 0;
    state = 'suspended';
    destination = {};
    createGain() {
      return { gain, connect: jest.fn() };
    }
    createOscillator() {
      return { frequency: { value: 0 }, connect: jest.fn(), start: jest.fn() };
    }
    async resume() {
      if (resumeFails) throw new Error('Audio suspended');
      this.state = 'running';
    }
  }
  const context = vm.createContext({
    window: {
      AudioContext,
      ReactNativeWebView: {
        postMessage: (data: string) => messages.push(JSON.parse(data)),
      },
    },
  });
  vm.runInContext(
    signalAudioSource.html.match(/<script>([\s\S]*)<\/script>/)![1],
    context,
  );
  return { context, messages, gain };
}

test('audio engine reports readiness and schedules actual tones before reporting started', async () => {
  const { context, messages, gain } = audioHarness();
  expect(messages).toEqual([{ type: 'ready' }]);
  await context.playSignal(7, signalTimeline('.-', 100));
  expect(messages).toEqual([{ type: 'ready' }, { type: 'started', id: 7 }]);
  expect(gain.linearRampToValueAtTime).toHaveBeenCalledTimes(4);
  context.stopSignal();
  expect(gain.cancelScheduledValues).toHaveBeenCalled();
});

test('audio failures are reported instead of silently claiming playback', async () => {
  const { context, messages } = audioHarness(true);
  await context.playSignal(8, signalTimeline('.', 100));
  expect(messages.at(-1)).toEqual({
    type: 'error',
    id: 8,
    message: 'Audio suspended',
  });
  expect(messages.some(message => message.type === 'started')).toBe(false);
});
