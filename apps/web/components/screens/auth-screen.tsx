"use client";

import { Flame } from "lucide-react";

const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export function AuthScreen() {
  const handleKakaoLogin = () => {
    const kakaoAuthUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${APP_URL}/auth/kakao/callback&response_type=code`;
    window.location.href = kakaoAuthUrl;
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${APP_URL}/auth/google/callback&response_type=code&scope=email%20profile`;
    window.location.href = googleAuthUrl;
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Flame className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">악귀 탐지기</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            직장 내 유해 언행을 탐지하고 공유하세요
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-semibold text-foreground">로그인</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              소셜 계정으로 간편하게 시작하세요
            </p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleKakaoLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3.5 font-semibold text-[#000000] transition-colors hover:bg-[#FDD835]"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 3C6.477 3 2 6.477 2 11c0 2.89 1.898 5.42 4.747 6.845-.153.537-.497 1.953-.57 2.261-.09.38.14.374.295.272.122-.08 1.94-1.283 2.72-1.8.58.087 1.18.132 1.808.132 5.523 0 10-3.477 10-8s-4.477-8-10-8z" />
              </svg>
              카카오로 시작하기
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card py-3.5 font-semibold text-foreground transition-colors hover:bg-secondary"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google로 시작하기
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            로그인하면{" "}
            <a href="/terms" className="text-primary hover:underline">
              이용약관
            </a>{" "}
            및{" "}
            <a href="/privacy" className="text-primary hover:underline">
              개인정보처리방침
            </a>
            에 동의하는 것으로 간주됩니다.
          </p>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          AI 기반 패턴 분석으로 법적 판단을 대체하지 않습니다.
        </p>
      </div>
    </div>
  );
}
