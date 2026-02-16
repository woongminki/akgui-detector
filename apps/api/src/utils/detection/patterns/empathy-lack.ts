// 공감 결여 패턴
// 상대방의 상황이나 입장을 고려하지 않는 표현

export const empathyLackPatterns = [
  // 무관심
  { pattern: '알아서 해', weight: 3 },
  { pattern: '니가 알아서', weight: 3 },
  { pattern: '내 알 바 아니', weight: 4 },
  { pattern: '관심 없어', weight: 3 },
  { pattern: '상관없어', weight: 2 },
  { pattern: '그래서 뭐', weight: 3 },

  // 이해 거부
  { pattern: '이해 안 가', weight: 2 },
  { pattern: '왜 그러는지 모르겠', weight: 2 },
  { pattern: '말이 안 통해', weight: 3 },
  { pattern: '대화가 안 돼', weight: 3 },
  { pattern: '답답해 죽겠', weight: 2 },

  // 무시
  { pattern: '말 끊지 마', weight: 2 },
  { pattern: '끼어들지 마', weight: 2 },
  { pattern: '조용히 해', weight: 2 },
  { pattern: '닥쳐', weight: 4 },
  { pattern: '입 닥쳐', weight: 4 },
  { pattern: '됐거든', weight: 2 },

  // 조롱
  { pattern: '웃기네', weight: 2 },
  { pattern: '웃긴다', weight: 2 },
  { pattern: '농담이지', weight: 2 },
  { pattern: '진짜야', weight: 1 },
  { pattern: '말도 안 돼', weight: 2 },
  { pattern: '어이없', weight: 2 },

  // 일방적 결정
  { pattern: '내가 결정해', weight: 2 },
  { pattern: '이렇게 할 거야', weight: 2 },
  { pattern: '토 달지 마', weight: 4 },
  { pattern: '말대꾸', weight: 3 },
  { pattern: '시키는 대로 해', weight: 4 },
  { pattern: '까라면 까', weight: 4 },

  // 상황 무시
  { pattern: '사정은 모르겠고', weight: 3 },
  { pattern: '핑계 대지 마', weight: 3 },
  { pattern: '변명하지 마', weight: 3 },
  { pattern: '그건 네 사정이고', weight: 4 },
  { pattern: '개인 사정은', weight: 2 },
];
