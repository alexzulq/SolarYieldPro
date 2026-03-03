import React, { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AggregatedData } from '../types';
import { useThemeLanguage } from '../contexts/ThemeLanguageContext';
import { CustomChartLegend } from './CustomChartLegend';

interface YieldChartProps {
  data: AggregatedData[];
  title: string;
  unit?: 'kWh' | 'MWh' | 'GWh';
}

const HorizontalDash = (props: any) => {
    const { cx, cy, stroke, value } = props;
    // Hide if value is 0 or invalid
    if (value === 0 || value === null || value === undefined) return null;
    
    return (
        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
    );
};

const YieldChart: React.FC<YieldChartProps> = ({ data, title, unit = 'kWh' }) => {
  const { chartColors, t } = useThemeLanguage();
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);
  
  // Determine if we have Guaranteed data (usually if PAE exists, this exists, but safe to check)
  const hasGuaranteed = useMemo(() => data.some(d => d.paeGuaranteed > 0), [data]);

  const toggleSeries = (e: any) => {
      const { dataKey } = e;
      setHiddenSeries(prev => 
          prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
      );
  };

  const formatNumber = (num: number) => {
    const val = unit === 'MWh' ? num / 1000 : unit === 'GWh' ? num / 1000000 : num;
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
  };

  const getBarColor = (variancePct: number) => {
    if (variancePct >= 0) return '#16a34a'; // green-600
    if (variancePct >= -10) return '#d97706'; // yellow-600
    return '#dc2626'; // red-600
  };

  const barSize = data.length > 50 ? undefined : data.length > 20 ? 10 : 30;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataRow = payload[0].payload as AggregatedData;
      return (
        <div 
          className="text-sm p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: chartColors.tooltipBg, 
            borderColor: chartColors.grid, 
            color: chartColors.tooltipText 
          }}
        >
          <p className="font-semibold mb-2">{label}</p>
          
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getBarColor(dataRow.variancePct) }}></div>
            <span className="flex-1">{t('label_actual')}:</span>
            <span className="font-mono font-medium">{formatNumber(dataRow.kwhActual)} {unit}</span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#9ca3af' }}></div>
            <span className="flex-1">{t('label_budget')}:</span>
            <span className="font-mono font-medium">{formatNumber(dataRow.kwhBudget)} {unit}</span>
          </div>
          
          {dataRow.paeGuaranteed > 0 && (
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-1 rounded-full" style={{ backgroundColor: '#db2777' }}></div>
              <span className="flex-1">{t('label_guaranteed')}:</span>
              <span className="font-mono font-medium">{formatNumber(dataRow.paeGuaranteed)} {unit}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const yAxisFormatter = (value: number) => {
      if (unit === 'MWh') return (value / 1000).toLocaleString(undefined, { maximumFractionDigits: 0 });
      if (unit === 'GWh') return (value / 1000000).toLocaleString(undefined, { maximumFractionDigits: 1 });
      if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
      return value.toLocaleString();
  };

  return (
    <div className="h-[430px] w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors flex flex-col">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
            data={data}
            margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
            }}
            >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartColors.grid} />
            <XAxis 
                dataKey="periodLabel" 
                tick={{ fill: chartColors.text, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                minTickGap={20}
            />
            <YAxis 
                tick={{ fill: chartColors.text, fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={yAxisFormatter}
                label={{ value: `${t('label_energy')} (${unit})`, angle: -90, position: 'insideLeft', fill: chartColors.text, fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
                onClick={toggleSeries} 
                wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} 
                content={<CustomChartLegend />}
            />
            
            <Bar 
                name={t('label_actual')} 
                dataKey="kwhActual" 
                barSize={barSize} 
                fill="#16a34a" 
                radius={[2, 2, 0, 0]} 
                hide={hiddenSeries.includes('kwhActual')}
            >
                {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.variancePct)} />
                ))}
            </Bar>
            
            <Bar 
                name={t('label_budget')} 
                dataKey="kwhBudget" 
                fill="#9ca3af" 
                barSize={barSize} 
                radius={[2, 2, 0, 0]} 
                hide={hiddenSeries.includes('kwhBudget')}
            />

            {hasGuaranteed && (
                <Line 
                name={t('label_guaranteed')} 
                dataKey="paeGuaranteed" 
                stroke="#db2777" 
                strokeWidth={0} // Hide connecting line
                dot={<HorizontalDash stroke="#db2777" />}
                activeDot={false}
                legendType="rect"
                hide={hiddenSeries.includes('paeGuaranteed')}
                />
            )}

            </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default YieldChart;