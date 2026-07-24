import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated, StatusBar, SafeAreaView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import TopicCard from '../components/TopicCard';
import { COLORS } from '../constants/colors';

const isWeb = Platform.OS === 'web';

const TOPICS = [
  { key: 'prophet', title: 'النبي محمد ﷺ', subtitle: 'خاتم الأنبياء والمرسلين', icon: '🕊️', color: '#2E7D32', screen: 'Prophet', count: '12 حواراً' },
  { key: 'sahaba', title: 'الصحابة الكرام', subtitle: 'رضي الله عنهم وأرضاهم', icon: '🤝', color: '#1565C0', screen: 'Sahaba', count: '10 صحابياً' },
  { key: 'ghazwat', title: 'الغزوات النبوية', subtitle: 'بطولات وانتصارات الإسلام', icon: '⚔️', color: '#C62828', screen: 'Ghazwat', count: '11 غزوة' },
  { key: 'ummahat', title: 'أمهات المؤمنين', subtitle: 'زوجات النبي الطاهرات', icon: '👑', color: '#7B1FA2', screen: 'Ummahat', count: '11 أماً' },
  { key: 'videos', title: 'الفيديوهات', subtitle: 'مقاطع مرئية وثائقية', icon: '🎬', color: '#E65100', screen: 'Videos', count: '5 فيديوهات' },
];

const FloatingOrnament = ({ delay, size, left, top, color }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 3000, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 3000, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -15] });
  const opacity2 = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.3, 0.15] });

  return (
    <Animated.View style={[styles.ornament, { left, top, width: size, height: size, borderRadius: size / 2, opacity: opacity2, transform: [{ translateY }] }]} />
  );
};

const Header = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: false }),
      Animated.timing(slideAnim, { toValue: 0, duration: 1000, useNativeDriver: false }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.headerOuter, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <LinearGradient
        colors={['#0D1117', '#161B22']}
        style={StyleSheet.absoluteFill}
      />
      <FloatingOrnament delay={0} size={60} left="10%" top="10%" color="#2E7D32" />
      <FloatingOrnament delay={1000} size={40} left="75%" top="15%" color="#1565C0" />
      <FloatingOrnament delay={2000} size={50} left="20%" top="60%" color="#C62828" />
      <FloatingOrnament delay={1500} size={35} left="80%" top="70%" color="#7B1FA2" />

      <View style={styles.headerContent}>
        <View style={styles.logoWrap}>
          <LinearGradient colors={['#2E7D32', '#1565C0']} style={styles.logoCircle} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.logoIcon}>🕌</Text>
          </LinearGradient>
        </View>
        <Text style={styles.headerTitle}>تاريخ الإسلام</Text>
        <Text style={styles.headerSubtitle}>رحلة في سيرة النبي ﷺ والصحابة{'\n'}والغزوات وأمهات المؤمنين والفيديوهات</Text>
        <View style={styles.divider}>
          <View style={styles.dividerDot} />
          <View style={styles.dividerLine} />
          <View style={styles.dividerDot} />
        </View>
        <Text style={styles.headerHint}>اختر موضوعاً لبدء الحوار المعرفي</Text>
      </View>
    </Animated.View>
  );
};

const HomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Header />
        {TOPICS.map((topic, index) => (
          <TopicCard key={topic.key} item={topic} index={index} onPress={() => navigation.navigate(topic.screen)} />
        ))}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            { '"اللهم ارزقنا حب نبينا وحب صحابته أجمعين"' }
          </Text>
          <Text style={styles.footerVersion}>الإصدار 1.0 | جميع الحقوق محفوظة</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  headerOuter: {
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  ornament: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoWrap: {
    marginBottom: 16,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  logoIcon: {
    fontSize: 36,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 22,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.gold,
  },
  dividerLine: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.gold,
    opacity: 0.5,
  },
  headerHint: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingHorizontal: 20,
  },
  footerDivider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    borderRadius: 1,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 20,
  },
  footerVersion: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 8,
  },
});

export default HomeScreen;