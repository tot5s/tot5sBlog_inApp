import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlogPost } from '../types';

const KEY = '@blog_posts_v1';

export const Storage = {
  async getAll(): Promise<BlogPost[]> {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as BlogPost[]) : [];
    } catch {
      return [];
    }
  },

  async getById(id: string): Promise<BlogPost | null> {
    const posts = await this.getAll();
    return posts.find((p) => p.id === id) ?? null;
  },

  async save(post: BlogPost): Promise<void> {
    const posts = await this.getAll();
    const idx = posts.findIndex((p) => p.id === post.id);
    if (idx >= 0) posts[idx] = post;
    else posts.unshift(post);
    await AsyncStorage.setItem(KEY, JSON.stringify(posts));
  },

  async remove(id: string): Promise<void> {
    const posts = await this.getAll();
    await AsyncStorage.setItem(KEY, JSON.stringify(posts.filter((p) => p.id !== id)));
  },
};
