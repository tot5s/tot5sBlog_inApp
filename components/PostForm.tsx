import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import uuid from 'react-native-uuid';
import { BlogPost, MediaItem } from '../types';
import { Storage } from '../utils/storage';
import { Colors, CATEGORIES } from '../constants/theme';

interface Props {
  existingPost?: BlogPost;
}

function VideoPreview({ uri }: { uri: string }) {
  return (
    <Video
      source={{ uri }}
      style={styles.mediaVideo}
      useNativeControls
      resizeMode={ResizeMode.CONTAIN}
      isLooping={false}
    />
  );
}

export default function PostForm({ existingPost }: Props) {
  const isEdit = !!existingPost;

  const [title, setTitle] = useState(existingPost?.title ?? '');
  const [content, setContent] = useState(existingPost?.content ?? '');
  const [category, setCategory] = useState(existingPost?.category ?? 'daily');
  const [tags, setTags] = useState<string[]>(existingPost?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [media, setMedia] = useState<MediaItem[]>(existingPost?.media ?? []);
  const [saving, setSaving] = useState(false);

  /* ── media picker ── */
  const pickMedia = async (type: 'image' | 'video' | 'both') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.');
      return;
    }

    const mediaTypes =
      type === 'image' ? ImagePicker.MediaTypeOptions.Images
      : type === 'video' ? ImagePicker.MediaTypeOptions.Videos
      : ImagePicker.MediaTypeOptions.All;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes,
      allowsMultipleSelection: true,
      quality: 0.85,
      videoMaxDuration: 300,
    });

    if (!result.canceled) {
      const newMedia: MediaItem[] = result.assets.map(a => ({
        id: uuid.v4() as string,
        uri: a.uri,
        type: a.type === 'video' ? 'video' : 'image',
        width: a.width,
        height: a.height,
        duration: a.duration ?? undefined,
      }));
      setMedia(prev => [...prev, ...newMedia]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '카메라 접근 권한이 필요합니다.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!result.canceled && result.assets[0]) {
      const a = result.assets[0];
      setMedia(prev => [...prev, {
        id: uuid.v4() as string,
        uri: a.uri,
        type: a.type === 'video' ? 'video' : 'image',
        width: a.width,
        height: a.height,
      }]);
    }
  };

  const removeMedia = (id: string) =>
    setMedia(prev => prev.filter(m => m.id !== id));

  /* ── tags ── */
  const addTag = () => {
    const t = tagInput.trim().replace(/^#/, '');
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleSave = async () => {
  if (!title.trim()) { Alert.alert('제목을 입력해주세요'); return; }
  if (!content.trim()) { Alert.alert('내용을 입력해주세요'); return; }

  setSaving(true);
  try {
    const now = new Date().toISOString();

    // 새로 추가된 미디어(로컬 uri)만 Firebase Storage에 업로드
    const uploadedMedia = await Promise.all(
      media.map(async (m) => {
        if (m.uri.startsWith('https://')) return m;
        const downloadUrl = await Storage.uploadMedia(m);
        return { ...m, uri: downloadUrl };
      })
    );

    // coverImage: undefined 방지 → null 또는 첫 번째 이미지 URL
    const coverImage = uploadedMedia.find(m => m.type === 'image')?.uri ?? null;

    const post: BlogPost = {
      id: existingPost?.id ?? (uuid.v4() as string),
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      media: uploadedMedia,
      coverImage,  // null이면 Firestore에 null로 저장 (undefined 아님)
      createdAt: existingPost?.createdAt ?? now,
      updatedAt: now,
    };

    await Storage.save(post);
    router.back();
  } catch (e) {
    Alert.alert('저장 실패', '다시 시도해주세요.');
    console.error(e);
  } finally {
    setSaving(false);
  }
};

  const cats = CATEGORIES.filter(c => c.id !== 'all');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Ionicons name="close" size={20} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? '게시물 수정' : '새 게시물'}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, (!title.trim() || !content.trim()) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator size="small" color="#000" />
              : <Text style={styles.saveBtnText}>{isEdit ? '수정' : '저장'}</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>제목 *</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="게시물 제목을 입력하세요"
              placeholderTextColor={Colors.textDim}
              maxLength={100}
              returnKeyType="next"
            />
          </View>

          {/* Category */}
          <View style={styles.section}>
            <Text style={styles.label}>카테고리</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -4 }}>
              <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                {cats.map(c => {
                  const active = category === c.id;
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.catChip, active && { backgroundColor: c.color, borderColor: c.color }]}
                      onPress={() => setCategory(c.id)}
                    >
                      <Ionicons name={c.icon as any} size={13} color={active ? '#000' : c.color} />
                      <Text style={[styles.catText, active && { color: '#000' }]}>{c.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Content */}
          <View style={styles.section}>
            <Text style={styles.label}>내용 *</Text>
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="오늘의 이야기를 기록해보세요…"
              placeholderTextColor={Colors.textDim}
              multiline
              textAlignVertical="top"
            />
          </View>

          {/* Media */}
          <View style={styles.section}>
            <Text style={styles.label}>미디어</Text>

            {/* Media action buttons */}
            <View style={styles.mediaActions}>
              <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('image')}>
                <Ionicons name="images-outline" size={20} color={Colors.accent} />
                <Text style={styles.mediaBtnText}>사진</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaBtn} onPress={() => pickMedia('video')}>
                <Ionicons name="videocam-outline" size={20} color={Colors.accent} />
                <Text style={styles.mediaBtnText}>동영상</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mediaBtn} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color={Colors.accent} />
                <Text style={styles.mediaBtnText}>카메라</Text>
              </TouchableOpacity>
            </View>

            {/* Media preview */}
            {media.length > 0 && (
              <View style={styles.mediaGrid}>
                {media.map(m => (
                  <View key={m.id} style={styles.mediaItem}>
                    {m.type === 'image'
                      ? <Image source={{ uri: m.uri }} style={styles.mediaImg} resizeMode="cover" />
                      : (
                        <View style={styles.mediaVideoWrap}>
                          <VideoPreview uri={m.uri} />
                        </View>
                      )}
                    <TouchableOpacity style={styles.mediaRemove} onPress={() => removeMedia(m.id)}>
                      <Ionicons name="close-circle" size={22} color={Colors.error} />
                    </TouchableOpacity>
                    {m.type === 'video' && (
                      <View style={styles.videoLabel}>
                        <Ionicons name="videocam" size={10} color="#fff" />
                        <Text style={styles.videoLabelText}>동영상</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <Text style={styles.label}>태그</Text>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="태그 입력 후 추가"
                placeholderTextColor={Colors.textDim}
                onSubmitEditing={addTag}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.tagAddBtn} onPress={addTag}>
                <Ionicons name="add" size={20} color={Colors.accent} />
              </TouchableOpacity>
            </View>
            {tags.length > 0 && (
              <View style={styles.tagsWrap}>
                {tags.map(t => (
                  <TouchableOpacity key={t} style={styles.tag} onPress={() => removeTag(t)}>
                    <Text style={styles.tagText}>#{t}</Text>
                    <Ionicons name="close" size={12} color={Colors.textSub} style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },

  /* header */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  saveBtn: { paddingHorizontal: 20, paddingVertical: 9, borderRadius: 100, backgroundColor: Colors.accent },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },

  /* sections */
  section: { paddingHorizontal: 20, marginTop: 24 },
  label: { fontSize: 11, fontWeight: '700', color: Colors.textSub, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },

  /* title input */
  titleInput: { backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 17, fontWeight: '600', color: Colors.text },

  /* categories */
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100, borderWidth: 1, borderColor: Colors.borderLight, backgroundColor: 'transparent' },
  catText: { fontSize: 13, fontWeight: '600', color: Colors.textSub },

  /* content */
  contentInput: { backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16, color: Colors.text, minHeight: 180, lineHeight: 26 },

  /* media */
  mediaActions: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  mediaBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, backgroundColor: Colors.accentSoft, borderRadius: 12, borderWidth: 1, borderColor: Colors.accentBorder },
  mediaBtnText: { fontSize: 13, fontWeight: '600', color: Colors.accent },
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  mediaItem: { position: 'relative' },
  mediaImg: { width: 90, height: 90, borderRadius: 10 },
  mediaVideoWrap: { width: 160, borderRadius: 10, overflow: 'hidden', backgroundColor: '#000' },
  mediaVideo: { width: 160, height: 90 },
  mediaRemove: { position: 'absolute', top: -8, right: -8, backgroundColor: Colors.bg, borderRadius: 11 },
  videoLabel: { position: 'absolute', bottom: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  videoLabelText: { fontSize: 9, color: '#fff', fontWeight: '600' },

  /* tags */
  tagInputRow: { flexDirection: 'row', gap: 10 },
  tagInput: { flex: 1, backgroundColor: Colors.bgInput, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: Colors.text },
  tagAddBtn: { width: 48, borderRadius: 12, backgroundColor: Colors.accentSoft, borderWidth: 1, borderColor: Colors.accentBorder, alignItems: 'center', justifyContent: 'center' },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  tag: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.borderLight },
  tagText: { fontSize: 13, color: Colors.textSub, fontWeight: '500' },
});
