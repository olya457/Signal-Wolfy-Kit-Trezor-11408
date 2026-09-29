import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppProvider, useApp } from '../src/state/AppState';
jest.mock('@react-native-async-storage/async-storage', () => {
  const values = new Map<string, string>();
  return {
    getItem: jest.fn(async (key: string) => values.get(key) ?? null),
    setItem: jest.fn(async (key: string, value: string) => {
      values.set(key, value);
    }),
    clear: jest.fn(async () => {
      values.clear();
    }),
  };
});
let state: ReturnType<typeof useApp>;
function Probe() {
  state = useApp();
  return null;
}
test('starts empty and restores user favorites after remount', async () => {
  await AsyncStorage.clear();
  let tree: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
  });
  expect(state!.ready).toBe(true);
  expect(state!.data.saved).toEqual([]);
  expect(state!.data.history).toEqual([]);
  await act(async () => {
    state!.update(d => ({ ...d, favorites: ['3'] }));
  });
  await act(async () => {
    tree!.unmount();
  });
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
  });
  expect(state!.data.favorites).toEqual(['3']);
  await act(async () => tree!.unmount());
});

test('reports a failed storage write and allows the next save to succeed', async () => {
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  let tree: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    tree = ReactTestRenderer.create(
      <AppProvider>
        <Probe />
      </AppProvider>,
    );
  });
  jest
    .mocked(AsyncStorage.setItem)
    .mockRejectedValueOnce(new Error('Storage full'));
  await act(async () => {
    expect(await state.update(d => ({ ...d, onboarded: true }))).toBe(false);
  });
  expect(alert).toHaveBeenCalledWith(
    'Unable to save',
    'Check available device storage and try again.',
  );
  await act(async () => {
    expect(await state.update(d => ({ ...d, onboarded: true }))).toBe(true);
  });
  await act(async () => tree!.unmount());
  alert.mockRestore();
});
