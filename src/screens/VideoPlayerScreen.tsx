import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Video from 'react-native-video';

interface RouteParams {
  url: string;
  title: string;
}

export default function VideoPlayerScreen() {
  const route = useRoute();
  const nav = useNavigation();
  const { url, title } = route.params as RouteParams;

  return (
    <View style={styles.container}>
      {/* 상단 바 */}
      <View style={styles.topBar}>
        <Pressable onPress={() => nav.goBack()} hitSlop={10}>
          <Text style={styles.backButton}>←</Text>
        </Pressable>
        <Text style={styles.titleText}>{title}</Text>
      </View>

      {/* 비디오 영역 */}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: url }}
          style={styles.video}
          resizeMode="contain"
          controls
          paused={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F2DF',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#E8F2DF',
    borderBottomWidth: 1,
    borderColor: '#C5E1A5',
  },
  backButton: {
    fontSize: 22,
    marginRight: 12,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    flexShrink: 1,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
});
