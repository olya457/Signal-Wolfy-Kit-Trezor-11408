import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
export type SavedResult = {
  id: string;
  input: string;
  result: string;
  direction: 'encode' | 'decode';
  createdAt: string;
};
export type QuizResult = {
  score: number;
  correct: number;
  seconds: number;
  createdAt: string;
};
export type SignalSettings = {
  sound: boolean;
  haptic: boolean;
  flash: boolean;
  speed: string;
};
type Data = {
  settings: SignalSettings;
  onboarded: boolean;
  favorites: string[];
  saved: SavedResult[];
  history: QuizResult[];
};
const initial: Data = {
  settings: { sound: true, haptic: false, flash: true, speed: 'Normal' },
  onboarded: false,
  favorites: [],
  saved: [],
  history: [],
};
const key = '@signal-wolfy/state/v1';
const Context = createContext<{
  data: Data;
  ready: boolean;
  update: (change: (data: Data) => Data) => Promise<boolean>;
}>({ data: initial, ready: false, update: async () => false });
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Data>(initial);
  const [ready, setReady] = useState(false);
  const queue = useRef(Promise.resolve(true));
  const currentData = useRef<Data>(initial);
  const readable = useRef(true);
  useEffect(() => {
    AsyncStorage.getItem(key)
      .then(raw => {
        if (raw) {
          const parsed = JSON.parse(raw);
          const restored: Data = {
            settings: { ...initial.settings, ...parsed.settings },
            onboarded: parsed.onboarded === true,
            favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
            saved: Array.isArray(parsed.saved) ? parsed.saved : [],
            history: Array.isArray(parsed.history) ? parsed.history : [],
          };
          currentData.current = restored;
          setData(restored);
        }
      })
      .catch(() => {
        readable.current = false;
        Alert.alert(
          'Storage unavailable',
          'Your saved data could not be loaded. Please restart the app before making changes.',
        );
      })
      .finally(() => setReady(true));
  }, []);
  const update = (change: (data: Data) => Data) => {
    if (!readable.current) {
      Alert.alert(
        'Storage unavailable',
        'Restart the app to reload your data before making changes.',
      );
      return Promise.resolve(false);
    }
    const next = change(currentData.current);
    currentData.current = next;
    setData(next);
    queue.current = queue.current
      .then(async () => {
        await AsyncStorage.setItem(key, JSON.stringify(next));
        return true;
      })
      .catch(() => {
        Alert.alert(
          'Unable to save',
          'Check available device storage and try again.',
        );
        return false;
      });
    return queue.current;
  };
  return (
    <Context.Provider value={{ data, ready, update }}>
      {children}
    </Context.Provider>
  );
}
export const useApp = () => useContext(Context);
