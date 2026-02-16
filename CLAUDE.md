# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Role

너는 세계 최고의 기획, 개발, 디자인, QA 능력을 가졌어. 각각의 모든 작업을 할 때 빠지거나, 놓치는 것 없는지 항상 더블체크해. 그리고 한 섹션의 작업이 끝날 때만 나에게 묻고 한 섹션으로 처리되어야 하는 작업은 묻지 말고 작업을 진행해.

## Project Overview

악귀 탐지기 (Evil Spirit Detector) - 직장 내 유해 언행을 탐지하고 익명으로 공유하는 커뮤니티 서비스

## Tech Stack

| 영역 | 기술 |
|------|------|
| **프론트엔드** | Next.js 14 (App Router) + TypeScript + Tailwind CSS |
| **상태 관리** | Zustand |
| **백엔드** | Node.js + Express + TypeScript |
| **데이터베이스** | MongoDB (Mongoose ODM) |
| **인증** | JWT + 카카오/구글 OAuth |

## Project Structure

```
악귀 탐지기/
├── apps/
│   ├── web/                    # Next.js 프론트엔드
│   │   ├── app/                # App Router
│   │   │   ├── (auth)/         # 인증 페이지
│   │   │   ├── (main)/         # 메인 레이아웃
│   │   │   ├── admin/          # 관리자 페이지
│   │   │   └── invite/         # 초대 링크
│   │   ├── components/         # 리액트 컴포넌트
│   │   ├── hooks/              # 커스텀 훅
│   │   ├── lib/                # API 클라이언트, 유틸리티
│   │   └── stores/             # Zustand 스토어
│   │
│   └── api/                    # Express 백엔드
│       └── src/
│           ├── routes/         # API 라우트
│           ├── controllers/    # 컨트롤러
│           ├── services/       # 비즈니스 로직
│           ├── models/         # Mongoose 모델
│           ├── middlewares/    # 미들웨어
│           └── utils/          # 유틸리티
│               └── detection/  # 악귀 탐지 엔진
│
├── packages/
│   └── shared/                 # 공통 타입, 상수
│
└── docs/                       # 문서
```

## Getting Started

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (프론트엔드 + 백엔드)
pnpm dev

# 프론트엔드만 실행
pnpm dev:web

# 백엔드만 실행
pnpm dev:api

# 빌드
pnpm build
```

## Environment Variables

`.env.example` 파일을 참고하여 `.env` 파일을 생성하세요.

필수 환경변수:
- `MONGODB_URI`: MongoDB 연결 문자열
- `JWT_SECRET`: JWT 시크릿 키
- `KAKAO_CLIENT_ID`, `KAKAO_CLIENT_SECRET`: 카카오 OAuth
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`: 구글 OAuth

## Key Features

1. **회원/인증**: 카카오/구글 소셜 로그인, 닉네임 기반 익명 시스템
2. **지역 그룹**: 초대 링크 기반 그룹 참여/생성
3. **상담소 글 작성**: 태그, 감정, 텍스트 입력 + 안전 필터
4. **악귀 탐지**: 패턴 기반 점수 산출 (1-10점)
5. **대시보드**: 그룹별 통계 및 트렌드
6. **커뮤니티**: 리액션, 댓글, 신고/블락
7. **관리자**: 신고 처리, 감사 로그

## Safety Considerations

- `authorId`는 API 응답에서 노출하지 않음
- 실명, 연락처 등 개인정보 필터링
- 10점 결과에만 고용노동부 신고 CTA 표시
- 고정 고지 문구: "AI 기반 패턴 분석으로 법적 판단을 대체하지 않습니다"
