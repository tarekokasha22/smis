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
export default function HorizontalBarChart({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  colors = ['#1D9E75', '#0F6E56', '#854F0B', '#A32D2D', '#3B6D11', '#185FA5', '#6c757d'],
  unit = ''
}) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A")}</p>
        </div>
      </div>;
  }
  const chartColors = colors.length >= data.length ? colors : [...colors, ...colors, ...colors].slice(0, data.length);
  return <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} layout="vertical" margin={{
      top: 5,
      right: 20,
      left: 10,
      bottom: 5
    }} barSize={24}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e9ecef" />
        
        <XAxis type="number" axisLine={false} tickLine={false} tick={{
        fontSize: 11,
        fill: '#6c757d'
      }} allowDecimals={false} />
        
        <YAxis type="category" dataKey={nameKey} axisLine={false} tickLine={false} tick={{
        fontSize: 11,
        fill: '#495057',
        fontWeight: 500
      }} width={70} />
        
        <Tooltip content={<CustomTooltip unit={unit} />} />
        
        <Bar dataKey={dataKey} radius={[0, 6, 6, 0]} animationBegin={0} animationDuration={800} label={{
        position: 'right',
        fill: '#6c757d',
        fontSize: 11,
        formatter: value => value
      }}>
          {data.map((entry, index) => <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />)}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>;
}