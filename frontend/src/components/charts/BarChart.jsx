import i18n from "../../utils/i18n";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
const CustomTooltip = ({
  active,
  payload,
  label,
  unit
}) => {
  if (active && payload && payload.length) {
    return <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm text-primary font-semibold">
          {payload[0].value}{unit ? ` ${unit}` : ''}
        </p>
      </div>;
  }
  return null;
};
export default function BarChart({
  data = [],
  dataKey = 'injuries',
  nameKey = 'week',
  colors = '#1D9E75',
  unit = ''
}) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A")}</p>
        </div>
      </div>;
  }
  return <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <ReBarChart data={data} margin={{
        top: 10,
        right: 10,
        left: 0,
        bottom: 10
      }} barSize={28}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors} stopOpacity={0.9} />
              <stop offset="100%" stopColor={colors} stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />
          <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{
          fontSize: 11,
          fill: '#6c757d'
        }} interval="preserveStartEnd" />
          <YAxis axisLine={false} tickLine={false} tick={{
          fontSize: 11,
          fill: '#6c757d'
        }} allowDecimals={false} />
          <Tooltip content={<CustomTooltip unit={unit} />} cursor={{
          fill: 'transparent'
        }} />

          <Bar dataKey={dataKey} fill="url(#barGradient)" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={800}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={index === data.length - 1 ? colors : 'url(#barGradient)'} />)}
          </Bar>
        </ReBarChart>
      </ResponsiveContainer>
    </div>;
}