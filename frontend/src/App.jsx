import i18n from "./utils/i18n";
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ScrollToTop from './components/common/ScrollToTop';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import Players from './pages/players/Players';
import PlayerDetail from './pages/players/PlayerDetail';
import Injuries from './pages/injuries/Injuries';
import Vitals from './pages/vitals/Vitals';
import Rehabilitation from './pages/rehabilitation/Rehabilitation';
import RehabilitationDetail from './pages/rehabilitation/RehabilitationDetail';
import Files from './pages/files/Files';
import Printing from './pages/printing/Printing';
import Equipment from './pages/equipment/Equipment';
import Supplies from './pages/supplies/Supplies';
import Measurements from './pages/measurements/Measurements';
import AuditLog from './pages/audit/AuditLog';
import Users from './pages/users/Users';
import Notifications from './pages/notifications/Notifications';
import Settings from './pages/settings/Settings';
import Appointments from './pages/appointments/Appointments';
import Performance from './pages/performance/Performance';
import Statistics from './pages/statistics/Statistics';
function App() {
  return <>
      <ScrollToTop />
      <Routes>
        {/* صفحة تسجيل الدخول */}
        <Route path="/login" element={<Login />} />

      {/* الصفحات المحمية */}
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {/* يتم إضافة المزيد من الصفحات في المراحل القادمة */}
        <Route path="players" element={<Players />} />
        <Route path="players/:id" element={<PlayerDetail />} />
        <Route path="injuries" element={<Injuries />} />
        <Route path="vitals" element={<Vitals />} />
        <Route path="rehabilitation" element={<Rehabilitation />} />
        <Route path="rehabilitation/:id" element={<RehabilitationDetail />} />
        <Route path="files" element={<Files />} />
        <Route path="printing" element={<Printing />} />
        <Route path="equipment" element={<Equipment />} />
        <Route path="supplies" element={<Supplies />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="performance" element={<Performance />} />
        <Route path="measurements" element={<Measurements />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="users" element={<Users />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>;
}

// حماية المسارات — يجب تسجيل الدخول
function ProtectedRoute({
  children
}) {
  const {
    token,
    user
  } = useAuthStore();
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// صفحة مؤقتة للأقسام التي لم تُبنَ بعد
function PlaceholderPage({
  title
}) {
  return <div className="flex items-center justify-center h-[60vh]">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">{i18n.t("\u0633\u064A\u062A\u0645 \u0628\u0646\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0641\u064A \u0627\u0644\u0645\u0631\u0627\u062D\u0644 \u0627\u0644\u0642\u0627\u062F\u0645\u0629")}</p>
      </div>
    </div>;
}
export default App;