import i18n from "../../utils/i18n";
import { useState, useEffect, useCallback } from 'react';
import { Settings as SettingsIcon, User, Building2, Bell, Lock, Upload, Camera, Save, Eye, EyeOff, Edit2, X, Languages } from 'lucide-react';
import { settingsApi } from '../../api/endpoints/settings';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Avatar from '../../components/ui/Avatar';
import useAuthStore from '../../store/authStore';
import useLanguageStore from '../../store/languageStore';
import toast from 'react-hot-toast';
const tabs = [{
  id: 'club',
  label: i18n.t("\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0627\u062F\u064A"),
  icon: Building2
}, {
  id: 'profile',
  label: i18n.t("\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A"),
  icon: User
}, {
  id: 'password',
  label: i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"),
  icon: Lock
}, {
  id: 'language',
  label: i18n.t('اللغة'),
  icon: Languages
}];
const sportTypes = [i18n.t("\u0643\u0631\u0629 \u0642\u062F\u0645"), i18n.t("\u0643\u0631\u0629 \u0633\u0644\u0629"), i18n.t("\u0643\u0631\u0629 \u064A\u062F"), i18n.t("\u0633\u0628\u0627\u062D\u0629"), i18n.t("\u0623\u0644\u0639\u0627\u0628 \u0642\u0648\u0649"), i18n.t("\u062A\u0646\u0633"), i18n.t("\u0631\u064A\u0627\u0636\u0627\u062A \u0623\u062E\u0631\u0649")];
const colorOptions = ['#1D9E75', '#3B6D11', '#185FA5', '#A32D2D', '#854F0B', '#7C3AED', '#DB2777', '#0D9488', '#ea580c', '#4f46e5', '#be123c', '#047857'];
export default function Settings() {
  const {
    user,
    setUser
  } = useAuthStore();
  const { locale, toggleLanguage } = useLanguageStore();
  const [activeTab, setActiveTab] = useState('club');
  const [loading, setLoading] = useState(false);

  // Club data - saved state
  const [clubData, setClubData] = useState({
    name: i18n.t("\u0646\u0627\u062F\u064A \u0627\u0644\u0647\u0644\u0627\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u064A"),
    name_en: 'Al Hilal Sports Club',
    city: i18n.t("\u0627\u0644\u0631\u064A\u0627\u0636"),
    country: i18n.t("\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629"),
    sport_type: i18n.t("\u0643\u0631\u0629 \u0642\u062F\u0645"),
    primary_color: '#1D9E75'
  });
  const [clubEditMode, setClubEditMode] = useState(false);
  const [clubForm, setClubForm] = useState({
    ...clubData
  });

  // Profile data - saved state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    role: user?.role || ''
  });
  const [profileEditMode, setProfileEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    ...profileData
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [logoFile, setLogoFile] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewLogo, setPreviewLogo] = useState(null);
  const fetchClubSettings = useCallback(async () => {
    try {
      const response = await settingsApi.getClub();
      if (response.data.success) {
        const data = response.data.data;
        const fetched = {
          name: data.name || i18n.t("\u0646\u0627\u062F\u064A \u0627\u0644\u0647\u0644\u0627\u0644 \u0627\u0644\u0631\u064A\u0627\u0636\u064A"),
          name_en: data.name_en || 'Al Hilal Sports Club',
          city: data.city || i18n.t("\u0627\u0644\u0631\u064A\u0627\u0636"),
          country: data.country || i18n.t("\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0627\u0644\u0633\u0639\u0648\u062F\u064A\u0629"),
          sport_type: data.sport_type || i18n.t("\u0643\u0631\u0629 \u0642\u062F\u0645"),
          primary_color: data.primary_color || '#1D9E75'
        };
        setClubData(fetched);
        setClubForm(fetched);
        if (data.logo_url) setPreviewLogo(data.logo_url);
      }
    } catch (error) {
      // Use defaults if API fails
    }
  }, []);
  const fetchProfile = useCallback(async () => {
    try {
      const response = await settingsApi.getProfile();
      if (response.data.success) {
        const data = response.data.data;
        const fetched = {
          name: data.name || user?.name || '',
          phone: data.phone || user?.phone || '',
          email: data.email || user?.email || '',
          role: data.role || user?.role || ''
        };
        setProfileData(fetched);
        setProfileForm(fetched);
      }
    } catch (error) {
      // Use auth store data if API fails
      const fallback = {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        role: user?.role || ''
      };
      setProfileData(fallback);
      setProfileForm(fallback);
    }
  }, [user]);
  useEffect(() => {
    fetchClubSettings();
    fetchProfile();
  }, [fetchClubSettings, fetchProfile]);

  // Club handlers
  const handleClubEdit = () => {
    setClubForm({
      ...clubData
    });
    setClubEditMode(true);
  };
  const handleClubCancel = () => {
    setClubForm({
      ...clubData
    });
    setClubEditMode(false);
    setLogoFile(null);
    if (clubData.logo_url) setPreviewLogo(clubData.logo_url);else setPreviewLogo(null);
  };
  const handleSaveClub = async () => {
    try {
      setLoading(true);
      await settingsApi.updateClub(clubForm);
      setClubData({
        ...clubForm
      });
      setClubEditMode(false);
      toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0627\u062F\u064A \u0628\u0646\u062C\u0627\u062D"));
    } catch (error) {
      // Save to localStorage as fallback
      localStorage.setItem('smis-club-settings', JSON.stringify(clubForm));
      setClubData({
        ...clubForm
      });
      setClubEditMode(false);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0645\u062D\u0644\u064A\u0627\u064B"));
    } finally {
      setLoading(false);
    }
  };

  // Profile handlers
  const handleProfileEdit = () => {
    setProfileForm({
      ...profileData
    });
    setProfileEditMode(true);
  };
  const handleProfileCancel = () => {
    setProfileForm({
      ...profileData
    });
    setProfileEditMode(false);
    setAvatarFile(null);
  };
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await settingsApi.updateProfile(profileForm);
      if (response.data.success) {
        setUser(response.data.data);
        setProfileData({
          ...profileForm
        });
        setProfileEditMode(false);
        toast.success(i18n.t("\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A \u0628\u0646\u062C\u0627\u062D"));
      }
    } catch (error) {
      localStorage.setItem('smis-profile', JSON.stringify(profileForm));
      setProfileData({
        ...profileForm
      });
      setProfileEditMode(false);
      toast.success(i18n.t("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A \u0645\u062D\u0644\u064A\u0627\u064B"));
    } finally {
      setLoading(false);
    }
  };
  const handleChangePassword = async () => {
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error(i18n.t("\u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0645\u0637\u0644\u0648\u0628\u0629"));
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(i18n.t("\u0643\u0644\u0645\u0627\u062A \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0645\u062A\u0637\u0627\u0628\u0642\u0629"));
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 6 \u0623\u062D\u0631\u0641 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644"));
      return;
    }
    try {
      setLoading(true);
      await settingsApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      toast.success(i18n.t("\u062A\u0645 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0628\u0646\u062C\u0627\u062D"));
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error(error.response?.data?.message || i18n.t("\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"));
    } finally {
      setLoading(false);
    }
  };
  const handleLogoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };
  const handleUploadLogo = async () => {
    if (!logoFile) return;
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);
      await settingsApi.uploadLogo(formData);
      toast.success(i18n.t("\u062A\u0645 \u0631\u0641\u0639 \u0627\u0644\u0634\u0639\u0627\u0631 \u0628\u0646\u062C\u0627\u062D"));
      setLogoFile(null);
    } catch (error) {
      toast.success(i18n.t("\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0634\u0639\u0627\u0631 \u0645\u0624\u0642\u062A\u0627\u064B"));
    }
  };
  const roleLabel = role => {
    const roleMap = {
      club_admin: i18n.t("\u0645\u062F\u064A\u0631 \u0627\u0644\u0646\u0627\u062F\u064A"),
      doctor: i18n.t("\u0637\u0628\u064A\u0628"),
      physiotherapist: i18n.t("\u0623\u062E\u0635\u0627\u0626\u064A \u0639\u0644\u0627\u062C \u0637\u0628\u064A\u0639\u064A"),
      coach: i18n.t("\u0645\u062F\u0631\u0628"),
      nutritionist: i18n.t("\u0623\u062E\u0635\u0627\u0626\u064A \u062A\u063A\u0630\u064A\u0629"),
      manager: i18n.t("\u0645\u062F\u064A\u0631 \u0639\u0645\u0644\u064A\u0627\u062A"),
      analyst: i18n.t("\u0645\u062D\u0644\u0644"),
      nurse: i18n.t("\u0645\u0645\u0631\u0636")
    };
    return roleMap[role] || role;
  };
  return <div className="animate-fade-in">
      <PageHeader title={<div className="flex items-center gap-3">
            <SettingsIcon className="w-6 h-6 text-primary" />
            <span>{i18n.t("\u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A")}</span>
          </div>} subtitle={i18n.t("\u0625\u062F\u0627\u0631\u0629 \u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A")} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="card p-2">
            {tabs.map(tab => {
            const Icon = tab.icon;
            return <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>;
          })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Club Settings */}
          {activeTab === 'club' && <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{i18n.t("\u0625\u0639\u062F\u0627\u062F\u0627\u062A \u0627\u0644\u0646\u0627\u062F\u064A")}</h3>
                {!clubEditMode ? <Button variant="outline" onClick={handleClubEdit} className="gap-2">
                    <Edit2 className="w-4 h-4" />{i18n.t("\u062A\u0639\u062F\u064A\u0644")}</Button> : <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleClubCancel} disabled={loading} className="gap-2">
                      <X className="w-4 h-4" />{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
                    <Button onClick={handleSaveClub} disabled={loading} className="gap-2">
                      <Save className="w-4 h-4" />
                      {loading ? i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...") : i18n.t("\u062D\u0641\u0638")}
                    </Button>
                  </div>}
              </div>

              {/* Logo */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center overflow-hidden">
                    {previewLogo ? <img src={previewLogo} alt="Logo" className="w-full h-full object-contain" /> : <div className="flex flex-col items-center gap-1">
                        <Building2 className="w-10 h-10 text-gray-400" />
                        <span className="text-xs text-gray-400">{i18n.t("\u0634\u0639\u0627\u0631 \u0627\u0644\u0646\u0627\u062F\u064A")}</span>
                      </div>}
                  </div>
                  {clubEditMode && <label className="absolute bottom-0 left-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-dark transition-colors">
                      <Camera className="w-4 h-4 text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                    </label>}
                </div>
                {logoFile && clubEditMode && <Button onClick={handleUploadLogo} className="mt-3" size="sm">
                    <Upload className="w-4 h-4 ml-2" />{i18n.t("\u0631\u0641\u0639 \u0627\u0644\u0634\u0639\u0627\u0631")}</Button>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clubEditMode ? <>
                    <Input label={i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0646\u0627\u062F\u064A")} value={clubForm.name} onChange={e => setClubForm({
                ...clubForm,
                name: e.target.value
              })} />
                    <Input label={i18n.t("\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629")} value={clubForm.name_en} onChange={e => setClubForm({
                ...clubForm,
                name_en: e.target.value
              })} />
                    <Input label={i18n.t("\u0627\u0644\u0645\u062F\u064A\u0646\u0629")} value={clubForm.city} onChange={e => setClubForm({
                ...clubForm,
                city: e.target.value
              })} />
                    <Input label={i18n.t("\u0627\u0644\u062F\u0648\u0644\u0629")} value={clubForm.country} onChange={e => setClubForm({
                ...clubForm,
                country: e.target.value
              })} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0631\u064A\u0627\u0636\u0629")}</label>
                      <select value={clubForm.sport_type} onChange={e => setClubForm({
                  ...clubForm,
                  sport_type: e.target.value
                })} className="input-field w-full">
                        <option value="">{i18n.t("\u0627\u062E\u062A\u0631 \u0627\u0644\u0631\u064A\u0627\u0636\u0629")}</option>
                        {sportTypes.map(sport => <option key={sport} value={sport}>{sport}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A")}</label>
                      <div className="flex flex-wrap gap-2">
                        {colorOptions.map(color => <button key={color} type="button" onClick={() => setClubForm({
                    ...clubForm,
                    primary_color: color
                  })} className={`w-8 h-8 rounded-lg transition-all ${clubForm.primary_color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'}`} style={{
                    backgroundColor: color
                  }} />)}
                      </div>
                    </div>
                  </> : <>
                    {[{
                label: i18n.t("\u0627\u0633\u0645 \u0627\u0644\u0646\u0627\u062F\u064A"),
                value: clubData.name
              }, {
                label: i18n.t("\u0627\u0644\u0627\u0633\u0645 \u0628\u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629"),
                value: clubData.name_en
              }, {
                label: i18n.t("\u0627\u0644\u0645\u062F\u064A\u0646\u0629"),
                value: clubData.city
              }, {
                label: i18n.t("\u0627\u0644\u062F\u0648\u0644\u0629"),
                value: clubData.country
              }, {
                label: i18n.t("\u0627\u0644\u0631\u064A\u0627\u0636\u0629"),
                value: clubData.sport_type
              }].map(({
                label,
                value
              }) => <div key={label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="font-semibold text-gray-900">{value || '—'}</p>
                      </div>)}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-2">{i18n.t("\u0627\u0644\u0644\u0648\u0646 \u0627\u0644\u0631\u0626\u064A\u0633\u064A")}</p>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full border border-white shadow-sm" style={{
                    backgroundColor: clubData.primary_color
                  }} />
                        <span className="font-mono text-sm text-gray-600">{clubData.primary_color}</span>
                      </div>
                    </div>
                  </>}
              </div>
            </div>}

          {/* Profile Settings */}
          {activeTab === 'profile' && <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg">{i18n.t("\u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0634\u062E\u0635\u064A")}</h3>
                {!profileEditMode ? <Button variant="outline" onClick={handleProfileEdit} className="gap-2">
                    <Edit2 className="w-4 h-4" />{i18n.t("\u062A\u0639\u062F\u064A\u0644")}</Button> : <div className="flex gap-2">
                    <Button variant="ghost" onClick={handleProfileCancel} disabled={loading} className="gap-2">
                      <X className="w-4 h-4" />{i18n.t("\u0625\u0644\u063A\u0627\u0621")}</Button>
                    <Button onClick={handleSaveProfile} disabled={loading} className="gap-2">
                      <Save className="w-4 h-4" />
                      {loading ? i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062D\u0641\u0638...") : i18n.t("\u062D\u0641\u0638")}
                    </Button>
                  </div>}
              </div>

              <div className="flex flex-col items-center mb-8">
                <div className="text-center">
                  <p className="font-bold text-xl text-gray-900">{profileData.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{roleLabel(profileData.role)}</p>
                </div>
              </div>

              <div className="space-y-4 max-w-md">
                {profileEditMode ? <>
                    <Input label={i18n.t("\u0627\u0644\u0627\u0633\u0645")} value={profileForm.name} onChange={e => setProfileForm({
                ...profileForm,
                name: e.target.value
              })} />
                    <Input label={i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641")} value={profileForm.phone} onChange={e => setProfileForm({
                ...profileForm,
                phone: e.target.value
              })} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")}</label>
                      <input type="text" value={profileData.email} disabled className="input-field w-full bg-gray-50 text-gray-500" />
                      <p className="text-xs text-gray-400 mt-1">{i18n.t("\u0644\u0627 \u064A\u0645\u0643\u0646 \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A")}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{i18n.t("\u0627\u0644\u062F\u0648\u0631")}</label>
                      <input type="text" value={roleLabel(profileData.role)} disabled className="input-field w-full bg-gray-50 text-gray-500" />
                    </div>
                  </> : <>
                    {[{
                label: i18n.t("\u0627\u0644\u0627\u0633\u0645"),
                value: profileData.name
              }, {
                label: i18n.t("\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641"),
                value: profileData.phone || '—'
              }, {
                label: i18n.t("\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A"),
                value: profileData.email
              }, {
                label: i18n.t("\u0627\u0644\u062F\u0648\u0631 \u0627\u0644\u0648\u0638\u064A\u0641\u064A"),
                value: roleLabel(profileData.role)
              }].map(({
                label,
                value
              }) => <div key={label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="font-semibold text-gray-900">{value || '—'}</p>
                      </div>)}
                  </>}
              </div>
            </div>}

          {/* Password Settings */}
          {activeTab === 'password' && <div className="card">
              <h3 className="font-bold text-lg mb-6">{i18n.t("\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}</h3>

              <div className="space-y-4 max-w-md">
                {[{
              key: 'currentPassword',
              label: i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629"),
              showKey: 'current',
              placeholder: i18n.t("\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062D\u0627\u0644\u064A\u0629")
            }, {
              key: 'newPassword',
              label: i18n.t("\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629"),
              showKey: 'new',
              placeholder: i18n.t("\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0627\u0644\u062C\u062F\u064A\u062F\u0629")
            }, {
              key: 'confirmPassword',
              label: i18n.t("\u062A\u0623\u0643\u064A\u062F \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631"),
              showKey: 'confirm',
              placeholder: i18n.t("\u0623\u062F\u062E\u0644 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u062C\u062F\u062F\u0627\u064B")
            }].map(({
              key,
              label,
              showKey,
              placeholder
            }) => <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                    <div className="relative">
                      <input type={showPassword[showKey] ? 'text' : 'password'} value={passwordForm[key]} onChange={e => setPasswordForm({
                  ...passwordForm,
                  [key]: e.target.value
                })} className="input-field w-full pr-10" placeholder={placeholder} />
                      <button type="button" onClick={() => setShowPassword({
                  ...showPassword,
                  [showKey]: !showPassword[showKey]
                })} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showPassword[showKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>)}
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={handleChangePassword} disabled={loading}>
                  <Lock className="w-4 h-4 ml-2" />
                  {loading ? i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u063A\u064A\u064A\u0631...") : i18n.t("\u062A\u063A\u064A\u064A\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631")}
                </Button>
              </div>
            </div>}

          {/* Language Settings */}
          {activeTab === 'language' && <div className="card">
              <div className="flex items-center gap-3 mb-6">
                <Languages className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">{i18n.t('إعدادات اللغة')}</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-gray-500">{i18n.t('اختر لغة عرض النظام')}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                  {/* Arabic */}
                  <button
                    onClick={() => locale !== 'ar' && toggleLanguage()}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${locale === 'ar' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}
                  >
                    <span className="text-2xl">🇸🇦</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">العربية</p>
                      <p className="text-xs text-gray-500">Arabic</p>
                    </div>
                    {locale === 'ar' && <div className="mr-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>}
                  </button>

                  {/* English */}
                  <button
                    onClick={() => locale !== 'en' && toggleLanguage()}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${locale === 'en' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/40 hover:bg-gray-50'}`}
                  >
                    <span className="text-2xl">🇬🇧</span>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">English</p>
                      <p className="text-xs text-gray-500">الإنجليزية</p>
                    </div>
                    {locale === 'en' && <div className="mr-auto w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>}
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-2">{i18n.t('سيتم إعادة تحميل الصفحة عند تغيير اللغة')}</p>
              </div>
            </div>}
        </div>
      </div>
    </div>;
}