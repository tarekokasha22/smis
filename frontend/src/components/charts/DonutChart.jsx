import i18n from "../../utils/i18n";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
const CustomTooltip = ({
  active,
  payload
}) => {
  if (active && payload && payload.length) {
    return <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold text-gray-900">{payload[0].name}</p>
        <p className="text-sm text-gray-600">
          {payload[0].value}{i18n.t("\u0625\u0635\u0627\u0628\u0629 (")}{Math.round(payload[0].percent * 100)}%)
        </p>
      </div>;
  }
  return null;
};
const CustomLegend = ({
  payload
}) => {
  return <ul className="flex flex-wrap gap-2 sm:gap-3 justify-center mt-2">
      {payload.map((entry, index) => <li key={`legend-${index}`} className="flex items-center gap-1.5 sm:text-sm">
          <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0" style={{
        backgroundColor: entry.color
      }} />
          <span className="text-gray-600 text-xs sm:text-sm">{entry.value}</span>
        </li>)}
    </ul>;
};
export default function DonutChart({
  data = [],
  dataKey = 'value',
  nameKey = 'name',
  centerLabel = i18n.t("\u0625\u0635\u0627\u0628\u0629")
}) {
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center py-6">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13M11 3.055A9.001 9.001 0 1018.945 8m-8.945 5h8.945M12 19.5v-8.25m0 0a4.5 4.5 0 110 9 4.5 4.5 0 010-9z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">{i18n.t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0628\u064A\u0627\u0646\u0627\u062A")}</p>
        </div>
      </div>;
  }
  const total = data.reduce((sum, item) => sum + (item[dataKey] || 0), 0);
  return <div className="h-full flex flex-col">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} cx="50%" cy="45%" innerRadius={50} outerRadius={75} paddingAngle={2} dataKey={dataKey} nameKey={nameKey} animationBegin={0} animationDuration={800}>
            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color || ['#1D9E75', '#854F0B', '#A32D2D', '#3B6D11', '#185FA5', '#6c757d'][index % 6]} strokeWidth={0} className="transition-all duration-300 hover:opacity-80" />)}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} verticalAlign="bottom" height={30} />
        </PieChart>
      </ResponsiveContainer>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{
      marginTop: '-10%'
    }}>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900 font-numbers">{total}</p>
          <p className="text-xs text-gray-500">{centerLabel}</p>
        </div>
      </div>
    </div>;
}