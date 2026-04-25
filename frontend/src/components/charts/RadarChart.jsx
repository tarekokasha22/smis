import i18n from "../../utils/i18n";
import { RadarChart as ReRadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
const CustomTooltip = ({
  active,
  payload
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
        <p className="font-semibold text-gray-900 mb-1">{data.metric}</p>
        <p className="text-sm text-primary font-semibold">
          {data.value} / {data.fullMark}
        </p>
      </div>;
  }
  return null;
};
export default function RadarChart({
  data,
  title
}) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A")}</p>
      </div>;
  }
  return <div className="h-full flex flex-col">
      {title && <h4 className="text-sm font-bold text-gray-800 mb-4 text-center">{title}</h4>}
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ReRadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1D9E75" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1D9E75" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <PolarGrid stroke="#e9ecef" />

            <PolarAngleAxis dataKey="metric" tick={{
            fontSize: 11,
            fill: '#495057',
            fontWeight: 600
          }} />

            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{
            fontSize: 10,
            fill: '#adb5bd'
          }} tickCount={6} />

            <Radar name={i18n.t("\u0623\u062F\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642")} dataKey="value" stroke="#1D9E75" strokeWidth={2} fill="url(#radarGradient)" animationBegin={0} animationDuration={1000} />

            <Tooltip content={<CustomTooltip />} />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>
    </div>;
}