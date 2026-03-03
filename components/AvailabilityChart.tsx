import React, { useState } from 'react';
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

interface AvailabilityChartProps {
  data: AggregatedData[];
  title: string;
}

const HorizontalDash = (props: any) => {
    const { cx, cy, stroke, value } = props;
    if (value === 0 || value === null || value === undefined) return null;
    
    return (
        <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke={stroke} strokeWidth={3} strokeLinecap="round" />
    );
};

const AvailabilityChart: React.FC<AvailabilityChartProps> = ({ data, title }) => {
  const { chartColors, t } = useThemeLanguage();
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([]);

  const toggleSeries = (e: any) => {
      const { dataKey } = e;
      setHiddenSeries(prev => 
          prev.includes(dataKey) ? prev.filter(k => k !== dataKey) : [...prev, dataKey]
      );
  };

  const formatPct = (num: number) => (num * 100).toFixed(2) + '%';
  const barSize = data.length > 50 ? undefined : data.length > 20 ? 10 : 30;

  const getBarColor = (actual: number, target: number | null) => {
    if (!target) return '#16a34a'; // Default green
    if (actual >= target) return '#16a34a'; // Met target
    return '#dc2626'; // Missed target
  };

  // Only show chart if there is some availability data
  const hasData = data.some(d => d.actualAvailability !== null || d.guaranteedAvailability !== null);

  if (!hasData) return null;

  return (
    <div className="h-[400px] w-full bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{title}</h3>
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
            tickFormatter={(val) => (val * 100).toFixed(0) + '%'}
            domain={[0, 1.1]} // Allow some headroom
            label={{ value: t('label_availability'), angle: -90, position: 'insideLeft', fill: chartColors.text, fontSize: 12 }}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [formatPct(value), name]}
            contentStyle={{ 
                borderRadius: '8px', 
                border: 'none', 
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                backgroundColor: chartColors.tooltipBg,
                color: chartColors.tooltipText
            }}
          />
          <Legend 
            onClick={toggleSeries} 
            wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} 
          />
          
          <Bar 
            name={t('label_actual_avail')} 
            dataKey="actualAvailability" 
            barSize={barSize} 
            fill="#16a34a" 
            radius={[2, 2, 0, 0]} 
            hide={hiddenSeries.includes('actualAvailability')}
          >
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.actualAvailability || 0, entry.guaranteedAvailability)} />
             ))}
          </Bar>

          <Line 
            name={t('label_guaranteed_avail')} 
            dataKey="guaranteedAvailability" 
            stroke="#4b5563" 
            strokeWidth={0} 
            dot={<HorizontalDash stroke="#4b5563" />}
            activeDot={false}
            legendType="rect"
            hide={hiddenSeries.includes('guaranteedAvailability')}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AvailabilityChart;