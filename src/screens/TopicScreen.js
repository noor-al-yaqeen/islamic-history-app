import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, StatusBar, SafeAreaView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ChatBubble, { TypingIndicator } from '../components/ChatBubble';
import { COLORS } from '../constants/colors';

const isWeb = Platform.OS === 'web';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ConversationView = ({ conversation }) => {
  const [visibleCount, setVisibleCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef(null);
  const conversationEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      conversationEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 200);
  }, []);

  useEffect(() => {
    if (visibleCount === 0) {
      setVisibleCount(1);
    }
  }, []);

  useEffect(() => {
    if (visibleCount > 0 && visibleCount <= conversation.length) {
      if (visibleCount < conversation.length) {
        setIsTyping(true);
        const timeout = setTimeout(() => {
          setIsTyping(false);
          setVisibleCount(prev => prev + 1);
          scrollToBottom();
        }, 1500 + Math.random() * 1000);
        return () => clearTimeout(timeout);
      } else {
        setFinished(true);
        scrollToBottom();
      }
    }
  }, [visibleCount]);

  const handleTap = useCallback(() => {
    if (!isTyping && !finished) {
      setIsTyping(false);
      setVisibleCount(prev => Math.min(prev + 1, conversation.length));
    }
  }, [isTyping, finished, conversation.length]);

  return (
    <View style={styles.chatContainer}>
      <View style={styles.chatHeader}>
        <View style={styles.chatHeaderLeft}>
          <View style={styles.chatAvatar}>
            <Text style={styles.chatAvatarIcon}>📜</Text>
          </View>
          <View>
            <Text style={styles.chatHeaderName}>حكيم وسائل</Text>
            <Text style={styles.chatHeaderStatus}>
              {finished ? 'انتهى الحوار ✓' : isTyping ? 'يكتب...' : 'متصل الآن'}
            </Text>
          </View>
        </View>
        <View style={styles.chatHeaderRight}>
          <Text style={styles.chatHeaderIcon}>⋮</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        style={styles.chatScroll}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={scrollToBottom}
      >
        {conversation.slice(0, visibleCount).map((msg, index) => (
          <ChatBubble
            key={index}
            speaker={msg.speaker}
            text={msg.text}
            delay={0}
            isLast={index === visibleCount - 1}
            onVisible={scrollToBottom}
          />
        ))}

        {isTyping && (
          <TypingIndicator speaker={visibleCount % 2 === 0 ? 'حكيم' : 'سائل'} />
        )}

        {finished && (
          <View style={styles.completeBadge}>
            <Text style={styles.completeIcon}>✓</Text>
            <Text style={styles.completeText}>تمت قراءة جميع الرسائل</Text>
          </View>
        )}

        <View ref={conversationEndRef} style={{ height: 20 }} />
      </ScrollView>

      {!finished && !isTyping && visibleCount > 0 && (
        <TouchableOpacity style={styles.tapToContinue} onPress={handleTap} activeOpacity={0.8}>
          <Text style={styles.tapText}>اضغط للمتابعة ↓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const SectionTitle = ({ title }) => (
  <View style={styles.sectionTitleWrap}>
    <LinearGradient colors={['transparent', COLORS.border, 'transparent']} style={styles.sectionLine} />
    <Text style={styles.sectionTitleText}>{title}</Text>
    <LinearGradient colors={['transparent', COLORS.border, 'transparent']} style={styles.sectionLine} />
  </View>
);

const InfoCard = ({ children, style }) => (
  <View style={[styles.infoCard, style]}>{children}</View>
);

const FactGrid = ({ facts }) => (
  <View style={styles.factGrid}>
    {facts.map((f, i) => (
      <View key={i} style={styles.factItem}>
        <Text style={styles.factLabel}>{f.label}</Text>
        <Text style={styles.factValue}>{f.value}</Text>
      </View>
    ))}
  </View>
);

const CompanionCard = ({ c }) => (
  <InfoCard>
    <View style={styles.cardRow}>
      <View style={[styles.cardIconWrap, { backgroundColor: '#0A1F0A' }]}>
        <Text style={styles.cardIcon}>{c.icon}</Text>
      </View>
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardTitle}>{c.name}</Text>
        <Text style={styles.cardSubtitle}>{c.title}</Text>
      </View>
    </View>
    <Text style={styles.cardBody}>{c.about}</Text>
    {c.highlights?.length > 0 && (
      <View style={styles.bulletList}>
        {c.highlights.map((h, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={styles.bulletDot}>◈</Text>
            <Text style={styles.bulletText}>{h}</Text>
          </View>
        ))}
      </View>
    )}
    {c.quote ? (
      <View style={styles.quoteBox}>
        <Text style={styles.quoteMark}>❝</Text>
        <Text style={styles.quoteText}>{c.quote}</Text>
      </View>
    ) : null}
  </InfoCard>
);

const BattleCard = ({ b }) => (
  <InfoCard>
    <View style={styles.cardRow}>
      <View style={[styles.cardIconWrap, { backgroundColor: '#1F0A0A' }]}>
        <Text style={styles.cardIcon}>{b.icon}</Text>
      </View>
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardTitle}>{b.name}</Text>
        <Text style={styles.cardSubtitle}>{b.date}</Text>
      </View>
    </View>
    <View style={styles.metaRow}>
      <View style={styles.metaTag}>
        <Text style={styles.metaText}>📍 {b.location}</Text>
      </View>
      <View style={[styles.metaTag, styles.metaResult]}>
        <Text style={styles.metaText}>{b.result}</Text>
      </View>
    </View>
    <Text style={styles.cardBody}>{b.reason}</Text>
    {b.highlights?.length > 0 && (
      <View style={styles.bulletList}>
        {b.highlights.map((h, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: '#C62828' }]}>⚔</Text>
            <Text style={styles.bulletText}>{h}</Text>
          </View>
        ))}
      </View>
    )}
    {b.quranVerse ? (
      <View style={styles.verseBox}>
        <Text style={styles.verseLabel}>📖 آية قرآنية</Text>
        <Text style={styles.verseText}>{b.quranVerse}</Text>
      </View>
    ) : null}
  </InfoCard>
);

