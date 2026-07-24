import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';

const isWeb = Platform.OS === 'web';

const TopicCard = ({ item, onPress, index = 0 }) => {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 60, delay: index * 200, useNativeDriver: false }),
      Animated.timing(opacity, { toValue: 1, duration: 600, delay: index * 200, useNativeDriver: false }),
    ]).start();
  }, []);

  const cardShadow = isWeb
    ? { boxShadow: `0 0 30px ${item.color}20, 0 8px 32px rgba(0,0,0,0.5)` }
    : { shadowColor: item.color, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 24, elevation: 12 };

  return (
    <Animated.View style={[styles.wrapper, { opacity, transform: [{ scale }, { perspective: 1000 }] }]}>
      <TouchableOpacity activeOpacity={0.9} onPress={() => onPress?.(item)}>
        <LinearGradient
          colors={[item.color, item.color + '99']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 1.2 }}
          style={[styles.card, cardShadow]}
        >
          <View style={styles.overlayGlow} />
          <View style={styles.topSection}>
            <LinearGradient colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']} style={styles.iconRing}>
              <Text style={styles.icon}>{item.icon}</Text>
            </LinearGradient>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>اكتشف ←</Text>
            </View>
          </View>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
          <View style={styles.decorLine} />
          <View style={styles.bottomRow}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>{item.count || ''}</Text>
            </View>
            <Text style={styles.hint}>اضغط لبدء الحوار</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  card: {
    borderRadius: 28,
    padding: 24,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 180,
  },
  overlayGlow: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  icon: {
    fontSize: 26,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  decorLine: {
    width: 50,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
    borderRadius: 2,
    marginTop: 16,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stat: {},
  statNum: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  hint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default TopicCard;