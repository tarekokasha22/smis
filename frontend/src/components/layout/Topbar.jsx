import i18n from "../../utils/i18n";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, User, Settings, ChevronDown, Menu, Building2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useUIStore from '../../store/uiStore';
import useLanguageStore from '../../store/languageStore';
import { notificationsApi } from '../../api/endpoints/notifications';
import { getRoleLabel } from '../../utils/formatters';
import { getInitials } from '../../utils/helpers';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import 'dayjs/locale/en';
import isgLogo from '../../assets/isg_logo.jpg';
dayjs.locale(localStorage.getItem('smis-locale') === 'en' ? 'en' : 'ar');
export default function Topbar() {
  const {
    user,
    club,
    logout
  } = useAuthStore();
  const {
    toggleMobileSidebar
  } = useUIStore();
  const {
    locale,
    toggleLanguage
  } = useLanguageStore();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await notificationsApi.getUnreadCount();
        if (res.data.success) setUnreadCount(res.data.data?.unreadCount ?? 0);
      } catch {}
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    const handleClick = e => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const today = dayjs().format(i18n.t("dddd\u060C DD MMMM YYYY"));
  return <header className="fixed top-0 left-0 right-0 h-[var(--topbar-height)] z-30 bg-white border-b border-gray-100" style={{
    boxShadow: '0 1px 8px rgba(0,0,0,0.06)'
  }}>
      <div className="flex items-center justify-between h-full px-5">

        {/* Right side: mobile menu + club info */}
        <div className="flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button onClick={toggleMobileSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Club info */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0 border border-gray-100 shadow-sm overflow-hidden">
              <img src={isgLogo} alt="Sportix" className="w-full h-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-sm font-bold text-gray-900 leading-none">
                {club?.name || 'Sportix'}
              </h2>
              <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{today}</p>
            </div>
          </div>
        </div>

        {/* Left side: language switch + notifications + user */}
        <div className="flex items-center gap-2">

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/5 transition-all duration-200" title={locale === 'ar' ? i18n.t("\u0627\u0644\u0625\u0634\u0639\u0627\u0631\u0627\u062A") : 'Notifications'}>
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-danger rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>}
          </button>

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors group">
              {/* Avatar - Club Logo */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm bg-white border border-gray-100 overflow-hidden">
                {(() => {
                const stored = JSON.parse(localStorage.getItem('smis-club-settings') || '{}');
                return stored.logo_url || club?.logo_url ? <img src={stored.logo_url || club?.logo_url} alt="Sportix" className="w-full h-full object-contain" /> : <img src={isgLogo} alt="Sportix" className="w-full h-full object-contain" />;
              })()}
              </div>
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{getRoleLabel(user?.role)}</p>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50" style={{
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
          }}>
                {/* User Info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold bg-white border border-gray-100 overflow-hidden">
                      {(() => {
                    const stored = JSON.parse(localStorage.getItem('smis-club-settings') || '{}');
                    return stored.logo_url || club?.logo_url ? <img src={stored.logo_url || club?.logo_url} alt="Sportix" className="w-full h-full object-contain" /> : <img src={isgLogo} alt="Sportix" className="w-full h-full object-contain" />;
                  })()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {getRoleLabel(user?.role)}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-1">
                  <button onClick={() => {
                navigate('/settings');
                setDropdownOpen(false);
              }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <User className="w-4 h-4 text-gray-400" />
                    {locale === 'ar' ? i18n.t("\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A") : 'Profile'}
                  </button>
                  <button onClick={() => {
                navigate('/settings');
                setDropdownOpen(false);
              }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings className="w-4 h-4 text-gray-400" />
                    {locale === 'ar' ? i18n.t("\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A") : 'Settings'}
                  </button>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-danger hover:bg-danger-light transition-colors">
                    <LogOut className="w-4 h-4" />
                    {locale === 'ar' ? i18n.t("\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C") : 'Logout'}
                  </button>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </header>;
}