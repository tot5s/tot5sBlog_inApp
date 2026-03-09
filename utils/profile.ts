import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  name:      '@profile_name',
  bio:       '@profile_bio',
  avatarUri: '@profile_avatarUri',
  email:     '@profile_email',
  website:   '@profile_website',
  instagram: '@profile_instagram',
  twitter:   '@profile_twitter',
};

export interface UserProfile {
  name: string;
  bio: string;
  avatarUri: string | null;
  email: string;
  website: string;
  instagram: string;
  twitter: string;
}

export const defaultProfile: UserProfile = {
  name: '',
  bio: '',
  avatarUri: null,
  email: '',
  website: '',
  instagram: '',
  twitter: '',
};

export const ProfileStorage = {
  async get(): Promise<UserProfile> {
    try {
      const [name, bio, avatarUri, email, website, instagram, twitter] =
        await AsyncStorage.multiGet(Object.values(KEYS));
      return {
        name:      name[1]      ?? '',
        bio:       bio[1]       ?? '',
        avatarUri: avatarUri[1] ?? null,
        email:     email[1]     ?? '',
        website:   website[1]   ?? '',
        instagram: instagram[1] ?? '',
        twitter:   twitter[1]   ?? '',
      };
    } catch {
      return defaultProfile;
    }
  },

  async save(profile: UserProfile): Promise<void> {
    // JSON.stringify 없이 각 필드를 문자열로 직접 저장
    const pairs: [string, string][] = [
      [KEYS.name,      String(profile.name      ?? '')],
      [KEYS.bio,       String(profile.bio        ?? '')],
      [KEYS.avatarUri, String(profile.avatarUri  ?? '')],
      [KEYS.email,     String(profile.email      ?? '')],
      [KEYS.website,   String(profile.website    ?? '')],
      [KEYS.instagram, String(profile.instagram  ?? '')],
      [KEYS.twitter,   String(profile.twitter    ?? '')],
    ];
    await AsyncStorage.multiSet(pairs);
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove(Object.values(KEYS));
  },
};