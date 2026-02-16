// 성과 압박 패턴
// 과도한 성과 압박이나 협박성 표현

export const pressurePatterns = [
  // 성과 압박
  { pattern: '실적이 왜 이래', weight: 3 },
  { pattern: '성과가 없', weight: 2 },
  { pattern: '숫자로 보여줘', weight: 2 },
  { pattern: '결과가 전부', weight: 3 },
  { pattern: '결과로 말해', weight: 2 },
  { pattern: '어떻게든 해', weight: 3 },

  // 협박
  { pattern: '자리 없어', weight: 4 },
  { pattern: '짤릴 줄 알아', weight: 4 },
  { pattern: '나가고 싶어', weight: 3 },
  { pattern: '대신할 사람 많아', weight: 4 },
  { pattern: '너 아니어도', weight: 4 },
  { pattern: '필요 없으면', weight: 3 },

  // 비교 압박
  { pattern: '다른 사람은 잘 하던데', weight: 3 },
  { pattern: '왜 너만 못 해', weight: 4 },
  { pattern: '쟤는 잘 하잖아', weight: 3 },
  { pattern: '신입도 하는데', weight: 3 },
  { pattern: '경력이 몇 년인데', weight: 3 },

  // 능력 비하
  { pattern: '이것도 못 해', weight: 3 },
  { pattern: '그것도 몰라', weight: 3 },
  { pattern: '기본도 안 돼', weight: 3 },
  { pattern: '배운 게 없어', weight: 4 },
  { pattern: '할 줄 아는 게 뭐야', weight: 4 },
  { pattern: '능력이 없', weight: 4 },

  // 평가 협박
  { pattern: '인사고과', weight: 2 },
  { pattern: '평가에 반영', weight: 2 },
  { pattern: '고과 어떻게 될지', weight: 3 },
  { pattern: '승진은 꿈도', weight: 3 },
  { pattern: '연봉 올릴 생각', weight: 2 },
];
