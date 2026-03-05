import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, Image, Alert, TextInput, RefreshControl,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlogPost } from '../types';
import { Storage } from '../utils/storage';
import { Colors, CATEGORIES, getCategoryMeta, formatDate, readTime } from '../constants/theme';

export default function HomeScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setPosts(await Storage.getAll());
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const filtered = posts.filter((p) => {
    const matchCat = category === 'all' || p.category === category;
    const q = query.toLowerCase();
    const matchQ = !q || p.title.toLowerCase().includes(q) || p.content.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  const onDelete = (p: BlogPost) =>
    Alert.alert('게시물 삭제', `"${p.title}"\n삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: async () => { await Storage.remove(p.id); load(); } },
    ]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  /* ── card ── */
  const renderCard = ({ item, index }: { item: BlogPost; index: number }) => {
    const cat = getCategoryMeta(item.category);
    const cover = item.coverImage ?? item.media.find(m => m.type === 'image')?.uri;
    const isFirst = index === 0 && filtered.length > 2;

    if (isFirst) {
      return (
        <TouchableOpacity style={styles.heroCard} onPress={() => router.push(`/post/${item.id}`)} activeOpacity={0.88}>
          {cover
            ? <Image source={{ uri: cover }} style={styles.heroCover} />
            : <View style={[styles.heroCover, styles.heroCoverEmpty]}><Ionicons name="image-outline" size={48} color={Colors.textDim} /></View>}
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={[styles.catPill, { backgroundColor: cat.color + '33', borderColor: cat.color + '66' }]}>
              <Text style={[styles.catPillText, { color: cat.color }]}>{cat.name}</Text>
            </View>
            <Text style={styles.heroTitle} numberOfLines={2}>{item.title}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroDate}>{formatDate(item.createdAt)}</Text>
              <Text style={styles.heroDot}>·</Text>
              <Text style={styles.heroDate}>{readTime(item.content)}</Text>
            </View>
          </View>
          <View style={styles.cardActionsTop}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push(`/post/edit/${item.id}`)}>
              <Ionicons name="pencil" size={14} color={Colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconBtn, { marginTop: 6 }]} onPress={() => onDelete(item)}>
              <Ionicons name="trash" size={14} color={Colors.error} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity style={styles.card} onPress={() => router.push(`/post/${item.id}`)} activeOpacity={0.85}>
        {cover
          ? <Image source={{ uri: cover }} style={styles.cardThumb} />
          : (
            <View style={[styles.cardThumb, styles.cardThumbEmpty, { backgroundColor: cat.color + '15' }]}>
              <Ionicons name={cat.icon as any} size={22} color={cat.color + '80'} />
            </View>
          )}
        <View style={styles.cardBody}>
          <View style={[styles.catPill, { backgroundColor: cat.color + '22', borderColor: cat.color + '44' }]}>
            <Text style={[styles.catPillText, { color: cat.color }]}>{cat.name}</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.cardExcerpt} numberOfLines={2}>{item.content.replace(/\n/g, ' ')}</Text>
          <View style={styles.cardFooter}>
            <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            <View style={styles.cardRight}>
              {item.media.length > 0 && (
                <View style={styles.metaChip}>
                  <Ionicons name="images-outline" size={10} color={Colors.textDim} />
                  <Text style={styles.metaChipText}>{item.media.length}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.iconBtnSm} onPress={() => router.push(`/post/edit/${item.id}`)}>
                <Ionicons name="pencil-outline" size={13} color={Colors.textSub} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtnSm} onPress={() => onDelete(item)}>
                <Ionicons name="trash-outline" size={13} color={Colors.error + 'CC'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const ListHeader = () => (
    <View>
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topLabel}>MY BLOG</Text>
          <Text style={styles.topTitle}>나의 기록</Text>
        </View>
        <TouchableOpacity
          style={[styles.searchToggle, searchOpen && styles.searchToggleActive]}
          onPress={() => { setSearchOpen(v => !v); setQuery(''); }}
        >
          <Ionicons name={searchOpen ? 'close' : 'search'} size={20} color={searchOpen ? Colors.accent : Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {searchOpen && (
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={16} color={Colors.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="제목, 내용, 태그 검색…"
            placeholderTextColor={Colors.textDim}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textSub} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: '전체 글', value: posts.length },
          {
            label: '이번달', value: posts.filter(p => {
              const d = new Date(p.createdAt);
              const n = new Date();
              return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
            }).length,
          },
          { label: '미디어', value: posts.reduce((a, p) => a + p.media.length, 0) },
        ].map((s, i) => (
          <View key={i} style={[styles.statBox, i === 1 && styles.statBoxMid]}>
            <Text style={styles.statNum}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Categories */}
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.catList}
        keyExtractor={c => c.id}
        renderItem={({ item: c }) => {
          const active = category === c.id;
          return (
            <TouchableOpacity
              style={[styles.catChip, active && { backgroundColor: c.color, borderColor: c.color }]}
              onPress={() => setCategory(c.id)}
            >
              <Ionicons name={c.icon as any} size={12} color={active ? '#000' : c.color} />
              <Text style={[styles.catChipText, active && { color: '#000' }]}>{c.name}</Text>
              {c.id !== 'all' && (
                <Text style={[styles.catCount, active && { color: '#00000077' }]}>
                  {posts.filter(p => p.category === c.id).length}
                </Text>
              )}
            </TouchableOpacity>
          );
        }}
      />

      {/* Section header */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          {category === 'all' ? '모든 게시물' : getCategoryMeta(category).name}
        </Text>
        <Text style={styles.sectionCount}>{filtered.length}개</Text>
      </View>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="pencil-outline" size={40} color={Colors.textDim} />
      </View>
      <Text style={styles.emptyTitle}>{query ? '검색 결과가 없어요' : '아직 작성한 글이 없어요'}</Text>
      <Text style={styles.emptyDesc}>
        {query ? '다른 검색어를 입력해보세요' : '오른쪽 하단 버튼으로 첫 글을 작성해보세요'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={p => p.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/post/create')} activeOpacity={0.85}>
        <Ionicons name="add" size={30} color="#000" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  list: { paddingBottom: 110 },

  /* top */
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  topLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 2, color: Colors.accent, marginBottom: 2 },
  topTitle: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.8 },
  searchToggle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  searchToggleActive: { backgroundColor: Colors.accentSoft, borderWidth: 1, borderColor: Colors.accentBorder },

  /* search */
  searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, backgroundColor: Colors.bgInput, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15 },

  /* stats */
  statsRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: Colors.bgCard, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: Colors.textSub, marginTop: 2, fontWeight: '500' },

  /* categories */
  catList: { paddingHorizontal: 20, paddingBottom: 20, gap: 8 },
  catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 100, borderWidth: 1, borderColor: Colors.borderLight, gap: 5 },
  catChipText: { fontSize: 13, fontWeight: '600', color: Colors.textSub },
  catCount: { fontSize: 11, color: Colors.textDim, fontWeight: '500' },

  /* section */
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: Colors.text },
  sectionCount: { fontSize: 13, color: Colors.textSub, fontWeight: '500' },

  /* hero card */
  heroCard: { marginHorizontal: 20, marginBottom: 12, borderRadius: 20, overflow: 'hidden', height: 260, backgroundColor: Colors.bgCard },
  heroCover: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  heroCoverEmpty: { backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  heroContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginTop: 8, marginBottom: 8 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroDate: { fontSize: 12, color: 'rgba(255,255,255,0.65)', fontWeight: '500' },
  heroDot: { color: 'rgba(255,255,255,0.4)' },
  cardActionsTop: { position: 'absolute', top: 14, right: 14 },

  /* regular card */
  card: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, backgroundColor: Colors.bgCard, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  cardThumb: { width: 90, height: 90 },
  cardThumbEmpty: { width: 90, height: 90, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: Colors.text, marginTop: 5, marginBottom: 3, letterSpacing: -0.2 },
  cardExcerpt: { fontSize: 12, color: Colors.textSub, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  cardDate: { fontSize: 11, color: Colors.textDim, fontWeight: '500' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 3, marginRight: 4 },
  metaChipText: { fontSize: 10, color: Colors.textDim },

  /* cat pill */
  catPill: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100, borderWidth: 1 },
  catPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },

  /* icon buttons */
  iconBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  iconBtnSm: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.bgElevated, alignItems: 'center', justifyContent: 'center' },

  /* empty */
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: Colors.textSub, textAlign: 'center', lineHeight: 22 },

  /* fab */
  fab: { position: 'absolute', bottom: 36, right: 24, width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});
