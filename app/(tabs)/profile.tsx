import React, { useState, useCallback, use } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Image, Alert, KeyboardAvoidingView, Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { ProfileStorage, UserProfile, defaultProfile } from '../../utils/profile';
import { Storage } from '../../utils/storage';
import { Colors } from '../../constants/theme';

type SocialField = {icon: string; placeholder: string; key: keyof UserProfile};

const SOCIAL_FIELD : SocialField[] = [
    { key: 'email', icon: 'mail-outline', placeholder: '이메일'},
    { key: 'website', icon: 'globe-outline', placeholder: '웹사이트 URL'},
    { key: 'instagram', icon: 'logo-instagram', placeholder: '인스타그램'},
    { key: 'twitter', icon: 'logo-twitter', placeholder: '트위터'}
]

export default function ProfileScreen() {
    
    const [editing, setEditing] = useState(false)
    const [saving, setSaving] = useState(false)
    const [draft, setDraft] = useState<UserProfile>(defaultProfile)
    const [profile, setProfile] = useState<UserProfile>(defaultProfile)
    const [postCount, setPostCount] = useState(0)
    const [mediaCount, setMediaCount] = useState(0)


    useFocusEffect(
        useCallback(() => {
            (async() => {
                const [p, posts] = await Promise.all([ProfileStorage.get(), Storage.getAll()])
                
                setProfile(p)
                setDraft(p)
                setPostCount(posts.length)
                setMediaCount(posts.reduce((a, p) => a + p.media.length, 0))
            })();
        }, [])
    )


    const startEdit = () => {
        setDraft({
            name: profile.name ?? '',
            bio: profile.bio ?? '',
            avatarUri : profile.avatarUri ?? null,
            email: profile.email ?? '',
            website: profile.website ?? '',
            instagram: profile.instagram ?? '',
            twitter: profile.twitter ?? ''
        })
        setEditing(true)
    }

    const cancelEdit = () => {
        setDraft({...profile})
        setEditing(false)
    }

    const handleSave = async () => {
        setSaving(true)
        try{

            const merged: UserProfile = {
                ...profile,
                ...draft
            }
            await ProfileStorage.save(merged);
            setProfile(merged);
            setEditing(false);
            Alert.alert('저장 성공', '저장에 성공 하였습니다.')
        } catch (e){
            Alert.alert('저장 실패', '다시 시도해주세요.');
            console.log('save error', String(e));
            
        }finally{
            setSaving(false);
        }
    }


    const pickAvatar = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(status !== 'granted') {
            Alert.alert('권한 필요', '사진 라이브러리 접근 권한이 필요합니다.')
            return;
        }


        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1,1],
            quality: 0.8
        });

        if(!result.canceled && result.assets[0]) {
            const uri = result.assets[0].uri;
            setDraft(prev => ({...prev, avatarUri: uri}))
        }
    }
    const updateDraft = (key: keyof UserProfile, value: string | null) => {
        setDraft(prev => ({...prev, [key]: value}))
    }


    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <KeyboardAvoidingView style={{ flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                {/* header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>프로필</Text>
                    {!editing ? (
                        <TouchableOpacity style={styles.editBtn} onPress={startEdit}>
                            <Ionicons name='pencil-outline' size={16} color={Colors.accent}/>
                            <Text style={styles.editBtnText}>편집</Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={cancelEdit}>
                                <Text style={styles.cancelBtnText}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} disabled={saving} onPress={handleSave}>
                                {
                                    saving ? <ActivityIndicator size={'small'} color={'#000000'}/> : <Text style={styles.saveBtnText}>저장</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* body */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

                    {/* avatar */}
                    <View style={styles.avatarSection}>
                        <TouchableOpacity
                            style={styles.avatarWrap}
                            activeOpacity={editing ? 0.7 : 1}
                            onPress={editing ? pickAvatar : undefined}
                        >
                            {(editing ? draft.avatarUri : profile.avatarUri) ? (
                                <Image source={{ uri: editing ? draft.avatarUri : profile.avatarUri}} style={styles.avatar}/>
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <Ionicons name='person' size={48} color={Colors.textDim}/>
                                </View>
                            )}
                            {editing && (
                                <View style={styles.avatarEditBadge}>
                                    <Ionicons name='camera' size={14} color={'#000000'}/>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* name */}
                    {editing ? (
                        <TextInput 
                            style={styles.nameInput}
                            value={draft.name}
                            onChangeText={v => updateDraft('name', v)}
                            placeholder='이름을 입력하세요'
                            placeholderTextColor={Colors.textDim}
                            textAlign='center'
                            maxLength={30}
                        />
                    ): (
                        <Text style={[styles.name, {textAlign: 'center'}]}>
                            {profile.name || '이름을 설정해 주세요'}
                        </Text>
                    )}


                    {/* Bio */}
                    {editing ? (
                        <TextInput 
                            style={styles.bioInput}
                            value={draft.bio}
                            onChangeText={v => updateDraft('bio', v)}
                            placeholder='소개를 입력하세요'
                            placeholderTextColor={Colors.textDim}
                            multiline
                            textAlign='center'
                            maxLength={100}
                        />
                    ) : (
                        profile.bio ?
                        <Text style={styles.bio}>{profile.bio}</Text> :
                        <Text style={styles.bio}>소개를 작성해주세요</Text>
                    )}
                    </View>

                    {/* stats */}
                    <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>{postCount}</Text>
                            <Text style={styles.statLabel}>게시물</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>{mediaCount}</Text>
                            <Text style={styles.statLabel}>미디어</Text>
                        </View>
                        <View style={styles.statBox}>
                            <Text style={styles.statNum}>{postCount}</Text>
                            <Text style={styles.statLabel}>이번달 게시글</Text>
                        </View>
                    </View>

                    {/* SNS */}
                    
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            연락처 & SNS
                        </Text>

                        {
                            SOCIAL_FIELD.map(field => {
                                const value = editing ? (draft[field.key] as string) : (profile[field.key] as string);

                                return(
                                    <View key={field.key} style={styles.socialRow}>
                                        <View style={styles.socialIcon}>
                                            <Ionicons name={field.icon as any} size={18} color={Colors.accent}/>
                                        </View>
                                        {editing ? (
                                            <TextInput
                                                style={styles.socialInput}
                                                value={value}
                                                onChangeText={v => updateDraft(field.key, v)}
                                                placeholder={field.placeholder}
                                                placeholderTextColor={Colors.textDim}
                                                autoCapitalize='none'
                                                keyboardType={field.key == 'email' ? 'email-address' : 'default'}
                                            />
                                        ) : (
                                            <Text style={[styles.socialValue, !value && styles.socialEmpty]}>
                                                { value || `${field.placeholder} 미설정`}
                                            </Text>
                                        )}
                                    </View>
                                )
                            })
                        }
                    </View>


                    {/* app info */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>앱 정보</Text>
                        {[
                            {label: '앱 이름', value: 'tot5sBlog'},
                            {label: '버전', value: '1.0.0'},
                            {label: '저장소', value: 'Firebase FireStore'}
                        ].map(item => (
                            <View key={item.label} style={styles.infoRow}>
                                <Text style={styles.infoLabel}>{item.label}</Text>
                                <Text style={styles.infoValue}>{item.value}</Text>
                            </View>
                        ))}
                    </View>


                    {/* reset profile */}
                    
                    {!editing && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>데이터</Text>
                            <TouchableOpacity style={styles.dangerBtn} onPress={() => 
                                Alert.alert('프로필 초기화', '프로필 정보를 모두 삭제할까요?', [
                                    {text: '취소', style: 'cancel'},
                                    {
                                        text: '초기화', 
                                        style: 'destructive', 
                                        onPress: async () => {
                                              await ProfileStorage.clear();
                                                setProfile(defaultProfile);
                                                setDraft(defaultProfile);
                                        }}
                                ])
                            }>
                                <Ionicons name='trash-outline' size={16} color={Colors.error}/>
                                <Text style={styles.dangerBtnText}>프로필 초기화</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    )
}



const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 60 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 100,
    backgroundColor: Colors.accentSoft, borderWidth: 1, borderColor: Colors.accentBorder,
  },
  editBtnText: { fontSize: 13, fontWeight: '700', color: Colors.accent },
  cancelBtn: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100,
    backgroundColor: Colors.bgElevated, borderWidth: 1, borderColor: Colors.border,
  },
  cancelBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSub },
  saveBtn: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 100,
    backgroundColor: Colors.accent, minWidth: 56, alignItems: 'center',
  },
  saveBtnText: { fontSize: 13, fontWeight: '700', color: '#000' },
  avatarSection: { alignItems: 'center', paddingTop: 10, paddingBottom: 28 },
  avatarWrap: { position: 'relative', marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: Colors.accent },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.bgElevated, borderWidth: 2, borderColor: Colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarEditBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.accent, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.bg,
  },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.3, marginBottom: 6 },
  nameInput: {
    fontSize: 22, fontWeight: '800', color: Colors.text,
    marginBottom: 6, borderBottomWidth: 1, borderBottomColor: Colors.accent,
    paddingBottom: 4, minWidth: 160, textAlign: 'center',
  },
  bio: { fontSize: 14, color: Colors.textSub, lineHeight: 20, textAlign: 'center', paddingHorizontal: 40 },
  bioEmpty: { fontSize: 14, color: Colors.textDim, fontStyle: 'italic' },
  bioInput: {
    fontSize: 14, color: Colors.textSub, lineHeight: 20, textAlign: 'center',
    paddingHorizontal: 40, borderBottomWidth: 1, borderBottomColor: Colors.border, paddingBottom: 4, minWidth: 200,
  },
  statsRow: {
    flexDirection: 'row', marginHorizontal: 20, marginBottom: 28,
    backgroundColor: Colors.bgCard, borderRadius: 16,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statBoxMid: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.border },
  statNum: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: Colors.textSub, marginTop: 2, fontWeight: '500' },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: Colors.textSub,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12,
  },
  socialRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.bgCard, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 13, marginBottom: 8,
  },
  socialIcon: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.accentSoft, alignItems: 'center', justifyContent: 'center',
  },
  socialInput: { flex: 1, fontSize: 15, color: Colors.text },
  socialValue: { flex: 1, fontSize: 15, color: Colors.text },
  socialEmpty: { color: Colors.textDim, fontStyle: 'italic' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: 14, color: Colors.textSub, fontWeight: '500' },
  infoValue: { fontSize: 14, color: Colors.text, fontWeight: '600' },
  dangerBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12,
    backgroundColor: Colors.errorSoft, borderWidth: 1, borderColor: Colors.error + '44',
  },
  dangerBtnText: { fontSize: 14, fontWeight: '600', color: Colors.error },
});
