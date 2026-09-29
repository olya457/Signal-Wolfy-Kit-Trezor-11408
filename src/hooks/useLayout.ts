import { useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useLayout() {
  const { width, height, fontScale } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const availableWidth = width - insets.left - insets.right;
  const compact = availableWidth < 375;
  const short = height - insets.top - insets.bottom < 650;
  const padding = compact ? 14 : 20;
  const contentWidth = Math.min(availableWidth, 620) - padding * 2;
  const largeText = fontScale > 1.3;
  const columns = contentWidth < 280 || largeText ? 1 : 2;
  const letterColumns = compact || largeText ? 2 : 3;
  return {
    width,
    height,
    compact,
    short,
    padding,
    contentWidth,
    largeText,
    columns,
    letterColumns,
    gridWidth: (count: number, gap = 12) =>
      (contentWidth - gap * (count - 1)) / count,
  };
}
