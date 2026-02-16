"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Loader2, AlertCircle } from "lucide-react";
import { groupApi } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useGroupStore } from "@/stores/group";
import { useToast } from "@/hooks/use-toast";

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const { isAuthenticated, isLoading: authLoading, initialize } = useAuthStore();
  const { addGroup, setCurrentGroup } = useGroupStore();
  const { toast } = useToast();

  const [inviteInfo, setInviteInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await groupApi.verifyInvite(token);
        if (response.data.success && response.data.data) {
          setInviteInfo(response.data.data);
        }
      } catch (error) {
        toast({
          title: "유효하지 않은 초대",
          description: "초대 링크가 만료되었거나 유효하지 않습니다.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, toast]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      localStorage.setItem("pendingInviteToken", token);
      router.push("/auth");
      return;
    }

    setIsJoining(true);
    try {
      const response = await groupApi.join(token);
      if (response.data.success && response.data.data) {
        const { id, label, alreadyMember } = response.data.data;

        if (alreadyMember) {
          toast({ title: "이미 참여 중인 그룹입니다." });
        } else {
          addGroup({ id, label, memberCount: 1, postCount: 0 });
          setCurrentGroup({ id, label, memberCount: 1, postCount: 0 });
          toast({ title: "그룹에 참여했습니다!" });
        }

        router.push("/");
      }
    } catch (error: any) {
      toast({
        title: "참여 실패",
        description: error.response?.data?.error?.message || "그룹 참여 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
        <div className="text-muted-foreground">확인 중...</div>
      </div>
    );
  }

  if (!inviteInfo?.valid) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/20">
              <AlertCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">유효하지 않은 초대</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {inviteInfo?.isExpired
                ? "초대 링크가 만료되었습니다."
                : "초대 링크가 유효하지 않습니다."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/auth")}
            className="w-full rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            홈으로 이동
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20">
            <Users className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">그룹 초대</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            악귀 탐지기 그룹에 초대되었습니다
          </p>
        </div>

        {/* Invite Card */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">{inviteInfo.groupLabel}</h2>
            <div className="mt-4 flex justify-center">
              <div className="rounded-2xl bg-secondary px-6 py-4 text-center">
                <p className="text-3xl font-bold text-foreground">{inviteInfo.memberCount}</p>
                <p className="text-sm text-muted-foreground">현재 멤버</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleJoin}
            disabled={isJoining}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {isJoining ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                참여 중...
              </>
            ) : isAuthenticated ? (
              "그룹 참여하기"
            ) : (
              "로그인하고 참여하기"
            )}
          </button>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            악귀 탐지기에서 동료들과 익명으로 소통하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
