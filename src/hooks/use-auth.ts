import { useMutation } from "@tanstack/vue-query";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import type { LoginPayload } from "@/api/auth/types";
import { useAuthStore } from "@/stores/auth";

export const useAuth = () => {
  const authStore = useAuthStore();
  authStore.restoreState();
  const { user } = storeToRefs(authStore);

  const loginMutation = useMutation({
    mutationFn: (payload: LoginPayload) => authStore.login(payload),
  });

  const isLogin = computed(() => authStore.isLogin);

  const login = (payload: LoginPayload) => loginMutation.mutateAsync(payload);
  const logout = () => authStore.logout();

  return {
    user,
    isLogin,
    login,
    logout,
    loginPending: computed(() => loginMutation.isPending.value),
  };
};
