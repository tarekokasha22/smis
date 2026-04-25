import { create } from 'zustand';

const useUIStore = create((set) => ({
  // حالة الشريط الجانبي
  sidebarOpen: true,
  sidebarMobileOpen: false,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
  closeMobileSidebar: () => set({ sidebarMobileOpen: false }),

  // المودال
  activeModal: null,
  modalData: null,
  openModal: (name, data = null) => set({ activeModal: name, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),

  // جاري التحميل العام
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
}));

export default useUIStore;
