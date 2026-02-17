import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { groupApi } from '@/lib/api';

interface Group {
  id: string;
  label: string;
  memberCount: number;
  postCount: number;
}

interface GroupState {
  groups: Group[];
  currentGroup: Group | null;
  isLoading: boolean;
  fetchGroups: () => Promise<void>;
  setCurrentGroup: (group: Group | null) => void;
  addGroup: (group: Group) => void;
}

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      currentGroup: null,
      isLoading: false,

      fetchGroups: async () => {
        set({ isLoading: true });
        try {
          const response = await groupApi.getMyGroups();
          if (response.data.success && response.data.data) {
            const groups = response.data.data;
            const currentGroup = get().currentGroup;

            // 현재 그룹이 사용자의 그룹 목록에 있으면 최신 데이터로 업데이트
            const updatedCurrentGroup = currentGroup
              ? groups.find(g => g.id === currentGroup.id)
              : null;

            if (updatedCurrentGroup) {
              set({ groups, currentGroup: updatedCurrentGroup });
            } else if (groups.length > 0) {
              // 첫 번째 그룹을 현재 그룹으로 설정
              set({ groups, currentGroup: groups[0] });
            } else {
              // 그룹이 없으면 currentGroup도 초기화
              set({ groups, currentGroup: null });
            }
          }
        } catch (error) {
          console.error('Failed to fetch groups:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentGroup: (group) => {
        set({ currentGroup: group });
      },

      addGroup: (group) => {
        set((state) => ({
          groups: [...state.groups, group],
          currentGroup: state.currentGroup || group,
        }));
      },
    }),
    {
      name: 'group-storage',
      partialize: (state) => ({
        currentGroup: state.currentGroup,
      }),
    }
  )
);
