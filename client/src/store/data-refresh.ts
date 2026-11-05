import { create } from "zustand";

interface DataRefreshState {
  version: number;
  invalidate: () => void;
}

export const useDataRefresh = create<DataRefreshState>((set) => ({
  version: 0,
  invalidate: () => set((state) => ({ version: state.version + 1 })),
}));
