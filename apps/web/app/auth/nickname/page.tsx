"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flame, Check, Loader2 } from "lucide-react";
import { userApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/hooks/use-toast";

export default function NicknamePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [nickname, setNickname] = useState(user?.nickname || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkResult, setCheckResult] = useState<{ available: boolean; reason: string | null } | null>(null);

  const handleCheckNickname = async () => {
    if (nickname.length < 2) {
      toast({
        title: "닉네임 오류",
        description: "닉네임은 2자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      const response = await userApi.checkNickname(nickname);
      if (response.data.success && response.data.data) {
        setCheckResult(response.data.data);
        if (!response.data.data.available) {
          toast({
            title: "사용 불가",
            description: response.data.data.reason === "TAKEN" ? "이미 사용 중인 닉네임입니다." : "사용할 수 없는 닉네임입니다.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "닉네임 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleSubmit = async () => {
    if (!checkResult?.available) {
      toast({
        title: "확인 필요",
        description: "닉네임 중복 확인을 먼저 해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await userApi.updateNickname(nickname);
      if (response.data.success && response.data.data) {
        setUser({ ...user!, nickname: response.data.data.nickname });
        toast({
          title: "완료",
          description: "닉네임이 설정되었습니다.",
        });
        router.replace("/");
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "닉네임 설정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.replace("/");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Flame className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">닉네임 설정</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            서비스에서 사용할 닉네임을 설정해주세요.
            <br />
            닉네임은 30일마다 변경할 수 있습니다.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="space-y-4">
            {/* Nickname Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                닉네임
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="닉네임 (2-10자)"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    setCheckResult(null);
                  }}
                  maxLength={10}
                  className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleCheckNickname}
                  disabled={isChecking || nickname.length < 2}
                  className="rounded-xl border border-border bg-secondary px-4 py-3 font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isChecking ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "중복 확인"
                  )}
                </button>
              </div>
              {checkResult?.available && (
                <p className="mt-2 flex items-center gap-1 text-sm text-score-safe">
                  <Check className="h-4 w-4" />
                  사용 가능한 닉네임입니다.
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSkip}
                className="flex-1 rounded-xl border border-border py-3 font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                나중에 설정
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!checkResult?.available || isSubmitting}
                className="flex-1 rounded-xl bg-primary py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    설정 중...
                  </span>
                ) : (
                  "설정 완료"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
