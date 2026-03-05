import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert, Dimensions, Modal,
} from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { BlogPost } from '../../types';
import { Storage } from '../../utils/storage';
import { Colors, getCategoryMeta, formatDate, readTime } from '../../constants/theme';

const { width: SW } = Dimensions.get('window');

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [lightboxUri, setLightboxUri] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    if (id) Storage.getById(id).then(setPost);
  }, [id]));

  if (!post) return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.loading}>
        <Text style={{ color: Colors.textSub }}>불러오는 중…</Text>
      </View>
    </SafeAreaView>
  );

  const cat = getCategoryMeta(post.category);

  const handleDelete = () =>
    Alert.alert('게시물 삭제', '이 게시물을 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제', style: 'destructive',
        onPress: async () => { await Storage.remove(post.id); router.back(); },
      },
    ]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push(`/post/edit/${post.id}`)}>
            <Ionicons name="pencil-outline" size={18} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, styles.headerBtnDanger]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Cover image */}
        {(post.coverImage || post.media.find(m => m.type === 'image')) && (
          <TouchableOpacity
            onPress={() => {
              const uri = post.coverImage ?? post.media.find(m => m.type === 'image')?.uri;
              if (uri) setLightboxUri(uri);
            }}
          >
            <Image
              source={{ uri: post.coverImage ?? post.media.find(m => m.type === 'image')?.uri }}
              style={styles.cover}
              resizeMode="cover"
            />
          </TouchableOpacity>
        )}

        <View style={styles.body}>
          {/* Category & Date */}
          <View style={styles.topMeta}>
            <View style={[styles.catBadge, { backgroundColor: cat.color + '22', borderColor: cat.color + '55' }]}>
              <Ionicons name={cat.icon as any} size={12} color={cat.color} />
              <Text style={[styles.catBadgeText, { color: cat.color }]}>{cat.name}</Text>
            </View>
            <Text style={styles.metaDate}>{formatDate(post.createdAt)}</Text>
            {post.updatedAt !== post.createdAt && (
              <Text style={styles.metaUpdated}>수정됨</Text>
            )}
          </View>

          {/* Title */}
          <Text style={styles.title}>{post.title}</Text>

          {/* Read info */}
          <View style={styles.readInfo}>
            <Ionicons name="time-outline" size={13} color={Colors.textDim} />
            <Text style={styles.readInfoText}>{readTime(post.content)}</Text>
            {post.media.length > 0 && (
              <>
                <View style={styles.dot} />
                <Ionicons name="images-outline" size={13} color={Colors.textDim} />
                <Text style={styles.readInfoText}>미디어 {post.media.length}개</Text>
              </>
            )}
          </View>

          <View style={styles.divider} />

          {/* Content */}
          <Text style={styles.content}>{post.content}</Text>

          {/* Media grid */}
          {post.media.length > 0 && (
            <View style={styles.mediaSection}>
              <Text style={styles.mediaSectionTitle}>첨부 미디어</Text>
              <View style={styles.mediaGrid}>
                {post.media.map((m) => {
                  if (m.type === 'image') {
                    return (
                      <TouchableOpacity key={m.id} onPress={() => setLightboxUri(m.uri)}>
                        <Image source={{ uri: m.uri }} style={styles.mediaThumb} resizeMode="cover" />
                      </TouchableOpacity>
                    );
                  }
                  if (m.type === 'video') {
                    return (
                      <View key={m.id} style={styles.mediaVideoWrap}>
                        <Video
                          source={{ uri: m.uri }}
                          style={styles.mediaVideo}
                          useNativeControls
                          resizeMode={ResizeMode.CONTAIN}
                          isLooping={false}
                        />
                      </View>
                    );
                  }
                  return null;
                })}
              </View>
            </View>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <View style={styles.tagsSection}>
              <View style={styles.tagsWrap}>
                {post.tags.map((t) => (
                  <View key={t} style={styles.tag}>
                    <Text style={styles.tagText}>#{t}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Lightbox */}
      {lightboxUri && (
        <Modal visible animationType="fade" transparent>
          <TouchableOpacity style={styles.lightbox} onPress={() => setLightboxUri(null)} activeOpacity={1}>
            <Image source={{ uri: lightboxUri }} style={styles.lightboxImg} resizeMode="contain" />
            <TouchableOpacity style={styles.lightboxClose} onPress={() => setLightboxUri(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: 60 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerBtnDanger: { backgroundColor: Colors.errorSoft },
  cover: { width: '100%', height: 240 },
  body: { padding: 20 },
  topMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  catBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100, borderWidth: 1 },
  catBadgeText: { fontSize: 12, fontWeight: '700' },
  metaDate: { fontSize: 12, color: Colors.textSub, fontWeight: '500' },
  metaUpdated: { fontSize: 11, color: Colors.textDim, fontStyle: 'italic' },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, lineHeight: 34, letterSpacing: -0.5, marginBottom: 12 },
  readInfo: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 20 },
  readInfoText: { fontSize: 12, color: Colors.textDim, fontWeight: '500' },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: Colors.textDim },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20 },
  content: { fontSize: 16, color: Colors.text, lineHeight: 28, letterSpacing: 0.1 },
  mediaSection: { marginTop: 28 },
  mediaSectionTitle: { fontSize: 13, fontWeight: '700', color: Colors.textSub, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 12 },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mediaThumb: { width: (SW - 56) / 3, height: (SW - 56) / 3, borderRadius: 10 },
  mediaVideoWrap: { width: '100%', borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', marginBottom: 4 },
  mediaVideo: { width: '100%', height: 200 },
  tagsSection: { marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderTopColor: Colors.border },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.borderLight },
  tagText: { fontSize: 13, color: Colors.textSub, fontWeight: '500' },
  lightbox: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', alignItems: 'center', justifyContent: 'center' },
  lightboxImg: { width: SW, height: SW * 1.2 },
  lightboxClose: { position: 'absolute', top: 60, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});