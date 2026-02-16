"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { Loader2 } from "lucide-react";

export default function KakaoCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setTokens, setUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const hasHandledRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get("code");

    if (!code) {
      setError("인가 코드가 없습니다.");
      return;
    }

    // 이미 성공적으로 처리했으면 무시
    if (hasHandledRef.current) return;

    const handleLogin = async () => {
      try {
        const response = await authApi.kakaoLogin(code);

        if (response.data.success && response.data.data) {
          // 성공 처리는 한 번만
          if (hasHandledRef.current) return;
          hasHandledRef.current = true;

          const { user, tokens, isNewUser } = response.data.data;
          setTokens(tokens.accessToken, tokens.refreshToken);
          setUser(user);

          if (isNewUser) {
            router.replace("/auth/nickname");
          } else {
            router.replace("/");
          }
        } else {
          setError("로그인에 실패했습니다.");
        }
      } catch (err: any) {
        // 이미 성공 처리됐으면 에러 무시 (중복 호출로 인한 에러)
        if (hasHandledRef.current) return;

        console.error("Kakao login error:", err);
        setError("로그인 중 오류가 발생했습니다.");
      }
    };

    handleLogin();
  }, [searchParams, setTokens, setUser, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="mb-4 text-destructive">{error}</p>
          <button
            onClick={() => router.replace("/auth")}
            className="rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
      <div className="text-muted-foreground">로그인 처리 중...</div>
    </div>
  );
}
