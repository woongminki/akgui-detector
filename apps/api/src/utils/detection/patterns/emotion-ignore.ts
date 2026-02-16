// 감정 무시형 패턴
// 상대방의 감정을 무시하거나 축소하는 표현

export const emotionIgnorePatterns = [
  // 감정 축소
  { pattern: '그게 뭐가 힘들어', weight: 3 },
  { pattern: '뭐가 힘든데', weight: 3 },
  { pattern: '그게 뭐가 힘드냐', weight: 3 },
  { pattern: '별거 아닌 거', weight: 2 },
  { pattern: '별거 아니잖아', weight: 2 },
  { pattern: '대수롭지 않', weight: 2 },
  { pattern: '대수야', weight: 2 },

  // 감정 부정
  { pattern: '네 감정은 중요하지 않', weight: 4 },
  { pattern: '감정적이야', weight: 2 },
  { pattern: '감정적으로 굴', weight: 3 },
  { pattern: '울면 안 돼', weight: 2 },
  { pattern: '울지 마', weight: 1 },
  { pattern: '왜 울어', weight: 2 },
  { pattern: '울긴 왜 울어', weight: 3 },

  // 예민 지적
  { pattern: '예민하게 굴', weight: 3 },
  { pattern: '너무 예민해', weight: 3 },
  { pattern: '예민한 거 아니야', weight: 2 },
  { pattern: '유난 떨', weight: 3 },
  { pattern: '유난이야', weight: 3 },
  { pattern: '너만 그래', weight: 3 },

  // 감정 무효화
  { pattern: '그렇게 생각하면 안 돼', weight: 2 },
  { pattern: '네 생각이 잘못된 거야', weight: 3 },
  { pattern: '그냥 넘어가', weight: 2 },
  { pattern: '쿨하게', weight: 1 },
  { pattern: '쿨해져', weight: 2 },
  { pattern: '잊어버려', weight: 1 },

  // 비교 축소
  { pattern: '나도 그랬어', weight: 1 },
  { pattern: '다들 그래', weight: 2 },
  { pattern: '누구나 겪는 거야', weight: 2 },
  { pattern: '나때는 더 했어', weight: 3 },
  { pattern: '나때는 말이야', weight: 2 },
  { pattern: '옛날에는', weight: 1 },
];
