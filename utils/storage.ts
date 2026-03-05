import {
  collection, doc, getDocs, getDoc,
  setDoc, deleteDoc, orderBy, query,
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL, deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';
import { BlogPost, MediaItem } from '../types';

const COLLECTION = 'posts';

export const Storage = {
  // 전체 게시물 조회
  async getAll(): Promise<BlogPost[]> {
    try {
      const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as BlogPost);
    } catch (e) {
      console.error('getAll error:', e);
      return [];
    }
  },

  // 단일 게시물 조회
  async getById(id: string): Promise<BlogPost | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTION, id));
      return snap.exists() ? (snap.data() as BlogPost) : null;
    } catch (e) {
      console.error('getById error:', e);
      return null;
    }
  },

 // 게시물 저장 (생성 / 수정)
async save(post: BlogPost): Promise<void> {
  // Firestore는 undefined를 허용하지 않으므로 null로 변환
  const sanitized = JSON.parse(JSON.stringify(post, (_, v) => v === undefined ? null : v));
  await setDoc(doc(db, COLLECTION, post.id), sanitized);
},
  // 게시물 삭제
  async remove(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION, id));
  },

  // 미디어 파일 업로드 → Firebase Storage
  async uploadMedia(media: MediaItem): Promise<string> {
    const response = await fetch(media.uri);
    const blob = await response.blob();
    const ext = media.type === 'video' ? 'mp4' : 'jpg';
    const storageRef = ref(storage, `media/${media.id}.${ext}`);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  },

  // 미디어 파일 삭제
  async deleteMedia(mediaId: string, type: 'image' | 'video'): Promise<void> {
    try {
      const ext = type === 'video' ? 'mp4' : 'jpg';
      const storageRef = ref(storage, `media/${mediaId}.${ext}`);
      await deleteObject(storageRef);
    } catch (e) {
      console.error('deleteMedia error:', e);
    }
  },

  
};