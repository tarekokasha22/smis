import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      club: null,

      // تسجيل الدخول
      setAuth: (user, token, refreshToken) => {
        set({
          user,
          token,
          refreshToken,
          club: user?.club || null,
        });
      },

      // تحديث التوكنات
      setTokens: (token, refreshToken) => {
        set({ token, refreshToken });
      },

      // تحديث بيانات المستخدم
      setUser: (user) => {
        set({ user, club: user?.club || null });
      },

      // تسجيل الخروج
      logout: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          club: null,
        });
      },

      // التحقق من الصلاحية
      hasRole: (roles) => {
        const user = get().user;
        if (!user) return false;
        if (user.role === 'super_admin') return true;
        if (typeof roles === 'string') return user.role === roles;
        return roles.includes(user.role);
      },

      // هل المستخدم مسؤول
      isAdmin: () => {
        const user = get().user;
        return user?.role === 'super_admin' || user?.role === 'club_admin';
      },
    }),
    {
      name: 'smis-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        club: state.club,
      }),
    }
  )
);

export default useAuthStore;
