// 과로 정상화 패턴
// 과도한 업무나 야근을 당연시하거나 강요하는 표현

export const overworkNormalizePatterns = [
  // 야근 강요
  { pattern: '야근 좀 하면 어때', weight: 3 },
  { pattern: '야근이 당연', weight: 4 },
  { pattern: '야근은 기본', weight: 4 },
  { pattern: '야근 안 하면', weight: 3 },
  { pattern: '오늘 좀 남아', weight: 2 },
  { pattern: '주말에 좀', weight: 2 },

  // 시간 무시
  { pattern: '퇴근 시간 됐다고', weight: 3 },
  { pattern: '칼퇴하냐', weight: 3 },
  { pattern: '벌써 가', weight: 2 },
  { pattern: '일찍 가네', weight: 2 },
  { pattern: '퇴근이 뭐야', weight: 3 },
  { pattern: '쉬는 날이 어딨어', weight: 4 },

  // 업무량 정상화
  { pattern: '이 정도는 해야지', weight: 3 },
  { pattern: '이것도 못 해', weight: 3 },
  { pattern: '일이 이렇게 많은 게 어딨어', weight: 2 },
  { pattern: '바쁜 게 당연', weight: 3 },
  { pattern: '한가한 거 아니야', weight: 2 },

  // 휴식 비난
  { pattern: '쉴 때가 아니', weight: 3 },
  { pattern: '쉬면서 해', weight: 1 },
  { pattern: '휴가가 뭐야', weight: 3 },
  { pattern: '연차 쓰기 전에', weight: 2 },
  { pattern: '연차를 왜 써', weight: 3 },
  { pattern: '아파도 일해', weight: 4 },

  // 헌신 강요
  { pattern: '회사가 먼저', weight: 3 },
  { pattern: '회사를 생각해', weight: 2 },
  { pattern: '애사심이 없', weight: 3 },
  { pattern: '열정이 부족', weight: 3 },
  { pattern: '프로의식', weight: 2 },
  { pattern: '책임감이 없', weight: 3 },
];
