import i18n from "../../utils/i18n";
import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
const CustomTooltip = ({
  active,
  payload,
  label,
  unit
}) => {
  if (active && payload && payload.length) {
    return <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{
          backgroundColor: entry.color
        }} />
            <span className="text-gray-600">{entry.name}:</span>
            <span className="font-semibold" style={{
          color: entry.color
        }}>
              {entry.value}
              {unit && <span className="text-gray-400 font-normal mr-1 text-xs">{unit}</span>}
            </span>
          </div>)}
      </div>;
  }
  return null;
};
const CustomLegend = ({
  payload,
  labelMap = {}
}) => <ul className="flex justify-center gap-4 mt-2">
    {payload.map((entry, index) => <li key={`legend-${index}`} className="flex items-center gap-1.5 text-xs">
        <span className="w-2 h-2 rounded-full" style={{
      backgroundColor: entry.color
    }} />
        <span className="text-gray-600">{labelMap[entry.dataKey] || entry.value}</span>
      </li>)}
  </ul>;

/**
 * Generic / single‑line mode:
 *   <LineChart data={[{date, value}]} dataKey="value" xKey="date" color="#A32D2D" label="معدل القلب" />
 *
 * Multi‑line legacy mode (backward compat with dashboard):
 *   <LineChart data={[{date, heartRate, spo2, weight}]} title="..." />
 */
export default function LineChart({
  data,
  title,
  // generic single-line props
  dataKey,
  xKey = 'date',
  color = '#1D9E75',
  label,
  unit = ''
}) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A")}</p>
      </div>;
  }

  // If a single dataKey is specified → single-line mode
  const isSingleLine = !!dataKey;
  const multiLines = [{
    key: 'heartRate',
    name: i18n.t("\u0645\u0639\u062F\u0644 \u0627\u0644\u0646\u0628\u0636"),
    color: '#A32D2D'
  }, {
    key: 'spo2',
    name: i18n.t("\u0646\u0633\u0628\u0629 \u0627\u0644\u0623\u0643\u0633\u062C\u064A\u0646"),
    color: '#185FA5'
  }, {
    key: 'weight',
    name: i18n.t("\u0627\u0644\u0648\u0632\u0646"),
    color: '#1D9E75'
  }];
  const multiLabelMap = Object.fromEntries(multiLines.map(l => [l.key, l.name]));
  return <div className="h-full flex flex-col">
      {title && <h4 className="text-sm font-bold text-gray-800 mb-2">{title}</h4>}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ReLineChart data={data} margin={{
          top: 10,
          right: 10,
          left: 0,
          bottom: 0
        }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e9ecef" />

            <XAxis dataKey={xKey} axisLine={false} tickLine={false} tick={{
            fontSize: 10,
            fill: '#6c757d'
          }} interval="preserveStartEnd" />

            <YAxis axisLine={false} tickLine={false} tick={{
            fontSize: 11,
            fill: '#6c757d'
          }} />

            <Tooltip content={<CustomTooltip unit={unit} />} />

            {isSingleLine ? <Line type="monotone" dataKey={dataKey} name={label || dataKey} stroke={color} strokeWidth={2.5} dot={{
            r: 3,
            fill: color,
            strokeWidth: 0
          }} activeDot={{
            r: 5,
            fill: color
          }} animationDuration={800} connectNulls /> : <>
                <Legend content={<CustomLegend labelMap={multiLabelMap} />} />
                {multiLines.map(l => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={{
              r: 3,
              fill: l.color
            }} activeDot={{
              r: 5
            }} animationDuration={800} />)}
              </>}
          </ReLineChart>
        </ResponsiveContainer>
      </div>
    </div>;
}