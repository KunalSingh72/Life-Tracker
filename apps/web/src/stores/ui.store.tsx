import { create } from "zustand";

interface UIStore {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  isScheduleModalOpen: boolean;
  openScheduleModal: () => void;
  closeScheduleModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () =>
    set((state) => ({
      sidebarOpen: !state.sidebarOpen,
    })),
  isScheduleModalOpen: false,
  openScheduleModal: () => set({ isScheduleModalOpen: true }),
  closeScheduleModal: () => set({ isScheduleModalOpen: false }),
}));