const MotherCard = ({ m }) => (
  <InfoCard>
    <View style={styles.cardRow}>
      <View style={[styles.cardIconWrap, { backgroundColor: '#1A0A1F' }]}>
        <Text style={styles.cardIcon}>{m.icon}</Text>
      </View>
      <View style={styles.cardHeaderText}>
        <Text style={styles.cardTitle}>{m.name}</Text>
        <Text style={styles.cardSubtitle}>{m.title}</Text>
      </View>
    </View>
    <Text style={styles.cardBody}>{m.about}</Text>
    {m.highlights?.length > 0 && (
      <View style={styles.bulletList}>
        {m.highlights.map((h, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bulletDot, { color: '#7B1FA2' }]}></Text>
            <Text style={styles.bulletText}>{h}</Text>
          </View>
        ))}
      </View>
    )}
    {m.quote ? (
      <View style={styles.quoteBox}>
        <Text style={styles.quoteMark}>❝</Text>
        <Text style={styles.quoteText}>{m.quote}</Text>
      </View>
    ) : null}
  </InfoCard>
);

const VideoCard = ({ v }) => (
  <TouchableOpacity onPress={() => {
    if (v.url) {
      // Open the video URL in browser/webview
      if (typeof window !== 'undefined') window.open(v.url, '_blank');
    }
  }}>
    <InfoCard>
      <View style={styles.cardRow}>
        <View style={[styles.cardIconWrap, { backgroundColor: '#1A0F00' }]}>
          <Text style={styles.cardIcon}>🎬</Text>
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{v.title}</Text>
          <Text style={styles.cardSubtitle}>{v.duration || ''}</Text>
        </View>
      </View>
      <View style={styles.videoPreview}>
        <View style={styles.videoThumb}>
          <Text style={styles.videoThumbIcon}>▶</Text>
        </View>
      </View>
      {v.description ? <Text style={styles.cardBody}>{v.description}</Text> : null}
      {v.category ? (
        <View style={styles.metaRow}>
          <View style={styles.metaTag}>
            <Text style={styles.metaText}>{v.category}</Text>
          </View>
        </View>
      ) : null}
    </InfoCard>
  </TouchableOpacity>
);

