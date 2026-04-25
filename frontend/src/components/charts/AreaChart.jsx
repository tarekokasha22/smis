import i18n from "../../utils/i18n";
import { AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const CustomTooltip = ({
  active,
  payload,
  label,
  unit
}) => {
  if (active && payload && payload.length) {
    return <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-900 mb-1">{label}</p>
        <p className="text-sm font-semibold" style={{
        color: payload[0].color || '#1D9E75'
      }}>
          {payload[0].value}
          {unit && <span className="text-gray-400 font-normal mr-1 text-xs">{unit}</span>}
        </p>
      </div>;
  }
  return null;
};
export default function AreaChart({
  data,
  title,
  color = '#1D9E75',
  dataKey = 'value',
  xKey = 'date',
  unit = ''
}) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A")}</p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {title && <h4 className="text-sm font-bold text-gray-800 mb-4">{title}</h4>}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ReAreaChart data={data} margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 10
        }}>
            <defs>
              <linearGradient id={`areaGradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />

            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{
            fontSize: 10,
            fill: '#6c757d'
          }} interval="preserveStartEnd" />

            <YAxis axisLine={false} tickLine={false} tick={{
            fontSize: 11,
            fill: '#6c757d'
          }} allowDecimals={false} />

            <Tooltip content={<CustomTooltip unit={unit} />} />

            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2.5} fill={`url(#areaGradient-${dataKey})`} dot={{
            r: 3,
            fill: color,
            strokeWidth: 0
          }} activeDot={{
            r: 5,
            fill: color
          }} animationBegin={0} animationDuration={1000} connectNulls />
          </ReAreaChart>
        </ResponsiveContainer>
      </div>
    </div>;
}