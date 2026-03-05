import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BlogPost } from '../../../types';
import { Storage } from '../../../utils/storage';
import { Colors } from '../../../constants/theme';
import PostForm from '../../../components/PostForm';

export default function EditPost() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);

  useEffect(() => {
    if (id) Storage.getById(id).then(setPost);
  }, [id]);

  if (!post) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} />
      </View>
    );
  }

  return <PostForm existingPost={post} />;
}