const TopicScreen = ({ route, navigation }) => {
  const { data, type } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;

  const isSahaba = type === 'sahaba';
  const isGhazwat = type === 'ghazwat';
  const isUmmahat = type === 'ummahat';
  const isProphet = type === 'prophet';
  const isVideos = type === 'videos';

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      <Animated.View style={[styles.topBar, { opacity: headerOpacity }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <LinearGradient colors={[data.color + 'CC', data.color + '88']} style={styles.topBarGlow} />
        <View style={styles.topBarContent}>
          <Text style={styles.topBarIcon}>{data.icon}</Text>
          <Text style={styles.topBarTitle}>{data.title}</Text>
        </View>
        <View style={styles.backBtn} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        <ConversationView conversation={data.conversation} />

        {isProphet && data.quickFacts && (
          <>
            <SectionTitle title="معلومات سريعة عن النبي ﷺ" />
            <FactGrid facts={data.quickFacts} />
          </>
        )}

        {isSahaba && data.companions && (
          <>
            <SectionTitle title={`أبرز الصحابة الكرام (${data.companions.length})`} />
            {data.companions.map((c, i) => <CompanionCard key={c.id || i} c={c} />)}
          </>
        )}

        {isGhazwat && data.battles && (
          <>
            <SectionTitle title={`الغزوات النبوية (${data.battles.length})`} />
            {data.battles.map((b, i) => <BattleCard key={b.id || i} b={b} />)}
          </>
        )}

        {isUmmahat && data.mothers && (
          <>
            <SectionTitle title={`أمهات المؤمنين (${data.mothers.length})`} />
            {data.mothers.map((m, i) => <MotherCard key={m.id || i} m={m} />)}
          </>
        )}

        {isVideos && data.videos && (
          <>
            <SectionTitle title={`فيديوهات التاريخ الإسلامي (${data.videos.length})`} />
            {data.videos.map((v, i) => <VideoCard key={v.id || i} v={v} />)}
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
    overflow: 'hidden',
  },
  topBarGlow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  topBarIcon: {
    fontSize: 18,
  },
  topBarTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Chat style
  chatContainer: {
    backgroundColor: COLORS.chatBg,
    borderRadius: 16,
    marginHorizontal: 8,
    marginTop: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chatAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chatAvatarIcon: {
    fontSize: 18,
  },
  chatHeaderName: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
  },
  chatHeaderStatus: {
    color: COLORS.textLight,
    fontSize: 11,
    marginTop: 1,
  },
  chatHeaderRight: {},
  chatHeaderIcon: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: '700',
  },
  chatScroll: {
    maxHeight: 420,
  },
  chatContent: {
    paddingVertical: 8,
  },
  tapToContinue: {
    alignSelf: 'center',
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tapText: {
    color: COLORS.textLight,
    fontWeight: '600',
    fontSize: 12,
  },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  completeIcon: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '700',
  },
  completeText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: '500',
  },

  // Sections
  sectionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    gap: 10,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  sectionTitleText: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Cards
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    marginHorizontal: 12,
    marginVertical: 6,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...(isWeb ? { boxShadow: '0 4px 20px rgba(0,0,0,0.3)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 }),
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: 2,
  },
  cardBody: {
    fontSize: 13,
    color: COLORS.textLight,
    lineHeight: 22,
    textAlign: 'right',
    marginBottom: 10,
  },

  // Bullet list
  bulletList: {
    marginTop: 4,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 6,
  },
  bulletDot: {
    fontSize: 10,
    color: '#4CAF50',
    marginTop: 4,
  },
  bulletText: {
    fontSize: 12,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
    lineHeight: 20,
  },

  // Quote
  quoteBox: {
    backgroundColor: '#1A1500',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#3D2E00',
  },
  quoteMark: {
    fontSize: 18,
    color: COLORS.gold,
    marginBottom: 4,
    textAlign: 'right',
  },
  quoteText: {
    fontSize: 12,
    color: '#D4A800',
    fontStyle: 'italic',
    textAlign: 'right',
    lineHeight: 20,
  },

  // Meta row for battles
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metaTag: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  metaResult: {
    borderColor: '#2E7D32',
  },
  metaText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: '500',
  },

  // Verse box
  verseBox: {
    backgroundColor: '#0A1F0A',
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#1A4A1A',
  },
  verseLabel: {
    color: COLORS.textLight,
    fontSize: 10,
    marginBottom: 6,
  },
  verseText: {
    fontSize: 13,
    color: '#A5D6A7',
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },

  // Facts grid
  factGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  factItem: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    width: (SCREEN_WIDTH - 60) / 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...(isWeb ? { boxShadow: '0 2px 12px rgba(0,0,0,0.2)' } : { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 }),
  },
  factLabel: {
    fontSize: 10,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  factValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Video card
  videoPreview: {
    width: '100%',
    height: 160,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#000',
  },
  videoThumb: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  videoThumbIcon: {
    fontSize: 48,
    color: '#FF0000',
    opacity: 0.8,
  },
});

export default TopicScreen;