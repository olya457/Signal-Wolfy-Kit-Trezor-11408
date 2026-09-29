import React, { useContext, useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { NavigationContext } from '@react-navigation/native';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  animationKey?: string | number;
};

export function ContentReveal({ children, style, animationKey }: Props) {
  const navigation = useContext(NavigationContext);
  const progress = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    let disposed = false;
    let request = 0;
    const reveal = async () => {
      const current = ++request;
      const reduced = await AccessibilityInfo.isReduceMotionEnabled().catch(
        () => false,
      );
      if (disposed || current !== request) return;
      progress.stopAnimation();
      if (reduced) {
        progress.setValue(1);
        return;
      }
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 360,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    };
    if (!navigation || navigation.isFocused()) reveal();
    const focus = navigation?.addListener('focus', reveal);
    const blur = navigation?.addListener('blur', () => {
      request++;
      progress.stopAnimation();
    });
    const motion = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      enabled => {
        if (enabled) {
          request++;
          progress.stopAnimation();
          progress.setValue(1);
        }
      },
    );
    return () => {
      disposed = true;
      request++;
      focus?.();
      blur?.();
      motion.remove();
      progress.stopAnimation();
    };
  }, [navigation, progress, animationKey]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
