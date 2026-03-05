export const Colors = {
  bg: '#0A0A0A',
  bgCard: '#141414',
  bgElevated: '#1C1C1C',
  bgInput: '#181818',
  accent: '#C8FF00',
  accentSoft: 'rgba(200,255,0,0.12)',
  accentBorder: 'rgba(200,255,0,0.25)',
  text: '#F0EDE8',
  textSub: '#9A9590',
  textDim: '#4A4845',
  border: '#252525',
  borderLight: '#303030',
  error: '#FF4455',
  errorSoft: 'rgba(255,68,85,0.12)',
  white: '#FFFFFF',
  black: '#000000',
};

export const CATEGORIES = [
  { id: 'all',      name: '전체',  icon: 'grid-outline',        color: '#C8FF00' },
  { id: 'daily',    name: '일상',  icon: 'sunny-outline',       color: '#FFD166' },
  { id: 'tech',     name: '기술',  icon: 'code-slash-outline',  color: '#06D6A0' },
  { id: 'travel',   name: '여행',  icon: 'airplane-outline',    color: '#118AB2' },
  { id: 'food',     name: '음식',  icon: 'restaurant-outline',  color: '#FF6B6B' },
  { id: 'thoughts', name: '생각',  icon: 'bulb-outline',        color: '#C77DFF' },
];

export function getCategoryMeta(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0];
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return '오늘';
  if (diff === 1) return '어제';
  if (diff < 7)  return `${diff}일 전`;
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function readTime(text: string): string {
  const mins = Math.max(1, Math.ceil(text.trim().split(/\s+/).length / 200));
  return `${mins}분 읽기`;
}
