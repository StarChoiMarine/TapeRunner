export interface VideoItem {
  id: number;
  title: string;
  url: string;
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video1.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video1.mp4",
      },
      {
        id: 5,
        title: "아킬레스건 및 종아리 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video5.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video2.mp4",
      },
      {
        id: 3,
        title: "발목 전체적 안정성 제공 테이핑 figure8 (C-tape)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video3.mp4",
      },
      {
        id: 13,
        title: "Stirup 발목 내번 안정성 강화 테이핑 (C-tape)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video13.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video4.mp4",
      },
      {
        id: 8,
        title: "무릎 뒤쪽 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video8.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video6.mp4",
      },
      {
        id: 8,
        title: "무릎 뒤쪽 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video8.mp4",
      },
      {
        id: 9,
        title: "슬개연골 연화증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video9.mp4",
      },
      {
        id: 10,
        title: "무릎 바깥쪽 + 장경인대 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video10.mp4",
      },
      {
        id: 11,
        title: "대퇴사두근 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video11.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video7.mp4",
      },
      {
        id: 12,
        title: "비골 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video12.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video10.mp4",
      },
      {
        id: 11,
        title: "대퇴사두근 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video11.mp4",
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
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video7.mp4",
      },
      {
        id: 12,
        title: "비골 통증 예방 테이핑 (키네시오)",
        url: "https://your-bucket-name.s3.ap-northeast-2.amazonaws.com/video12.mp4",
      },
    ],
  },
];
