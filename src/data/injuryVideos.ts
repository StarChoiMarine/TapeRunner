import type { ImageSourcePropType } from 'react-native';

export interface VideoItem {
  id: number;
  title: string;
  url: string;
  thumbnail: ImageSourcePropType; // require('../assets/thumbnails/video_X.png')
  thumbNo: number;               // 파일명 X (video_X.png)
}

export interface InjuryItem {
  id: number;
  name: string;
  videos: VideoItem[];
}

export const injuryVideos: InjuryItem[] = [
  {
    id: 1,
    name: "Plantar Fasciitis (족저근막염)",
    videos: [
      {
        id: 1,
        title: "족저근막염 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EC%A1%B1%EC%A0%80%EA%B7%BC%EB%A7%89%EC%97%BC+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
  {
    id: 2,
    name: "Achilles Tendinopathy (아킬레스건염)",
    videos: [
      {
        id: 1,
        title: "족저근막염 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EC%A1%B1%EC%A0%80%EA%B7%BC%EB%A7%89%EC%97%BC+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
      {
        id: 5,
        title: "아킬레스건 및 종아리 통증 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EC%95%84%ED%82%AC%EB%A0%88%EC%8A%A4%EA%B1%B4%2C+%EC%A2%85%EC%95%84%EB%A6%AC+%ED%86%B5%EC%A6%9D+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_5.png'),
        thumbNo: 5,
      },
    ],
  },
  {
    id: 3,
    name: "Inversion Sprain (발목 내번 염좌)",
    videos: [
      {
        id: 2,
        title: "발목 내번 부상 예방 테이핑 힐락 (C-tape)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EB%B0%9C%EB%AA%A9+%EB%82%B4%EB%B2%88+%EB%B6%80%EC%83%81+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_2.png'),
        thumbNo: 2,
      },
      {
        id: 3,
        title: "발목 전체적 안정성 제공 테이핑 figure8 (C-tape)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video3.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
      {
        id: 13,
        title: "Stirup 발목 내번 안정성 강화 테이핑 (C-tape)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video13.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
  {
    id: 4,
    name: "Hamstring injury (햄스트링 부상)",
    videos: [
      {
        id: 4,
        title: "햄스트링 부상 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%ED%96%84%EC%8A%A4%ED%8A%B8%EB%A7%81+%EB%B6%80%EC%83%81+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_4.png'),
        thumbNo: 4,
      },
      {
        id: 8,
        title: "무릎 뒤쪽 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video8.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
  {
    id: 5,
    name: "PFPS (슬개대퇴통증증후군)",
    videos: [
      {
        id: 6,
        title: "전체적인 무릎 통증 증후군 통증 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EB%AC%B4%EB%A6%8E+%ED%86%B5%EC%A6%9D+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_6.png'),
        thumbNo: 6,
      },
      {
        id: 8,
        title: "무릎 뒤쪽 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video8.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
      {
        id: 9,
        title: "슬개연골 연화증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video9.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
      {
        id: 10,
        title: "무릎 바깥쪽 + 장경인대 통증 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EB%AC%B4%EB%A6%8E+%EC%99%B8%EC%B8%A1%EB%B6%80%2C+%EC%9E%A5%EA%B2%BD%EC%9D%B8%EB%8C%80+%ED%86%B5%EC%A6%9D+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_10.png'),
        thumbNo: 10,
      },
      {
        id: 11,
        title: "대퇴사두근 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video11.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
  {
    id: 6,
    name: "MTSS (내측경골스트레스증후군)",
    videos: [
      {
        id: 7,
        title: "정강이스트레스 증후군 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EC%A0%95%EA%B0%95%EC%9D%B4+%ED%86%B5%EC%A6%9D+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
      {
        id: 12,
        title: "비골 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video12.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
  {
    id: 7,
    name: "ITBS (장경인대증후군)",
    videos: [
      {
        id: 10,
        title: "무릎 바깥쪽 + 장경인대 통증 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EB%AC%B4%EB%A6%8E+%EC%99%B8%EC%B8%A1%EB%B6%80%2C+%EC%9E%A5%EA%B2%BD%EC%9D%B8%EB%8C%80+%ED%86%B5%EC%A6%9D+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_10.png'),
        thumbNo: 10,
      },
      {
        id: 11,
        title: "대퇴사두근 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video11.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
  {
    id: 8,
    name: "TSF (정강이 미세골절)",
    videos: [
      {
        id: 7,
        title: "정강이스트레스 증후군 예방 테이핑 (키네시오)",
        url: "https://tape-runner-videos.s3.ap-northeast-2.amazonaws.com/%EC%A0%95%EA%B0%95%EC%9D%B4+%ED%86%B5%EC%A6%9D+%EC%98%88%EB%B0%A9+%ED%85%8C%EC%9D%B4%ED%95%91.mp4",
        thumbnail: require('../assets/thumbnails/video_7.png'),
        thumbNo: 7,
      },
      {
        id: 12,
        title: "비골 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video12.mp4",
        thumbnail: require('../assets/thumbnails/video_1.png'),
        thumbNo: 1,
      },
    ],
  },
];
