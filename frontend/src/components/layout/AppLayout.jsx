import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import useUIStore from '../../store/uiStore';

export default function AppLayout() {
  const { sidebarOpen, sidebarMobileOpen, closeMobileSidebar } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الشريط الجانبي - سطح المكتب */}
      <Sidebar />

      {/* الطبقة المعتمة - الموبايل */}
      {sidebarMobileOpen && (
        <div 
          className="overlay lg:hidden z-40"
          onClick={closeMobileSidebar}
        />
      )}

      {/* المحتوى الرئيسي */}
      <div
        className="transition-all duration-300"
        style={{
          marginRight: sidebarOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed-width)',
        }}
      >
        <Topbar />
        <main className="p-6 mt-[var(--topbar-height)]">
          <div className="max-w-content mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
