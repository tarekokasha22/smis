import i18n from "../../utils/i18n";
import isgLogo from '../../assets/isg_logo.jpg';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, HeartPulse, Stethoscope, Activity, FileText, Printer, Wrench, Pill, Calendar, TrendingUp, Ruler, BarChart3, UserCog, Bell, ClipboardList, Settings, ChevronRight, ChevronLeft, Shield, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
const NAV_SECTIONS = [{
  items: [{
    path: '/dashboard',
    label: i18n.t("\u0644\u0648\u062D\u0629 \u0627\u0644\u062A\u062D\u0643\u0645"),
    icon: LayoutDashboard
  }, {
    path: '/players',
    label: i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628\u0648\u0646"),
    icon: Users
  }]
}, {
  label: i18n.t("\u0627\u0644\u0631\u0639\u0627\u064A\u0629 \u0627\u0644\u0637\u0628\u064A\u0629"),
  items: [{
    path: '/injuries',
    label: i18n.t("\u0627\u0644\u0625\u0635\u0627\u0628\u0627\u062A"),
    icon: HeartPulse
  }, {
    path: '/vitals',
    label: i18n.t("\u0627\u0644\u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062D\u064A\u0648\u064A\u0629"),
    icon: Activity
  }, {
    path: '/rehabilitation',
    label: i18n.t("\u0627\u0644\u062A\u0623\u0647\u064A\u0644"),
    icon: Stethoscope
  }, {
    path: '/measurements',
    label: i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645"),
    icon: Ruler
  }, {
    path: '/performance',
    label: i18n.t("\u062A\u0642\u064A\u064A\u0645 \u0627\u0644\u0623\u062F\u0627\u0621"),
    icon: TrendingUp
  }]
}, {
  label: i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A"),
  items: [{
    path: '/equipment',
    label: i18n.t("\u0627\u0644\u0645\u0639\u062F\u0627\u062A \u0627\u0644\u0637\u0628\u064A\u0629"),
    icon: Wrench
  }, {
    path: '/supplies',
    label: i18n.t("\u0627\u0644\u0645\u0633\u062A\u0644\u0632\u0645\u0627\u062A \u0648\u0627\u0644\u0623\u062F\u0648\u064A\u0629"),
    icon: Pill
  }, {
    path: '/appointments',
    label: i18n.t("\u062C\u062F\u0648\u0644 \u0627\u0644\u0645\u0648\u0627\u0639\u064A\u062F"),
    icon: Calendar
  }]
}, {
  label: i18n.t("\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062A"),
  items: [{
    path: '/files',
    label: i18n.t("\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0648\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631"),
    icon: FileText
  }, {
    path: '/printing',
    label: i18n.t("\u0627\u0644\u0637\u0628\u0627\u0639\u0629 \u0648\u0627\u0644\u0625\u0631\u0633\u0627\u0644"),
    icon: Printer
  }, {
    path: '/statistics',
    label: i18n.t("\u0627\u0644\u0625\u062D\u0635\u0627\u0621\u0627\u062A"),
    icon: BarChart3
  }]
}, {
  label: i18n.t("\u0627\u0644\u0646\u0638\u0627\u0645"),
  items: [{
    path: '/users',
    label: i18n.t("\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u0648\u0646"),
    icon: UserCog,
    adminOnly: true
  }, {
    path: '/notifications',
    label: i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A"),
    icon: Bell
  }, {
    path: '/audit',
    label: i18n.t("\u0633\u062C\u0644 \u0627\u0644\u0646\u0634\u0627\u0637"),
    icon: ClipboardList,
    adminOnly: true
  }, {
    path: '/settings',
    label: i18n.t("\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A"),
    icon: Settings
  }]
}];
export default function Sidebar() {
  const {
    sidebarOpen,
    sidebarMobileOpen,
    toggleSidebar,
    closeMobileSidebar
  } = useUIStore();
  const {
    isAdmin
  } = useAuthStore();
  const location = useLocation();
  const collapsed = !sidebarOpen;
  return <>
      {/* Desktop Sidebar */}
      <aside className={`
          fixed top-0 right-0 h-full z-50 flex flex-col
          bg-white border-l border-gray-100
          transition-all duration-300 ease-in-out
          no-scrollbar overflow-y-auto overflow-x-hidden
          ${sidebarMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          ${collapsed ? 'lg:w-[var(--sidebar-collapsed-width)]' : 'lg:w-[var(--sidebar-width)]'}
          w-[var(--sidebar-width)]
        `} style={{
      boxShadow: '2px 0 20px rgba(0,0,0,0.06)'
    }}>
        {/* Logo Area */}
        <div className={`
          flex items-center h-[var(--topbar-height)] border-b border-gray-100 flex-shrink-0
          ${collapsed ? 'justify-center px-3' : 'px-5 gap-3'}
        `}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden bg-white">
            <img src={isgLogo} alt="Sportix" className="w-full h-full object-contain" />
          </div>
          {!collapsed && <div className="animate-fade-in overflow-hidden">
              <h1 className="text-sm font-extrabold text-gray-900 leading-none tracking-tight">Sportix</h1>
              <p className="text-[10px] text-gray-400 leading-tight mt-0.5">{i18n.t("\u0646\u0638\u0627\u0645 \u0627\u0644\u0635\u062D\u0629 \u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0629")}</p>
            </div>}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 no-scrollbar">
          {NAV_SECTIONS.map((section, si) => <div key={si} className={collapsed ? '' : 'mb-1'}>
              {/* Section Label */}
              {section.label && !collapsed && <div className="px-5 pt-4 pb-1.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {section.label}
                  </p>
                </div>}
              {section.label && collapsed && si > 0 && <div className="mx-3 my-2 border-t border-gray-100" />}

              {/* Nav Items */}
              <div className={collapsed ? 'flex flex-col items-center gap-1 px-2' : 'px-3 space-y-0.5'}>
                {section.items.map(item => {
              if (item.adminOnly && !isAdmin()) return null;
              const Icon = item.icon;
              const isActive = location.pathname === item.path || item.path !== '/dashboard' && location.pathname.startsWith(item.path);
              if (collapsed) {
                return <NavLink key={item.path} to={item.path} onClick={closeMobileSidebar} title={item.label} className={`
                          w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
                          ${isActive ? 'bg-primary text-white shadow-sm shadow-primary/30' : 'text-gray-500 hover:bg-primary/8 hover:text-primary'}
                        `}>
                        <Icon className="w-[18px] h-[18px]" />
                      </NavLink>;
              }
              return <NavLink key={item.path} to={item.path} onClick={closeMobileSidebar} className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200 group relative
                        ${isActive ? 'bg-primary text-white shadow-sm shadow-primary/20' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                      `}>
                      <Icon className={`w-[17px] h-[17px] flex-shrink-0 transition-colors
                        ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-primary'}
                      `} />
                      <span className="truncate">{item.label}</span>
                      {isActive && <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary-dark rounded-l-full" />}
                    </NavLink>;
            })}
              </div>
            </div>)}
        </nav>

        {/* Collapse Toggle Button */}
        <div className="hidden lg:flex border-t border-gray-100 p-3 flex-shrink-0 justify-center">
          <button onClick={toggleSidebar} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-primary hover:bg-primary/5 transition-all duration-200 w-full justify-center" title={collapsed ? i18n.t("\u062A\u0648\u0633\u064A\u0639 \u0627\u0644\u0642\u0627\u0626\u0645\u0629") : i18n.t("\u0637\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629")}>
            {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <>
                <PanelLeftClose className="w-4 h-4" />
                <span className="animate-fade-in">{i18n.t("\u0637\u064A \u0627\u0644\u0642\u0627\u0626\u0645\u0629")}</span>
              </>}
          </button>
        </div>
      </aside>
    </>;
}