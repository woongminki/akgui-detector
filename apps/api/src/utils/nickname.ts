import { User } from '../models/index.js';

// Adjectives for nickname generation
const adjectives = [
  '행복한',
  '즐거운',
  '신나는',
  '용감한',
  '지혜로운',
  '친절한',
  '멋진',
  '귀여운',
  '씩씩한',
  '당당한',
  '활발한',
  '차분한',
  '따뜻한',
  '밝은',
  '건강한',
  '똑똑한',
  '재미있는',
  '성실한',
  '긍정적인',
  '창의적인',
];

// Nouns for nickname generation
const nouns = [
  '고양이',
  '강아지',
  '토끼',
  '여우',
  '곰돌이',
  '판다',
  '사자',
  '호랑이',
  '펭귄',
  '올빼미',
  '다람쥐',
  '고슴도치',
  '수달',
  '너구리',
  '코알라',
  '햄스터',
  '앵무새',
  '돌고래',
  '나비',
  '무지개',
];

export const generateRandomNickname = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 100);

    const nickname = `${adjective}${noun}${number}`;

    // Check if nickname exists
    const existing = await User.findOne({ nickname });
    if (!existing) {
      return nickname;
    }

    attempts++;
  }

  // Fallback with timestamp
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const timestamp = Date.now().toString().slice(-4);

  return `${adjective}${noun}${timestamp}`;
};
