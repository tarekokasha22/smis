import i18n from "../../utils/i18n";
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { measurementsApi } from '../../api/endpoints/measurements';
import { playersApi } from '../../api/endpoints/players';
import MeasurementForm from './MeasurementForm';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Settings, Plus, TrendingUp, TrendingDown, Activity, User, Search, Filter, Droplet } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
export default function Measurements() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(''); // For trend filtering
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  // Queries
  const {
    data: statsResponse,
    isLoading: isLoadingStats
  } = useQuery({
    queryKey: ['measurementsStats'],
    queryFn: () => measurementsApi.getStats()
  });
  const {
    data: measurementsResponse,
    isLoading: isLoadingMeasurements
  } = useQuery({
    queryKey: ['measurementsList', selectedPlayerId],
    queryFn: () => measurementsApi.getAll({
      player_id: selectedPlayerId,
      limit: 50
    })
  });
  const {
    data: playersResponse
  } = useQuery({
    queryKey: ['players-list'],
    queryFn: () => playersApi.getAll({
      limit: 100
    })
  });
  const deleteMutation = useMutation({
    mutationFn: id => measurementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['measurementsList']);
      queryClient.invalidateQueries(['measurementsStats']);
    }
  });
  const stats = statsResponse?.data?.data?.averages || {};
  const measurements = measurementsResponse?.data?.data || [];
  const players = playersResponse?.data?.data || [];

  // Filter local search 
  const filteredMeasurements = useMemo(() => {
    return measurements.filter(m => m.player?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || m.notes?.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [measurements, searchTerm]);

  // Chart data formatting (for overall view if no player selected, or player trends)
  const dateFnsLocale = localStorage.getItem('smis-locale') === 'en' ? enUS : ar;
  const chartData = [...filteredMeasurements].reverse().map(m => ({
    name: format(new Date(m.measured_at), 'MMM dd', {
      locale: dateFnsLocale
    }),
    bodyFat: m.body_fat_pct,
    muscleMass: m.muscle_mass_kg,
    weight: m.weight
  })).slice(0, 10); // Show last 10 for chart

  return <div className="space-y-6 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{i18n.t("\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u062C\u0633\u0645")}</h1>
          <p className="text-gray-500 mt-1">{i18n.t("\u062A\u062A\u0628\u0639 \u0645\u0624\u0634\u0631\u0627\u062A \u0627\u0644\u062C\u0633\u0645 \u0648\u062A\u063A\u064A\u0631\u0627\u062A \u0627\u0644\u0648\u0632\u0646 \u0644\u0644\u0627\u0639\u0628\u064A\u0646 \u0639\u0644\u0649 \u0645\u062F\u0627\u0631 \u0627\u0644\u0648\u0642\u062A")}</p>
        </div>
        <button onClick={() => {
        setSelectedMeasurement(null);
        setIsFormOpen(true);
      }} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl shadow-md shadow-primary-500/20 hover:bg-primary-dark transition-all duration-200 font-medium text-sm">
          <Plus className="w-4 h-4" />
          <span>{i18n.t("\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u062C\u062F\u064A\u062F")}</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646")} value={`${Number(stats.avgBodyFat || 0).toFixed(1)}%`} icon={<Droplet className="w-6 h-6 text-orange-500" />} gradient="from-orange-50 to-orange-100/50" trend="+1.2%" trendUp={false} />
        <StatCard title={i18n.t("\u0645\u062A\u0648\u0633\u0637 \u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0636\u0644\u064A\u0629")} value={`${Number(stats.avgMuscleMass || 0).toFixed(1)} ${i18n.t('كجم')}`} icon={<Activity className="w-6 h-6 text-blue-500" />} gradient="from-blue-50 to-blue-100/50" trend={`+0.8 ${i18n.t('كجم')}`} trendUp={true} />
        <StatCard title={i18n.t("\u0645\u062A\u0648\u0633\u0637 InBody Score")} value={Number(stats.avgInbodyScore || 0).toFixed(0)} icon={<TrendingUp className="w-6 h-6 text-green-500" />} gradient="from-green-50 to-green-100/50" trend="+3" trendUp={true} />
        <StatCard title={i18n.t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0627\u0644\u0645\u0633\u062C\u0644\u0629")} value={stats.totalMeasurements || 0} icon={<Settings className="w-6 h-6 text-purple-500" />} gradient="from-purple-50 to-purple-100/50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main List and Controls */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50">
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input type="text" placeholder={i18n.t("\u0627\u0628\u062D\u062B \u0639\u0646 \u0644\u0627\u0639\u0628...")} className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow transition-colors text-sm" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select className="block w-full py-2 px-3 border border-gray-200 bg-white rounded-xl text-sm focus:ring-primary-500 focus:border-primary-500 transition-shadow" value={selectedPlayerId} onChange={e => setSelectedPlayerId(e.target.value)}>
                <option value="">{i18n.t("\u0643\u0644 \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646")}</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
             {isLoadingMeasurements ? <div className="p-8 text-center text-gray-500">{i18n.t("\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644...")}</div> : <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{i18n.t("\u0627\u0644\u0644\u0627\u0639\u0628")}</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">{i18n.t("\u0627\u0644\u062A\u0627\u0631\u064A\u062E")}</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{i18n.t("\u0627\u0644\u0648\u0632\u0646")}</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{i18n.t("\u0627\u0644\u062F\u0647\u0648\u0646 %")}</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">{i18n.t("\u0627\u0644\u0639\u0636\u0644\u0627\u062A (\u0643\u062C\u0645)")}</th>
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">InBody</th>
                      <th className="px-6 py-4 right text-xs font-semibold text-gray-500 uppercase tracking-wider">{i18n.t("\u0625\u062C\u0631\u0627\u0621\u0627\u062A")}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredMeasurements.length === 0 ? <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          <Activity className="w-12 h-12 text-gray-200 mb-3 mx-auto" />
                          <p className="font-medium text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0642\u064A\u0627\u0633\u0627\u062A \u0645\u0633\u062C\u0644\u0629")}</p>
                          <p className="text-sm text-gray-300 mt-1">{i18n.t("\u0627\u0636\u063A\u0637 \"\u0625\u0636\u0627\u0641\u0629 \u0642\u064A\u0627\u0633 \u062C\u062F\u064A\u062F\" \u0644\u0644\u0628\u062F\u0621")}</p>
                        </td>
                      </tr> : filteredMeasurements.map(item => <tr key={item.id} className="hover:bg-primary-50/30 transition-colors group">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 relative">
                                {item.player?.avatar_url ? <img className="h-10 w-10 rounded-full object-cover border-2 border-transparent group-hover:border-primary-200 transition-colors" src={item.player.avatar_url.startsWith('http') ? item.player.avatar_url : `/uploads${item.player.avatar_url}`} alt="" /> : <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold border-2 border-transparent group-hover:border-primary-200 transition-colors">
                                    {item.player?.name?.charAt(0) || 'U'}
                                  </div>}
                                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                              </div>
                              <div className="mr-3">
                                <div className="text-sm font-bold text-gray-900 group-hover:text-primary-700 transition-colors">{item.player?.name}</div>
                                <div className="text-xs text-gray-500">{item.player?.position || i18n.t("\u0644\u0627\u0639\u0628")}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {format(new Date(item.measured_at), 'dd MMM yyyy', {
                    locale: dateFnsLocale
                  })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                              {item.weight || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-medium ${item.body_fat_pct > 20 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                              {item.body_fat_pct ? `${item.body_fat_pct}%` : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                              {item.muscle_mass_kg || '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-semibold text-gray-700">
                            {item.inbody_score || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button onClick={() => {
                    setSelectedMeasurement(item);
                    setIsFormOpen(true);
                  }} className="text-primary-600 hover:text-primary-900 ml-3 hover:bg-primary-50 p-1.5 rounded-lg transition-colors">{i18n.t("\u062A\u0639\u062F\u064A\u0644")}</button>
                            <button onClick={() => {
                    if (window.confirm(i18n.t("\u0647\u0644 \u0623\u0646\u062A \u0645\u062A\u0623\u0643\u062F \u0645\u0646 \u0627\u0644\u062D\u0630\u0641\u061F"))) deleteMutation.mutate(item.id);
                  }} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors">{i18n.t("\u062D\u0630\u0641")}</button>
                          </td>
                        </tr>)}
                  </tbody>
                </table>}
          </div>
        </div>

        {/* Charts & Trends Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-6">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-500" />{i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u062F\u0647\u0648\u0646 \u0648\u0627\u0644\u0643\u062A\u0644\u0629 \u0627\u0644\u0639\u0636\u0644\u064A\u0629")}</h3>
          
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{
              top: 10,
              right: 0,
              left: -20,
              bottom: 0
            }}>
                <defs>
                  <linearGradient id="colorMuscle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{
                fontSize: 12,
                fill: '#6b7280'
              }} axisLine={false} tickLine={false} />
                <YAxis tick={{
                fontSize: 12,
                fill: '#6b7280'
              }} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }} />
                <Area type="monotone" dataKey="muscleMass" name={i18n.t("\u0627\u0644\u0639\u0636\u0644\u0627\u062A (\u0643\u062C\u0645)")} stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMuscle)" />
                <Area type="monotone" dataKey="bodyFat" name={i18n.t("\u0627\u0644\u062F\u0647\u0648\u0646 %")} stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorFat)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="h-[200px] w-full mt-4">
            <h4 className="text-sm font-semibold text-gray-500 mb-2">{i18n.t("\u062A\u063A\u064A\u0631\u0627\u062A \u0627\u0644\u0648\u0632\u0646")}</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{
              top: 5,
              right: 0,
              left: -20,
              bottom: 5
            }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{
                fontSize: 11,
                fill: '#9ca3af'
              }} axisLine={false} tickLine={false} hide />
                <YAxis tick={{
                fontSize: 11,
                fill: '#9ca3af'
              }} axisLine={false} tickLine={false} domain={['dataMin - 2', 'auto']} />
                <RechartsTooltip />
                <Line type="monotone" dataKey="weight" name={i18n.t("\u0627\u0644\u0648\u0632\u0646 (\u0643\u062C\u0645)")} stroke="#8b5cf6" strokeWidth={3} dot={{
                strokeWidth: 2,
                r: 4
              }} activeDot={{
                r: 6
              }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {isFormOpen && <MeasurementForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} measurementToEdit={selectedMeasurement} players={players} />}
    </div>;
}
function StatCard({
  title,
  value,
  icon,
  gradient,
  trend,
  trendUp
}) {
  return <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 border border-white/50 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          
          {trend && <div className={`flex items-center mt-2 text-xs font-medium ${trendUp ? 'text-green-600' : 'text-orange-500'}`}>
              {trendUp ? <TrendingUp className="w-3 h-3 ml-1" /> : <TrendingDown className="w-3 h-3 ml-1" />}
              <span>{trend}{i18n.t("\u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0633\u0627\u0628\u0642")}</span>
            </div>}
        </div>
        <div className="p-3 bg-white/80 rounded-xl shadow-sm backdrop-blur-sm">
          {icon}
        </div>
      </div>
    </div>;
}