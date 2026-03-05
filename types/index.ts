export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  uri: string;
  type: MediaType;
  name?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  category: string;
  media: MediaItem[];
  tags: string[];
  coverImage: string | null;  // undefined → null로 변경
  createdAt: string;
  updatedAt: string;
}