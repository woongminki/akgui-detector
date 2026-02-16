// 책임 전가형 패턴
// 자신의 잘못을 상대방에게 돌리거나 회피하는 표현

export const blameShiftPatterns = [
  // 직접적 책임 전가
  { pattern: '네 탓이야', weight: 4 },
  { pattern: '니 잘못이야', weight: 4 },
  { pattern: '네가 잘못해서', weight: 4 },
  { pattern: '네가 그러니까', weight: 3 },
  { pattern: '너 때문에', weight: 3 },
  { pattern: '다 니가', weight: 3 },

  // 역할 전환
  { pattern: '내가 뭘 잘못했는데', weight: 3 },
  { pattern: '내가 뭘 어쨌다고', weight: 3 },
  { pattern: '내가 언제', weight: 2 },
  { pattern: '난 안 그랬어', weight: 2 },
  { pattern: '내 기억엔', weight: 1 },

  // 피해자 코스프레
  { pattern: '내가 피해자야', weight: 4 },
  { pattern: '오히려 내가', weight: 3 },
  { pattern: '나도 힘들어', weight: 2 },
  { pattern: '나한테 왜 그래', weight: 2 },
  { pattern: '내가 뭔 죄야', weight: 3 },

  // 회피
  { pattern: '그건 내 일 아니', weight: 3 },
  { pattern: '내 소관 아니', weight: 3 },
  { pattern: '나는 모르는 일', weight: 2 },
  { pattern: '나는 관여 안 했', weight: 2 },
  { pattern: '나는 지시받은 대로', weight: 2 },

  // 정당화
  { pattern: '어쩔 수 없었어', weight: 2 },
  { pattern: '다 이유가 있어', weight: 2 },
  { pattern: '상황이 그랬어', weight: 2 },
  { pattern: '원래 그런 거야', weight: 3 },
  { pattern: '다 너를 위한 거야', weight: 3 },
  { pattern: '네가 성장하려면', weight: 2 },
];
