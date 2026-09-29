import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, Vibration, View } from 'react-native';
import {
  WebView,
  WebViewMessageEvent,
  WebViewProps,
} from 'react-native-webview';
import { signalTimeline } from './morse';
import { SignalClock, SignalEvent } from './signalClock';
import { signalAudioSource } from './signalAudio';
import { useApp, SignalSettings as Settings } from '../state/AppState';

type Player = {
  playing: boolean;
  lit: boolean;
  active: string;
  progress: number;
  error: string;
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  play: (code: string, label?: string) => void;
  stop: () => void;
};
type Playback = { id: number; events: SignalEvent[]; settings: Settings };
const Context = createContext<Player>(null as unknown as Player);

export function SignalProvider({ children }: { children: React.ReactNode }) {
  const web = useRef<WebView<WebViewProps>>(null);
  const clock = useRef(new SignalClock()).current;
  const ready = useRef(false);
  const sequence = useRef(0);
  const request = useRef<Playback | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [playing, setPlaying] = useState(false);
  const [lit, setLit] = useState(false);
  const [active, setActive] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const { data, update } = useApp();
  const settings = data.settings;
  const stop = useCallback(() => {
    sequence.current++;
    request.current = null;
    clearTimeout(timeout.current);
    clock.stop();
    web.current?.injectJavaScript('stopSignal();true;');
    Vibration.cancel();
    setPlaying(false);
    setLit(false);
    setActive('');
    setProgress(0);
  }, [clock]);
  const fail = useCallback(
    (message: string) => {
      stop();
      setError(message);
    },
    [stop],
  );
  const startClock = (playback: Playback) => {
    clearTimeout(timeout.current);
    clock.start(
      playback.events,
      (event, value) => {
        if (request.current?.id !== playback.id) return;
        setProgress(value);
        setLit(event.on && playback.settings.flash);
        if (playback.settings.haptic) {
          if (event.on) Vibration.vibrate(event.duration);
          else Vibration.cancel();
        }
      },
      () => {
        if (request.current?.id === playback.id) {
          stop();
          setProgress(1);
        }
      },
    );
  };
  const sendAudio = (playback: Playback) =>
    web.current?.injectJavaScript(
      `playSignal(${playback.id},${JSON.stringify(playback.events)});true;`,
    );
  const play = (code: string, label = '') => {
    stop();
    setError('');
    const events = signalTimeline(
      code,
      settings.speed === 'Slow' ? 180 : settings.speed === 'Fast' ? 65 : 110,
    );
    if (!events.length) return;
    if (!settings.sound && !settings.haptic && !settings.flash) {
      setError('Enable Sound, Haptic or Flash before playing.');
      return;
    }
    const playback = {
      id: ++sequence.current,
      events,
      settings: { ...settings },
    };
    request.current = playback;
    setPlaying(true);
    setActive(label);
    if (!settings.sound) {
      startClock(playback);
      return;
    }
    timeout.current = setTimeout(() => {
      if (request.current?.id === playback.id)
        fail(
          'Audio did not start. Try again, or turn Sound off to use Flash and Haptic.',
        );
    }, 5000);
    if (ready.current) sendAudio(playback);
  };
  const onMessage = (event: WebViewMessageEvent) => {
    let message: { type: string; id?: number; message?: string };
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      return;
    }
    if (message.type === 'ready') {
      ready.current = true;
      const playback = request.current;
      if (playback?.settings.sound) sendAudio(playback);
      return;
    }
    const playback = request.current;
    if (!playback || message.id !== playback.id) return;
    if (message.type === 'started') startClock(playback);
    if (message.type === 'error')
      fail(message.message || 'Unable to play audio.');
  };
  const setSettings: React.Dispatch<
    React.SetStateAction<Settings>
  > = change => {
    stop();
    setError('');
    update(current => ({
      ...current,
      settings:
        typeof change === 'function' ? change(current.settings) : change,
    }));
  };
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state !== 'active') stop();
    });
    return () => {
      subscription.remove();
      clearTimeout(timeout.current);
      clock.stop();
      Vibration.cancel();
    };
  }, [clock, stop]);
  return (
    <Context.Provider
      value={{
        playing,
        lit,
        active,
        progress,
        error,
        settings,
        setSettings,
        play,
        stop,
      }}
    >
      {children}
      <View
        pointerEvents="none"
        accessible={false}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          width: 2,
          height: 2,
          opacity: 0.01,
          bottom: 0,
        }}
      >
        <WebView<WebViewProps>
          ref={web}
          source={signalAudioSource}
          style={{ width: 2, height: 2 }}
          javaScriptEnabled
          scrollEnabled={false}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback
          onMessage={onMessage}
          onLoadStart={() => {
            ready.current = false;
          }}
          onError={() => {
            ready.current = false;
            if (request.current)
              fail(
                'The audio engine could not load. Turn Sound off to use Flash and Haptic.',
              );
          }}
          onContentProcessDidTerminate={() => {
            ready.current = false;
            stop();
            web.current?.reload();
          }}
          onRenderProcessGone={() => {
            ready.current = false;
            stop();
            web.current?.reload();
          }}
        />
      </View>
    </Context.Provider>
  );
}
export const useSignal = () => useContext(Context);
