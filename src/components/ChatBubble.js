import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS } from '../constants/colors';

const isWeb = Platform.OS === 'web';

const TypingDots = ({ color }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 400, useNativeDriver: false }),
          Animated.timing(dot, { toValue: 0.3, duration: 400, useNativeDriver: false }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 200);
    const a3 = animate(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, { backgroundColor: color, opacity: dot1 }]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: color, opacity: dot2 }]} />
      <Animated.View style={[styles.typingDot, { backgroundColor: color, opacity: dot3 }]} />
    </View>
  );
};

const AvatarCircle = ({ speaker, size = 36 }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isHakeem = speaker === 'حكيم';
  const bgColor = isHakeem ? COLORS.haqeem : COLORS.saail;
  const icon = isHakeem ? '📜' : '🌟';

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 0.9, duration: 1500, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: false }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <Animated.View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor, transform: [{ scale: pulseAnim }] },
      ]}
    >
      <Text style={[styles.avatarIcon, { fontSize: size * 0.45 }]}>{icon}</Text>
    </Animated.View>
  );
};

const ChatBubble = ({ speaker, text, delay = 0, isLast = false, onVisible }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const [showing, setShowing] = useState(false);

  const isHakeem = speaker === 'حكيم';

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowing(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: false }),
        Animated.timing(translateY, { toValue: 0, duration: 500, useNativeDriver: false }),
      ]).start(() => onVisible?.());
    }, delay);
    return () => clearTimeout(timer);
  }, []);

  if (!showing) return null;

  const borderRadius = isHakeem
    ? { borderTopLeftRadius: 4, borderTopRightRadius: 16, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }
    : { borderTopLeftRadius: 16, borderTopRightRadius: 4, borderBottomLeftRadius: 16, borderBottomRightRadius: 16 };

  return (
    <Animated.View
      style={[
        styles.container,
        isHakeem ? styles.hakeemRow : styles.saailRow,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      {isHakeem && <AvatarCircle speaker={speaker} size={32} />}

      <View style={[styles.bubbleWrapper, isHakeem ? styles.hakeemWrapper : styles.saailWrapper]}>
        <View
          style={[
            styles.bubble,
            isHakeem ? styles.hakeemBubble : styles.saailBubble,
            borderRadius,
          ]}
        >
          <Text style={[styles.text, isHakeem ? styles.hakeemText : styles.saailText]}>
            {text}
          </Text>
        </View>
        <Text style={[styles.time, isHakeem ? styles.hakeemTime : styles.saailTime]}>
          {isHakeem ? 'حكيم' : 'سائل'} · الآن
        </Text>
      </View>

      {!isHakeem && <AvatarCircle speaker={speaker} size={32} />}
    </Animated.View>
  );
};

const TypingIndicator = ({ speaker }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const isHakeem = speaker === 'حكيم';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: false }),
      Animated.timing(translateY, { toValue: 0, duration: 400, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.container, isHakeem ? styles.hakeemRow : styles.saailRow, { opacity, transform: [{ translateY }] }]}>
      {isHakeem && <AvatarCircle speaker={speaker} size={28} />}
      <View style={[styles.bubble, styles.typingBubble, isHakeem ? styles.hakeemBubble : styles.saailBubble]}>
        <TypingDots color={isHakeem ? COLORS.haqeemLight : COLORS.saailLight} />
      </View>
      {!isHakeem && <AvatarCircle speaker={speaker} size={28} />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 3,
    marginHorizontal: 8,
    alignItems: 'flex-end',
  },
  hakeemRow: {
    justifyContent: 'flex-start',
  },
  saailRow: {
    justifyContent: 'flex-end',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  avatarIcon: {},
  bubbleWrapper: {
    maxWidth: '75%',
  },
  hakeemWrapper: {
    marginLeft: 4,
  },
  saailWrapper: {
    marginRight: 4,
    alignItems: 'flex-end',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hakeemBubble: {
    backgroundColor: COLORS.otherMessage,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saailBubble: {
    backgroundColor: COLORS.myMessage,
    borderWidth: 1,
    borderColor: '#075E54',
  },
  text: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  hakeemText: {
    color: '#E0E0E0',
  },
  saailText: {
    color: '#FFFFFF',
  },
  time: {
    fontSize: 10,
    marginTop: 2,
    marginHorizontal: 4,
  },
  hakeemTime: {
    color: COLORS.textLight,
    textAlign: 'left',
  },
  saailTime: {
    color: COLORS.textLight,
    textAlign: 'right',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingBubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderTopLeftRadius: 4,
  },
});

export { TypingIndicator };
export default ChatBubble;