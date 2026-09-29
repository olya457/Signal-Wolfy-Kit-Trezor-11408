import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
export type RootStackParams = {
  Main: NavigatorScreenParams<TabParams> | undefined;
  Saved: undefined;
  Flag: { id: string };
  Article: { id: string };
  Favorites: undefined;
  Quiz: undefined;
};
export type RootProps<T extends keyof RootStackParams> = NativeStackScreenProps<
  RootStackParams,
  T
>;
export type TabParams = {
  Morse: { mode?: 'Converter' } | undefined;
  Flags: undefined;
  Guide: undefined;
  Train: undefined;
  Tips: undefined;
};
