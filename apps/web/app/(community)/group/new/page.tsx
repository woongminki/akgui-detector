"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Copy, Check, ArrowLeft, Loader2 } from "lucide-react";
import { groupApi } from "@/lib/api";
import { useGroupStore } from "@/stores/group";
import { useToast } from "@/hooks/use-toast";

export default function NewGroupPage() {
  const router = useRouter();
  const { addGroup, setCurrentGroup } = useGroupStore();
  const { toast } = useToast();

  const [label, setLabel] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdGroup, setCreatedGroup] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async () => {
    if (label.length < 2) {
      toast({
        title: "이름 오류",
        description: "그룹 이름은 2자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await groupApi.create(label);
      if (response.data.success && response.data.data) {
        setCreatedGroup(response.data.data);
        addGroup({
          id: response.data.data.id,
          label: response.data.data.label,
          memberCount: 1,
          postCount: 0,
        });
      }
    } catch (error: any) {
      toast({
        title: "생성 실패",
        description: error.response?.data?.error?.message || "그룹 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/invite/${createdGroup.inviteToken}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({
      title: "복사 완료",
      description: "초대 링크가 클립보드에 복사되었습니다.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleComplete = () => {
    if (createdGroup) {
      setCurrentGroup({
        id: createdGroup.id,
        label: createdGroup.label,
        memberCount: 1,
        postCount: 0,
      });
    }
    router.push("/");
  };

  if (createdGroup) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 pb-24">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-score-safe/20">
              <Check className="h-10 w-10 text-score-safe" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">그룹이 생성되었습니다!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              동료들을 초대해서 함께 사용하세요.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <p className="mb-1 text-sm font-medium text-muted-foreground">그룹 이름</p>
              <p className="text-lg font-semibold text-foreground">{createdGroup.label}</p>
            </div>

            <div className="mb-6">
              <p className="mb-2 text-sm font-medium text-muted-foreground">초대 링크</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={`${window.location.origin}/invite/${createdGroup.inviteToken}`}
                  className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center justify-center rounded-xl border border-border bg-secondary px-4 transition-colors hover:bg-secondary/80"
                >
                  {copied ? <Check className="h-5 w-5 text-score-safe" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                초대 링크는 30일간 유효합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleComplete}
              className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              시작하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4">
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-secondary-foreground transition-colors hover:bg-secondary/80"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground">새 그룹 만들기</h1>
      </header>

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            같은 회사/팀/부서 동료들과
            <br />
            익명으로 공유할 그룹을 만드세요.
          </p>
        </div>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            그룹 이름
          </label>
          <input
            type="text"
            placeholder="예: 마케팅팀, 3층 직원들"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={20}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <p className="mt-2 text-xs text-muted-foreground">
            회사명이나 실명은 피해주세요.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || label.length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              생성 중...
            </>
          ) : (
            "그룹 만들기"
          )}
        </button>
      </div>
    </div>
  );
}
