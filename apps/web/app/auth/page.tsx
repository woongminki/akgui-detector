"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthScreen } from "@/components/screens/auth-screen";
import { useAuthStore } from "@/stores/auth";

export default function AuthPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">로딩 중...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <AuthScreen />;
}
