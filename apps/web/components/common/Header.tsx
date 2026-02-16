'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Plus, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/auth';
import { useGroupStore } from '@/stores/group';

export default function Header() {
  const { user, logout } = useAuthStore();
  const { groups, currentGroup, setCurrentGroup } = useGroupStore();
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  const handleGroupChange = (group: typeof currentGroup) => {
    setCurrentGroup(group);
    setShowGroupSelector(false);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="relative">
          <button
            onClick={() => setShowGroupSelector(!showGroupSelector)}
            className="flex items-center gap-1 font-semibold"
          >
            {currentGroup?.label || '그룹 선택'}
            <ChevronDown className="h-4 w-4" />
          </button>
          {showGroupSelector && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowGroupSelector(false)}
              />
              <div className="absolute left-0 top-full z-20 mt-2 w-48 rounded-md border bg-background shadow-lg">
                {groups.map((group) => (
                  <button
                    key={group.id}
                    onClick={() => handleGroupChange(group)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-muted ${
                      currentGroup?.id === group.id ? 'bg-muted' : ''
                    }`}
                  >
                    {group.label}
                  </button>
                ))}
                <Link
                  href="/group/new"
                  className="flex w-full items-center gap-2 border-t px-4 py-2 text-sm hover:bg-muted"
                  onClick={() => setShowGroupSelector(false)}
                >
                  <Plus className="h-4 w-4" />
                  새 그룹 만들기
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{user?.nickname}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
