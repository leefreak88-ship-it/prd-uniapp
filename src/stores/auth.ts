import { defineStore } from "pinia";
import { loginByPassword } from "@/api/auth";
import { clearAuthToken, setAuthToken } from "@/utils/request";
import type { LoginPayload, LoginSuccessData } from "@/api/auth/types";
import type { UserProfile } from "@/api/types";

interface AuthState {
  token: string;
  user: UserProfile | null;
}

const STORAGE_KEY = "pd-auth-state";

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    token: "",
    user: null,
  }),
  getters: {
    isLogin(state) {
      return Boolean(state.token && state.user);
    },
  },
  actions: {
    saveState() {
      if (this.token) {
        setAuthToken(this.token);
      } else {
        clearAuthToken();
      }
      uni.setStorageSync(
        STORAGE_KEY,
        JSON.stringify({
          token: this.token,
          user: this.user,
        }),
      );
    },
    restoreState() {
      const raw = uni.getStorageSync(STORAGE_KEY);
      if (!raw) {
        return;
      }
      try {
        const parsed = JSON.parse(raw);
        this.token = parsed.token ?? "";
        this.user = parsed.user ?? null;
        if (this.token) {
          setAuthToken(this.token);
        } else {
          clearAuthToken();
        }
      } catch {
        this.token = "";
        this.user = null;
        clearAuthToken();
      }
    },
    async login(payload: LoginPayload) {
      const result = await loginByPassword(payload);
      this.token = result.token ?? "";
      this.user = this.buildUser(result, payload);
      this.saveState();
      return result;
    },
    logout() {
      this.token = "";
      this.user = null;
      this.saveState();
    },
    buildUser(result: LoginSuccessData, payload: LoginPayload): UserProfile {
      return {
        id: result.userId || "",
        account: payload.phone || payload.wxNumber || "",
        nickname: result.userName || "用户",
      };
    },
  },
});
