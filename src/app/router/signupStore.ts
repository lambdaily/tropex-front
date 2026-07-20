import { create } from "zustand";
import type { SignupData } from "@/app/types/signup";

interface SignupState {
  signupData: SignupData;
  selectedRole: string;
  loginError: string | null;
  signupError: string | null;
  setSignupData: (partial: Partial<SignupData>) => void;
  replaceSignupData: (data: SignupData) => void;
  setSelectedRole: (role: string) => void;
  setLoginError: (error: string | null) => void;
  setSignupError: (error: string | null) => void;
  reset: () => void;
}

export const useSignupStore = create<SignupState>((set) => ({
  signupData: {},
  selectedRole: "",
  loginError: null,
  signupError: null,
  setSignupData: (partial) =>
    set((state) => ({ signupData: { ...state.signupData, ...partial } })),
  replaceSignupData: (data) => set({ signupData: data }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setLoginError: (error) => set({ loginError: error }),
  setSignupError: (error) => set({ signupError: error }),
  reset: () =>
    set({ signupData: {}, selectedRole: "", loginError: null, signupError: null }),
}));
