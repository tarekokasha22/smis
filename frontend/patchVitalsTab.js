const fs = require('fs');
const filePath = '/home/tarek/Project/frontend/src/pages/players/PlayerDetail.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add imports if not exist
if (!content.includes("import { useAuthStore }")) {
  content = content.replace(
    "import { playersApi }",
    "import { useAuthStore } from '../../store/authStore';\nimport { VitalFormModal } from '../vitals/Vitals';\nimport { playersApi }"
  );
}

// 2. Pass player to VitalsTab usage
content = content.replace(
  "<VitalsTab playerId={id} />",
  "<VitalsTab playerId={id} player={player} />"
);

// 3. Define the new VitalsTab function entirely
const newVitalsTab = `function VitalsTab({ playerId, player }) {
  const { hasRole } = useAuthStore();
  const canEdit = hasRole(['super_admin', 'club_admin', 'doctor', 'physiotherapist', 'nurse', 'nutritionist', 'manager']);

  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vitalToEdit, setVitalToEdit] = useState(null);
  const [vitalToDelete, setVitalToDelete] = useState(null);

  const fetchVitals = useCallback(() => {
    setLoading(true);
    vitalsApi.getPlayerVitals(playerId, { days: 180 })
      .then(r => {
        if (r.data.success) {
          const arr = r.data.data?.vitals || r.data.data || [];
          setVitals([...arr].reverse());
        }
      })
      .catch(() => toast.error('فشل تحميل المؤشرات الحيوية'))
      .finally(() => setLoading(false));
  }, [playerId]);

  useEffect(() => {
    fetchVitals();
  }, [fetchVitals]);

  const handleSaveVital = async (formData, editId) => {
    try {
      if (editId) {
        await vitalsApi.update(editId, formData);
        toast.success('تم تحديث القياس بنجاح');
      } else {
        await vitalsApi.create(formData);
        toast.success('تم تسجيل المؤشرات الحيوية بنجاح');
      }
      setIsFormOpen(false);
      setVitalToEdit(null);
      fetchVitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ القياس');
      throw error;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!vitalToDelete) return;
    try {
      await vitalsApi.delete(vitalToDelete.id);
      toast.success('تم حذف القياس بنجاح');
      setVitalToDelete(null);
      fetchVitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حذف القياس');
    }
  };

  const ABNORMAL = {
    heart_rate: v => v > 100 || v < 50,
    spo2: v => v < 95,
    temperature: v => v > 37.5,
    blood_pressure_systolic: v => v > 140,
    fatigue_level: v => v >= 8,
  };

  function VitalBadge({ label, value, unit, field }) {
    if (!value && value !== 0) return null;
    const abnormal = ABNORMAL[field]?.(parseFloat(value));
    return (
      <div className={\`p-3 rounded-xl border text-center \${abnormal ? 'bg-danger-light border-danger/20' : 'bg-gray-50 border-gray-100'}\`}>
        <p className="text-xs text-gray-500 mb-1">{label}</p>
        <p className={\`text-lg font-bold font-numbers \${abnormal ? 'text-danger' : 'text-gray-900'}\`}>
          {value}<span className="text-xs font-normal ml-0.5">{unit}</span>
        </p>
        {abnormal && <p className="text-[10px] text-danger mt-0.5">⚠ خارج الطبيعي</p>}
      </div>
    );
  }

  if (loading) return <TabLoading />;

  return (
    <div className="space-y-6">
      {/* Latest reading header and actions */}
      <div className="flex items-center justify-between mt-4">
        <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          المؤشرات الحيوية
        </h4>
        {canEdit && (
          <Button onClick={() => { setVitalToEdit(null); setIsFormOpen(true); }} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" />
            تسجيل قياس جديد
          </Button>
        )}
      </div>

      {!vitals.length ? (
        <EmptyState icon={Activity} title="لا توجد مؤشرات حيوية" subtitle="لم يتم تسجيل أي قياسات حيوية لهذا اللاعب بعد" />
      ) : (
        <>
          {/* Latest reading */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2 text-sm">
              <HeartPulse className="w-4 h-4 text-primary" />
              أحدث قياس — {dayjs(vitals[0].recorded_at).format('DD/MM/YYYY HH:mm')}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <VitalBadge label="معدل القلب" value={vitals[0].heart_rate} unit="نبضة/د" field="heart_rate" />
              <VitalBadge label="SpO2" value={vitals[0].spo2} unit="%" field="spo2" />
              <VitalBadge label="الحرارة" value={vitals[0].temperature} unit="°C" field="temperature" />
              <VitalBadge label="ضغط الدم" value={vitals[0].blood_pressure_systolic ? \`\${vitals[0].blood_pressure_systolic}/\${vitals[0].blood_pressure_diastolic}\` : null} unit="mmHg" field="blood_pressure_systolic" />
              <VitalBadge label="الوزن" value={vitals[0].weight} unit="كجم" field="weight" />
              <VitalBadge label="مستوى التعب" value={vitals[0].fatigue_level} unit="/10" field="fatigue_level" />
            </div>
          </div>

          {/* History table */}
          <div>
            <h4 className="font-bold text-gray-800 mb-3 text-sm">سجل المؤشرات الحيوية الكامل</h4>
            <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['التاريخ','القلب','SpO2','الحرارة','ضغط الدم','الوزن','التعب','ملاحظات'].map(h => (
                      <th key={h} className="text-right px-3 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">{h}</th>
                    ))}
                    {canEdit && <th className="text-center px-3 py-3 text-xs font-bold text-gray-500 whitespace-nowrap">إجراءات</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {vitals.map(v => (
                    <tr key={v.id} className="hover:bg-primary-50/50 transition-colors">
                      <td className="px-3 py-2.5 font-numbers text-xs text-gray-500 whitespace-nowrap">{dayjs(v.recorded_at).format('DD/MM/YY HH:mm')}</td>
                      <td className="px-3 py-2.5 font-numbers text-center">
                        <span className={v.heart_rate > 100 || v.heart_rate < 50 ? 'text-danger font-bold' : 'text-gray-700'}>{v.heart_rate ?? '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 font-numbers text-center">
                        <span className={v.spo2 < 95 ? 'text-danger font-bold' : 'text-gray-700'}>{v.spo2 ?? '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 font-numbers text-center">
                        <span className={v.temperature > 37.5 ? 'text-danger font-bold' : 'text-gray-700'}>{v.temperature ?? '—'}</span>
                      </td>
                      <td className="px-3 py-2.5 font-numbers text-center text-gray-700 text-xs">
                        {v.blood_pressure_systolic ? \`\${v.blood_pressure_systolic}/\${v.blood_pressure_diastolic}\` : '—'}
                      </td>
                      <td className="px-3 py-2.5 font-numbers text-center text-gray-700">{v.weight ?? '—'}</td>
                      <td className="px-3 py-2.5 font-numbers text-center">
                        {v.fatigue_level != null ? (
                          <span className={\`px-2 py-0.5 rounded-full text-xs font-bold \${v.fatigue_level >= 8 ? 'bg-danger-light text-danger' : v.fatigue_level >= 6 ? 'bg-warning-light text-warning' : 'bg-success-light text-success'}\`}>
                            {v.fatigue_level}/10
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-gray-400 max-w-[120px] truncate" title={v.notes}>{v.notes || '—'}</td>
                      {canEdit && (
                        <td className="px-3 py-2.5 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => { setVitalToEdit(v); setIsFormOpen(true); }}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-colors"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setVitalToDelete(v)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-danger hover:bg-danger-light transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <VitalFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setVitalToEdit(null); }}
        onSave={handleSaveVital}
        players={player ? [player] : []}
        vitalToEdit={vitalToEdit || { player_id: playerId }}
      />

      <Modal
        isOpen={!!vitalToDelete}
        onClose={() => setVitalToDelete(null)}
        title="تأكيد حذف القياس"
        size="sm"
      >
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-danger-light flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-7 h-7 text-danger" />
          </div>
          <p className="text-gray-600 mb-2">هل أنت متأكد من حذف هذا القياس؟</p>
          {vitalToDelete && (
            <p className="text-sm text-gray-400 mb-6 font-numbers">
              {dayjs(vitalToDelete.recorded_at).format('DD/MM/YYYY HH:mm')}
            </p>
          )}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setVitalToDelete(null)} className="flex-1">إلغاء</Button>
            <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">حذف</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}`;

content = content.replace(
  /function VitalsTab\(\{\s*playerId\s*\}\) \{[\s\S]*?\}\n\n\/\/ ── Measurements Tab ─────────────────────────/,
  newVitalsTab + "\n\n// ── Measurements Tab ─────────────────────────"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log("Updated PlayerDetail.jsx successfully.");
