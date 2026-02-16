"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, FileText, Bookmark, Shield, HelpCircle, LogOut, Radar, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";
import { useGroupStore } from "@/stores/group";
import { userApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: FileText, label: "내가 쓴 글", href: "/my/posts" },
  { icon: Bookmark, label: "북마크", href: "/my/bookmarks" },
  { icon: Shield, label: "안전정책 및 가이드", href: "/safety" },
  { icon: HelpCircle, label: "도움말", href: "/help" },
];

export function MyScreen() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const { groups } = useGroupStore();
  const { toast } = useToast();

  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNicknameChange = async () => {
    if (newNickname.length < 2) {
      toast({
        title: "닉네임 오류",
        description: "닉네임은 2자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // First check availability
      const checkResponse = await userApi.checkNickname(newNickname);
      if (!checkResponse.data.data?.available) {
        toast({
          title: "사용 불가",
          description: "이미 사용 중이거나 사용할 수 없는 닉네임입니다.",
          variant: "destructive",
        });
        return;
      }

      const response = await userApi.updateNickname(newNickname);
      if (response.data.success && response.data.data) {
        setUser({ ...user!, nickname: response.data.data.nickname });
        setIsEditingNickname(false);
        toast({ title: "닉네임이 변경되었습니다." });
      }
    } catch (error: any) {
      toast({
        title: "변경 실패",
        description: error.response?.data?.error?.message || "닉네임 변경 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace("/auth");
  };

  return (
    <div className="pb-24 pt-4">
      {/* Profile Section */}
      <section className="mb-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
            {user?.nickname?.charAt(0) || "익"}
          </div>
          <div className="flex-1">
            {isEditingNickname ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleNicknameChange}
                  disabled={isSubmitting}
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingNickname(false);
                    setNewNickname(user?.nickname || "");
                  }}
                  className="rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground"
                >
                  취소
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-foreground">{user?.nickname || "익명"}</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditingNickname(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {groups.length > 0 ? `${groups[0].label} 멤버` : "그룹 없음"}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            { label: "작성글", value: "-" },
            { label: "받은 공감", value: "-" },
            { label: "평균 점수", value: "-" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* My Groups */}
      <section className="mb-6">
        <h3 className="mb-3 text-sm font-medium text-muted-foreground">내 그룹</h3>
        <div className="space-y-2">
          {groups.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-4 text-center text-muted-foreground">
              참여 중인 그룹이 없습니다.
            </div>
          ) : (
            groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => router.push(`/group/${group.id}`)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-muted-foreground/30"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-sm font-medium text-primary">
                    {group.label.charAt(0)}
                  </div>
                  <div className="text-left">
                    <span className="font-medium text-foreground">{group.label}</span>
                    <p className="text-xs text-muted-foreground">
                      멤버 {group.memberCount} · 글 {group.postCount}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            ))
          )}
        </div>
      </section>

      {/* Menu Items */}
      <section className="mb-6">
        <div className="rounded-2xl border border-border bg-card">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex w-full items-center justify-between p-4 transition-colors hover:bg-secondary/50",
                  index !== menuItems.length - 1 && "border-b border-border"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Logout */}
      <button
        type="button"
        onClick={handleLogout}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-4 text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
      >
        <LogOut className="h-5 w-5" />
        로그아웃
      </button>

      {/* Switch to Detector Mode */}
      <Link
        href="/detector"
        className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary/10 py-4 text-primary transition-colors hover:bg-primary/20"
      >
        <Radar className="h-5 w-5" />
        악귀 탐지 모드로 전환
      </Link>

      {/* Version Info */}
      <div className="text-center text-xs text-muted-foreground">
        악귀 탐지기 v1.0.0 (MVP)
      </div>
    </div>
  );
}
