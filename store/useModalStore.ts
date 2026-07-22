import { create } from 'zustand';

interface LoginModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLoginModalStore = create<LoginModalStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));

interface CreatePlanModalStore {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useCreatePlanModalStore = create<CreatePlanModalStore>((set) => ({
  isOpen: true,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
